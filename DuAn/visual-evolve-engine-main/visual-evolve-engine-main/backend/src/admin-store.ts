/// <reference types="@cloudflare/workers-types" />

export type ProductData = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  stock: number;
  description: string;
  platforms: string[];
  specs: { label: string; value: string }[];
};

type CategoryData = { id: string; slug: string; name: string };
type CouponData = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
};
type KeyData = {
  id: string;
  productId: string;
  key: string;
  status: "available" | "used";
  assignedOrderId?: string;
};
type BannerData = {
  id: string;
  title: string;
  image: string;
  type: "banner" | "poster";
  active: boolean;
};
type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
};
type OrderData = {
  id: string;
  email: string;
  phone: string;
  note: string;
  deliveryMethod: string;
  couponCode?: string;
  total: number;
  status: "pending" | "paid" | "approved" | "completed" | "cancelled";
  deliveryEmailStatus: "pending" | "sent" | "logged";
  createdAt: string;
  items: OrderItem[];
};
type NotificationData = {
  id: string;
  message: string;
  type: "order" | "payment" | "system";
  orderId?: string;
  createdAt: string;
  read: boolean;
};

export type StoreData = {
  products: ProductData[];
  categories: CategoryData[];
  coupons: CouponData[];
  keys: KeyData[];
  banners: BannerData[];
  orders: OrderData[];
  notifications: NotificationData[];
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category_slug: string;
  price: number;
  compare_at: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  stock: number;
  description: string;
  platforms: string;
  specs: string;
};

type CouponRow = {
  id: string;
  code: string;
  discount_percent: number;
  active: number;
};

type KeyRow = {
  id: string;
  product_id: string;
  license_key: string;
  status: KeyData["status"];
  assigned_order_id: string | null;
};

type BannerRow = {
  id: string;
  title: string;
  image: string;
  type: BannerData["type"];
  active: number;
};

type OrderRow = {
  id: string;
  email: string;
  phone: string;
  note: string;
  delivery_method: string;
  coupon_code: string | null;
  total: number;
  status: OrderData["status"];
  delivery_email_status: OrderData["deliveryEmailStatus"];
  created_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

type NotificationRow = {
  id: string;
  message: string;
  type: NotificationData["type"];
  order_id: string | null;
  created_at: string;
  is_read: number;
};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function toIsoString(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).toISOString();
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function getStore(db: D1Database): Promise<StoreData> {
  const [
    categoriesRes,
    productRowsRes,
    couponRowsRes,
    keyRowsRes,
    bannersRes,
    orderRowsRes,
    itemRowsRes,
    notificationRowsRes,
  ] = await db.batch([
    db.prepare("SELECT id, slug, name FROM categories"),
    db.prepare(
      "SELECT id, slug, name, brand, category_slug, price, compare_at, rating, reviews, image, badge, stock, description, platforms, specs FROM products",
    ),
    db.prepare("SELECT id, code, discount_percent, active FROM coupons"),
    db.prepare("SELECT id, product_id, license_key, status, assigned_order_id FROM product_keys"),
    db.prepare("SELECT id, title, image, type, active FROM banners"),
    db.prepare(
      "SELECT id, email, phone, note, delivery_method, coupon_code, total, status, delivery_email_status, created_at FROM orders",
    ),
    db.prepare(
      "SELECT order_id, product_id, name, quantity, unit_price FROM order_items",
    ),
    db.prepare(
      "SELECT id, message, type, order_id, created_at, is_read FROM notifications",
    ),
  ]);

  const categories = (categoriesRes.results || []) as unknown as StoreData["categories"];
  const productRows = (productRowsRes.results || []) as unknown as ProductRow[];
  const couponRows = (couponRowsRes.results || []) as unknown as CouponRow[];
  const keyRows = (keyRowsRes.results || []) as unknown as KeyRow[];
  const banners = (bannersRes.results || []) as unknown as BannerRow[];
  const orderRows = (orderRowsRes.results || []) as unknown as OrderRow[];
  const itemRows = (itemRowsRes.results || []) as unknown as OrderItemRow[];
  const notificationRows = (notificationRowsRes.results || []) as unknown as NotificationRow[];

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const row of itemRows) {
    const items = itemsByOrder.get(row.order_id) ?? [];
    items.push({
      productId: row.product_id,
      name: row.name,
      qty: row.quantity,
      price: row.unit_price,
    });
    itemsByOrder.set(row.order_id, items);
  }

  return {
    categories,
    products: productRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      brand: row.brand,
      category: row.category_slug,
      price: row.price,
      ...(row.compare_at === null ? {} : { compareAt: row.compare_at }),
      rating: row.rating,
      reviews: row.reviews,
      image: row.image,
      ...(row.badge === null ? {} : { badge: row.badge }),
      stock: row.stock,
      description: row.description,
      platforms: parseJson<string[]>(row.platforms),
      specs: parseJson<ProductData["specs"]>(row.specs),
    })),
    coupons: couponRows.map((row) => ({
      id: row.id,
      code: row.code,
      discountPercent: row.discount_percent,
      active: Boolean(row.active),
    })),
    keys: keyRows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      key: row.license_key,
      status: row.status,
      ...(row.assigned_order_id ? { assignedOrderId: row.assigned_order_id } : {}),
    })),
    banners: banners.map((row) => ({
      id: row.id,
      title: row.title,
      image: row.image,
      type: row.type,
      active: Boolean(row.active),
    })),
    orders: orderRows.map((row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      note: row.note,
      deliveryMethod: row.delivery_method,
      ...(row.coupon_code ? { couponCode: row.coupon_code } : {}),
      total: row.total,
      status: row.status,
      deliveryEmailStatus: row.delivery_email_status,
      createdAt: toIsoString(row.created_at),
      items: itemsByOrder.get(row.id) ?? [],
    })),
    notifications: notificationRows.map((row) => ({
      id: row.id,
      message: row.message,
      type: row.type,
      ...(row.order_id ? { orderId: row.order_id } : {}),
      createdAt: toIsoString(row.created_at),
      read: Boolean(row.is_read),
    })),
  };
}

