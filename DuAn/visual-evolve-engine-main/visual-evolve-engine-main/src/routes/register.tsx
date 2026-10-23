import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Đăng ký — Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Mật khẩu xác nhận chưa khớp");
      return;
    }
    const result = register(name.trim(), email.trim(), password);
    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate({ to: "/login" });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 lg:px-0 py-16">
        <div className="bg-white rounded-3xl shadow-lg ring-1 ring-black/5 p-8">
          <h1 className="text-3xl font-semibold mb-2">Tạo tài khoản mới</h1>
          <p className="text-sm text-zinc-500 mb-6">Đăng ký để lưu thông tin và tiện theo dõi đơn hàng.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-zinc-700">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <label className="block text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <label className="block text-sm font-medium text-zinc-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <label className="block text-sm font-medium text-zinc-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <button type="submit" className="w-full rounded-2xl bg-brand px-4 py-3 text-white font-semibold hover:bg-brand-hover transition-colors">
              Đăng ký
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500 text-center">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-hover">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
