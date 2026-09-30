import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, User, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import ConfigNotice from "../../components/common/ConfigNotice";
import PasswordStrength from "../../components/common/PasswordStrength";
import { Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import {
  all, clean, email as emailRule, hasErrors, maxLen, minLen, password as passwordRule, required, validate,
} from "../../utils/validators";

const schema = {
  fullName: all(required("Full name"), minLen("Full name", 2), maxLen("Full name", 100)),
  email: emailRule,
  password: passwordRule,
  confirm: (v, all) => (v !== all.password ? "Passwords do not match" : ""),
};

export default function Register() {
  useDocumentTitle("Create Account");
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  if (user && !busy) return <Navigate to="/profile" replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const found = validate(form, schema);
    setErrors(found);
    if (hasErrors(found)) return;

    const gate = limiters.register.check();
    if (!gate.allowed) {
      setFormError(`Too many sign-up attempts. Please try again in ${formatWait(gate.retryAfterMs)}.`);
      return;
    }

    setBusy(true);
    try {
      limiters.register.hit();
      const { needsEmailConfirmation } = await signUp({
        fullName: clean(form.fullName, 100),
        email: clean(form.email, 254).toLowerCase(),
        password: form.password,
      });
      if (needsEmailConfirmation) {
        setConfirmSent(true);
      } else {
        toast.success("Account created — welcome to NAQSH!");
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (confirmSent)
    return (
      <AuthLayout title="Check your email">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MailCheck size={30} />
          </div>
          <p className="text-sm text-gray-600">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-black transition">
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track orders, save your wishlist and check out faster"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-slate-900 underline">
            Sign in
          </Link>
        </>
      }
    >
      <ConfigNotice />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3" role="alert">
            {formError}
          </div>
        )}
        <FormField label="Full name" icon={User} autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} maxLength={100} />
        <FormField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} maxLength={254} />
        <div>
          <FormField label="Password" icon={Lock} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} error={errors.password} maxLength={72} />
          <PasswordStrength value={form.password} />
        </div>
        <FormField label="Confirm password" icon={Lock} type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} maxLength={72} />
        <button type="submit" disabled={busy} className="w-full bg-slate-900 text-white rounded-full py-3.5 font-semibold text-sm hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <Spinner size={16} />} Create Account
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          By creating an account you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
