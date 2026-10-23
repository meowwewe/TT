CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price REAL NOT NULL,
  compare_at REAL,
  rating REAL NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  platforms TEXT NOT NULL DEFAULT '[]',
  specs TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_percent REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS product_keys (
  id TEXT PRIMARY KEY NOT NULL,
  product_id TEXT NOT NULL,
  license_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'used'))
);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'poster')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  delivery_method TEXT NOT NULL,
  coupon_code TEXT,
  total REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'approved', 'cancelled')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'payment', 'system')),
  order_id TEXT,
  created_at TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1))
);

CREATE INDEX IF NOT EXISTS products_category_slug_idx ON products(category_slug);
CREATE INDEX IF NOT EXISTS product_keys_product_id_idx ON product_keys(product_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
