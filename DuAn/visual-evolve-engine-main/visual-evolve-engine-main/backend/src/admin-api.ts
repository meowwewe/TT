/// <reference types="@cloudflare/workers-types" />
import { createId, getStore, writeStore, type StoreData } from "./admin-store.js";
import type { Env } from "./env.js";

const DEFAULT_ADMIN_EMAIL = "admin@namnguyen.local";
const ADMIN_NAME = "Quản trị viên";
const SESSION_COOKIE = "admin_session";

const notificationSubscribers = new Set<(event: string) => void>();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cookieAttributes(request: Request): string {
  return new URL(request.url).protocol === "https:"
    ? "HttpOnly; Path=/; SameSite=None; Secure"
    : "HttpOnly; Path=/; SameSite=Lax";
}

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((chunk) => {
    const [key, ...rest] = chunk.split("=");
    if (!key) return;
    cookies[key.trim()] = decodeURIComponent(rest.join("=").trim());
  });
  return cookies;
}

async function getAdminSession(request: Request, db: D1Database) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return db
    .prepare("SELECT email FROM admin_sessions WHERE session_id = ? AND expires_at > ?")
    .bind(token, Date.now())
    .first<{ email: string }>();
}

function createResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...init.headers },
    ...init,
  });
}

function createError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function sendNotificationObj(notification: {
  id: string;
  message: string;
  type: StoreData["notifications"][number]["type"];
  orderId?: string;
  createdAt: string;
  read: boolean;
}) {
  const event = JSON.stringify(notification);
  for (const notify of notificationSubscribers) {
    notify(event);
  }
}

type OrderForDelivery = {
  id: string;
  email: string;
  phone: string;
  note: string;
  delivery_method: string;
  coupon_code: string | null;
  total: number;
  status: "pending" | "paid" | "approved" | "completed" | "cancelled";
  delivery_email_status: "pending" | "sent" | "logged";
  created_at: string;
};

type OrderItemForDelivery = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

