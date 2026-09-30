import { AlertTriangle, RefreshCw } from "lucide-react";

// Shown when a request fails. Never shows technical details to the user.
export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please try again.",
  onRetry,
}) {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-xs max-w-xl mx-auto" role="alert">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={30} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-black transition"
        >
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  );
}
