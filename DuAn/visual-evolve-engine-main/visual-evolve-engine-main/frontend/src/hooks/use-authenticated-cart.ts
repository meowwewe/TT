import { useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function useAuthenticatedCartAdd() {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return (product: Product, qty = 1) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      const redirect = `${location.pathname}${location.searchStr}${location.hash}`;
      void navigate({ to: "/login", search: { redirect } });
      return;
    }

    add(product, qty);
    toast.success(`Đã thêm "${product.name}" vào giỏ`);
  };
}
