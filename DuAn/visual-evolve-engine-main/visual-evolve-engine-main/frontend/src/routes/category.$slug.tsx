import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import posterWin from "../assets/Anh_banner_poster/poster_win.png";
import posterOffice from "../assets/Anh_banner_poster/poster_office.jpg";
import posterVirus from "../assets/Anh_banner_poster/poster_virus.png";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { brands, categories, getByCategory, type Product } from "@/lib/products";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat, items: getByCategory(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.cat.name} bản quyền — Công Ty TNHH Công Nghệ Nam Nguyễn` },
      { name: "description", content: `Mua ${loaderData.cat.name.toLowerCase()} bản quyền chính hãng tại Công Ty TNHH Công Nghệ Nam Nguyễn. Giao key qua email 5 phút, bảo hành trọn đời.` },
    ] : [{ title: "Danh mục — Công Ty TNHH Công Nghệ Nam Nguyễn" }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, items } = Route.useLoaderData() as { cat: { slug: string; name: string }; items: Product[] };
  const [sort, setSort] = useState("featured");
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [page, setPage] = useState(1);

  const platformOptions = Array.from(new Set(items.flatMap((item) => item.platforms))).sort();

  const filtered = items
    .filter((p) => (brandFilter.length ? brandFilter.includes(p.brand) : true))
    .filter((p) => (platformFilter.length ? platformFilter.some((platform) => p.platforms.includes(platform)) : true))
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price :
      sort === "price-desc" ? b.price - a.price :
      sort === "rating" ? b.rating - a.rating : 0
    );

  useEffect(() => {
    setPage(1);
  }, [sort, brandFilter, platformFilter, maxPrice]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleBrand = (b: string) =>
    setBrandFilter((f) => (f.includes(b) ? f.filter((x) => x !== b) : [...f, b]));

  const togglePlatform = (p: string) =>
    setPlatformFilter((f) => (f.includes(p) ? f.filter((x) => x !== p) : [...f, p]));

  const posterMap: Record<string, string> = {
    windows: posterWin,
    office: posterOffice,
    antivirus: posterVirus,
  };

  const posterImage = posterMap[cat.slug] || posterWin;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
          <Link to="/" className="hover:text-brand">Trang chủ</Link>
          <ChevronRight className="size-3" />
          <span className="text-ink font-medium">{cat.name}</span>
        </nav>
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold">{cat.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{filtered.length} sản phẩm</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-zinc-600">Sắp xếp</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white rounded-lg ring-1 ring-black/10 px-3 py-2 text-sm outline-none focus:ring-brand">
              <option value="featured">Nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-black/5">
              <img src={posterImage} alt={cat.name} className="w-full h-full object-cover" />
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl ring-1 ring-black/5 p-12 text-center">
                <p className="text-zinc-500">Không có sản phẩm nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl ring-1 ring-black/5 p-4">
                  <div className="text-sm text-zinc-500">Hiển thị {((page - 1) * itemsPerPage) + 1}–{Math.min(page * itemsPerPage, filtered.length)} của {filtered.length} sản phẩm</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
                    >Trước</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setPage(index + 1)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${page === index + 1 ? 'bg-brand text-brand-foreground' : 'border hover:bg-zinc-50'}`}
                      >{index + 1}</button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
                    >Sau</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}