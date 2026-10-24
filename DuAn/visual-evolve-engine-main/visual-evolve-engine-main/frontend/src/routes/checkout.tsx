import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, QrCode, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Thanh toán — Công Ty TNHH Công Nghệ Nam Nguyễn" }] }),
  component: CheckoutPage,
});

const steps = [
  { id: 1, label: "Thông tin", icon: User },
  { id: 2, label: "Thanh toán", icon: CreditCard },
];

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const shipping = 0;
  const total = subtotal + shipping;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const placeOrder = async () => {
    if (!email || !phone) {
      toast.error("Vui lòng điền email và số điện thoại");
      return;
    }
    const items = lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      qty: line.qty,
      price: line.product.price,
    }));
    try {
      const resp = await apiFetch("/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items, email, phone, note, deliveryMethod: "email" }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        toast.error("Đặt hàng thất bại: " + err);
        return;
      }
      const data = await resp.json();
      setOrderId(data.orderId || null);
      setDone(true);
      clear();
      toast.success("Đặt hàng thành công! Mã đơn: " + (data.orderId || "(không có)"));
    } catch (e) {
      toast.error("Lỗi khi đặt hàng");
    }
  };

  if (done) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="size-16 bg-brand rounded-full grid place-items-center mx-auto mb-6">
            <Check className="size-8 text-brand-foreground" />
          </div>
          <h1 className="text-3xl font-semibold mb-3">Đặt hàng thành công</h1>
          <p className="text-zinc-500 mb-8">{orderId ? `Mã đơn hàng ${orderId}.` : ''} Key bản quyền sẽ được gửi qua email trong vòng 5 phút. Cảm ơn bạn đã mua hàng!</p>
          <Link to="/" className="inline-block bg-brand hover:bg-brand-hover text-brand-foreground font-semibold px-8 py-3 rounded-lg">Về trang chủ</Link>
        </div>
      </Layout>
    );
  }

  if (lines.length === 0) {
    setTimeout(() => navigate({ to: "/cart" }), 0);
    return <Layout><div className="p-16 text-center text-zinc-500">Giỏ hàng đang trống.</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Thanh toán</h1>

        <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={"size-10 rounded-full grid place-items-center transition-colors " + (step >= s.id ? "bg-brand text-brand-foreground" : "bg-zinc-200 text-zinc-500")}>
                  {step > s.id ? <Check className="size-4" /> : <s.icon className="size-4" />}
                </div>
                <span className={"text-xs mt-2 font-medium " + (step >= s.id ? "text-brand" : "text-zinc-400")}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={"flex-1 h-0.5 mx-2 " + (step > s.id ? "bg-brand" : "bg-zinc-200")} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 lg:p-8 space-y-4">
              {step === 1 && (
                <>
                  <h2 className="font-semibold text-lg mb-2">Thông tin khách hàng</h2>
                  <Field label="Email nhận key" type="email" placeholder="ban@vidu.com" value={email} onChange={(v) => setEmail(v)} />
                  <Field label="Số điện thoại" type="tel" placeholder="0912 345 678" value={phone} onChange={(v) => setPhone(v)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Họ" value={firstName} onChange={(v) => setFirstName(v)} />
                    <Field label="Tên" value={lastName} onChange={(v) => setLastName(v)} />
                  </div>
                  <Field label="Địa chỉ xuất hóa đơn (không bắt buộc)" value={address} onChange={(v) => setAddress(v)} />
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="font-semibold text-lg mb-2">Thanh toán</h2>
                  <p className="text-sm text-zinc-500">
                    Quét mã QR để thanh toán. Mã QR sẽ được cập nhật tại đây.
                  </p>
                  <div
                    className="mx-auto flex aspect-square w-full max-w-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center"
                    aria-label="Khung mã QR thanh toán"
                  >
                    <QrCode className="size-16 text-zinc-400" strokeWidth={1.25} />
                    <span className="text-sm font-medium text-zinc-500">
                      Mã QR thanh toán
                    </span>
                    <span className="text-xs text-zinc-400">
                      Hình QR sẽ hiển thị tại đây
                    </span>
                  </div>
                  <p className="text-center text-sm text-zinc-500">
                    Tổng thanh toán: <span className="font-semibold text-zinc-900">{money(total)}</span>
                  </p>
                  <p className="text-center text-sm font-medium text-brand">
                    Thanh toán thành công và ấn đặt hàng
                  </p>
                </>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:text-brand disabled:opacity-40">Quay lại</button>
                {step < 2 ? (
                  <button onClick={() => setStep(step + 1)} className="bg-brand hover:bg-brand-hover text-brand-foreground font-semibold px-6 py-2.5 rounded-lg">Tiếp tục</button>
                ) : (
                  <button onClick={placeOrder} className="bg-brand hover:bg-brand-hover text-brand-foreground font-semibold px-6 py-2.5 rounded-lg">Đặt hàng</button>
                )}
              </div>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 sticky top-32">
              <h2 className="font-semibold text-lg mb-5">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 mb-5">
                {lines.map((l) => (
                  <div key={l.product.id} className="flex gap-3 text-sm">
                    <img src={l.product.image} alt="" className="size-14 rounded-lg object-cover bg-zinc-50" width={56} height={56} loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{l.product.name}</div>
                      <div className="text-xs text-zinc-500">SL {l.qty}</div>
                    </div>
                    <span className="font-medium">{money(l.product.price * l.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Tạm tính</span><span className="font-medium">{money(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Giao key qua email</span><span className="font-medium">Miễn phí</span></div>
                <div className="flex justify-between pt-3 border-t border-zinc-100"><span className="font-semibold">Tổng cộng</span><span className="text-xl font-semibold">{money(total)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-600 mb-1.5 block">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-zinc-50 ring-1 ring-zinc-200 focus:ring-brand rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
      />
    </label>
  );
}