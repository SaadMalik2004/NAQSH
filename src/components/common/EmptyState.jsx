import { Link } from "react-router-dom";

// Friendly "nothing here" screen. `action` = { label, to } or { label, onClick }
export default function EmptyState({ icon: Icon, title, message, action, tone = "slate" }) {
  const tones = {
    slate: "bg-gray-50 text-gray-400",
    red: "bg-red-50 text-red-400",
    blue: "bg-blue-50 text-blue-400",
  };
  const btn =
    "inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-black transition shadow-lg";

  return (
    <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-100 shadow-xs max-w-xl mx-auto">
      {Icon && (
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${tones[tone]}`}>
          <Icon size={36} />
        </div>
      )}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      {message && <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{message}</p>}
      {action &&
        (action.to ? (
          <Link to={action.to} className={btn}>
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className={btn}>
            {action.label}
          </button>
        ))}
    </div>
  );
}
