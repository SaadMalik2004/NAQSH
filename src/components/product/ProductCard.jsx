import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { defaultSize } from "../../utils/format";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useShop();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="group bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
      {/* Top Image Box */}
      <div className="relative bg-[#F8F5F1] overflow-hidden">
        <Link to={`/product/${product.id}`} className="block overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-[360px] object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        {product.stock <= 0 && (
          <span className="absolute bottom-5 left-5 bg-white/95 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none">
            SOLD OUT
          </span>
        )}

        {product.badge && (
          <span className="absolute top-5 left-5 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-5 right-5 w-11 h-11 rounded-full shadow-md flex items-center justify-center transition ${
            isWishlisted
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-white text-slate-800 hover:bg-slate-900 hover:text-white"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} className={isWishlisted ? "fill-red-500" : ""} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition duration-300 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-900 hover:text-white"
          aria-label="Quick View"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <p className="uppercase tracking-[3px] text-gray-400 text-xs font-semibold mb-2">
            {product.category}
          </p>

          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            {product.reviews > 0 ? (
              <>
                <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({product.reviews})</span>
              </>
            ) : (
              <span className="text-gray-400 text-xs">No reviews yet</span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="line-through text-gray-400 text-sm">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product, defaultSize(product), 1)}
          disabled={product.stock <= 0}
          className="w-full bg-slate-900 text-white rounded-full py-3.5 flex justify-center items-center gap-2 font-semibold text-sm hover:bg-black hover:shadow-lg transition active:scale-98 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={18} />
          {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}