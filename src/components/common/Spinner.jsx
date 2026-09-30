import { Loader2 } from "lucide-react";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />;
}

// Full-page loader used while pages / sessions load
export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500" role="status">
      <Spinner size={32} className="text-slate-900" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
