import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ArrowLeft, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Giỏ hàng — Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, subtotal, count } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("email");
  const [orderNote, setOrderNote] = useState("");
  const shipping = deliveryMethod === "cod" ? 0 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "NAMNGUYEN10") {
      setDiscount(subtotal * 0.1);
      toast.success("Áp dụng mã thành công — giảm 10%");
    } else {
      setDiscount(0);
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Giỏ hàng của bạn</h1>

        {lines.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-16 text-center">
            <ShoppingBag className="size-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500 mb-6">Giỏ hàng đang trống.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-brand-foreground font-semibold px-6 py-3 rounded-lg transition-colors">
              <ArrowLeft className="size-4" /> Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-3">
              {lines.map((l) => (
                <div key={l.product.id} className="bg-white rounded-xl ring-1 ring-black/5 p-4 flex gap-4">
                  <Link to="/product/$slug" params={{ slug: l.product.slug }} className="shrink-0">
                    <img src={l.product.image} alt={l.product.name} className="size-24 object-cover rounded-lg bg-zinc-50" width={96} height={96} loading="lazy" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{l.product.brand}</div>
                    <Link to="/product/$slug" params={{ slug: l.product.slug }} className="font-medium hover:text-brand line-clamp-2">{l.product.name}</Link>
                    <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center bg-zinc-100 rounded-lg">
                        <button onClick={() => setQty(l.product.id, l.qty - 1)} className="size-9 grid place-items-center hover:text-brand">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                        <button onClick={() => setQty(l.product.id, l.qty + 1)} className="size-9 grid place-items-center hover:text-brand">+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{money(l.product.price * l.qty)}</span>
                        <button onClick={() => remove(l.product.id)} className="p-2 text-zinc-400 hover:text-red-500" aria-label="Xóa"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-brand mt-4"><ArrowLeft className="size-4" /> Tiếp tục mua sắm</Link>
            </div>

            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 sticky top-32">
                <h2 className="font-semibold text-lg mb-5">Tóm tắt đơn hàng</h2>
                <div className="space-y-3 text-sm border-b border-zinc-100 pb-5 mb-5">
                  <div className="flex justify-between"><span className="text-zinc-500">Tạm tính ({count} sản phẩm)</span><span className="font-medium">{money(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Giao key qua email</span><span className="font-medium">Miễn phí</span></div>
                  {discount > 0 && <div className="flex justify-between text-brand"><span>Giảm giá</span><span className="font-medium">−{money(discount)}</span></div>}
                </div>
                <div className="flex justify-between mb-6">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-semibold">{money(total)}</span>
                </div>
                <div className="space-y-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Phương thức giao key</p>
                    <div className="grid gap-2">
                      <label className="flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer">
                        <input type="radio" name="delivery" value="email" checked={deliveryMethod === "email"} onChange={() => setDeliveryMethod("email")} className="accent-brand" />
                        <span className="text-sm">Giao key qua email (mặc định)</span>
                      </label>
                      <label className="flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer">
                        <input type="radio" name="delivery" value="cod" checked={deliveryMethod === "cod"} onChange={() => setDeliveryMethod("cod")} className="accent-brand" />
                        <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Ghi chú đơn hàng</label>
                    <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Ghi chú cho cửa hàng..." className="w-full min-h-[90px] rounded-2xl border border-zinc-200 p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Mã giảm giá (thử NAMNGUYEN10)" className="w-full bg-zinc-50 ring-1 ring-zinc-200 focus:ring-brand rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none" />
                  </div>
                  <button onClick={applyCoupon} className="px-4 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800">Áp dụng</button>
                </div>
                <Link to="/checkout" className="block text-center w-full bg-brand hover:bg-brand-hover text-brand-foreground font-semibold py-3.5 rounded-lg transition-colors">Thanh toán</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}