import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Đăng nhập — Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@namnguyen.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/session").then(async (response) => {
      if (response.ok) {
        navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Đăng nhập thất bại");
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 lg:px-0 py-24">
        <div className="bg-white rounded-3xl shadow-lg ring-1 ring-black/5 p-8">
          <h1 className="text-3xl font-semibold mb-3">Đăng nhập Admin</h1>
          <p className="text-sm text-zinc-500 mb-6">Sử dụng tài khoản admin để truy cập quản trị.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
            <label className="block text-sm font-medium text-zinc-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <button className="w-full rounded-2xl bg-brand px-4 py-3 text-white font-semibold hover:bg-brand-hover transition-colors">Đăng nhập</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
