import { requireSupabase, isSupabaseConfigured } from "../supabase/client";

export async function fetchReviews(productId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await requireSupabase()
    .from("reviews")
    .select("id, user_id, reviewer_name, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// Latest 4-5 star reviews for the home page
export async function fetchRecentReviews(limit = 3) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await requireSupabase()
    .from("reviews")
    .select("id, product_id, reviewer_name, rating, comment, created_at")
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Only customers with a non-cancelled order containing the product can review it
// (enforced by RLS too — this check just lets the UI show/hide the form).
export async function hasPurchased(productId) {
  const { data, error } = await requireSupabase()
    .from("order_items")
    .select("id, orders!inner(status)")
    .eq("product_id", productId)
    .neq("orders.status", "cancelled")
    .limit(1);
  if (error) throw error;
  return data.length > 0;
}

export async function submitReview({ productId, userId, rating, comment }) {
  const { error } = await requireSupabase()
    .from("reviews")
    .insert({ product_id: productId, user_id: userId, rating, comment });
  if (error) throw error;
}

export async function deleteReview(id) {
  const { error } = await requireSupabase().from("reviews").delete().eq("id", id);
  if (error) throw error;
}
