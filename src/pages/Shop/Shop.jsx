import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import ProductCard from "../../components/product/ProductCard";
import { ProductGridSkeleton } from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/errors";
import { Filter, SlidersHorizontal, ArrowUpDown, SearchX, RotateCcw } from "lucide-react";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, reload } = useProducts();

  // The URL is the single source of truth for category / search / sort.
  const selectedCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "featured";

  // The price slider always reaches the most expensive product (no hidden items).
  const priceCeiling = Math.max(50, Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 10) * 10);
  const [priceChoice, setMaxPrice] = useState(null);
  const maxPrice = Math.min(priceChoice ?? priceCeiling, priceCeiling);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useDocumentTitle(selectedCategory === "All" ? "Shop" : `${selectedCategory} Collection`);

  const categories = ["All", "Men", "Women", "Unisex", "Footwear", "Accessories"];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    // Filter by Price
    result = result.filter((p) => p.price <= maxPrice);

    // Filter by Sale if sort param was sale
    if (sortBy === "sale") {
      result = result.filter((p) => p.badge === "SALE" || p.oldPrice > p.price);
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "new") {
      result.sort((a, b) => (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === "featured") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", newSort);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setMaxPrice(null);
    setSearchParams({});
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title & Breadcrumb */}
        <div className="mb-10 text-center md:text-left">
          <p className="uppercase tracking-[5px] text-xs font-semibold text-blue-600 mb-2">
            CATALOG & ARCHIVE
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {selectedCategory === "All" ? "The NAQSH Collection" : `${selectedCategory} Collection`}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Pakistani heritage couture, handcrafted footwear, and modern drape. Wear Your Identity.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold"
            >
              <Filter size={14} /> Filters
            </button>

            <span className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-slate-900">{loading ? "…" : filteredProducts.length}</strong> styles
              {selectedCategory !== "All" && (
                <span className="ml-1 text-blue-600 font-semibold">in {selectedCategory}</span>
              )}
            </span>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <ArrowUpDown size={14} /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-hidden focus:border-slate-900 cursor-pointer"
            >
              <option value="featured">Featured Essentials</option>
              <option value="new">Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="sale">On Sale</option>
            </select>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Main Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters Desktop */}
          <div
            className={`md:block ${
              showFiltersMobile ? "block" : "hidden"
            } md:col-span-1 space-y-6`}
          >
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} /> Filter Products
                </span>
                {(selectedCategory !== "All" || searchQuery || maxPrice < priceCeiling || sortBy !== "featured") && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex justify-between items-center ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-2">
                  <span>MAX PRICE</span>
                  <span className="text-blue-600">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={priceCeiling}
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>$0</span>
                  <span>${priceCeiling}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : error ? (
              <ErrorState
                title="We couldn't load the collection"
                message={getErrorMessage(error, "Please check your connection and try again.")}
                onRetry={reload}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={searchQuery ? `No results for "${searchQuery}"` : "No garments match your filters"}
                message="Try a different search, or adjust the category or price to find your fit."
                action={{ label: "Clear All Filters", onClick: resetFilters }}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}