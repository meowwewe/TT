import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import win11Home1 from "../../Anh_sp_win/win11_home1.webp";
import win11Home2 from "../../Anh_sp_win/win11_home2.webp";
import win11Home3 from "../../Anh_sp_win/win11_home3.jpeg";
import win11Home4 from "../../Anh_sp_win/win11_home4.jpg";
import win11Pro1 from "../../Anh_sp_win/win11_pro1.jpg";
import win11Pro2 from "../../Anh_sp_win/win11_pro2.webp";
import win11Pro3 from "../../Anh_sp_win/win11_pro3.webp";
import win11Pro4 from "../../Anh_sp_win/win11_pro4.png";
import officeHome1 from "../../Anh_sp_office/office_home1.png";
import officeHome2 from "../../Anh_sp_office/office_home2.jpg";
import officeHome3 from "../../Anh_sp_office/office_home3.webp";
import officeHome4 from "../../Anh_sp_office/office_home4.jpg";
import officeFamily1 from "../../Anh_sp_office/office_family1.webp";
import officeFamily2 from "../../Anh_sp_office/office_family2.webp";
import officeFamily3 from "../../Anh_sp_office/office_family3.png";
import officeFamily4 from "../../Anh_sp_office/office_family4.webp";
import virusKas1 from "../../Anh_sp_virus/virus_kas1.jpg";
import virusKas2 from "../../Anh_sp_virus/virus_kas2.avif";
import virusKas3 from "../../Anh_sp_virus/virus_kas3.jpg";
import virusKas4 from "../../Anh_sp_virus/virus_kas4.jpg";
import virusEs1 from "../../Anh_sp_virus/virus_es1.jpg";
import virusEs2 from "../../Anh_sp_virus/virus_es2.webp";
import virusEs3 from "../../Anh_sp_virus/virus_es3.webp";
import virusEs4 from "../../Anh_sp_virus/virus_es4.webp";
import virusBit1 from "../../Anh_sp_virus/virus_bit1.jpg";
import virusBit2 from "../../Anh_sp_virus/virus_bit2.webp";
import virusBit3 from "../../Anh_sp_virus/virus_bit3.png";
import virusBit4 from "../../Anh_sp_virus/virus_bit4.png";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart";
import { getProduct, money, products, type Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — Công Ty TNHH Công Nghệ Nam Nguyễn` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:description", content: loaderData.product.description },
    ] : [{ title: "Sản phẩm — Công Ty TNHH Công Nghệ Nam Nguyễn" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [comment, setComment] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [comments, setComments] = useState([
    { id: 1, name: "Nguyễn Văn A", text: "Sản phẩm chất lượng, key giao nhanh. Đã kích hoạt thành công!" },
    { id: 2, name: "Trần Thị B", text: "Mua Office 2024 ở đây rất tốt, hỗ trợ cài đặt nhanh chóng." },
  ]);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  // Mảng ảnh cho sản phẩm Windows 11 Home
  const productImages = product.slug === "windows-11-home" 
    ? [win11Home1, win11Home2, win11Home3, win11Home4]
    : product.slug === "windows-11-pro"
    ? [win11Pro1, win11Pro2, win11Pro3, win11Pro4]
    : product.slug === "office-2024-home-student"
    ? [officeHome1, officeHome2, officeHome3, officeHome4]
    : product.slug === "microsoft-365-family"
    ? [officeFamily1, officeFamily2, officeFamily3, officeFamily4]
    : product.slug === "kaspersky-standard"
    ? [virusKas1, virusKas2, virusKas3, virusKas4]
    : product.slug === "eset-home-security-essential"
    ? [virusEs1, virusEs2, virusEs3, virusEs4]
    : product.slug === "bitdefender-total-security"
    ? [virusBit1, virusBit2, virusBit3, virusBit4]
    : [product.image, product.image, product.image, product.image];

  const currentImage = productImages[imageIndex];

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      { id: prev.length + 1, name: "Khách hàng mới", text: comment.trim() },
      ...prev,
    ]);
    setComment("");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-brand">Trang chủ</Link>
          <ChevronRight className="size-3" />
          <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-brand capitalize">{product.category}</Link>
          <ChevronRight className="size-3" />
          <span className="text-ink font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-7">
            <div className="relative bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden aspect-square">
              <img src={currentImage} alt={product.name} width={800} height={800} className="w-full h-full object-cover transition-opacity duration-300" />
              <button
                onClick={() => setImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-lg ring-1 ring-black/10 hover:bg-white"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="size-5 text-zinc-800" />
              </button>
              <button
                onClick={() => setImageIndex((prev) => (prev + 1) % productImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-lg ring-1 ring-black/10 hover:bg-white"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="size-5 text-zinc-800" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {productImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setImageIndex(i)}
                  className={"aspect-square rounded-lg overflow-hidden ring-1 transition-all " + (i === imageIndex ? "ring-brand ring-2" : "ring-black/5 hover:ring-brand")}
                >
                  <img src={img} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">{product.brand}</span>
            <h1 className="text-2xl lg:text-3xl font-semibold mt-2 mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={"size-4 " + (i < Math.round(product.rating) ? "fill-accent2 text-accent2" : "text-zinc-300")} />)}</div>
              <span className="text-xs text-zinc-500">{product.rating.toFixed(1)} · {product.reviews} đánh giá</span>
            </div>

            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 mb-5">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-semibold">{money(product.price)}</span>
                {product.compareAt && (
                  <>
                    <span className="text-lg text-zinc-400 line-through">{money(product.compareAt)}</span>
                    <span className="text-xs font-bold text-white bg-accent2 px-2 py-1 rounded">-{discount}%</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-brand mb-5">
                <Check className="size-4" /> Còn {product.stock} key · Giao qua email trong 5 phút
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-zinc-100 rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-10 grid place-items-center text-lg hover:text-brand">−</button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="size-10 grid place-items-center text-lg hover:text-brand">+</button>
                </div>
                <button
                  onClick={() => { add(product, qty); toast.success(`Đã thêm ${qty} × ${product.name} vào giỏ`); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-brand-foreground font-semibold py-3 rounded-lg transition-colors"
                >
                  <ShoppingCart className="size-4" /> Thêm vào giỏ
                </button>
                <button className="size-11 grid place-items-center rounded-lg ring-1 ring-black/10 hover:ring-brand hover:text-brand" aria-label="Yêu thích"><Heart className="size-4" /></button>
              </div>
              <button className="w-full bg-accent2 hover:brightness-95 text-ink font-semibold py-3 rounded-lg transition-all">Mua ngay</button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs mb-6">
              {[[Truck,"Giao key qua email"],[ShieldCheck,"Bản quyền chính hãng"],[RotateCcw,"Bảo hành trọn đời"]].map(([I, t]) => {
                const Icon = I as typeof Truck;
                return (
                  <div key={t as string} className="bg-white rounded-lg ring-1 ring-black/5 p-3 text-center">
                    <Icon className="size-4 text-brand mx-auto mb-1" />
                    <span className="text-zinc-600 font-medium">{t as string}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold mb-6">Hướng dẫn cài đặt</h2>
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
              <div>
                <h3 className="font-semibold">Bước 1: Nhận key</h3>
                <p className="text-sm text-zinc-600">Key sẽ được gửi vào email trong vòng 5 phút sau khi thanh toán.</p>
              </div>
              <div>
                <h3 className="font-semibold">Bước 2: Tải phần mềm</h3>
                <p className="text-sm text-zinc-600">Tải về từ trang chủ nhà sản xuất hoặc dùng link tải được cung cấp trong email.</p>
              </div>
              <div>
                <h3 className="font-semibold">Bước 3: Kích hoạt</h3>
                <p className="text-sm text-zinc-600">Mở phần mềm, nhập key và làm theo hướng dẫn để hoàn tất kích hoạt.</p>
              </div>
              <div>
                <h3 className="font-semibold">Bước 4: Hỗ trợ</h3>
                <p className="text-sm text-zinc-600">Nếu có lỗi, liên hệ fanpage hoặc hotline để được hỗ trợ cài đặt từ xa.</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-6">Thông tin chi tiết</h2>
            <div className="bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden">
              <dl>
                {product.specs.map((s, i) => (
                  <div key={s.label} className={"grid grid-cols-3 px-6 py-4 text-sm " + (i % 2 ? "bg-zinc-50" : "")}>
                    <dt className="text-zinc-500 col-span-1">{s.label}</dt>
                    <dd className="col-span-2 font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-6">Bình luận</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full min-h-[120px] rounded-2xl border border-zinc-200 p-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <div className="mt-4 flex justify-end">
                <button onClick={handleAddComment} className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-hover transition-colors">Gửi bình luận</button>
              </div>
            </div>
            {comments.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-zinc-100 grid place-items-center text-sm font-semibold text-zinc-700">{item.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-zinc-500">Khách hàng đã mua</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}