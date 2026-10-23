-- Cloudflare D1 (SQLite) Schema & Data Dump for duanbackup

DROP TABLE IF EXISTS product_keys;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS banners;

CREATE TABLE banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  type TEXT NOT NULL,
  active INTEGER NOT NULL
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent REAL NOT NULL,
  active INTEGER NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  order_id TEXT DEFAULT NULL,
  created_at TEXT NOT NULL,
  is_read INTEGER NOT NULL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  coupon_code TEXT DEFAULT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at INTEGER DEFAULT NULL,
  rating REAL NOT NULL,
  reviews INTEGER NOT NULL,
  image TEXT NOT NULL,
  badge TEXT DEFAULT NULL,
  stock INTEGER NOT NULL,
  description TEXT NOT NULL,
  platforms TEXT NOT NULL,
  specs TEXT NOT NULL
);

CREATE TABLE product_keys (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  license_key TEXT NOT NULL,
  status TEXT NOT NULL
);

-- BANNERS DATA
INSERT INTO banners (id, title, image, type, active) VALUES
('banner1', 'Ưu đãi Windows 11', 'https://via.placeholder.com/1200x520?text=Banner+Windows+11', 'banner', 1),
('banner2', 'Khuyến mãi Office', 'https://via.placeholder.com/1200x520?text=Banner+Office', 'poster', 1);

-- CATEGORIES DATA
INSERT INTO categories (id, slug, name) VALUES
('c1', 'windows', 'Windows'),
('c2', 'office', 'Office'),
('c3', 'antivirus', 'Diệt virus');

-- COUPONS DATA
INSERT INTO coupons (id, code, discount_percent, active) VALUES
('coupon1', 'NAMNGUYEN10', 10.00, 1);

