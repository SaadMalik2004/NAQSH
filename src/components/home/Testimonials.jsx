import { Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchRecentReviews } from "../../services/reviewService";
import { useProducts } from "../../context/ProductsContext";

// Shows real reviews left by verified buyers. Hidden until at least one exists.
export default function Testimonials() {
  const { getProduct } = useProducts();
  const { data } = useAsyncData(() => fetchRecentReviews(3), []);
  if (!data || data.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[6px] text-blue-600 font-semibold text-xs mb-3">VERIFIED VOICES</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">What Our Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {data.map((r) => {
            const product = getProduct(r.product_id);
            return (
              <figure key={r.id} className="bg-[#FAF8F5] rounded-3xl p-8 border border-stone-100 flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4" aria-label={`${r.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} className={n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-sm leading-relaxed whitespace-pre-line break-words">{r.comment}</blockquote>
                </div>
                <figcaption className="mt-6 text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">{r.reviewer_name} <CheckCircle size={13} className="text-emerald-600" /></p>
                  {product && <Link to={`/product/${product.id}`} className="text-gray-500 hover:underline">{product.name}</Link>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
