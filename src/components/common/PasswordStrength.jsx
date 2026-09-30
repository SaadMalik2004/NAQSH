import { passwordStrength } from "../../utils/validators";

const LABELS = ["Too weak", "Weak", "Okay", "Good", "Strong"];
const COLORS = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];

export default function PasswordStrength({ value }) {
  if (!value) return null;
  const score = passwordStrength(value);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? COLORS[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">Password strength: {LABELS[score]}</p>
    </div>
  );
}
