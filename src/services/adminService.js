import { requireSupabase } from "../supabase/client";
import { mapProduct, clearProductCache } from "./productService";

// All of these only work for users whose profile.role = 'admin' (enforced by RLS).

export async function fetchAllOrders() {
  const { data, error } = await requireSupabase()
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, total, ship_name, ship_email, ship_phone, ship_address, ship_city, created_at, " +
        "order_items (id, product_name, size, quantity, unit_price)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function updateOrder(id, values) {
  const { error } = await requireSupabase().from("orders").update(values).eq("id", id);
  if (error) throw error;
}

export async function fetchAllProducts() {
  const { data, error } = await requireSupabase()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function saveProduct(values, id) {
  const sb = requireSupabase();
  const query = id ? sb.from("products").update(values).eq("id", id) : sb.from("products").insert(values);
  const { error } = await query;
  if (error) throw error;
  clearProductCache();
}

export async function deleteProduct(id) {
  const { error } = await requireSupabase().from("products").delete().eq("id", id);
  if (error) throw error;
  clearProductCache();
}

export async function uploadProductImage(file) {
  const sb = requireSupabase();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("product-images").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function fetchMessages() {
  const { data, error } = await requireSupabase()
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function markMessageRead(id, isRead) {
  const { error } = await requireSupabase().from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id) {
  const { error } = await requireSupabase().from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}
