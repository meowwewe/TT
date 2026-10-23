import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MonitorSmartphone, FileText, ShieldCheck, Palette, Briefcase, Wrench, Zap, Mail, RotateCcw, Headphones as HeadphonesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import bannerHero from "../assets/banner/hero-banner.jpg";
import posterWinTrangChu from "../assets/Anh_banner_poster/poster_win_trangchu.jpg";
import posterVirusTrangChu from "../assets/Anh_banner_poster/poster_virus_trangchu.jpg";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/products";

const slides = [
  { image: bannerHero },
  { image: bannerHero },
  { image: bannerHero },
];

export const Route = createFileRoute("/")({
  component: Index,
});

const catIcons: Record<string, typeof ShieldCheck> = {
  windows: MonitorSmartphone, office: FileText, antivirus: ShieldCheck,
  "do-hoa": Palette, "van-phong": Briefcase, "tien-ich": Wrench,
};

function Index() {
  const featured = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 6);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Layout>
      <section className="py-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[440px] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-zinc-100">
              {slides.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  alt={`Banner ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
            <Link to="/category/$slug" params={{ slug: "windows" }} className="group relative flex-1 min-h-40 rounded-2xl overflow-hidden ring-1 ring-black/5 hover:ring-brand/40 transition-all">
              <img src={posterWinTrangChu} alt="Windows" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </Link>
            <Link to="/category/$slug" params={{ slug: "antivirus" }} className="group relative flex-1 min-h-40 rounded-2xl overflow-hidden ring-1 ring-black/5 hover:ring-brand/40 transition-all">
              <img src={posterVirusTrangChu} alt="Antivirus" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {[
            { icon: Mail, title: "Giao key 5 phút", sub: "Nhận key qua email tự động" },
            { icon: ShieldCheck, title: "Bản quyền chính hãng", sub: "100% key retail vĩnh viễn" },
            { icon: RotateCcw, title: "Bảo hành trọn đời", sub: "1 đổi 1 nếu key lỗi" },
            { icon: HeadphonesIcon, title: "Hỗ trợ cài đặt", sub: "Kỹ thuật viên online 24/7" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl ring-1 ring-black/5 p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-brand-soft grid place-items-center shrink-0">
                <f.icon className="size-5 text-brand" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{f.title}</div>
                <div className="text-xs text-zinc-500 truncate">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase">Mua sắm theo</span>
              <h2 className="text-2xl lg:text-3xl font-semibold mt-1">Danh mục phần mềm</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {categories.map((c) => {
              return (
                <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group flex flex-col items-center gap-2 bg-white rounded-xl ring-1 ring-black/5 hover:ring-brand/40 hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className="w-full aspect-square bg-zinc-100 flex items-center justify-center overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-zinc-700 text-center pb-2 px-2">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-accent2 text-xs font-semibold tracking-widest uppercase mb-2 block">Ưu đãi có hạn</span>
              <h2 className="text-white text-2xl lg:text-3xl font-semibold">Flash Sale kết thúc sau</h2>
            </div>
            <div className="flex gap-3">
              {[["08","Giờ"],["42","Phút"],["19","Giây"]].map(([n,l]) => (
                <div key={l} className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700/50 text-center min-w-16">
                  <span className="text-white text-2xl font-semibold tabular-nums block">{n}</span>
                  <span className="text-zinc-500 text-[10px] uppercase">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} dark />)}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase">Được yêu thích</span>
              <h2 className="text-2xl lg:text-3xl font-semibold mt-1">Bán chạy trong tuần</h2>
            </div>
            <Link to="/category/$slug" params={{ slug: "windows" }} className="text-xs font-semibold border-b border-ink hover:text-brand hover:border-brand pb-0.5">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} hideRating />)}
          </div>
        </div>
      </section>

      <section className="py-10 border-y border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-around gap-8 opacity-50 text-zinc-500">
            {["MICROSOFT","KASPERSKY","ESET","BITDEFENDER","ADOBE","AUTODESK"].map((b) => (
              <span key={b} className="text-lg font-bold tracking-tighter">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto bg-zinc-100 rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl lg:text-3xl font-semibold text-balance mb-3">Đăng ký nhận ưu đãi</h2>
            <p className="text-zinc-600 text-sm lg:text-base">Nhận mã giảm giá độc quyền, thông tin sản phẩm mới và giá thành viên sớm nhất.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-sm flex flex-col gap-3">
            <input type="email" required placeholder="Địa chỉ email của bạn" className="w-full px-5 py-3.5 bg-white rounded-full ring-1 ring-black/5 focus:ring-brand outline-none transition-all text-sm" />
            <button className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-medium py-3.5 rounded-full shadow-lg shadow-brand/20 text-sm transition-colors">Đăng ký</button>
          </form>
        </div>
      </section>
    </Layout>
  );
}