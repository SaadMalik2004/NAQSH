import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import ConfigNotice from "../../components/common/ConfigNotice";
import { Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import { clean, email as emailRule, required, validate, hasErrors } from "../../utils/validators";

export default function Login() {
  useDocumentTitle("Sign In");
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/profile";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={redirectTo} replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const found = validate(form, { email: emailRule, password: required("Password") });
    setErrors(found);
    if (hasErrors(found)) return;

    const gate = limiters.login.check();
    if (!gate.allowed) {
      setFormError(`Too many failed attempts. Please try again in ${formatWait(gate.retryAfterMs)}.`);
      return;
    }

    setBusy(true);
    try {
      await signIn({ email: clean(form.email, 254).toLowerCase(), password: form.password });
      limiters.login.reset();
      toast.success("Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      limiters.login.hit(); // only failed attempts count
      setFormError(getErrorMessage(error, "We couldn't sign you in. Please try again."));
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track orders and manage your account"
      footer={
        <>
          New to NAQSH?{" "}
          <Link to="/register" className="font-bold text-slate-900 underline">
            Create an account
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
        <FormField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          maxLength={254}
        />
        <div className="relative">
          <FormField
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            maxLength={72}
            labelRight={
              <Link to="/forgot-password" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Forgot password?
              </Link>
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-[34px] text-gray-400 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-slate-900 text-white rounded-full py-3.5 font-semibold text-sm hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy && <Spinner size={16} />} Sign In
        </button>
      </form>
    </AuthLayout>
  );
}