-- NOTIFICATIONS DATA
INSERT INTO notifications (id, message, type, order_id, created_at, is_read) VALUES
('notify_mrq505lo_0cuamp', 'Đơn hàng mới order_mrq505lo_srhs3q từ customer@example.com', 'order', 'order_mrq505lo_srhs3q', '2026-07-18 09:00:59.100', 1),
('notify_mrq5w5g7_xgvqxl', 'Đơn hàng mới order_mrq5w5g7_fqx3re từ test2@example.com', 'order', 'order_mrq5w5g7_fqx3re', '2026-07-18 09:25:51.895', 1),
('notify_mrq5xjaj_wjtvlp', 'Đơn hàng mới order_mrq5xjaj_m54q7o từ test3@example.com', 'order', 'order_mrq5xjaj_m54q7o', '2026-07-18 09:26:56.491', 1),
('notify_mrq63ziu_px6599', 'Đơn hàng mới order_mrq63ziu_es94sl từ test1@example.com', 'order', 'order_mrq63ziu_es94sl', '2026-07-18 09:31:57.462', 1),
('notify_mrq65ghs_9tb4qi', 'Đơn hàng order_mrq63ziu_es94sl đã được duyệt thanh toán', 'payment', 'order_mrq63ziu_es94sl', '2026-07-18 09:33:06.112', 1),
('notify_mrq65rso_441msa', 'Đơn hàng order_mrq63ziu_es94sl đã được duyệt thanh toán', 'payment', 'order_mrq63ziu_es94sl', '2026-07-18 09:33:20.760', 1),
('notify_mrq6bc3s_0qii28', 'Đơn hàng mới order_mrq6bc3s_fzjp07 từ test1@example.com', 'order', 'order_mrq6bc3s_fzjp07', '2026-07-18 09:37:40.360', 1),
('notify_mrq6s4s2_1j35wg', 'Đơn hàng mới order_mrq6s4s2_w3rugu từ akdhd', 'order', 'order_mrq6s4s2_w3rugu', '2026-07-18 09:50:44.018', 1),
('notify_mrq6ssli_buqamg', 'Đơn hàng order_mrq6bc3s_fzjp07 đã được duyệt thanh toán', 'payment', 'order_mrq6bc3s_fzjp07', '2026-07-18 09:51:14.886', 1),
('notify_mrq6stl9_to5rqa', 'Đơn hàng order_mrq6s4s2_w3rugu đã được duyệt thanh toán', 'payment', 'order_mrq6s4s2_w3rugu', '2026-07-18 09:51:16.173', 1),
('notify_mrq6sunr_fbai6m', 'Đơn hàng order_mrq63ziu_es94sl đã được duyệt thanh toán', 'payment', 'order_mrq63ziu_es94sl', '2026-07-18 09:51:17.559', 1),
('notify_mrq6svs4_64j75g', 'Đơn hàng order_mrq5xjaj_m54q7o đã được duyệt thanh toán', 'payment', 'order_mrq5xjaj_m54q7o', '2026-07-18 09:51:19.012', 1),
('notify_mrq6swi1_9604ao', 'Đơn hàng order_mrq5w5g7_fqx3re đã được duyệt thanh toán', 'payment', 'order_mrq5w5g7_fqx3re', '2026-07-18 09:51:19.945', 1),
('notify_mrq6sxac_92nxkw', 'Đơn hàng order_mrq505lo_srhs3q đã được duyệt thanh toán', 'payment', 'order_mrq505lo_srhs3q', '2026-07-18 09:51:20.964', 1),
('notify_mrq6uuff_f45hqg', 'Đơn hàng order_mrq6s4s2_w3rugu đã được duyệt thanh toán', 'payment', 'order_mrq6s4s2_w3rugu', '2026-07-18 09:52:50.571', 1),
('notify_mrq6yrp3_oiaq88', 'Đơn hàng mới order_mrq6yrp3_rd06kd từ ạdgasgdds', 'order', 'order_mrq6yrp3_rd06kd', '2026-07-18 09:55:53.655', 1),
('notify_mrq6z5c6_5jtv5r', 'Đơn hàng order_mrq6yrp3_rd06kd đã được duyệt thanh toán', 'payment', 'order_mrq6yrp3_rd06kd', '2026-07-18 09:56:11.334', 1),
('notify_mrq7wutt_5z5jzt', 'Đơn hàng mới order_mrq7wutt_txvlkr từ ffd', 'order', 'order_mrq7wutt_txvlkr', '2026-07-18 10:22:24.017', 1),
('notify_mrqbhu5m_mzbiry', 'Đơn hàng order_mrq7wutt_txvlkr đã được duyệt thanh toán', 'payment', 'order_mrq7wutt_txvlkr', '2026-07-18 12:02:41.770', 1),
('notify_mrqfvngy_a5cxhg', 'Đơn hàng mới order_mrqfvngy_lwxdnd từ dtc235200121@ictu.edu.vn', 'order', 'order_mrqfvngy_lwxdnd', '2026-07-18 14:05:24.754', 1),
('notify_mrqj6193_jy7gq4', 'Đơn hàng order_mrqfvngy_lwxdnd đã được duyệt thanh toán', 'payment', 'order_mrqfvngy_lwxdnd', '2026-07-18 15:37:28.023', 1),
('notify_mrqj79lw_nsce1w', 'Đơn hàng mới order_mrqj79lw_vf6ha7: Windows 11 Pro – Key bản quyền vĩnh viễn', 'order', 'order_mrqj79lw_vf6ha7', '2026-07-18 15:38:25.508', 1),
('notify_mrqj7gmz_egi4mq', 'Đơn hàng order_mrqj79lw_vf6ha7 đã được duyệt thanh toán', 'payment', 'order_mrqj79lw_vf6ha7', '2026-07-18 15:38:34.619', 1),
('notify_mrqjeu64_nlsbxh', 'Đơn hàng mới order_mrqjeu64_chdmh8: Windows 11 Home – Key bản quyền vĩnh viễn', 'order', 'order_mrqjeu64_chdmh8', '2026-07-18 15:44:18.748', 1),
('notify_mrqjfw9e_tk3nqz', 'Đơn hàng order_mrqjeu64_chdmh8 đã được duyệt thanh toán', 'payment', 'order_mrqjeu64_chdmh8', '2026-07-18 15:45:08.114', 1),
('notify_mrqjiqlg_8egbhr', 'Đơn hàng mới: ESET HOME Security Essential – 1 thiết bị', 'order', 'order_mrqjiqlg_8bxy5l', '2026-07-18 15:47:20.740', 1),
('notify_mrqjiyjk_1flswi', 'Đơn hàng đã được duyệt: ESET HOME Security Essential – 1 thiết bị', 'payment', 'order_mrqjiqlg_8bxy5l', '2026-07-18 15:47:31.040', 1);

