import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Tài khoản — Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 lg:px-0 py-16 text-center">
          <div className="bg-white rounded-3xl shadow-lg ring-1 ring-black/5 p-8">
            <h1 className="text-3xl font-semibold mb-4">Bạn chưa đăng nhập</h1>
            <p className="text-zinc-500 mb-6">Vui lòng đăng nhập để quản lý thông tin tài khoản và đơn hàng.</p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className="rounded-2xl bg-brand px-4 py-3 text-white font-semibold hover:bg-brand-hover transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-700 hover:bg-zinc-50 transition-colors">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 lg:px-0 py-16">
        <div className="bg-white rounded-3xl shadow-lg ring-1 ring-black/5 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Xin chào, {user.name.split(" ")[0]}</h1>
            <p className="text-zinc-500">Quản lý thông tin tài khoản của bạn tại Công Ty TNHH Công Nghệ Nam Nguyễn.</p>
          </div>
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Họ và tên</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </Layout>
  );
}
