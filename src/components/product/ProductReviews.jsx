import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchReviews, hasPurchased, submitReview, deleteReview } from "../../services/reviewService";
import { isSupabaseConfigured } from "../../supabase/client";
import { getErrorMessage } from "../../utils/errors";
import { cleanMultiline } from "../../utils/validators";
import { limiters, formatWait } from "../../utils/rateLimit";
import { formatDate } from "../../utils/format";
import { ListSkeleton } from "../common/Skeleton";
import ErrorState from "../common/ErrorState";
import { Spinner } from "../common/Spinner";

function Stars({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

export default function ProductReviews({ product }) {
  const { user, isAdmin } = useAuth();
  const reviews = useAsyncData(() => fetchReviews(product.id), [product.id]);
  const canReview = useAsyncData(() => hasPurchased(product.id), [product.id, user?.id], {
    enabled: Boolean(user) && isSupabaseConfigured,
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return null;

  const list = reviews.data ?? [];
  const alreadyReviewed = list.some((r) => r.user_id === user?.id);

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = cleanMultiline(comment, 1000);
    if (text.length < 5) return setError("Please write at least 5 characters.");
    const gate = limiters.review.check();
    if (!gate.allowed) return setError(`Too many attempts. Try again in ${formatWait(gate.retryAfterMs)}.`);
    setError("");
    setBusy(true);
    try {
      limiters.review.hit();
      await submitReview({ productId: product.id, userId: user.id, rating, comment: text });
      setComment("");
      toast.success("Thanks for your review!");
      reviews.reload();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't post your review. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteReview(id);
      toast.success("Review removed");
      reviews.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs mb-16" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-black text-slate-900 mb-6">
        Customer Reviews
      </h2>

      {reviews.loading ? (
        <ListSkeleton rows={2} />
      ) : reviews.error ? (
        <ErrorState title="Couldn't load reviews" onRetry={reviews.reload} />
      ) : list.length === 0 ? (
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-stone-50 rounded-2xl p-5">
          <MessageSquareText size={20} className="text-gray-400" />
          No reviews yet. Verified buyers can be the first to share their experience.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {list.map((r) => (
            <li key={r.id} className="py-5 flex justify-between gap-4">
              <div>
                <Stars value={r.rating} />
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-line break-words">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {r.reviewer_name} · {formatDate(r.created_at)} · <span className="text-emerald-600">Verified buyer</span>
                </p>
              </div>
              {(r.user_id === user?.id || isAdmin) && (
                <button onClick={() => onDelete(r.id)} className="text-gray-400 hover:text-red-500 self-start p-1" aria-label="Delete review">
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        {!user ? (
          <p className="text-sm text-gray-500">
            <Link to="/login" className="font-bold text-slate-900 underline">Sign in</Link> to review products you've purchased.
          </p>
        ) : alreadyReviewed ? (
          <p className="text-sm text-gray-500">You've already reviewed this product. Thank you!</p>
        ) : canReview.loading ? null : canReview.data ? (
          <form onSubmit={onSubmit} className="space-y-3 max-w-xl" noValidate>
            <h3 className="text-sm font-bold text-slate-900">Write a review</h3>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} aria-pressed={n === rating}>
                  <Star size={24} className={n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="How was the fit, fabric and finish?"
              aria-label="Your review"
              className="w-full bg-stone-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-hidden focus:border-slate-900"
            />
            {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
            <button
              disabled={busy}
              className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-2"
            >
              {busy && <Spinner size={14} />} Post review
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">Only customers who have bought this product can review it.</p>
        )}
      </div>
    </section>
  );
}
