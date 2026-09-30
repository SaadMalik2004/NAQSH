import { requireSupabase } from "../supabase/client";

// Returns { code, percent } or null when the code is not valid
export async function validatePromo(code, subtotal) {
  const { data, error } = await requireSupabase().rpc("validate_promo", {
    p_code: code,
    p_subtotal: subtotal,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? { code: row.code, percent: Number(row.percent) } : null;
}
