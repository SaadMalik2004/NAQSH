import { useState } from "react";
import { X, Star, ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { defaultSize } from "../../utils/format";

export default function QuickViewModal() {
  const { quickViewProduct } = useShop();
  if (!quickViewProduct) return null;
  // key resets the chosen size whenever a different product is opened
  return <QuickViewContent key={quickViewProduct.id} product={quickViewProduct} />;
}

function QuickViewContent({ product }) {
  const { setQuickViewProduct, addToCart } = useShop();
  const quickViewProduct = product;
  const [selectedSize, setSelectedSize] = useState(defaultSize(product));
  const quantity = 1;

  const sizes = product.sizes;
  const soldOut = product.stock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={quickViewProduct.name}>
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setQuickViewProduct(null)}
        />

        {/* Modal Card */}
        <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 grid md:grid-cols-2">
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            aria-label="Close quick view"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:text-black hover:bg-white transition"
          >
            <X size={20} />
          </button>

          {/* Product Media Column */}
          <div className="relative bg-[#F8F5F1] p-8 flex items-center justify-center">
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              className="max-h-[380px] w-full object-contain drop-shadow-lg"
            />
            {quickViewProduct.badge && (
              <span className="absolute top-6 left-6 bg-slate-900 text-white text-xs font-bold tracking-wider px-3.5 py-1.5 rounded-full">
                {quickViewProduct.badge}
              </span>
            )}
          </div>

          {/* Product Details Column */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <p className="uppercase tracking-[3px] text-xs font-semibold text-blue-600 mb-2">
                {quickViewProduct.category}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {quickViewProduct.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} className="fill-yellow-400" />
                  <span className="font-semibold text-slate-900 text-sm">
                    {quickViewProduct.reviews > 0 ? quickViewProduct.rating.toFixed(1) : "New"}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  {quickViewProduct.reviews > 0 ? `(${quickViewProduct.reviews} verified reviews)` : "(No reviews yet)"}
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${quickViewProduct.price.toFixed(2)}
                </span>
                {quickViewProduct.oldPrice && (
                  <span className="text-lg line-through text-gray-400">
                    ${quickViewProduct.oldPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2.5">
                  <span>SELECT SIZE</span>

                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 rounded-xl text-xs font-bold border transition ${
                        selectedSize === size
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-gray-200 text-slate-800 hover:border-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 text-xs text-gray-500 mb-6 border-y border-gray-100 py-3">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="line-clamp-2">{quickViewProduct.description}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={soldOut}
                className="w-full bg-slate-900 text-white rounded-full py-4 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-black transition shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none"
              >
                <ShoppingBag size={18} />
                {soldOut ? "Sold Out" : `Add To Bag • $${(quickViewProduct.price * quantity).toFixed(2)}`}
              </button>

              <Link
                to={`/product/${quickViewProduct.id}`}
                onClick={() => setQuickViewProduct(null)}
                className="w-full text-center block text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
