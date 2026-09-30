import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MailCheck } from "lucide-react";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import ConfigNotice from "../../components/common/ConfigNotice";
import { Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import { clean, email as emailRule } from "../../utils/validators";

export default function ForgotPassword() {
  useDocumentTitle("Reset Password");
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = emailRule(email);
    if (msg) return setError(msg);
    const gate = limiters.passwordReset.check();
    if (!gate.allowed) return setError(`Too many requests. Please try again in ${formatWait(gate.retryAfterMs)}.`);

    setError("");
    setBusy(true);
    try {
      limiters.passwordReset.hit();
      await sendPasswordReset(clean(email, 254).toLowerCase());
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <AuthLayout title="Check your email">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MailCheck size={30} />
          </div>
          <p className="text-sm text-gray-600">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="text-sm font-bold text-slate-900 underline">Back to sign in</Link>
        </div>
      </AuthLayout>
    );

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={<Link to="/login" className="font-bold text-slate-900 underline">Back to sign in</Link>}
    >
      <ConfigNotice />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} maxLength={254} />
        <button type="submit" disabled={busy} className="w-full bg-slate-900 text-white rounded-full py-3.5 font-semibold text-sm hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <Spinner size={16} />} Send Reset Link
        </button>
      </form>
    </AuthLayout>
  );
}
