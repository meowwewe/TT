CREATE TABLE orders_new (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  delivery_method TEXT NOT NULL,
  coupon_code TEXT,
  total REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'approved', 'completed', 'cancelled')),
  delivery_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_email_status IN ('pending', 'sent', 'logged')),
  created_at TEXT NOT NULL
);

INSERT INTO orders_new (
  id, email, phone, note, delivery_method, coupon_code, total, status, created_at
)
SELECT id, email, phone, note, delivery_method, coupon_code, total, status, created_at
FROM orders;

CREATE TABLE order_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders_new(id) ON DELETE CASCADE
);

INSERT INTO order_items_new (id, order_id, product_id, name, quantity, unit_price)
SELECT id, order_id, product_id, name, quantity, unit_price
FROM order_items;

DROP TABLE order_items;
DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;
ALTER TABLE order_items_new RENAME TO order_items;

CREATE INDEX orders_created_at_idx ON orders(created_at);
CREATE INDEX order_items_order_id_idx ON order_items(order_id);

ALTER TABLE product_keys ADD COLUMN assigned_order_id TEXT;
CREATE INDEX product_keys_assigned_order_id_idx ON product_keys(assigned_order_id);

CREATE TRIGGER ensure_order_has_license_keys
BEFORE UPDATE OF status ON orders
WHEN NEW.status = 'completed' AND OLD.status <> 'completed'
BEGIN
  SELECT CASE
    WHEN COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id = NEW.id), 0) = 0
      OR EXISTS (
        SELECT 1
        FROM order_items
        WHERE order_id = NEW.id
        GROUP BY product_id
        HAVING (
          SELECT COUNT(*)
          FROM product_keys
          WHERE assigned_order_id = NEW.id
            AND product_id = order_items.product_id
        ) < SUM(quantity)
      )
      OR (
        SELECT COUNT(*)
        FROM product_keys
        WHERE assigned_order_id = NEW.id
      ) <> (
        SELECT COALESCE(SUM(quantity), 0)
        FROM order_items
        WHERE order_id = NEW.id
      )
    THEN RAISE(ABORT, 'INSUFFICIENT_LICENSE_KEYS')
  END;
END;
