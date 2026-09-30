import { requireSupabase } from "../supabase/client";

const COLUMNS = "id, label, full_name, phone, address_line, city, postal_code, country, is_default";

export async function fetchAddresses() {
  const { data, error } = await requireSupabase()
    .from("addresses")
    .select(COLUMNS)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function saveAddress(userId, values, id) {
  const sb = requireSupabase();
  const query = id
    ? sb.from("addresses").update(values).eq("id", id)
    : sb.from("addresses").insert({ ...values, user_id: userId });
  const { data, error } = await query.select(COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id) {
  const { error } = await requireSupabase().from("addresses").delete().eq("id", id);
  if (error) throw error;
}
