import mysql, { type PoolConnection, type RowDataPacket } from "mysql2/promise";

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
  status: "pending" | "paid" | "approved" | "cancelled";
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

type StoreData = {
  products: ProductData[];
  categories: CategoryData[];
  coupons: CouponData[];
  keys: KeyData[];
  banners: BannerData[];
  orders: OrderData[];
  notifications: NotificationData[];
};

type CategoryRow = RowDataPacket & CategoryData;
type ProductRow = RowDataPacket & {
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
  platforms: string[] | string;
  specs: { label: string; value: string }[] | string;
};
type CouponRow = RowDataPacket & {
  id: string;
  code: string;
  discount_percent: number;
  active: number;
};
type KeyRow = RowDataPacket & {
  id: string;
  product_id: string;
  license_key: string;
  status: KeyData["status"];
};
type BannerRow = RowDataPacket & BannerData;
type OrderRow = RowDataPacket & {
  id: string;
  email: string;
  phone: string;
  note: string;
  delivery_method: string;
  coupon_code: string | null;
  total: number;
  status: OrderData["status"];
  created_at: string;
};
type OrderItemRow = RowDataPacket & {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};
type NotificationRow = RowDataPacket & {
  id: string;
  message: string;
  type: NotificationData["type"];
  order_id: string | null;
  created_at: string;
  is_read: number;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "duanbackup",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  dateStrings: true,
});

const schemaStatements = [
  "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(32) PRIMARY KEY, slug VARCHAR(64) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS products (id VARCHAR(32) PRIMARY KEY, slug VARCHAR(128) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL, brand VARCHAR(128) NOT NULL, category_slug VARCHAR(64) NOT NULL, price BIGINT NOT NULL, compare_at BIGINT NULL, rating DECIMAL(3,1) NOT NULL, reviews INT UNSIGNED NOT NULL, image TEXT NOT NULL, badge VARCHAR(128) NULL, stock INT NOT NULL, description TEXT NOT NULL, platforms JSON NOT NULL, specs JSON NOT NULL, CONSTRAINT fk_products_category FOREIGN KEY (category_slug) REFERENCES categories(slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS coupons (id VARCHAR(32) PRIMARY KEY, code VARCHAR(64) NOT NULL UNIQUE, discount_percent DECIMAL(5,2) NOT NULL, active BOOLEAN NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS product_keys (id VARCHAR(32) PRIMARY KEY, product_id VARCHAR(32) NOT NULL, license_key VARCHAR(255) NOT NULL, status VARCHAR(32) NOT NULL, CONSTRAINT fk_keys_product FOREIGN KEY (product_id) REFERENCES products(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS banners (id VARCHAR(32) PRIMARY KEY, title VARCHAR(255) NOT NULL, image TEXT NOT NULL, type VARCHAR(32) NOT NULL, active BOOLEAN NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS orders (id VARCHAR(64) PRIMARY KEY, email VARCHAR(255) NOT NULL, phone VARCHAR(64) NOT NULL, note TEXT NOT NULL, delivery_method VARCHAR(64) NOT NULL, coupon_code VARCHAR(64) NULL, total BIGINT NOT NULL, status VARCHAR(32) NOT NULL, created_at DATETIME(3) NOT NULL, CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_code) REFERENCES coupons(code)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS order_items (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, order_id VARCHAR(64) NOT NULL, product_id VARCHAR(32) NOT NULL, name VARCHAR(255) NOT NULL, quantity INT UNSIGNED NOT NULL, unit_price BIGINT NOT NULL, CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id), CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
  "CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(64) PRIMARY KEY, message TEXT NOT NULL, type VARCHAR(32) NOT NULL, order_id VARCHAR(64) NULL, created_at DATETIME(3) NOT NULL, is_read BOOLEAN NOT NULL, CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
];

let schemaInitialization: Promise<void> | undefined;

export async function initializeStore() {
  if (!schemaInitialization) {
    schemaInitialization = (async () => {
      const connection = await pool.getConnection();
      try {
        for (const statement of schemaStatements) {
          await connection.query(statement);
        }
      } catch (error) {
        schemaInitialization = undefined;
        throw error;
      } finally {
        connection.release();
      }
    })();
  }
  await schemaInitialization;
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: string): string {
  return value.includes("T")
    ? new Date(value).toISOString()
    : new Date(`${value.replace(" ", "T")}Z`).toISOString();
}

