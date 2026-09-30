import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/product/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { defaultSize } from "../../utils/format";

export default function Wishlist() {
  const { wishlist, addToCart } = useShop();

  useDocumentTitle("Wishlist");

  const handleAddAllToCart = () => {
    wishlist
      .filter((product) => product.stock > 0)
      .forEach((product) => addToCart(product, defaultSize(product), 1));
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-8 border-b border-gray-200 mb-10 gap-4">
          <div>
            <p className="uppercase tracking-[4px] text-xs font-bold text-red-500 mb-1 flex items-center gap-1.5">
              <Heart size={14} className="fill-red-500" /> SAVED SILHOUETTES
            </p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Your Personal Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? "garment" : "garments"} saved
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition flex items-center gap-2 shadow-md"
            >
              <ShoppingBag size={14} /> Add All To Bag
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <EmptyState
            icon={Heart}
            tone="red"
            title="Your wishlist is currently empty"
            message="Explore our collection and tap the heart icon on any piece you'd like to save for later."
            action={{ label: "Discover NAQSH Pieces", to: "/shop" }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}