import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, Shirt } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import FormField from "../../components/common/FormField";
import { ListSkeleton } from "../../components/common/Skeleton";
import { Spinner } from "../../components/common/Spinner";
import { useAsyncData } from "../../hooks/useAsyncData";
import { deleteProduct, fetchAllProducts, saveProduct, uploadProductImage } from "../../services/adminService";
import { getErrorMessage } from "../../utils/errors";
import { money } from "../../utils/format";
import { all, clean, cleanMultiline, hasErrors, maxLen, minLen, required, validate } from "../../utils/validators";

const CATEGORIES = ["Men", "Women", "Unisex", "Footwear", "Accessories"];
const number = (label, { min = 0, max = 1000000 } = {}) => (v) => {
  if (v === "" || v == null) return `${label} is required`;
  const n = Number(v);
  if (Number.isNaN(n) || n < min || n > max) return `${label} must be between ${min} and ${max}`;
  return "";
};

const schema = {
  name: all(required("Name"), minLen("Name", 2), maxLen("Name", 150)),
  price: number("Price"),
  oldPrice: (v) => (v === "" ? "" : number("Old price")(v)),
  stock: number("Stock", { max: 100000 }),
  sizes: required("Sizes"),
  image: required("Image"),
};

const EMPTY = { name: "", category: "Men", subCategory: "", price: "", oldPrice: "", stock: "10", badge: "", description: "", sizes: "XS, S, M, L, XL", image: "", isActive: true, sortOrder: "100" };

function ProductForm({ initial, onDone }) {
  const [form, setForm] = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Use a JPG, PNG or WebP image.");
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3 MB.");
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((v) => ({ ...v, image: url }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form, schema);
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      await saveProduct(
        {
          name: clean(form.name, 150),
          category: form.category,
          sub_category: clean(form.subCategory, 60) || null,
          price: Number(form.price),
          old_price: form.oldPrice === "" ? null : Number(form.oldPrice),
          stock: Math.floor(Number(form.stock)),
          badge: clean(form.badge, 20).toUpperCase() || null,
          description: cleanMultiline(form.description, 1000),
          sizes: form.sizes.split(",").map((s) => clean(s, 10)).filter(Boolean),
          image_url: form.image,
          is_active: form.isActive,
          sort_order: Math.floor(Number(form.sortOrder) || 100),
        },
        initial?.id
      );
      toast.success("Product saved");
      onDone(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="bg-white rounded-3xl p-6 border border-gray-100 grid sm:grid-cols-2 gap-4">
      <FormField label="Name" value={form.name} onChange={set("name")} error={errors.name} maxLength={150} />
      <FormField label="Category" as="select" value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</FormField>
      <FormField label="Sub-category" value={form.subCategory} onChange={set("subCategory")} maxLength={60} />
      <FormField label="Badge (optional)" value={form.badge} onChange={set("badge")} maxLength={20} placeholder="NEW, SALE..." />
      <FormField label="Price ($)" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} error={errors.price} />
      <FormField label="Old price ($, optional)" type="number" min="0" step="0.01" value={form.oldPrice} onChange={set("oldPrice")} error={errors.oldPrice} />
      <FormField label="Stock" type="number" min="0" value={form.stock} onChange={set("stock")} error={errors.stock} />
      <FormField label="Sizes (comma separated)" value={form.sizes} onChange={set("sizes")} error={errors.sizes} hint='Footwear: "40, 41, 42". Accessories: "One Size".' />
      <FormField className="sm:col-span-2" label="Description" as="textarea" rows={3} value={form.description} onChange={set("description")} maxLength={1000} />
      <div className="sm:col-span-2">
        <label className="text-xs font-bold text-slate-700 block mb-1">Image</label>
        <div className="flex items-center gap-4">
          {form.image && <img src={form.image} alt="Preview" className="w-16 h-20 object-cover rounded-lg bg-stone-50" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="text-xs" />
          {uploading && <Spinner size={16} />}
        </div>
        {errors.image && <p className="text-[11px] text-red-500 mt-1">{errors.image}</p>}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((v) => ({ ...v, isActive: e.target.checked }))} className="accent-slate-900" /> Visible in store
      </label>
      <FormField label="Sort order (lower = first)" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
      <div className="sm:col-span-2 flex gap-3">
        <button disabled={busy || uploading} className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-black disabled:opacity-60 flex items-center gap-2">{busy && <Spinner size={14} />} Save product</button>
        <button type="button" onClick={() => onDone(false)} className="px-6 py-3 rounded-full text-xs font-bold text-slate-600 hover:bg-gray-100">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const { data, loading, error, reload } = useAsyncData(() => fetchAllProducts(), []);
  const [editing, setEditing] = useState(null); // null | "new" | product

  const toForm = (p) => ({
    id: p.id, name: p.name, category: p.category, subCategory: p.subCategory ?? "", price: String(p.price),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : "", stock: String(p.stock), badge: p.badge ?? "",
    description: p.description, sizes: p.sizes.join(", "), image: p.image, isActive: p.isActive, sortOrder: String(p.sortOrder),
  });

  const onDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? Past orders keep their history.`)) return;
    try {
      await deleteProduct(p.id);
      toast.success("Product deleted");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (editing)
    return <ProductForm initial={editing === "new" ? undefined : toForm(editing)} onDone={(saved) => { setEditing(null); if (saved) reload(); }} />;
  if (loading) return <ListSkeleton rows={4} />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing("new")} className="bg-slate-900 text-white px-5 py-3 rounded-full text-xs font-bold hover:bg-black flex items-center gap-2"><Plus size={14} /> Add product</button>
      {data.length === 0 ? (
        <EmptyState icon={Shirt} title="No products" message="Add your first product to start selling." />
      ) : (
        <ul className="space-y-3">
          {data.map((p) => (
            <li key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <img src={p.image} alt={p.name} loading="lazy" className="w-14 h-16 object-cover rounded-lg bg-stone-50" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category} · {money(p.price)} · Stock {p.stock} {!p.isActive && <span className="text-amber-600 font-bold">· Hidden</span>}</p>
              </div>
              <button aria-label="Edit product" onClick={() => setEditing(p)} className="p-2 text-slate-600 hover:text-slate-900"><Pencil size={16} /></button>
              <button aria-label="Delete product" onClick={() => onDelete(p)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
