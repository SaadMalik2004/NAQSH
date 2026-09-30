import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import PasswordStrength from "../../components/common/PasswordStrength";
import { PageLoader, Spinner } from "../../components/common/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/errors";
import { password as passwordRule } from "../../utils/validators";

// Reached from the link in the password-reset email (Supabase signs the user in temporarily).
export default function ResetPassword() {
  useDocumentTitle("Choose a New Password");
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader label="Verifying your link..." />;

  if (!user)
    return (
      <AuthLayout title="Link expired">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-black transition">
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    const pw = passwordRule(password);
    if (pw) found.password = pw;
    if (password !== confirm) found.confirm = "Passwords do not match";
    setErrors(found);
    if (Object.keys(found).length) return;

    setFormError("");
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Password updated");
      navigate("/profile", { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3" role="alert">{formError}</div>}
        <div>
          <FormField label="New password" icon={Lock} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} maxLength={72} />
          <PasswordStrength value={password} />
        </div>
        <FormField label="Confirm new password" icon={Lock} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} maxLength={72} />
        <button type="submit" disabled={busy} className="w-full bg-slate-900 text-white rounded-full py-3.5 font-semibold text-sm hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <Spinner size={16} />} Update Password
        </button>
      </form>
    </AuthLayout>
  );
}
