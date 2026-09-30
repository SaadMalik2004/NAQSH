import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    freeShippingThreshold,
    progressToFreeShipping,
    amountToFreeShipping,
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping bag">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">Your Bag</h2>
              <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-slate-900" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-[#F8F5F1] px-6 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>
                {amountToFreeShipping === 0 ? (
                  <span className="text-emerald-600 font-semibold">
                    🎉 You have unlocked Free Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-slate-900">${amountToFreeShipping.toFixed(2)}</strong> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="text-gray-500">${freeShippingThreshold} Goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Your bag is empty</h3>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                  Discover timeless essentials crafted for your modern silhouette.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-20 h-24 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-900 text-sm leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: <span className="font-medium text-slate-700">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-white space-y-4">
              <div className="flex justify-between items-center text-base">
                <span className="font-medium text-gray-600">Subtotal</span>
                <span className="font-bold text-xl text-slate-900">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-slate-900 text-white rounded-full py-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black transition shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-gray-50 text-slate-800 rounded-full py-3 font-semibold text-xs flex items-center justify-center hover:bg-gray-100 transition"
                >
                  View Full Bag
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure checkout · 30-day exchange policy</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
