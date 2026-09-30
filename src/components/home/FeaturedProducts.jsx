import { useState } from "react";
import { useProducts } from "../../context/ProductsContext";
import { ProductGridSkeleton } from "../common/Skeleton";
import ErrorState from "../common/ErrorState";
import ProductCard from "../product/ProductCard";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

export default function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { products, loading, error, reload } = useProducts();

  const filterTabs = ["All", "Trending", "Men", "Women", "Footwear"];

  const filteredProducts = products.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Trending")
      return item.badge === "TRENDING" || item.badge === "HOT" || item.badge === "BEST";
    return item.category.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 uppercase tracking-[6px] text-blue-600 font-semibold text-xs mb-3">
              <Flame size={16} />
              <span>CURATED ESSENTIALS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Featured NAQSH Pieces
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 ${
                  activeFilter === tab
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-10">Nothing in this filter yet — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-black hover:scale-105 transition-all shadow-xl"
          >
            Explore Complete Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
