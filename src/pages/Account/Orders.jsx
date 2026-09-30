import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { ListSkeleton } from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { fetchMyOrders } from "../../services/orderService";
import { formatDate, money, ORDER_STATUS_STYLES } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";

export default function Orders() {
  useDocumentTitle("My Orders");
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(() => fetchMyOrders(), [user.id]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <p className="uppercase tracking-[4px] text-xs font-bold text-blue-600 mb-1">MY ACCOUNT</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-8">My Orders</h1>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={reload} />
        ) : data.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" message="When you place an order it will show up here." action={{ label: "Start shopping", to: "/shop" }} />
        ) : (
          <ul className="space-y-4">
            {data.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.order_number}`} className="block bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{o.order_number}</p>
                      <p className="text-xs text-gray-500">{formatDate(o.created_at)} · {o.order_items.reduce((n, i) => n + i.quantity, 0)} items</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize ${ORDER_STATUS_STYLES[o.status]}`}>{o.status}</span>
                      <span className="font-black text-slate-900">{money(o.total)}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 overflow-hidden">
                    {o.order_items.slice(0, 5).map((i) => (
                      <img key={i.id} src={i.product_image} alt={i.product_name} loading="lazy" className="w-12 h-14 object-cover rounded-lg bg-stone-50" />
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
