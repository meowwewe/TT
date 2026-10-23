const { spawnSync } = require("node:child_process");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");

const backendDir = path.resolve(__dirname, "..");
const mode = process.argv.slice(2);
if (mode.length !== 1 || !["--local", "--remote"].includes(mode[0])) {
  throw new Error("Choose exactly one target: --local or --remote");
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Cannot import a non-finite number");
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table, columns, values) {
  return `INSERT OR IGNORE INTO ${table} (${columns.join(", ")}) VALUES (${values.map(sql).join(", ")});`;
}

const data = JSON.parse(
  readFileSync(path.join(backendDir, "data", "db.json"), "utf8"),
);
const collections = ["categories", "products", "coupons", "keys", "banners", "orders", "notifications"];
for (const collection of collections) {
  if (!Array.isArray(data[collection])) {
    throw new Error(`Fixture collection "${collection}" must be an array`);
  }
}

const statements = [];
for (const row of data.categories) {
  statements.push(insert("categories", ["id", "slug", "name"], [row.id, row.slug, row.name]));
}
for (const row of data.products) {
  statements.push(
    insert(
      "products",
      [
        "id", "slug", "name", "brand", "category_slug", "price", "compare_at",
        "rating", "reviews", "image", "badge", "stock", "description", "platforms", "specs",
      ],
      [
        row.id, row.slug, row.name, row.brand, row.category, row.price, row.compareAt ?? null,
        row.rating, row.reviews, row.image, row.badge ?? null, row.stock, row.description,
        JSON.stringify(row.platforms ?? []), JSON.stringify(row.specs ?? []),
      ],
    ),
  );
}
for (const row of data.coupons) {
  statements.push(
    insert("coupons", ["id", "code", "discount_percent", "active"], [
      row.id, row.code, row.discountPercent, row.active,
    ]),
  );
}
for (const row of data.keys) {
  statements.push(
    insert("product_keys", ["id", "product_id", "license_key", "status"], [
      row.id, row.productId, row.key, row.status,
    ]),
  );
}
for (const row of data.banners) {
  statements.push(
    insert("banners", ["id", "title", "image", "type", "active"], [
      row.id, row.title, row.image, row.type, row.active,
    ]),
  );
}
for (const row of data.orders) {
  statements.push(
    insert(
      "orders",
      [
        "id", "email", "phone", "note", "delivery_method", "coupon_code",
        "total", "status", "created_at",
      ],
      [
        row.id, row.email, row.phone, row.note ?? "", row.deliveryMethod, row.couponCode ?? null,
        row.total, row.status, row.createdAt,
      ],
    ),
  );

  for (const item of row.items ?? []) {
    const values = [row.id, item.productId, item.name, item.qty, item.price];
    const [orderId, productId, name, quantity, unitPrice] = values.map(sql);
    statements.push(
      `INSERT INTO order_items (order_id, product_id, name, quantity, unit_price) SELECT ${orderId}, ${productId}, ${name}, ${quantity}, ${unitPrice} WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = ${orderId} AND product_id = ${productId} AND name = ${name} AND quantity = ${quantity} AND unit_price = ${unitPrice});`,
    );
  }
}
for (const row of data.notifications) {
  statements.push(
    insert(
      "notifications",
      ["id", "message", "type", "order_id", "created_at", "is_read"],
      [row.id, row.message, row.type, row.orderId ?? null, row.createdAt, row.read],
    ),
  );
}

const tempDir = mkdtempSync(path.join(tmpdir(), "duanbackup-d1-seed-"));
const sqlFile = path.join(tempDir, "seed.sql");
const wrangler = path.join(backendDir, "node_modules", "wrangler", "bin", "wrangler.js");
try {
  writeFileSync(sqlFile, `${statements.join("\n")}\n`, "utf8");
  const result = spawnSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "execute",
      "duanbackup",
      mode[0],
      "--file",
      sqlFile,
      "--config",
      "./wrangler.jsonc",
    ],
    { cwd: backendDir, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exitCode = result.status ?? 1;
  } else {
    console.log(`Fixture imported into ${mode[0] === "--local" ? "local" : "remote"} D1.`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
