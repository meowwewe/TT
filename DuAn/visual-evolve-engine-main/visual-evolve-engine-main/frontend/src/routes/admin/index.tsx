import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { apiFetch, apiUrl } from "@/lib/api";

type DashboardStats = {
  orderCount: number;
  productCount: number;
  categoryCount: number;
  couponCount: number;
  notificationCount: number;
};

type NotificationItem = {
  id: string;
  message: string;
  type: string;
  orderId?: string;
  createdAt: string;
  read: boolean;
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
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type ProductData = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  badge?: string;
};

type CategoryData = { id: string; slug: string; name: string };

type CouponData = { id: string; code: string; discountPercent: number; active: boolean };

type KeyData = { id: string; productId: string; key: string; status: string };

// Banner/Posters removed from admin UI

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: AdminDashboard,
});

const sections = [
  "dashboard",
  "notifications",
  "orders",
  "analytics",
  "products",
  "categories",
  "coupons",
  "keys",
] as const;

type Section = (typeof sections)[number];

function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [keys, setKeys] = useState<KeyData[]>([]);
  // banners removed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const analyticsDayTotal = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return orders
      .filter((order) => order.status === "approved" && new Date(order.createdAt) >= startOfDay)
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }, [orders]);

  const tabLabel = useMemo(
    () => ({
      dashboard: "Tổng quan",
      notifications: "Thông báo",
      orders: "Đơn hàng",
      analytics: "Thống Kê",
      products: "Sản phẩm",
      categories: "Danh mục",
      coupons: "Mã giảm giá",
      keys: "Key bản quyền",
    }),
    [],
  );

  function getStatusLabel(status: string) {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "paid":
        return "Đã thanh toán";
      case "approved":
        return "Đã duyệt";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  }

  function getOrderLabel(order: OrderData) {
    const names = order.items.map((item) => item.name).filter(Boolean);
    if (names.length === 0) return order.id;
    if (names.length === 1) return names[0];
    return `${names[0]} +${names.length - 1} sản phẩm`;
  }

  useEffect(() => {
    const loadSession = async () => {
      const response = await apiFetch("/admin/session");
      if (!response.ok) {
        navigate({ to: "/admin/login" });
        return;
      }
      await Promise.all([loadStats(), loadNotifications(), loadOrders(), loadProducts(), loadCategories(), loadCoupons(), loadKeys()]);
      setLoading(false);
    };
    loadSession();
    const source = new EventSource(apiUrl("/admin/notifications/stream"), { withCredentials: true });
    source.onopen = () => setSseConnected(true);
    source.onerror = () => setSseConnected(false);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as NotificationItem;
      setNotifications((current) => [payload, ...current]);
      setStats((current) => current ? { ...current, notificationCount: current.notificationCount + 1 } : current);
    };
    setEventSource(source);

    // Polling fallback if SSE isn't supported/connected
    let pollId: number | null = null;
    pollId = window.setInterval(() => {
      if (!sseConnected) loadNotifications();
    }, 10000);

    return () => {
      source.close();
      if (pollId) clearInterval(pollId);
    };
  }, [navigate]);

  const loadStats = async () => {
    const response = await apiFetch("/admin/dashboard");
    if (!response.ok) return;
    const data = await response.json();
    setStats(data);
  };

  const loadNotifications = async () => {
    const response = await apiFetch("/admin/notifications");
    if (!response.ok) return;
    const data = await response.json();
    setNotifications(data);
  };

  const loadOrders = async () => {
    const response = await apiFetch("/admin/orders");
    if (!response.ok) return;
    setOrders(await response.json());
  };

  const loadProducts = async () => {
    const response = await apiFetch("/admin/products");
    if (!response.ok) return;
    setProducts(await response.json());
  };

  const loadCategories = async () => {
    const response = await apiFetch("/admin/categories");
    if (!response.ok) return;
    setCategories(await response.json());
  };

  const loadCoupons = async () => {
    const response = await apiFetch("/admin/coupons");
    if (!response.ok) return;
    setCoupons(await response.json());
  };

  const loadKeys = async () => {
    const response = await apiFetch("/admin/keys");
    if (!response.ok) return;
    setKeys(await response.json());
  };

  // loadBanners removed

  const markNotificationRead = async (id: string) => {
    await apiFetch(`/admin/notifications/${encodeURIComponent(id)}`, { method: "POST" });
    setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
    setStats((current) => current ? { ...current, notificationCount: Math.max(0, current.notificationCount - 1) } : current);
  };

  const viewOrderFromNotification = async (orderId?: string, notificationId?: string) => {
    if (!orderId) return;
    if (notificationId) await markNotificationRead(notificationId);
    let order = orders.find((o) => o.id === orderId) as OrderData | undefined;
    if (!order) {
      await loadOrders();
      order = orders.find((o) => o.id === orderId);
    }
    if (order) setSelectedOrder(order);
    setActive("orders");
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const response = await apiFetch(`/admin/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;
    const order = await response.json();
    setOrders((current) => current.map((item) => (item.id === order.id ? order : item)));
    loadStats();
  };

  const handleLogout = async () => {
    await apiFetch("/admin/logout", { method: "POST" });
    navigate({ to: "/admin/login" });
  };

  const createItem = async (path: string, body: unknown, reload: () => Promise<void>) => {
    const response = await apiFetch(path.replace(/^\/api/, ""), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return;
    await reload();
    loadStats();
  };

  const updateItem = async (path: string, body: unknown, reload: () => Promise<void>) => {
    const response = await apiFetch(path.replace(/^\/api/, ""), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return;
    await reload();
    loadStats();
  };

  const deleteItem = async (path: string, reload: () => Promise<void>) => {
    const response = await apiFetch(path.replace(/^\/api/, ""), { method: "DELETE" });
    if (!response.ok) return;
    await reload();
    loadStats();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">Đang tải dữ liệu admin...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Bảng điều khiển Admin</p>
            <h1 className="text-3xl font-semibold">Quản trị Công Ty TNHH Công Nghệ Nam Nguyễn</h1>
          </div>
          <button onClick={handleLogout} className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition">
            Đăng xuất
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActive(section)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${active === section ? "bg-brand text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
            >
              {tabLabel[section]}
            </button>
          ))}
        </div>

        {active === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { key: "orders", label: "Đơn hàng", value: stats?.orderCount ?? 0 },
              { key: "products", label: "Sản phẩm", value: stats?.productCount ?? 0 },
              { key: "categories", label: "Danh mục", value: stats?.categoryCount ?? 0 },
              { key: "coupons", label: "Mã giảm giá", value: stats?.couponCount ?? 0 },
              { key: "notifications", label: "Thông báo chưa đọc", value: stats?.notificationCount ?? 0 },
              { key: "analytics", label: "Thống Kê", value: analyticsDayTotal },
            ].map((card) => (
              <div key={card.key} onClick={() => setActive(card.key as Section)} role="button" tabIndex={0} className="cursor-pointer rounded-3xl border border-zinc-200 p-6 bg-white shadow-sm hover:shadow-md">
                <p className="text-sm text-zinc-500 uppercase tracking-[0.2em] mb-3">{card.label}</p>
                <p className="text-4xl font-semibold">
                  {card.key === "analytics" ? new Intl.NumberFormat("vi-VN").format(card.value as number) + "₫" : card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {active === "analytics" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Thống Kê</h2>
            <AnalyticsView orders={orders} />
          </div>
        )}

        {active === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Chưa đọc</h3>
              <div className="space-y-4">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div key={notification.id} className={`rounded-3xl border p-4 ${notification.read ? "border-zinc-200 bg-zinc-50" : "border-brand bg-white"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{notification.message}</p>
                        <p className="text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => markNotificationRead(notification.id)} className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Đã đọc</button>
                        {notification.orderId && (
                          <button onClick={() => viewOrderFromNotification(notification.orderId, notification.id)} className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100">Xem đơn</button>
                        )}
                      </div>
                    </div>
                    {selectedOrder && notification.orderId === selectedOrder.id && (
                      <div className="mt-4 rounded-2xl border p-4 bg-zinc-50">
                        <p className="font-semibold">Sản phẩm: {getOrderLabel(selectedOrder)}</p>
                        <p className="text-sm">Khách: {selectedOrder.email} · {selectedOrder.phone}</p>
                        <div className="mt-2 space-y-2 text-sm text-zinc-700">
                          {selectedOrder.items.map((it) => (
                            <div key={it.productId} className="flex justify-between">
                              <span>{it.name} x{it.qty}</span>
                              <span>{new Intl.NumberFormat("vi-VN").format(it.price * it.qty)}₫</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold mt-2">
                            <span>Tổng</span>
                            <span>{new Intl.NumberFormat("vi-VN").format(selectedOrder.total)}₫</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            {selectedOrder.status !== 'approved' && selectedOrder.status !== 'cancelled' ? (
                              <>
                                <button onClick={() => updateOrderStatus(selectedOrder.id, "approved")} className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Duyệt</button>
                                <button onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")} className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600">Hủy</button>
                              </>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm font-semibold text-zinc-700">Trạng thái: {selectedOrder.status === 'approved' ? 'Đã duyệt' : 'Đã hủy'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Đã đọc</h3>
              <div className="space-y-4">
                {notifications.filter(n => n.read).map((notification) => (
                  <div key={notification.id} className="rounded-3xl border p-4 border-zinc-200 bg-zinc-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{notification.message}</p>
                        <p className="text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                      {notification.orderId && (
                        <button onClick={() => viewOrderFromNotification(notification.orderId, notification.id)} className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100">Xem đơn</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "orders" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Cần duyệt</h3>
              <div className="space-y-4">
                {orders.filter(o => o.status !== 'approved' && o.status !== 'cancelled').map((order) => (
                  <div key={order.id} className="rounded-3xl border border-zinc-200 bg-white p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-zinc-500">Sản phẩm: {getOrderLabel(order)}</p>
                        <p className="text-lg font-semibold">{order.email}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm">
                        <span className="rounded-full border px-3 py-1 text-zinc-600">{getStatusLabel(order.status)}</span>
                        <button onClick={() => updateOrderStatus(order.id, "approved")} className="rounded-full bg-brand px-3 py-1 text-white text-xs">Duyệt thanh toán</button>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-zinc-600">
                      <p>Điện thoại: {order.phone}</p>
                      <p>Phương thức: {order.deliveryMethod}</p>
                      <p>Ghi chú: {order.note || "Không có"}</p>
                        <p>Tổng: {new Intl.NumberFormat("vi-VN").format(order.total)}₫</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Đã xử lý</h3>
                <div className="space-y-4">
                  {orders.filter(o => o.status === 'approved' || o.status === 'cancelled').map((order) => (
                  <div key={order.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-zinc-500">Sản phẩm: {getOrderLabel(order)}</p>
                        <p className="text-lg font-semibold">{order.email}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${order.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-zinc-600">
                      <p>Điện thoại: {order.phone}</p>
                      <p>Phương thức: {order.deliveryMethod}</p>
                      <p>Ghi chú: {order.note || "Không có"}</p>
                      <p>Tổng: {new Intl.NumberFormat("vi-VN").format(order.total)}₫</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "products" && (
          <AdminCollection<ProductData>
            items={products}
            fields={["name", "brand", "category", "price", "stock"]}
            onCreate={async () => {
              const name = window.prompt("Tên sản phẩm");
              const slug = window.prompt("Slug sản phẩm");
              const brand = window.prompt("Thương hiệu");
              const category = window.prompt("Danh mục slug");
              const price = Number(window.prompt("Giá"));
              const stock = Number(window.prompt("Số lượng"));
              if (name && slug && brand && category && !Number.isNaN(price) && !Number.isNaN(stock)) {
                await createItem("/api/admin/products", { name, slug, brand, category, price, stock, image: "https://via.placeholder.com/420x280?text=Product", rating: 4.5, reviews: 0, description: "", platforms: [], specs: [] }, loadProducts);
              }
            }}
            onEdit={async (item) => {
              const name = window.prompt("Tên sản phẩm", item.name);
              const price = Number(window.prompt("Giá", String(item.price)));
              const stock = Number(window.prompt("Số lượng", String(item.stock)));
              if (name && !Number.isNaN(price) && !Number.isNaN(stock)) {
                await updateItem(`/api/admin/products/${item.id}`, { name, price, stock }, loadProducts);
              }
            }}
            onDelete={async (item) => deleteItem(`/api/admin/products/${item.id}`, loadProducts)}
          />
        )}

        {active === "categories" && (
          <AdminCollection<CategoryData>
            items={categories}
            fields={["name", "slug"]}
            onCreate={async () => {
              const name = window.prompt("Tên danh mục");
              const slug = window.prompt("Slug danh mục");
              if (name && slug) {
                await createItem("/api/admin/categories", { name, slug }, loadCategories);
              }
            }}
            onEdit={async (item) => {
              const name = window.prompt("Tên danh mục", item.name);
              const slug = window.prompt("Slug danh mục", item.slug);
              if (name && slug) {
                await updateItem(`/api/admin/categories/${item.id}`, { name, slug }, loadCategories);
              }
            }}
            onDelete={async (item) => deleteItem(`/api/admin/categories/${item.id}`, loadCategories)}
          />
        )}

        {active === "coupons" && (
          <AdminCollection<CouponData>
            items={coupons}
            fields={["code", "discountPercent", "active"]}
            onCreate={async () => {
              const code = window.prompt("Mã coupon");
              const discountPercent = Number(window.prompt("Phần trăm giảm giá"));
              if (code && !Number.isNaN(discountPercent)) {
                await createItem("/api/admin/coupons", { code, discountPercent, active: true }, loadCoupons);
              }
            }}
            onEdit={async (item) => {
              const code = window.prompt("Mã coupon", item.code);
              const discountPercent = Number(window.prompt("Phần trăm giảm giá", String(item.discountPercent)));
              const active = window.confirm("Kích hoạt coupon?");
              if (code && !Number.isNaN(discountPercent)) {
                await updateItem(`/api/admin/coupons/${item.id}`, { code, discountPercent, active }, loadCoupons);
              }
            }}
            onDelete={async (item) => deleteItem(`/api/admin/coupons/${item.id}`, loadCoupons)}
          />
        )}

        {active === "keys" && (
          <AdminCollection<KeyData>
            items={keys}
            fields={["productId", "key", "status"]}
            onCreate={async () => {
              const productId = window.prompt("Product ID");
              const key = window.prompt("Key bản quyền");
              if (productId && key) {
                await createItem("/api/admin/keys", { productId, key, status: "available" }, loadKeys);
              }
            }}
            onEdit={async (item) => {
              const status = window.prompt("Trạng thái (available/used)", item.status) ?? item.status;
              await updateItem(`/api/admin/keys/${item.id}`, { status }, loadKeys);
            }}
            onDelete={async (item) => deleteItem(`/api/admin/keys/${item.id}`, loadKeys)}
          />
        )}

        {/* Banners/Posters removed from admin UI */}
      </div>
    </Layout>
  );
}

function AnalyticsView({ orders }: { orders: OrderData[] }) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const totals = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay() + 1); // Monday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filtered: OrderData[] = orders.filter((o) => o.status === 'approved');
    if (period === 'day') {
      filtered = filtered.filter((o) => new Date(o.createdAt) >= startOfDay);
    } else if (period === 'week') {
      filtered = filtered.filter((o) => new Date(o.createdAt) >= startOfWeek);
    } else if (period === 'month') {
      filtered = filtered.filter((o) => new Date(o.createdAt) >= startOfMonth);
    }

    const totalValue = filtered.reduce((s, o) => s + (o.total || 0), 0);
    return { count: filtered.length, totalValue };
  }, [orders, period]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={() => setPeriod('day')} className={`px-3 py-1 rounded ${period==='day'? 'bg-brand text-white':'bg-zinc-100'}`}>Ngày</button>
          <button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded ${period==='week'? 'bg-brand text-white':'bg-zinc-100'}`}>Tuần</button>
          <button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded ${period==='month'? 'bg-brand text-white':'bg-zinc-100'}`}>Tháng</button>
        </div>
        <div className="text-sm text-zinc-500">Đơn hàng đã duyệt: {totals.count}</div>
      </div>
      <div className="text-3xl font-semibold">Tổng giá trị: {new Intl.NumberFormat('vi-VN').format(totals.totalValue)}₫</div>
    </div>
  );
}

function AdminCollection<T extends { id: string }>({
  items,
  fields,
  onCreate,
  onEdit,
  onDelete,
}: {
  items: T[];
  fields: string[];
  onCreate: () => Promise<void>;
  onEdit: (item: T) => Promise<void>;
  onDelete: (item: T) => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl font-semibold">Danh sách</h2>
        <button onClick={onCreate} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition">
          Thêm mới
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-zinc-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              {fields.map((field) => (
                <p key={field} className="text-sm text-zinc-600"><span className="font-semibold capitalize">{field}:</span> {(item as any)[field]?.toString() ?? "-"}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(item)} className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100">Sửa</button>
              <button onClick={() => onDelete(item)} className="rounded-full border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
