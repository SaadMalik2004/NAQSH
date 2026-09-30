import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Lock, MapPin, Package, Plus, Pencil, Trash2, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";
import FormField from "../../components/common/FormField";
import PasswordStrength from "../../components/common/PasswordStrength";
import ErrorState from "../../components/common/ErrorState";
import { ListSkeleton } from "../../components/common/Skeleton";
import { Spinner } from "../../components/common/Spinner";
import AddressForm from "../../components/account/AddressForm";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { deleteAddress, fetchAddresses, saveAddress } from "../../services/addressService";
import { getErrorMessage } from "../../utils/errors";
import { all, clean, hasErrors, maxLen, minLen, password as passwordRule, phone as phoneRule, required, validate } from "../../utils/validators";

const SIZES = ["", "XS", "S", "M", "L", "XL"];

function Card({ icon: Icon, title, children, action }) {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <Icon size={18} /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PersonalInfo() {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    preferredSize: profile?.preferred_size ?? "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      fullName: all(required("Full name"), minLen("Full name", 2), maxLen("Full name", 100)),
      phone: (v) => (clean(v) ? phoneRule(v) : ""),
    });
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      await updateProfile({
        full_name: clean(form.fullName, 100),
        phone: clean(form.phone, 20) || null,
        preferred_size: form.preferredSize || null,
      });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't save your profile."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card icon={User} title="Personal information">
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4" noValidate>
        <FormField label="Full name" icon={User} value={form.fullName} onChange={set("fullName")} error={errors.fullName} maxLength={100} />
        <FormField label="Email" value={user.email} disabled readOnly hint="Your email can't be changed here." />
        <FormField label="Phone" icon={Phone} type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={set("phone")} error={errors.phone} maxLength={20} />
        <FormField label="Preferred size" as="select" value={form.preferredSize} onChange={set("preferredSize")}>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s || "Not set"}</option>
          ))}
        </FormField>
        <div className="sm:col-span-2">
          <button disabled={busy} className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-2">
            {busy && <Spinner size={14} />} Save changes
          </button>
        </div>
      </form>
    </Card>
  );
}

function Addresses() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(() => fetchAddresses(), [user.id]);
  const [editing, setEditing] = useState(null); // null | "new" | address
  const [busy, setBusy] = useState(false);

  const onSave = async (values) => {
    setBusy(true);
    try {
      await saveAddress(user.id, values, editing !== "new" ? editing.id : undefined);
      toast.success("Address saved");
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't save this address."));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success("Address deleted");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toForm = (a) => ({
    label: a.label, fullName: a.full_name, phone: a.phone, address: a.address_line,
    city: a.city, postalCode: a.postal_code, country: a.country, isDefault: a.is_default,
  });

  return (
    <Card
      icon={MapPin}
      title="Saved addresses"
      action={
        !editing && (
          <button onClick={() => setEditing("new")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <Plus size={14} /> Add address
          </button>
        )
      }
    >
      {editing ? (
        <AddressForm initial={editing === "new" ? undefined : toForm(editing)} onSubmit={onSave} onCancel={() => setEditing(null)} busy={busy} />
      ) : loading ? (
        <ListSkeleton rows={1} />
      ) : error ? (
        <ErrorState title="Couldn't load addresses" onRetry={reload} />
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">You haven't saved an address yet. Add one to check out faster.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {data.map((a) => (
            <li key={a.id} className="border border-gray-100 rounded-2xl p-4 text-sm relative">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-slate-900">{a.label}</strong>
                {a.is_default && <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
              </div>
              <p className="text-gray-600">{a.full_name} · {a.phone}</p>
              <p className="text-gray-500">{a.address_line}, {a.city} {a.postal_code}, {a.country}</p>
              <div className="flex gap-3 mt-3 text-xs">
                <button onClick={() => setEditing(a)} className="flex items-center gap-1 text-slate-600 hover:text-slate-900"><Pencil size={12} /> Edit</button>
                <button onClick={() => onDelete(a.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700"><Trash2 size={12} /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ChangePassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    const pw = passwordRule(password);
    if (pw) found.password = pw;
    if (password !== confirm) found.confirm = "Passwords do not match";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Password updated");
      setPassword("");
      setConfirm("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card icon={Lock} title="Change password">
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4" noValidate>
        <div>
          <FormField label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} maxLength={72} />
          <PasswordStrength value={password} />
        </div>
        <FormField label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} maxLength={72} />
        <div className="sm:col-span-2">
          <button disabled={busy} className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-2">
            {busy && <Spinner size={14} />} Update password
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function Profile() {
  useDocumentTitle("My Profile");
  const { user, profile, profileLoading, isAdmin } = useAuth();

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <p className="uppercase tracking-[4px] text-xs font-bold text-blue-600 mb-1">MY ACCOUNT</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Hello, {profile?.full_name?.split(" ")[0] || user.email.split("@")[0]}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/orders" className="bg-slate-900 text-white px-5 py-3 rounded-full text-xs font-bold hover:bg-black transition flex items-center gap-2">
              <Package size={14} /> My Orders
            </Link>
            {isAdmin && (
              <Link to="/admin" className="bg-blue-600 text-white px-5 py-3 rounded-full text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2">
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}
          </div>
        </div>

        {profileLoading ? <ListSkeleton rows={2} /> : (
          <>
            <PersonalInfo key={profile?.id ?? "none"} />
            <Addresses />
            <ChangePassword />
          </>
        )}
      </div>
    </div>
  );
}