export async function getStore(): Promise<StoreData> {
  await initializeStore();
  const [categories] = await pool.query<CategoryRow[]>(
    "SELECT id, slug, name FROM categories",
  );
  const [productRows] = await pool.query<ProductRow[]>(
    "SELECT id, slug, name, brand, category_slug, price, compare_at, rating, reviews, image, badge, stock, description, platforms, specs FROM products",
  );
  const [couponRows] = await pool.query<CouponRow[]>(
    "SELECT id, code, discount_percent, active FROM coupons",
  );
  const [keyRows] = await pool.query<KeyRow[]>(
    "SELECT id, product_id, license_key, status FROM product_keys",
  );
  const [banners] = await pool.query<BannerRow[]>(
    "SELECT id, title, image, type, active FROM banners",
  );
  const [orderRows] = await pool.query<OrderRow[]>(
    "SELECT id, email, phone, note, delivery_method, coupon_code, total, status, created_at FROM orders",
  );
  const [itemRows] = await pool.query<OrderItemRow[]>(
    "SELECT order_id, product_id, name, quantity, unit_price FROM order_items",
  );
  const [notificationRows] = await pool.query<NotificationRow[]>(
    "SELECT id, message, type, order_id, created_at, is_read FROM notifications",
  );
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
      platforms: parseJson(row.platforms),
      specs: parseJson(row.specs),
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
    })),
    banners: banners.map((row) => ({ ...row, active: Boolean(row.active) })),
    orders: orderRows.map((row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      note: row.note,
      deliveryMethod: row.delivery_method,
      ...(row.coupon_code ? { couponCode: row.coupon_code } : {}),
      total: row.total,
      status: row.status,
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

async function replaceStore(connection: PoolConnection, data: StoreData) {
  await connection.query("DELETE FROM notifications");
  await connection.query("DELETE FROM order_items");
  await connection.query("DELETE FROM orders");
  await connection.query("DELETE FROM product_keys");
  await connection.query("DELETE FROM products");
  await connection.query("DELETE FROM categories");
  await connection.query("DELETE FROM coupons");
  await connection.query("DELETE FROM banners");

  for (const row of data.categories) {
    await connection.execute(
      "INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)",
      [row.id, row.slug, row.name],
    );
  }
  for (const row of data.products) {
    await connection.execute(
      "INSERT INTO products (id, slug, name, brand, category_slug, price, compare_at, rating, reviews, image, badge, stock, description, platforms, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
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
      ],
    );
  }
  for (const row of data.coupons) {
    await connection.execute(
      "INSERT INTO coupons (id, code, discount_percent, active) VALUES (?, ?, ?, ?)",
      [row.id, row.code, row.discountPercent, Number(row.active)],
    );
  }
  for (const row of data.keys) {
    await connection.execute(
      "INSERT INTO product_keys (id, product_id, license_key, status) VALUES (?, ?, ?, ?)",
      [row.id, row.productId, row.key, row.status],
    );
  }
  for (const row of data.banners) {
    await connection.execute(
      "INSERT INTO banners (id, title, image, type, active) VALUES (?, ?, ?, ?, ?)",
      [row.id, row.title, row.image, row.type, Number(row.active)],
    );
  }
  for (const row of data.orders) {
    await connection.execute(
      "INSERT INTO orders (id, email, phone, note, delivery_method, coupon_code, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        row.id,
        row.email,
        row.phone,
        row.note,
        row.deliveryMethod,
        row.couponCode ?? null,
        row.total,
        row.status,
        new Date(row.createdAt),
      ],
    );
    for (const item of row.items) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
        [row.id, item.productId, item.name, item.qty, item.price],
      );
    }
  }
  for (const row of data.notifications) {
    await connection.execute(
      "INSERT INTO notifications (id, message, type, order_id, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?)",
      [
        row.id,
        row.message,
        row.type,
        row.orderId ?? null,
        new Date(row.createdAt),
        Number(row.read),
      ],
    );
  }
}

export async function writeStore(data: StoreData) {
  await initializeStore();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await replaceStore(connection, data);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type {
  CategoryData,
  CouponData,
  KeyData,
  BannerData,
  OrderData,
  NotificationData,
  StoreData,
};