type AssignedKey = { productName: string; key: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function sendOrderKeysEmail(
  env: Env,
  order: OrderForDelivery,
  keys: AssignedKey[],
): Promise<{ emailSent: boolean; emailLogged: boolean; emailError?: string }> {
  if (order.delivery_email_status === "sent") {
    return { emailSent: true, emailLogged: false };
  }

  const subject = `Mã license cho đơn hàng ${order.id}`;
  const keyLines = keys.map(({ productName, key }) => `${productName}: ${key}`);

  if (!env.RESEND_API_KEY) {
    if (order.delivery_email_status !== "logged") {
      console.info(
        JSON.stringify({
          event: "order_license_email_fallback",
          to: order.email,
          orderId: order.id,
          subject,
          licenseKeys: keyLines,
        }),
      );
    }
    return { emailSent: false, emailLogged: true };
  }

  if (!env.RESEND_FROM_EMAIL) {
    console.error("RESEND_FROM_EMAIL is required when RESEND_API_KEY is configured");
    return {
      emailSent: false,
      emailLogged: false,
      emailError: "Email chưa được gửi: Worker thiếu cấu hình RESEND_FROM_EMAIL.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [order.email],
        subject,
        text: [
          `Cảm ơn bạn đã đặt hàng. Mã license cho đơn hàng ${order.id}:`,
          "",
          ...keyLines,
        ].join("\n"),
        html: `<p>Cảm ơn bạn đã đặt hàng. Mã license cho đơn hàng <strong>${escapeHtml(order.id)}</strong>:</p><ul>${keys
          .map(
            ({ productName, key }) =>
              `<li><strong>${escapeHtml(productName)}:</strong> <code>${escapeHtml(key)}</code></li>`,
          )
          .join("")}</ul>`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend rejected order license email", response.status, details);
      return {
        emailSent: false,
        emailLogged: false,
        emailError: "Email chưa gửi được; có thể thử xác nhận lại để gửi lại.",
      };
    }

    return { emailSent: true, emailLogged: false };
  } catch (error) {
    console.error("Failed to send order license email", error);
    return {
      emailSent: false,
      emailLogged: false,
      emailError: "Email chưa gửi được; có thể thử xác nhận lại để gửi lại.",
    };
  }
}

async function confirmOrder(orderId: string, env: Env): Promise<Response> {
  const order = await env.DB.prepare(
    "SELECT id, email, phone, note, delivery_method, coupon_code, total, status, delivery_email_status, created_at FROM orders WHERE id = ?",
  )
    .bind(orderId)
    .first<OrderForDelivery>();
  if (!order) return createError(404, "Không tìm thấy đơn hàng");
  if (order.status === "cancelled") {
    return createError(400, "Không thể xác nhận đơn hàng đã hủy");
  }

  const orderItems = await env.DB.prepare(
    "SELECT product_id, name, quantity, unit_price FROM order_items WHERE order_id = ?",
  )
    .bind(orderId)
    .all<OrderItemForDelivery>();
  const items = orderItems.results ?? [];
  if (items.length === 0) return createError(400, "Đơn hàng không có sản phẩm");

  let assignedKeys: AssignedKey[];
  if (order.status === "completed") {
    const existingKeys = await env.DB.prepare(
      "SELECT pk.license_key, COALESCE((SELECT oi.name FROM order_items oi WHERE oi.order_id = pk.assigned_order_id AND oi.product_id = pk.product_id LIMIT 1), 'Sản phẩm') AS name FROM product_keys pk WHERE pk.assigned_order_id = ? ORDER BY pk.rowid",
    )
      .bind(orderId)
      .all<{ license_key: string; name: string }>();
    assignedKeys = (existingKeys.results ?? []).map((row) => ({
      productName: row.name,
      key: row.license_key,
    }));
  } else {
    if (!["pending", "paid", "approved"].includes(order.status)) {
      return createError(400, "Trạng thái đơn hàng không hợp lệ để xác nhận");
    }

    const quantities = new Map<string, { productName: string; quantity: number }>();
    for (const item of items) {
      const current = quantities.get(item.product_id);
      quantities.set(item.product_id, {
        productName: item.name,
        quantity: (current?.quantity ?? 0) + item.quantity,
      });
    }

    assignedKeys = [];
    const keyUpdates: D1PreparedStatement[] = [];
    for (const [productId, item] of quantities) {
      const available = await env.DB.prepare(
        "SELECT id, license_key FROM product_keys WHERE product_id = ? AND status = 'available' ORDER BY rowid LIMIT ?",
      )
        .bind(productId, item.quantity)
        .all<{ id: string; license_key: string }>();
      const rows = available.results ?? [];
      if (rows.length < item.quantity) {
        return createError(
          400,
          `Kho key cho sản phẩm "${item.productName}" không đủ; còn ${rows.length}/${item.quantity} key cần giao.`,
        );
      }

      for (const row of rows) {
        assignedKeys.push({ productName: item.productName, key: row.license_key });
        keyUpdates.push(
          env.DB.prepare(
            "UPDATE product_keys SET status = 'used', assigned_order_id = ? WHERE id = ? AND status = 'available' AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND status IN ('pending', 'paid', 'approved'))",
          ).bind(orderId, row.id, orderId),
        );
      }
    }

    const notification = {
      id: createId("notify"),
      message: `Đơn hàng ${orderId} đã hoàn tất, license key đã được gửi tới khách hàng.`,
      type: "payment" as const,
      orderId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      await env.DB.batch([
        ...keyUpdates,
        env.DB.prepare(
          "UPDATE orders SET status = 'completed' WHERE id = ? AND status IN ('pending', 'paid', 'approved')",
        ).bind(orderId),
        env.DB.prepare(
          "INSERT INTO notifications (id, message, type, order_id, created_at, is_read) SELECT ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM orders WHERE id = ? AND status = 'completed') AND NOT EXISTS (SELECT 1 FROM notifications WHERE order_id = ? AND message = ?)",
        ).bind(
          notification.id,
          notification.message,
          notification.type,
          orderId,
          notification.createdAt,
          0,
          orderId,
          orderId,
          notification.message,
        ),
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("INSUFFICIENT_LICENSE_KEYS")) {
        return createError(400, "Kho key vừa thay đổi; không đủ key để hoàn tất đơn hàng.");
      }
      throw error;
    }

    const updatedOrder = await env.DB.prepare(
      "SELECT status FROM orders WHERE id = ?",
    )
      .bind(orderId)
      .first<{ status: string }>();
    if (updatedOrder?.status !== "completed") {
      return createError(400, "Đơn hàng đã thay đổi trạng thái; hãy tải lại và thử lại.");
    }

    sendNotificationObj(notification);
  }

  if (assignedKeys.length === 0) {
    return createError(400, "Không tìm thấy license key đã gán cho đơn hàng");
  }

  const delivery = await sendOrderKeysEmail(env, order, assignedKeys);
  if (delivery.emailSent || delivery.emailLogged) {
    await env.DB.prepare("UPDATE orders SET delivery_email_status = ? WHERE id = ?")
      .bind(delivery.emailSent ? "sent" : "logged", orderId)
      .run();
  }

  return createResponse({
    id: order.id,
    email: order.email,
    phone: order.phone,
    note: order.note,
    deliveryMethod: order.delivery_method,
    ...(order.coupon_code ? { couponCode: order.coupon_code } : {}),
    total: order.total,
    status: "completed",
    deliveryEmailStatus: delivery.emailSent
      ? "sent"
      : delivery.emailLogged
        ? "logged"
        : order.delivery_email_status,
    createdAt: order.created_at,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      qty: item.quantity,
      price: item.unit_price,
    })),
    emailSent: delivery.emailSent,
    emailLogged: delivery.emailLogged,
    ...(delivery.emailError ? { emailError: delivery.emailError } : {}),
  });
}

