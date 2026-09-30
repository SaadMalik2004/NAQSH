import { useState } from "react";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { ListSkeleton } from "../../components/common/Skeleton";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchAllOrders, updateOrder } from "../../services/adminService";
import { formatDateTime, money, ORDER_STATUS_STYLES } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT = ["unpaid", "paid", "refunded"];

export default function AdminOrders() {
  const { data, loading, error, reload } = useAsyncData(() => fetchAllOrders(), []);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);

  const change = async (order, values) => {
    if (values.status === "cancelled" && !window.confirm("Cancel this order? Stock will be returned.")) return;
    try {
      await updateOrder(order.id, values);
      toast.success("Order updated");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <ListSkeleton rows={4} />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  const list = data.filter((o) => filter === "all" || o.status === filter);
  const revenue = data.filter((o) => o.status !== "cancelled").reduce((n, o) => n + Number(o.total), 0);
  const pending = data.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[["Orders", data.length], ["Pending", pending], ["Revenue (excl. cancelled)", money(revenue)]].map(([k, v]) => (
          <div key={k} className="bg-white rounded-2xl p-5 border border-gray-100"><p className="text-xs text-gray-400">{k}</p><p className="text-2xl font-black text-slate-900">{v}</p></div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${filter === s ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-slate-600"}`}>{s}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Package} title="No orders" message="Orders will appear here as customers place them." />
      ) : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="text-left">
                  <p className="font-bold text-slate-900">{o.order_number}</p>
                  <p className="text-xs text-gray-500">{o.ship_name} · {formatDateTime(o.created_at)}</p>
                </button>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize ${ORDER_STATUS_STYLES[o.status]}`}>{o.status}</span>
                  <span className="font-black">{money(o.total)}</span>
                  <select aria-label="Order status" value={o.status} disabled={o.status === "cancelled"} onChange={(e) => change(o, { status: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 capitalize">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select aria-label="Payment status" value={o.payment_status} onChange={(e) => change(o, { payment_status: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 capitalize">
                    {PAYMENT.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {open === o.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Customer</p>
                    <p>{o.ship_name} · {o.ship_phone}</p><p>{o.ship_email}</p><p>{o.ship_address}, {o.ship_city}</p>
                    <p className="mt-1 capitalize">Payment: {o.payment_method.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Items</p>
                    {o.order_items.map((i) => <p key={i.id}>{i.quantity} × {i.product_name} ({i.size}) — {money(i.unit_price)}</p>)}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
