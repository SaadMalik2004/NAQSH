export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const isApparelSize = (sizes = []) => sizes.includes("M");

// The size to pre-select for a product
export const defaultSize = (product) => {
  const sizes = product?.sizes?.length ? product.sizes : ["One Size"];
  return sizes.includes("M") ? "M" : sizes[0];
};

export const ORDER_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};
