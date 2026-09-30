import { useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, Tag, ShieldCheck, X } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { Spinner } from "../../components/common/Spinner";
import toast from "react-hot-toast";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    promo,
    applyPromo,
    removePromo,
    amountToFreeShipping,
  } = useShop();

  useDocumentTitle("Shopping Bag");

  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const finalTotal = cartTotal;

  const onApplyPromo = async (e) => {
    e.preventDefault();
    setPromoBusy(true);
    const result = await applyPromo(promoCode);
    setPromoBusy(false);
    if (result.ok) {
      toast.success(result.message);
      setPromoCode("");
    } else toast.error(result.message);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-900 transition mb-3"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Review your selected garments before checking out
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xs max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Your bag is currently empty
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Looks like you haven't added any essentials to your bag yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-black transition shadow-lg"
            >
              Start Exploring <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-6"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-28 h-32 object-cover rounded-2xl bg-stone-50"
                  />

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          {item.product.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {item.product.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                      Selected Size: <strong className="text-slate-800">{item.size}</strong>
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-full bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-black font-bold"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-black font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Column */}
            <div className="space-y-6">
              {/* Promo Code Box */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  <Tag size={14} /> Have a Promo Code?
                </h4>
                {promo ? (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2 text-xs font-bold">
                    <span>{promo.code} · {promo.percent}% off</span>
                    <button onClick={removePromo} aria-label="Remove promo code" className="hover:text-emerald-900">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={onApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      aria-label="Promo code"
                      maxLength={30}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 min-w-0 bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-bold focus:outline-hidden focus:border-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={promoBusy}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-1"
                    >
                      {promoBusy && <Spinner size={12} />} Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Order Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-lg border-b border-gray-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({promo?.percent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong className="text-emerald-600">FREE</strong>
                      ) : (
                        `$${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {amountToFreeShipping > 0 && (
                    <p className="text-[11px] text-amber-600 pt-1">
                      Add ${(amountToFreeShipping).toFixed(2)} more to qualify for Free Shipping!
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Total</span>
                  <span className="font-black text-2xl text-slate-900">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="w-full bg-slate-900 text-white rounded-full py-4 font-semibold text-sm hover:bg-black transition shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>30-day exchange policy</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}