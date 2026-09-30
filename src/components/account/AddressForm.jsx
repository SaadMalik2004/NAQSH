import { useState } from "react";
import FormField from "../common/FormField";
import { Spinner } from "../common/Spinner";
import { addressSchema, clean, hasErrors, validate } from "../../utils/validators";

const EMPTY = { label: "Home", fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Pakistan", isDefault: false };

export default function AddressForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form, addressSchema);
    setErrors(found);
    if (hasErrors(found)) return;
    onSubmit({
      label: clean(form.label, 30) || "Home",
      full_name: clean(form.fullName, 100),
      phone: clean(form.phone, 20),
      address_line: clean(form.address, 200),
      city: clean(form.city, 80),
      postal_code: clean(form.postalCode, 12),
      country: clean(form.country, 60),
      is_default: form.isDefault,
    });
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4" noValidate>
      <FormField label="Label" placeholder="Home, Office..." value={form.label} onChange={set("label")} maxLength={30} />
      <FormField label="Full name" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} maxLength={100} />
      <FormField label="Phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" value={form.phone} onChange={set("phone")} error={errors.phone} maxLength={20} />
      <FormField label="City" autoComplete="address-level2" value={form.city} onChange={set("city")} error={errors.city} maxLength={80} />
      <FormField className="sm:col-span-2" label="Street address" autoComplete="street-address" value={form.address} onChange={set("address")} error={errors.address} maxLength={200} />
      <FormField label="Postal code" autoComplete="postal-code" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} maxLength={12} />
      <FormField label="Country" autoComplete="country-name" value={form.country} onChange={set("country")} error={errors.country} maxLength={60} />
      <label className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-700">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((v) => ({ ...v, isDefault: e.target.checked }))} className="accent-slate-900" />
        Use as my default address
      </label>
      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={busy} className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-2">
          {busy && <Spinner size={14} />} Save address
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full text-xs font-bold text-slate-600 hover:bg-gray-100 transition">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
