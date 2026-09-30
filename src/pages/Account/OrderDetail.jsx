import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import ErrorState from "../../components/common/ErrorState";
import { ListSkeleton } from "../../components/common/Skeleton";
import { Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cancelOrder, fetchOrder } from "../../services/orderService";
import { formatDateTime, money, ORDER_STATUS_STYLES } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";
import { PAYMENT_METHODS, SITE } from "../../config/site";

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const { data: order, loading, error, reload } = useAsyncData(() => fetchOrder(orderNumber), [orderNumber, user.id]);
  const [cancelling, setCancelling] = useState(false);
  useDocumentTitle(`Order ${orderNumber}`);

  const onCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await cancelOrder(orderNumber);
      toast.success("Order cancelled");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const justPlaced = state?.justPlaced;
  const method = order && PAYMENT_METHODS.find((m) => m.id === order.payment_method);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-900 mb-4">
          <ArrowLeft size={14} /> All orders
        </Link>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={reload} />
        ) : !order ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Order not found</h1>
            <p className="text-sm text-gray-500 mb-6">We couldn't find this order in your account.</p>
            <Link to="/orders" className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold">View my orders</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {justPlaced && (
              <div className="bg-white rounded-3xl p-8 text-center border border-emerald-100 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Order confirmed!</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Thank you, {order.ship_name.split(" ")[0]}. We'll contact you on {order.ship_phone} to confirm delivery.
                </p>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs text-gray-400">Order number</p>
                  <h2 className="text-xl font-black text-slate-900">{order.order_number}</h2>
                  <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
                </div>
                <span className={`text-xs font-bold px-4 py-1.5 rounded-full capitalize ${ORDER_STATUS_STYLES[order.status]}`}>{order.status}</span>
              </div>

              <ul className="divide-y divide-gray-100">
                {order.order_items.map((i) => (
                  <li key={i.id} className="py-4 flex gap-4">
                    <img src={i.product_image} alt={i.product_name} loading="lazy" className="w-16 h-20 object-cover rounded-xl bg-stone-50" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-slate-900">{i.product_name}</p>
                      <p className="text-xs text-gray-500">Size {i.size} · Qty {i.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">{money(i.unit_price * i.quantity)}</p>
                  </li>
                ))}
              </ul>

              <dl className="border-t border-gray-100 pt-4 mt-2 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600"><dt>Discount {order.promo_code && `(${order.promo_code})`}</dt><dd>-{money(order.discount)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-gray-500">Shipping</dt><dd>{order.shipping > 0 ? money(order.shipping) : "FREE"}</dd></div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-gray-100"><dt>Total</dt><dd>{money(order.total)}</dd></div>
              </dl>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-sm">
                <h3 className="font-bold text-slate-900 mb-2">Delivery address</h3>
                <p className="text-gray-600">{order.ship_name}</p>
                <p className="text-gray-500">{order.ship_address}</p>
                <p className="text-gray-500">{order.ship_city} {order.ship_postal}, {order.ship_country}</p>
                <p className="text-gray-500">{order.ship_phone}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-sm">
                <h3 className="font-bold text-slate-900 mb-2">Payment</h3>
                <p className="text-gray-600">{method?.label}</p>
                <p className="text-gray-500 capitalize">Status: {order.payment_status}</p>
                {order.payment_method === "bank_transfer" && order.payment_status === "unpaid" && (
                  <p className="text-xs text-amber-600 mt-2">We'll email the transfer details to {order.ship_email}. Questions? {SITE.email}</p>
                )}
              </div>
            </div>

            {order.status === "pending" && (
              <button onClick={onCancel} disabled={cancelling} className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center gap-2 disabled:opacity-60">
                {cancelling && <Spinner size={14} />} Cancel this order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
