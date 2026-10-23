import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import logoImg from "../../logo/logo.png";
import { Search, ShoppingCart, User, Heart, Truck, Shield, Phone } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function AnnouncementBar() {
  return (
    <div className="bg-brand text-brand-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-9 flex items-center justify-between gap-4">
        <p className="font-medium tracking-wide truncate">
          <Truck className="inline size-3.5 mr-1.5 -mt-0.5" />
          Giao key bản quyền qua email trong 5 phút · Hỗ trợ cài đặt miễn phí
        </p>
        <div className="hidden md:flex gap-6 text-white/80">
          <a href="#" className="hover:text-white flex items-center gap-1.5"><Phone className="size-3" /> 1900 6868</a>
          <a href="#" className="uppercase tracking-widest text-[10px] hover:text-white">Tra cứu đơn hàng</a>
          <a href="#" className="uppercase tracking-widest text-[10px] hover:text-white">Hỗ trợ 24/7</a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();
  const { user } = useAuth();
  const [adminName, setAdminName] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const isAdminArea = location.pathname.startsWith("/admin");
    if (!isAdminArea) {
      setAdminName(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setAdminName(data.name || null);
        } else {
          setAdminName(null);
        }
      } catch {
        setAdminName(null);
      }
    })();
  }, [location.pathname]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate({ to: "/search", search: { q: trimmed } });
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logoImg} alt="Công Ty TNHH Công Nghệ Nam Nguyễn" className="h-8 w-auto rounded-md" />
            <span className="text-lg font-semibold tracking-tight">Công Ty TNHH Công Nghệ Nam Nguyễn</span>
          </Link>

          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm Windows, Office, Kaspersky, ESET..."
                className="w-full bg-zinc-100/80 border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand/30 focus:bg-white rounded-lg py-2.5 pl-4 pr-10 text-sm transition-all outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="size-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate({ to: "/search" })} className="md:hidden p-2 hover:bg-zinc-100 rounded-full" aria-label="Tìm kiếm"><Search className="size-5 text-zinc-600" /></button>
            <button className="hidden sm:grid p-2 hover:bg-zinc-100 rounded-full place-items-center" aria-label="Yêu thích"><Heart className="size-5 text-zinc-600" /></button>
            {!adminName && (
              <Link to="/cart" className="relative p-2 hover:bg-zinc-100 rounded-full grid place-items-center" aria-label="Giỏ hàng">
                <ShoppingCart className="size-5 text-zinc-600" />
                {count > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-brand text-[10px] font-semibold text-white rounded-full grid place-items-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            {adminName ? (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                <User className="size-4" /> {adminName.split(" ")[0]}
              </Link>
            ) : user ? (
              <Link to="/profile" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                <User className="size-4" /> {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                <User className="size-4" /> Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}