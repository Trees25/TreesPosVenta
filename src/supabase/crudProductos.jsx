
import { supabase } from "../index";
const tabla = "productos";
export async function InsertarProductos(p) {
  const { error, data } = await supabase.rpc("insertarproductos", p);
  if (error) {
    throw new Error(error.message);
  }
  console.log(data);
  return data;
}

export async function MostrarProductos(p) {
  let query = supabase.from(tabla).select("*").eq("id_empresa", p.id_empresa);

  if (p.id_categoria) {
    query = query.eq("id_categoria", p.id_categoria);
  }
  if (p.id_proveedor) {
    query = query.eq("id_proveedor", p.id_proveedor);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function BuscarProductos(p) {
  let query = supabase.from(tabla).select("*").eq("id_empresa", p.id_empresa)
    .ilike("nombre", `%${p.buscador}%`);

  if (p.id_categoria) {
    query = query.eq("id_categoria", p.id_categoria);
  }
  if (p.id_proveedor) {
    query = query.eq("id_proveedor", p.id_proveedor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function EliminarProductos(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function EditarProductos(p) {
  const { error } = await supabase.rpc("editarproductos", p);
  if (error) {
    throw new Error(error.message);
  }
}

export async function MostrarUltimoProducto(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa)
    .order("id", { ascending: false })
    .maybeSingle();

  return data;
}

export async function ActualizarPreciosMasivo(p) {
  const { error } = await supabase.rpc("actualizar_precios_masivo", p);
  if (error) {
    throw new Error(error.message);
  }
}