-- ORDERS DATA
INSERT INTO orders (id, email, phone, note, delivery_method, coupon_code, total, status, created_at) VALUES
('order_mrq505lo_srhs3q', 'customer@example.com', '0123456789', 'Test order', 'email', NULL, 1990000, 'approved', '2026-07-18 09:00:59.100'),
('order_mrq5w5g7_fqx3re', 'test2@example.com', '0987654321', 'Test2', 'email', NULL, 2690000, 'approved', '2026-07-18 09:25:51.895'),
('order_mrq5xjaj_m54q7o', 'test3@example.com', '0900000000', 'Test3', 'email', NULL, 1490000, 'approved', '2026-07-18 09:26:56.491'),
('order_mrq63ziu_es94sl', 'test1@example.com', '0912345678', 'ordered via test1', 'email', NULL, 1990000, 'approved', '2026-07-18 09:31:57.462'),
('order_mrq6bc3s_fzjp07', 'test1@example.com', '0912345678', 'order from test1 UI', 'email', NULL, 1290000, 'approved', '2026-07-18 09:37:40.360'),
('order_mrq6s4s2_w3rugu', 'akdhd', '1233', '', 'email', NULL, 1490000, 'approved', '2026-07-18 09:50:44.018'),
('order_mrq6yrp3_rd06kd', 'ạdgasgdds', '02493', '', 'email', NULL, 290000, 'approved', '2026-07-18 09:55:53.655'),
('order_mrq7wutt_txvlkr', 'ffd', '3232', '', 'email', NULL, 1990000, 'approved', '2026-07-18 10:22:24.017'),
('order_mrqfvngy_lwxdnd', 'dtc235200121@ictu.edu.vn', 'ds', '', 'email', NULL, 250000, 'approved', '2026-07-18 14:05:24.754'),
('order_mrqj79lw_vf6ha7', 'adddd', '23', '', 'email', NULL, 2690000, 'approved', '2026-07-18 15:38:25.508'),
('order_mrqjeu64_chdmh8', 'đăcxfd', '123', '', 'email', NULL, 3980000, 'approved', '2026-07-18 15:44:18.748'),
('order_mrqjiqlg_8bxy5l', 'hh', '12', '', 'email', NULL, 250000, 'approved', '2026-07-18 15:47:20.740');

-- ORDER_ITEMS DATA
INSERT INTO order_items (id, order_id, product_id, name, quantity, unit_price) VALUES
(1, 'order_mrqjiqlg_8bxy5l', 'p6', 'ESET HOME Security Essential – 1 thiết bị', 1, 250000),
(2, 'order_mrqjeu64_chdmh8', 'p1', 'Windows 11 Home – Key bản quyền vĩnh viễn', 2, 1990000),
(3, 'order_mrqj79lw_vf6ha7', 'p2', 'Windows 11 Pro – Key bản quyền vĩnh viễn', 1, 2690000),
(4, 'order_mrqfvngy_lwxdnd', 'p6', 'ESET HOME Security Essential – 1 thiết bị', 1, 250000),
(5, 'order_mrq7wutt_txvlkr', 'p1', 'Windows 11 Home – Key bản quyền vĩnh viễn', 1, 1990000),
(6, 'order_mrq6yrp3_rd06kd', 'p5', 'Kaspersky Standard – 1 PC / 12 tháng', 1, 290000),
(7, 'order_mrq6s4s2_w3rugu', 'p3', 'Office 2024 Home & Student – Trọn đời', 1, 1490000),
(8, 'order_mrq6bc3s_fzjp07', 'p4', 'Microsoft 365 Family', 1, 1290000),
(9, 'order_mrq63ziu_es94sl', 'p1', 'Windows 11 Home', 1, 1990000),
(10, 'order_mrq5xjaj_m54q7o', 'p3', 'Office 2024', 1, 1490000),
(11, 'order_mrq5w5g7_fqx3re', 'p2', 'Windows 11 Pro', 1, 2690000),
(12, 'order_mrq505lo_srhs3q', 'p1', 'Windows 11 Home – Key bản quyền vĩnh viễn', 1, 1990000);

