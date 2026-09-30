import { supabase, isSupabaseConfigured } from "../supabase/client";
import { seedProducts } from "../data/seedProducts";
import { getCached, getStale, setCached, invalidateCache } from "../utils/cache";

const CACHE_KEY = "products_v1";

// Database row (snake_case) -> the shape the UI components use
export function mapProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    subCategory: row.sub_category,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : null,
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews_count ?? 0),
    badge: row.badge || null,
    image: row.image_url,
    description: row.description || "",
    sizes: row.sizes?.length ? row.sizes : ["One Size"],
    stock: Number(row.stock ?? 0),
    isActive: row.is_active !== false,
    sortOrder: row.sort_order ?? 100,
  };
}

// Storefront catalogue (active products only). Cached for 5 minutes.
export async function fetchProducts({ force = false } = {}) {
  if (!isSupabaseConfigured) return seedProducts; // demo fallback (no backend configured)

  if (!force) {
    const cached = getCached(CACHE_KEY);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    const stale = getStale(CACHE_KEY);
    if (stale) return stale; // show old data rather than an empty shop
    throw error;
  }

  const products = data.map(mapProduct);
  setCached(CACHE_KEY, products);
  return products;
}

export const clearProductCache = () => invalidateCache(CACHE_KEY);
