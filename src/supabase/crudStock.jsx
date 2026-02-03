import { supabase } from "./supabase.config";

const tabla = "stock";
export async function InsertarStock(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}
export async function EditarStock(p, tipo) {
  const { error } = await supabase.rpc(
    tipo === "ingreso" ? "incrementarstock" : "reducirstock", p
  );
  if (error) {
    throw new Error(error.message);
  }
}
export async function MostrarStockXAlmacenYProducto(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_almacen", p.id_almacen)
    .eq("id_producto", p.id_producto)
    .maybeSingle();
  return data;
}
export async function MostrarStockXAlmacenesYProducto(p) {
  const { data } = await supabase
    .from(tabla)
    .select(`*, almacen(*)`)
    .eq("id_almacen", p.id_almacen)
    .eq("id_producto", p.id_producto)
    .gt("stock", 0);
  return data;
}

export async function MostrarStockAlertas(p) {
  const { data, error } = await supabase.rpc("mostrar_alertas_stock", {
    _id_empresa: p.id_empresa,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function ActualizarStockMinimo(p) {
  const { error } = await supabase
    .from(tabla)
    .update({ stock_minimo: p.stock_minimo })
    .eq("id", p.id);
  if (error) {
    throw new Error(error.message);
  }
}
