import { requireSupabase } from "../supabase/client";

const ORDER_COLUMNS =
  "id, order_number, status, payment_method, payment_status, subtotal, discount, shipping, total, promo_code, " +
  "ship_name, ship_email, ship_phone, ship_address, ship_city, ship_postal, ship_country, notes, created_at, " +
  "order_items (id, product_id, product_name, product_image, size, quantity, unit_price)";

// Prices are NOT sent from the browser. The server looks them up and
// calculates totals, discounts and shipping itself (place_order in schema.sql).
export async function placeOrder({ items, shipping, paymentMethod, promoCode, notes }) {
  const { data, error } = await requireSupabase().rpc("place_order", {
    p_items: items.map((i) => ({ product_id: i.productId, size: i.size, quantity: i.quantity })),
    p_shipping: shipping,
    p_payment_method: paymentMethod,
    p_promo_code: promoCode || null,
    p_notes: notes || null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { orderNumber: row.out_order_number, total: Number(row.out_total) };
}

export async function fetchMyOrders() {
  const { data, error } = await requireSupabase()
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchOrder(orderNumber) {
  const { data, error } = await requireSupabase()
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data; // null when it doesn't exist or belongs to someone else (RLS)
}

export async function cancelOrder(orderNumber) {
  const { error } = await requireSupabase().rpc("cancel_order", { p_order_number: orderNumber });
  if (error) throw error;
}
