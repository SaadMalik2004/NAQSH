import { DatabaseZap } from "lucide-react";
import { isSupabaseConfigured } from "../../supabase/client";

// Shown on account pages when the Supabase keys are missing from .env
export default function ConfigNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs flex gap-3 mb-6" role="alert">
      <DatabaseZap size={18} className="shrink-0 mt-0.5" />
      <p>
        The store backend isn't connected. Copy <code className="font-bold">.env.example</code> to{" "}
        <code className="font-bold">.env</code>, add your Supabase URL and anon key, then restart the dev server.
      </p>
    </div>
  );
}