export async function handleAdminApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const { pathname } = url;

  const adminEmail = env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;

  if (pathname === "/api/admin/login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD) {
      return createError(503, "Admin password is not configured");
    }
    const body = (await request.json()) as any;
    if (body.email !== adminEmail || body.password !== env.ADMIN_PASSWORD) {
      return createError(401, "Email hoặc mật khẩu không đúng");
    }
    const token = createId("session");
    await env.DB.prepare(
      "INSERT INTO admin_sessions (session_id, email, expires_at) VALUES (?, ?, ?)",
    )
      .bind(token, adminEmail, Date.now() + SESSION_TTL_MS)
      .run();
    return createResponse(
      { authenticated: true, name: ADMIN_NAME },
      {
        headers: {
          "Set-Cookie": `${SESSION_COOKIE}=${token}; ${cookieAttributes(request)}; Max-Age=${SESSION_TTL_MS / 1000}`,
        },
      },
    );
  }

  if (pathname === "/api/admin/logout" && request.method === "POST") {
    const cookies = parseCookies(request.headers.get("cookie"));
    const token = cookies[SESSION_COOKIE];
    if (token) {
      await env.DB.prepare("DELETE FROM admin_sessions WHERE session_id = ?")
        .bind(token)
        .run();
    }
    return createResponse(
      { authenticated: false },
      {
        headers: {
          "Set-Cookie": `${SESSION_COOKIE}=deleted; ${cookieAttributes(request)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        },
      },
    );
  }

  if (!pathname.startsWith("/api/admin/")) {
    return createError(404, "Not found");
  }

  if (!(await getAdminSession(request, env.DB))) {
    return createError(401, "Unauthorized");
  }

  if (pathname === "/api/admin/session" && request.method === "GET") {
    return createResponse({ authenticated: true, name: ADMIN_NAME });
  }

  if (pathname === "/api/admin/dashboard" && request.method === "GET") {
    const store = await getStore(env.DB);
    const unread = store.notifications.filter((notification) => !notification.read).length;
    return createResponse({
      orderCount: store.orders.length,
      productCount: store.products.length,
      categoryCount: store.categories.length,
      couponCount: store.coupons.length,
      notificationCount: unread,
    });
  }

  if (pathname === "/api/admin/notifications" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(
      store.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  if (pathname.startsWith("/api/admin/notifications/") && request.method === "POST") {
    const id = pathname.split("/").pop();
    if (!id) return createError(400, "Invalid notification id");
    const store = await getStore(env.DB);
    const notification = store.notifications.find((item) => item.id === id);
    if (!notification) return createError(404, "Notification not found");
    notification.read = true;
    await writeStore(env.DB, store);
    return createResponse(notification);
  }

  if (pathname === "/api/admin/orders" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(
      store.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  const confirmMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/confirm$/);
  if (confirmMatch && request.method === "POST") {
    return confirmOrder(decodeURIComponent(confirmMatch[1]), env);
  }

  if (pathname.startsWith("/api/admin/orders/") && request.method === "PATCH") {
    const id = pathname.split("/").pop();
    if (!id) return createError(400, "Invalid order id");
    const body = (await request.json()) as any;
    if (body.status === "approved") {
      return confirmOrder(decodeURIComponent(id), env);
    }
    const store = await getStore(env.DB);
    const order = store.orders.find((item) => item.id === id);
    if (!order) return createError(404, "Order not found");
    if (body.status && ["pending", "paid", "approved", "cancelled"].includes(body.status)) {
      order.status = body.status;
      await writeStore(env.DB, store);
      if (order.status === "approved") {
        const productNames = order.items
          .map((item: any) => item.name)
          .filter(Boolean)
          .join(", ");
        const notificationMessage = productNames
          ? `Đơn hàng đã được duyệt: ${productNames}`
          : `Đơn hàng ${order.id} đã được duyệt thanh toán`;
        const notification = {
          id: createId("notify"),
          message: notificationMessage,
          type: "payment" as const,
          orderId: order.id,
          createdAt: new Date().toISOString(),
          read: false,
        };
        store.notifications.push(notification);
        await writeStore(env.DB, store);
        sendNotificationObj(notification);
      }
      return createResponse(order);
    }
    return createError(400, "Invalid status");
  }

  if (pathname === "/api/admin/products" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.products);
  }

  if (pathname === "/api/admin/products" && request.method === "POST") {
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const product = { id: createId("prod"), ...body };
    store.products.push(product);
    await writeStore(env.DB, store);
    return createResponse(product);
  }

  if (pathname.startsWith("/api/admin/products/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const product = store.products.find((item) => item.id === id);
    if (!product) return createError(404, "Product not found");
    Object.assign(product, body);
    await writeStore(env.DB, store);
    return createResponse(product);
  }

  if (pathname.startsWith("/api/admin/products/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const position = store.products.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Product not found");
    const [deleted] = store.products.splice(position, 1);
    await writeStore(env.DB, store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/categories" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.categories);
  }

  if (pathname === "/api/admin/categories" && request.method === "POST") {
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const category = { id: createId("cat"), ...body };
    store.categories.push(category);
    await writeStore(env.DB, store);
    return createResponse(category);
  }

  if (pathname.startsWith("/api/admin/categories/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const category = store.categories.find((item) => item.id === id);
    if (!category) return createError(404, "Category not found");
    Object.assign(category, body);
    await writeStore(env.DB, store);
    return createResponse(category);
  }

  if (pathname.startsWith("/api/admin/categories/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const position = store.categories.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Category not found");
    const [deleted] = store.categories.splice(position, 1);
    await writeStore(env.DB, store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/coupons" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.coupons);
  }

  if (pathname === "/api/admin/coupons" && request.method === "POST") {
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const coupon = { id: createId("coupon"), ...body };
    store.coupons.push(coupon);
    await writeStore(env.DB, store);
    return createResponse(coupon);
  }

  if (pathname.startsWith("/api/admin/coupons/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const coupon = store.coupons.find((item) => item.id === id);
    if (!coupon) return createError(404, "Coupon not found");
    Object.assign(coupon, body);
    await writeStore(env.DB, store);
    return createResponse(coupon);
  }

  if (pathname.startsWith("/api/admin/coupons/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const position = store.coupons.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Coupon not found");
    const [deleted] = store.coupons.splice(position, 1);
    await writeStore(env.DB, store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/keys" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.keys);
  }

  if (pathname === "/api/admin/keys" && request.method === "POST") {
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const key = { id: createId("key"), ...body };
    store.keys.push(key);
    await writeStore(env.DB, store);
    return createResponse(key);
  }

  if (pathname.startsWith("/api/admin/keys/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const key = store.keys.find((item) => item.id === id);
    if (!key) return createError(404, "Key not found");
    Object.assign(key, body);
    await writeStore(env.DB, store);
    return createResponse(key);
  }

  if (pathname.startsWith("/api/admin/keys/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const position = store.keys.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Key not found");
    const [deleted] = store.keys.splice(position, 1);
    await writeStore(env.DB, store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/banners" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.banners);
  }

  if (pathname === "/api/admin/banners" && request.method === "POST") {
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const banner = { id: createId("banner"), ...body };
    store.banners.push(banner);
    await writeStore(env.DB, store);
    return createResponse(banner);
  }

  if (pathname.startsWith("/api/admin/banners/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = (await request.json()) as any;
    const store = await getStore(env.DB);
    const banner = store.banners.find((item) => item.id === id);
    if (!banner) return createError(404, "Banner not found");
    Object.assign(banner, body);
    await writeStore(env.DB, store);
    return createResponse(banner);
  }

  if (pathname.startsWith("/api/admin/banners/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const position = store.banners.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Banner not found");
    const [deleted] = store.banners.splice(position, 1);
    await writeStore(env.DB, store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/notifications/stream" && request.method === "GET") {
    let send: ((event: string) => void) | undefined;
    const stream = new ReadableStream({
      start(controller) {
        send = (event: string) => {
          controller.enqueue(`data: ${event}\n\n`);
        };
        notificationSubscribers.add(send);
        controller.enqueue("retry: 5000\n\n");
      },
      cancel() {
        if (send) {
          notificationSubscribers.delete(send);
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  return createError(404, "Admin endpoint not found");
}

export async function handlePublicApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  if (pathname === "/api/products" && request.method === "GET") {
    const store = await getStore(env.DB);
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    let products = store.products;
    if (category) {
      products = products.filter((item) => item.category === category);
    }
    if (query) {
      products = products.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }
    return createResponse(products);
  }

  if (pathname.startsWith("/api/products/") && request.method === "GET") {
    const slug = pathname.split("/").pop();
    const store = await getStore(env.DB);
    const product = store.products.find((item) => item.slug === slug);
    if (!product) return createError(404, "Product not found");
    return createResponse(product);
  }

  if (pathname === "/api/categories" && request.method === "GET") {
    const store = await getStore(env.DB);
    return createResponse(store.categories);
  }

  if (pathname === "/api/search" && request.method === "GET") {
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const store = await getStore(env.DB);
    const results = query
      ? store.products.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.brand.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query),
        )
      : [];
    return createResponse(results);
  }

  if (pathname === "/api/orders" && request.method === "POST") {
    const body = (await request.json()) as any;
    const { items, email, phone, note, deliveryMethod, couponCode } = body;
    if (!items || !Array.isArray(items) || !email || !phone) {
      return createError(400, "Missing order information");
    }
    const store = await getStore(env.DB);
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
    const order = {
      id: createId("order"),
      email,
      phone,
      note: note || "",
      deliveryMethod: deliveryMethod || "email",
      couponCode,
      total,
      status: "pending" as const,
      deliveryEmailStatus: "pending" as const,
      createdAt: new Date().toISOString(),
      items,
    };
    store.orders.push(order);
    const productNames = items
      .map((item: any) => item.name)
      .filter(Boolean)
      .join(", ");
    const notificationMessage = productNames
      ? `Đơn hàng mới: ${productNames}`
      : `Đơn hàng mới ${order.id}`;
    const notification = {
      id: createId("notify"),
      message: notificationMessage,
      type: "order" as const,
      orderId: order.id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    store.notifications.push(notification);
    await writeStore(env.DB, store);
    sendNotificationObj(notification);
    return createResponse({ orderId: order.id });
  }

  return createError(404, "Public endpoint not found");
}