-- PRODUCTS DATA
INSERT INTO products (id, slug, name, brand, category_slug, price, compare_at, rating, reviews, image, badge, stock, description, platforms, specs) VALUES
('p1', 'windows-11-home', 'Windows 11 Home – Key bản quyền vĩnh viễn', 'Microsoft', 'windows', 1990000, 3290000, 4.8, 1245, '/src/assets/sw-windows11.jpg', 'Bán chạy', 120, 'Key kích hoạt Windows 11 Home chính hãng Microsoft, bản quyền vĩnh viễn, sử dụng cho 1 thiết bị. Nhận key sau 5 phút qua email, hỗ trợ cài đặt từ xa miễn phí.', '["Windows"]', '[{"label":"Loại license","value":"Retail – vĩnh viễn"},{"label":"Số thiết bị","value":"1 PC"},{"label":"Ngôn ngữ","value":"Đa ngôn ngữ (có Tiếng Việt)"},{"label":"Nền tảng","value":"Windows 11"},{"label":"Bảo hành","value":"Trọn đời sử dụng"}]'),
('p2', 'windows-11-pro', 'Windows 11 Pro – Key bản quyền vĩnh viễn', 'Microsoft', 'windows', 2690000, 4590000, 4.9, 872, '/src/assets/sw-windows11pro.jpg', 'Mới', 80, 'Phiên bản Windows 11 Pro dành cho doanh nghiệp và người dùng chuyên nghiệp. Hỗ trợ BitLocker, Hyper-V, Remote Desktop và Domain Join.', '["Windows"]', '[{"label":"Loại license","value":"Retail – vĩnh viễn"},{"label":"Số thiết bị","value":"1 PC"},{"label":"Tính năng","value":"BitLocker, Hyper-V, RDP"},{"label":"Nền tảng","value":"Windows 11 Pro"}]'),
('p3', 'office-2024-home-student', 'Office 2024 Home & Student – Trọn đời', 'Microsoft', 'office', 1490000, 2990000, 4.7, 2140, '/src/assets/sw-office.jpg', '-50%', 200, 'Bộ Office 2024 gồm Word, Excel, PowerPoint và OneNote. Bản quyền vĩnh viễn cho 1 PC hoặc Mac, không cần trả phí hàng năm.', '["Windows","macOS"]', '[{"label":"Ứng dụng","value":"Word, Excel, PowerPoint, OneNote"},{"label":"Loại license","value":"Vĩnh viễn"},{"label":"Số thiết bị","value":"1 PC / Mac"},{"label":"Ngôn ngữ","value":"Đa ngôn ngữ"}]'),
('p4', 'microsoft-365-family', 'Microsoft 365 Family – 12 tháng cho 6 người', 'Microsoft', 'office', 1290000, 1990000, 4.8, 3421, '/src/assets/sw-m365.jpg', 'Ưu đãi', 150, 'Gói Microsoft 365 Family bản quyền 12 tháng, dùng cho 6 người trên tối đa 5 thiết bị/người. Kèm 1TB OneDrive/người và các ứng dụng luôn cập nhật.', '["Windows","macOS"]', '[{"label":"Thời hạn","value":"12 tháng"},{"label":"Số người dùng","value":"6 người"},{"label":"OneDrive","value":"1 TB / người"},{"label":"Ứng dụng","value":"Word, Excel, PowerPoint, Outlook, Teams"}]'),
('p5', 'kaspersky-standard', 'Kaspersky Standard – 1 PC / 12 tháng', 'Kaspersky', 'antivirus', 290000, 490000, 4.7, 5210, '/src/assets/sw-kaspersky.jpg', '-40%', 300, 'Giải pháp diệt virus toàn diện của Kaspersky. Chống mã độc, ransomware, lừa đảo trực tuyến và bảo vệ giao dịch ngân hàng.', '["Windows","macOS"]', '[{"label":"Thời hạn","value":"12 tháng"},{"label":"Số thiết bị","value":"1 PC"},{"label":"Hệ điều hành","value":"Windows / macOS"},{"label":"Tính năng","value":"Anti-ransomware, Safe Money"}]'),
('p6', 'eset-home-security-essential', 'ESET HOME Security Essential – 1 thiết bị', 'ESET', 'antivirus', 250000, 450000, 4.6, 1820, '/src/assets/sw-eset.jpg', NULL, 250, 'Phần mềm diệt virus ESET nhẹ, nhanh, ít tốn tài nguyên. Bảo vệ thời gian thực khỏi virus, mã độc và tấn công mạng.', '["Windows","Android","macOS"]', '[{"label":"Thời hạn","value":"12 tháng"},{"label":"Số thiết bị","value":"1 thiết bị"},{"label":"Nền tảng","value":"Windows / Android / macOS"}]'),
('p7', 'bitdefender-total-security', 'Bitdefender Total Security – 5 thiết bị / 1 năm', 'Bitdefender', 'antivirus', 590000, 990000, 4.9, 940, '/src/assets/sw-bitdefender.jpg', 'Đề cử', 90, 'Giải pháp bảo mật toàn diện đa nền tảng cho tối đa 5 thiết bị Windows, macOS, Android, iOS. Đạt nhiều giải AV-TEST.', '["Windows","macOS","Android","iOS"]', '[{"label":"Thời hạn","value":"12 tháng"},{"label":"Số thiết bị","value":"5 thiết bị"},{"label":"Nền tảng","value":"Windows / macOS / Android / iOS"},{"label":"Tính năng","value":"VPN 200MB, Parental Control, Anti-theft"}]');

-- PRODUCT KEYS DATA
INSERT INTO product_keys (id, product_id, license_key, status) VALUES
('key1', 'p1', 'WIN11-AAAA-BBBB-CCCC', 'available'),
('key2', 'p2', 'WIN11-DDDD-EEEE-FFFF', 'available');

-- INDEXES
CREATE INDEX idx_notifications_order ON notifications (order_id);
CREATE INDEX idx_orders_coupon ON orders (coupon_code);
CREATE INDEX idx_items_order ON order_items (order_id);
CREATE INDEX idx_items_product ON order_items (product_id);
CREATE INDEX idx_products_category ON products (category_slug);
CREATE INDEX idx_keys_product ON product_keys (product_id);