import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Spinner } from "../common/Spinner";
import { subscribeNewsletter } from "../../services/contactService";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import { clean, email as emailRule } from "../../utils/validators";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = emailRule(email);
    if (msg) return setError(msg);
    const gate = limiters.newsletter.check();
    if (!gate.allowed) return setError(`Too many attempts. Try again in ${formatWait(gate.retryAfterMs)}.`);

    setError("");
    setBusy(true);
    try {
      limiters.newsletter.hit();
      const result = await subscribeNewsletter(clean(email, 254).toLowerCase());
      setSubscribed(true);
      if (result === "exists") toast("You're already subscribed — thank you!", { icon: "💌" });
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't subscribe you. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="uppercase tracking-[6px] text-blue-400 font-semibold text-xs mb-3">THE NAQSH CIRCLE</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">Wear Your Identity. Unlock 15% Off.</h2>
        <p className="text-slate-400 text-base max-w-lg mx-auto mb-8">
          Join our circle for early access to festive drops and new arrivals.
        </p>

        {subscribed ? (
          <div className="bg-slate-800/80 border border-slate-700 max-w-md mx-auto p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-medium text-sm">
            <CheckCircle2 size={18} />
            You're on the list. Use code <strong className="text-white ml-1">NAQSH15</strong> at checkout.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1 text-left">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-full text-sm focus:outline-hidden focus:border-white transition placeholder:text-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="bg-white text-slate-950 font-semibold px-8 py-4 rounded-full text-sm hover:bg-stone-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Spinner size={16} /> : null} Subscribe <ArrowRight size={16} />
            </button>
          </form>
        )}
        {error && <p className="text-xs text-red-400 mt-3" role="alert">{error}</p>}
        <p className="text-xs text-slate-500 mt-4">No spam. We only email about new drops.</p>
      </div>
    </section>
  );
}
