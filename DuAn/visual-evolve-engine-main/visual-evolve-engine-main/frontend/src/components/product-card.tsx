import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { money, type Product } from "@/lib/products";
import { useAuthenticatedCartAdd } from "@/hooks/use-authenticated-cart";

export function ProductCard({
  product,
  dark = false,
  hideRating = false,
}: {
  product: Product;
  dark?: boolean;
  hideRating?: boolean;
}) {
  const addToCart = useAuthenticatedCartAdd();
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <div
      className={
        "group rounded-xl p-4 ring-1 transition-all hover:shadow-lg hover:-translate-y-0.5 " +
        (dark
          ? "bg-zinc-800/50 ring-white/5 hover:ring-white/20"
          : "bg-white ring-black/5 hover:ring-brand/30")
      }
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div
          className={
            "relative aspect-square rounded-lg overflow-hidden mb-4 " +
            (dark ? "bg-zinc-800" : "bg-zinc-50")
          }
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-accent2 text-[10px] font-bold px-2 py-1 rounded text-ink">
              {product.badge}
            </span>
          )}
          {discount > 0 && !product.badge && (
            <span className="absolute top-2 left-2 bg-accent2 text-[10px] font-bold px-2 py-1 rounded text-ink">
              -{discount}%
            </span>
          )}
        </div>
        <span
          className={
            "text-[10px] uppercase font-bold tracking-wider " +
            (dark ? "text-zinc-500" : "text-zinc-500")
          }
        >
          {product.brand}
        </span>
        <h4
          className={
            "text-sm font-medium mt-1 mb-2 line-clamp-2 min-h-10 " +
            (dark ? "text-zinc-100" : "text-ink")
          }
        >
          {product.name}
        </h4>
        {!hideRating && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="size-3 text-accent2 fill-accent2" />
            <span className={"text-[11px] " + (dark ? "text-zinc-500" : "text-zinc-500")}>
              {product.rating.toFixed(1)} ({product.reviews} đánh giá)
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={"font-semibold " + (dark ? "text-white" : "text-ink")}>
              {money(product.price)}
            </span>
            {product.compareAt && (
              <span
                className={"text-xs line-through " + (dark ? "text-zinc-500" : "text-zinc-400")}
              >
                {money(product.compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() => addToCart(product)}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-brand-foreground text-xs font-semibold py-2.5 rounded-lg transition-colors"
      >
        <ShoppingCart className="size-3.5" /> Thêm vào giỏ
      </button>
    </div>
  );
}
