import { requireSupabase } from "../supabase/client";

export async function fetchWishlistIds() {
  const { data, error } = await requireSupabase().from("wishlist_items").select("product_id");
  if (error) throw error;
  return data.map((r) => Number(r.product_id));
}

export async function addToWishlist(userId, productIds) {
  const ids = Array.isArray(productIds) ? productIds : [productIds];
  if (ids.length === 0) return;
  const { error } = await requireSupabase()
    .from("wishlist_items")
    .upsert(ids.map((product_id) => ({ user_id: userId, product_id })), { onConflict: "user_id,product_id" });
  if (error) throw error;
}

export async function removeFromWishlist(userId, productId) {
  const { error } = await requireSupabase()
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
}
