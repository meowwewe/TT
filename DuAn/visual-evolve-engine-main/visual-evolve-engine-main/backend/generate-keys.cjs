const { randomBytes, randomUUID } = require("node:crypto");
const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const KEYS_PER_PRODUCT = 50;
const backendDir = __dirname;
const fixturePath = path.join(backendDir, "data", "db.json");
const outputPath = path.join(backendDir, "seed-keys.sql");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

if (!Array.isArray(fixture.products) || fixture.products.length === 0) {
  throw new Error(`No products found in ${fixturePath}`);
}

const escapeSql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statements = ["-- TEST ONLY: generated placeholder keys are not valid licenses."];

for (const product of fixture.products) {
  if (typeof product.id !== "string" || !product.id) {
    throw new Error("Each product must have a non-empty string id");
  }

  for (let index = 0; index < KEYS_PER_PRODUCT; index += 1) {
    const licenseKey = `TEST-${product.id.toUpperCase()}-${randomBytes(6).toString("hex").toUpperCase()}`;
    const id = `testkey-${randomUUID()}`;
    statements.push(
      `INSERT INTO product_keys (id, product_id, license_key, status) ` +
        `SELECT ${escapeSql(id)}, ${escapeSql(product.id)}, ${escapeSql(licenseKey)}, 'available' ` +
        `WHERE NOT EXISTS (` +
        `SELECT 1 FROM product_keys WHERE product_id = ${escapeSql(product.id)} ` +
        `AND license_key = ${escapeSql(licenseKey)}` +
        `);`,
    );
  }
}

writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
console.log(
  `Generated ${fixture.products.length * KEYS_PER_PRODUCT} TEST-only keys for ` +
    `${fixture.products.length} products: ${path.relative(backendDir, outputPath)}`,
);
