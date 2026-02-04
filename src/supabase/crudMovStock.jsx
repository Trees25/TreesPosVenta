import { supabase } from "./supabase.config";
const tabla = "movimientos_stock";
export async function MostrarMovStock(p) {
  const pag = p.pagina || 1;
  const from = (pag - 1) * 20;
  const to = from + 19;
  const { data, error, count } = await supabase
    .from(tabla)
    .select(
      `
      *,
      almacen!inner(
        *,
        sucursales!inner(
          *
        )
      )
    `,
      { count: "exact" }
    )
    .eq("almacen.sucursales.id_empresa", p.id_empresa)
    .eq("id_producto", p.id_producto)
    .range(from, to)
    .order("fecha", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return { data, count };
}

export async function InsertarMovStock(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}
