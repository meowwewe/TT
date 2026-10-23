const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

function readDevVars() {
  const file = path.resolve(__dirname, "..", ".dev.vars");
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return separator < 0
          ? [line.trim(), ""]
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

(async () => {
  try {
    const localVars = readDevVars();
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:8787';
    const credentials = {
      email: process.env.ADMIN_EMAIL || localVars.ADMIN_EMAIL || 'admin@namnguyen.local',
      password: process.env.ADMIN_PASSWORD || localVars.ADMIN_PASSWORD,
    };
    if (!credentials.password) throw new Error('Set ADMIN_PASSWORD in .dev.vars or the process environment');
    const loginResp = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const loginText = await loginResp.text();
    console.log('LOGIN status', loginResp.status);
    console.log('LOGIN body:', loginText);

    if (!loginResp.ok) throw new Error('Admin login failed');
    const setCookie = loginResp.headers.get('set-cookie') || '';
    const cookie = setCookie.split(';')[0];
    // Use cookie if available
    const dashResp = await fetch(base + '/api/admin/dashboard', { headers: cookie ? { cookie } : {} });
    console.log('DASHBOARD status', dashResp.status);
    if (!dashResp.ok) throw new Error('Admin dashboard request failed');
    if (dashResp.headers.get('content-type')?.includes('application/json')) {
      console.log('DASHBOARD body:', await dashResp.json());
    } else {
      console.log('DASHBOARD text:', await dashResp.text());
    }

    const productsResp = await fetch(base + '/api/products', { headers: cookie ? { cookie } : {} });
    if (!productsResp.ok) throw new Error('Product request failed');
    const products = await productsResp.json();
    console.log('PRODUCTS_COUNT:', Array.isArray(products) ? products.length : JSON.stringify(products).slice(0,200));

    const categoriesResp = await fetch(base + '/api/categories', { headers: cookie ? { cookie } : {} });
    if (!categoriesResp.ok) throw new Error('Category request failed');
    const categories = await categoriesResp.json();
    console.log('CATEGORIES_COUNT:', Array.isArray(categories) ? categories.length : JSON.stringify(categories).slice(0,200));

    const searchResp = await fetch(base + '/api/search?q=Windows');
    if (!searchResp.ok) throw new Error('Product search request failed');
    const searchResults = await searchResp.json();
    if (!Array.isArray(searchResults)) throw new Error('Product search must return a JSON array');
    console.log('SEARCH_RESULTS_COUNT:', searchResults.length);

    for (const section of ['orders', 'notifications', 'products', 'categories', 'coupons', 'keys', 'banners']) {
      const response = await fetch(base + '/api/admin/' + section, { headers: cookie ? { cookie } : {} });
      if (!response.ok) throw new Error('Admin ' + section + ' request failed');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Admin ' + section + ' endpoint must return a JSON array');
      console.log(section.toUpperCase() + '_COUNT:', rows.length);
    }
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
