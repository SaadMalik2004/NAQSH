import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ShoppingBag, Lock } from "lucide-react";
import toast from "react-hot-toast";
import FormField from "../../components/common/FormField";
import EmptyState from "../../components/common/EmptyState";
import { Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { fetchAddresses, saveAddress } from "../../services/addressService";
import { placeOrder } from "../../services/orderService";
import { PAYMENT_METHODS } from "../../config/site";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import { money } from "../../utils/format";
import { addressSchema, clean, cleanMultiline, email as emailRule, hasErrors, validate } from "../../utils/validators";

const schema = { ...addressSchema, email: emailRule };

export default function Checkout() {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cart, cartSubtotal, discountAmount, shippingFee, cartTotal, promo, clearCart } = useShop();
  const addresses = useAsyncData(() => fetchAddresses(), [user.id]);

  const [form, setForm] = useState({
    fullName: profile?.full_name ?? "",
    email: user.email ?? "",
    phone: profile?.phone ?? "",
    address: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [saveAddr, setSaveAddr] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const pickSaved = (id) => {
    const a = addresses.data?.find((x) => x.id === id);
    if (!a) return;
    setForm((v) => ({ ...v, fullName: a.full_name, phone: a.phone, address: a.address_line, city: a.city, postalCode: a.postal_code, country: a.country }));
    setErrors({});
  };

  if (cart.length === 0 && !busy)
    return (
      <div className="bg-[#FAF8F5] min-h-[70vh] py-16 px-6">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" message="Add something to your bag before checking out." action={{ label: "Start Exploring", to: "/shop" }} />
      </div>
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const found = validate(form, schema);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const gate = limiters.order.check();
    if (!gate.allowed) return setFormError(`Too many orders in a short time. Please try again in ${formatWait(gate.retryAfterMs)}.`);

    setBusy(true);
    try {
      limiters.order.hit();
      const shipping = {
        name: clean(form.fullName, 100),
        email: clean(form.email, 254).toLowerCase(),
        phone: clean(form.phone, 20),
        address: clean(form.address, 200),
        city: clean(form.city, 80),
        postal_code: clean(form.postalCode, 12),
        country: clean(form.country, 60),
      };
      // The server recalculates prices, stock, discount and shipping — nothing here is trusted.
      const { orderNumber } = await placeOrder({
        items: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        shipping,
        paymentMethod,
        promoCode: promo?.code,
        notes: cleanMultiline(notes, 500),
      });

      if (saveAddr) {
        // best effort — the order is already placed, so ignore failures here
        saveAddress(user.id, {
          label: "Checkout", full_name: shipping.name, phone: shipping.phone, address_line: shipping.address,
          city: shipping.city, postal_code: shipping.postal_code, country: shipping.country,
          is_default: !addresses.data?.length,
        }).catch(() => {});
      }

      clearCart();
      navigate(`/orders/${orderNumber}`, { replace: true, state: { justPlaced: true } });
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't place your order. Please try again."));
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-900 mb-3">
          <ArrowLeft size={14} /> Back to bag
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-8">Checkout</h1>

        <form onSubmit={onSubmit} noValidate className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
              <h2 className="font-bold text-slate-900 text-lg mb-4">Delivery details</h2>

              {addresses.data?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-700 mb-2">Use a saved address</p>
                  <div className="flex flex-wrap gap-2">
                    {addresses.data.map((a) => (
                      <button key={a.id} type="button" onClick={() => pickSaved(a.id)} className="text-xs font-semibold border border-gray-200 rounded-full px-4 py-2 hover:border-slate-900 transition">
                        {a.label} · {a.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Full name" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} maxLength={100} />
                <FormField label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} maxLength={254} />
                <FormField label="Phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" value={form.phone} onChange={set("phone")} error={errors.phone} maxLength={20} />
                <FormField label="City" autoComplete="address-level2" value={form.city} onChange={set("city")} error={errors.city} maxLength={80} />
                <FormField className="sm:col-span-2" label="Street address" autoComplete="street-address" value={form.address} onChange={set("address")} error={errors.address} maxLength={200} />
                <FormField label="Postal code" autoComplete="postal-code" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} maxLength={12} />
                <FormField label="Country" autoComplete="country-name" value={form.country} onChange={set("country")} error={errors.country} maxLength={60} />
                <FormField className="sm:col-span-2" label="Order notes (optional)" as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Delivery instructions, gift message..." />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 mt-4">
                <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="accent-slate-900" />
                Save this address for next time
              </label>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
              <h2 className="font-bold text-slate-900 text-lg mb-4">Payment method</h2>
              <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-start gap-3 border rounded-2xl p-4 cursor-pointer transition ${paymentMethod === m.id ? "border-slate-900 bg-stone-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="mt-1 accent-slate-900" />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">{m.label}</span>
                      <span className="block text-xs text-gray-500">{m.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                <Lock size={12} /> We never ask for card numbers on this site.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:sticky lg:top-28">
              <h2 className="font-bold text-slate-900 text-lg border-b border-gray-100 pb-3 mb-4">Order summary</h2>
              <ul className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map((i) => (
                  <li key={i.id} className="flex gap-3 text-xs">
                    <img src={i.product.image} alt={i.product.name} loading="lazy" className="w-12 h-14 object-cover rounded-lg bg-stone-50" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 line-clamp-2">{i.product.name}</p>
                      <p className="text-gray-500">Size {i.size} · Qty {i.quantity}</p>
                    </div>
                    <span className="font-bold">{money(i.product.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold text-slate-900">{money(cartSubtotal)}</dd></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><dt>Promo ({promo.code})</dt><dd>-{money(discountAmount)}</dd></div>}
                <div className="flex justify-between"><dt>Shipping</dt><dd>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : money(shippingFee)}</dd></div>
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100"><dt className="font-bold text-slate-900 text-sm">Total</dt><dd className="font-black text-2xl text-slate-900">{money(cartTotal)}</dd></div>
              </dl>

              {formError && <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3 mt-4" role="alert">{formError}</div>}

              <button type="submit" disabled={busy} className="w-full mt-5 bg-slate-900 text-white rounded-full py-4 font-semibold text-sm hover:bg-black transition shadow-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {busy ? <Spinner size={16} /> : <ShieldCheck size={16} />} {busy ? "Placing order..." : "Place Order"}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-3">Final prices are confirmed securely when you place the order.</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
