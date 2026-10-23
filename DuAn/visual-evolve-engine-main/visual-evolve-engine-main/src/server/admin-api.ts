import { createId, getStore, writeStore, type StoreData } from "./admin-store";

const ADMIN_EMAIL = "admin@namnguyen.local";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Quản trị viên";
const SESSION_COOKIE = "admin_session";
const sessions = new Map<string, { email: string; createdAt: number }>();
const notificationSubscribers = new Set<(event: string) => void>();

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

function getAdminSession(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return sessions.get(token) ?? null;
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

function sendNotificationObj(notification: { id: string; message: string; type: StoreData["notifications"][number]["type"]; orderId?: string; createdAt: string; read: boolean }) {
  const event = JSON.stringify(notification);
  for (const notify of notificationSubscribers) {
    notify(event);
  }
}

export async function handleAdminApi(request: Request) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  if (pathname === "/api/admin/login" && request.method === "POST") {
    const body = await request.json();
    if (body.email !== ADMIN_EMAIL || body.password !== ADMIN_PASSWORD) {
      return createError(401, "Email hoặc mật khẩu không đúng");
    }
    const token = createId("session");
    sessions.set(token, { email: ADMIN_EMAIL, createdAt: Date.now() });
    return createResponse({ authenticated: true, name: ADMIN_NAME }, {
      headers: {
        "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax`,
      },
    });
  }

  if (pathname === "/api/admin/logout" && request.method === "POST") {
    const session = getAdminSession(request);
    if (session) {
      const cookies = parseCookies(request.headers.get("cookie"));
      const token = cookies[SESSION_COOKIE];
      if (token) sessions.delete(token);
    }
    return createResponse({ authenticated: false }, {
      headers: {
        "Set-Cookie": `${SESSION_COOKIE}=deleted; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`,
      },
    });
  }

  if (!pathname.startsWith("/api/admin/")) {
    return createError(404, "Not found");
  }

  if (!getAdminSession(request)) {
    return createError(401, "Unauthorized");
  }

  if (pathname === "/api/admin/session" && request.method === "GET") {
    return createResponse({ authenticated: true, name: ADMIN_NAME });
  }

  if (pathname === "/api/admin/dashboard" && request.method === "GET") {
    const store = await getStore();
    const unread = store.notifications.filter((notification) => !notification.read).length;
    return createResponse({ orderCount: store.orders.length, productCount: store.products.length, categoryCount: store.categories.length, couponCount: store.coupons.length, notificationCount: unread });
  }

  if (pathname === "/api/admin/notifications" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (pathname.startsWith("/api/admin/notifications/") && request.method === "POST") {
    const id = pathname.split("/").pop();
    if (!id) return createError(400, "Invalid notification id");
    const store = await getStore();
    const notification = store.notifications.find((item) => item.id === id);
    if (!notification) return createError(404, "Notification not found");
    notification.read = true;
    await writeStore(store);
    return createResponse(notification);
  }

  if (pathname === "/api/admin/orders" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (pathname.startsWith("/api/admin/orders/") && request.method === "PATCH") {
    const id = pathname.split("/").pop();
    if (!id) return createError(400, "Invalid order id");
    const body = await request.json();
    const store = await getStore();
    const order = store.orders.find((item) => item.id === id);
    if (!order) return createError(404, "Order not found");
    if (body.status && ["pending", "paid", "approved", "cancelled"].includes(body.status)) {
      order.status = body.status;
      await writeStore(store);
      if (order.status === "approved") {
        const productNames = order.items
          .map((item: any) => item.name)
          .filter(Boolean)
          .join(", ");
        const notificationMessage = productNames
          ? `Đơn hàng đã được duyệt: ${productNames}`
          : `Đơn hàng ${order.id} đã được duyệt thanh toán`;
        const notification = { id: createId("notify"), message: notificationMessage, type: "payment" as const, orderId: order.id, createdAt: new Date().toISOString(), read: false };
        store.notifications.push(notification);
        await writeStore(store);
        sendNotificationObj(notification);
      }
      return createResponse(order);
    }
    return createError(400, "Invalid status");
  }

  if (pathname === "/api/admin/products" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.products);
  }

  if (pathname === "/api/admin/products" && request.method === "POST") {
    const body = await request.json();
    const store = await getStore();
    const product = { id: createId("prod"), ...body };
    store.products.push(product);
    await writeStore(store);
    return createResponse(product);
  }

  if (pathname.startsWith("/api/admin/products/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await request.json();
    const store = await getStore();
    const product = store.products.find((item) => item.id === id);
    if (!product) return createError(404, "Product not found");
    Object.assign(product, body);
    await writeStore(store);
    return createResponse(product);
  }

  if (pathname.startsWith("/api/admin/products/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore();
    const position = store.products.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Product not found");
    const [deleted] = store.products.splice(position, 1);
    await writeStore(store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/categories" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.categories);
  }

  if (pathname === "/api/admin/categories" && request.method === "POST") {
    const body = await request.json();
    const store = await getStore();
    const category = { id: createId("cat"), ...body };
    store.categories.push(category);
    await writeStore(store);
    return createResponse(category);
  }

  if (pathname.startsWith("/api/admin/categories/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await request.json();
    const store = await getStore();
    const category = store.categories.find((item) => item.id === id);
    if (!category) return createError(404, "Category not found");
    Object.assign(category, body);
    await writeStore(store);
    return createResponse(category);
  }

  if (pathname.startsWith("/api/admin/categories/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore();
    const position = store.categories.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Category not found");
    const [deleted] = store.categories.splice(position, 1);
    await writeStore(store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/coupons" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.coupons);
  }

  if (pathname === "/api/admin/coupons" && request.method === "POST") {
    const body = await request.json();
    const store = await getStore();
    const coupon = { id: createId("coupon"), ...body };
    store.coupons.push(coupon);
    await writeStore(store);
    return createResponse(coupon);
  }

  if (pathname.startsWith("/api/admin/coupons/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await request.json();
    const store = await getStore();
    const coupon = store.coupons.find((item) => item.id === id);
    if (!coupon) return createError(404, "Coupon not found");
    Object.assign(coupon, body);
    await writeStore(store);
    return createResponse(coupon);
  }

  if (pathname.startsWith("/api/admin/coupons/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore();
    const position = store.coupons.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Coupon not found");
    const [deleted] = store.coupons.splice(position, 1);
    await writeStore(store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/keys" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.keys);
  }

  if (pathname === "/api/admin/keys" && request.method === "POST") {
    const body = await request.json();
    const store = await getStore();
    const key = { id: createId("key"), ...body };
    store.keys.push(key);
    await writeStore(store);
    return createResponse(key);
  }

  if (pathname.startsWith("/api/admin/keys/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await request.json();
    const store = await getStore();
    const key = store.keys.find((item) => item.id === id);
    if (!key) return createError(404, "Key not found");
    Object.assign(key, body);
    await writeStore(store);
    return createResponse(key);
  }

  if (pathname.startsWith("/api/admin/keys/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore();
    const position = store.keys.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Key not found");
    const [deleted] = store.keys.splice(position, 1);
    await writeStore(store);
    return createResponse(deleted);
  }

  if (pathname === "/api/admin/banners" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.banners);
  }

  if (pathname === "/api/admin/banners" && request.method === "POST") {
    const body = await request.json();
    const store = await getStore();
    const banner = { id: createId("banner"), ...body };
    store.banners.push(banner);
    await writeStore(store);
    return createResponse(banner);
  }

  if (pathname.startsWith("/api/admin/banners/") && request.method === "PUT") {
    const id = pathname.split("/").pop();
    const body = await request.json();
    const store = await getStore();
    const banner = store.banners.find((item) => item.id === id);
    if (!banner) return createError(404, "Banner not found");
    Object.assign(banner, body);
    await writeStore(store);
    return createResponse(banner);
  }

  if (pathname.startsWith("/api/admin/banners/") && request.method === "DELETE") {
    const id = pathname.split("/").pop();
    const store = await getStore();
    const position = store.banners.findIndex((item) => item.id === id);
    if (position === -1) return createError(404, "Banner not found");
    const [deleted] = store.banners.splice(position, 1);
    await writeStore(store);
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
        "Connection": "keep-alive",
      },
    });
  }

  return createError(404, "Admin endpoint not found");
}

export async function handlePublicApi(request: Request) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  if (pathname === "/api/products" && request.method === "GET") {
    const store = await getStore();
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    let products = store.products;
    if (category) {
      products = products.filter((item) => item.category === category);
    }
    if (query) {
      products = products.filter((item) => item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));
    }
    return createResponse(products);
  }

  if (pathname.startsWith("/api/products/") && request.method === "GET") {
    const slug = pathname.split("/").pop();
    const store = await getStore();
    const product = store.products.find((item) => item.slug === slug);
    if (!product) return createError(404, "Product not found");
    return createResponse(product);
  }

  if (pathname === "/api/categories" && request.method === "GET") {
    const store = await getStore();
    return createResponse(store.categories);
  }

  if (pathname === "/api/search" && request.method === "GET") {
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const store = await getStore();
    const results = query
      ? store.products.filter((item) => item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query) || item.category.toLowerCase().includes(query))
      : [];
    return createResponse(results);
  }

  if (pathname === "/api/orders" && request.method === "POST") {
    const body = await request.json();
    const { items, email, phone, note, deliveryMethod, couponCode } = body;
    if (!items || !Array.isArray(items) || !email || !phone) {
      return createError(400, "Missing order information");
    }
    const store = await getStore();
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
    const order = {
      id: createId("order"),
      email,
      phone,
      note: note || "",
      deliveryMethod: deliveryMethod || "email",
      couponCode,
      total,
      status: "pending",
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
    await writeStore(store);
    sendNotificationObj(notification);
    return createResponse({ orderId: order.id });
  }

  return createError(404, "Public endpoint not found");
}