export async function writeStore(db: D1Database, data: StoreData): Promise<void> {
  const statements: D1PreparedStatement[] = [
    db.prepare("DELETE FROM notifications"),
    db.prepare("DELETE FROM order_items"),
    db.prepare("DELETE FROM orders"),
    db.prepare("DELETE FROM product_keys"),
    db.prepare("DELETE FROM products"),
    db.prepare("DELETE FROM categories"),
    db.prepare("DELETE FROM coupons"),
    db.prepare("DELETE FROM banners"),
  ];

  for (const row of data.categories) {
    statements.push(
      db
        .prepare("INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)")
        .bind(row.id, row.slug, row.name),
    );
  }

  for (const row of data.products) {
    statements.push(
      db
        .prepare(
          "INSERT INTO products (id, slug, name, brand, category_slug, price, compare_at, rating, reviews, image, badge, stock, description, platforms, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          row.id,
          row.slug,
          row.name,
          row.brand,
          row.category,
          row.price,
          row.compareAt ?? null,
          row.rating,
          row.reviews,
          row.image,
          row.badge ?? null,
          row.stock,
          row.description,
          JSON.stringify(row.platforms),
          JSON.stringify(row.specs),
        ),
    );
  }

  for (const row of data.coupons) {
    statements.push(
      db
        .prepare(
          "INSERT INTO coupons (id, code, discount_percent, active) VALUES (?, ?, ?, ?)",
        )
        .bind(row.id, row.code, row.discountPercent, Number(row.active)),
    );
  }

  for (const row of data.keys) {
    statements.push(
      db
        .prepare(
          "INSERT INTO product_keys (id, product_id, license_key, status, assigned_order_id) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(row.id, row.productId, row.key, row.status, row.assignedOrderId ?? null),
    );
  }

  for (const row of data.banners) {
    statements.push(
      db
        .prepare(
          "INSERT INTO banners (id, title, image, type, active) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(row.id, row.title, row.image, row.type, Number(row.active)),
    );
  }

  for (const row of data.orders) {
    statements.push(
      db
        .prepare(
          "INSERT INTO orders (id, email, phone, note, delivery_method, coupon_code, total, status, delivery_email_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          row.id,
          row.email,
          row.phone,
          row.note,
          row.deliveryMethod,
          row.couponCode ?? null,
          row.total,
          row.status,
          row.deliveryEmailStatus,
          toIsoString(row.createdAt),
        ),
    );

    for (const item of row.items) {
      statements.push(
        db
          .prepare(
            "INSERT INTO order_items (order_id, product_id, name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
          )
          .bind(row.id, item.productId, item.name, item.qty, item.price),
      );
    }
  }

  for (const row of data.notifications) {
    statements.push(
      db
        .prepare(
          "INSERT INTO notifications (id, message, type, order_id, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          row.id,
          row.message,
          row.type,
          row.orderId ?? null,
          toIsoString(row.createdAt),
          Number(row.read),
        ),
    );
  }

  await db.batch(statements);
}
