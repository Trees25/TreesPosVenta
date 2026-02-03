import { supabase } from "../supabase/supabase.config";
const tabla = "permisos";
export async function MostrarPermisos(p) {
  const { data } = await supabase
    .from(tabla)
    .select(`*, modulos(*)`)
    .eq("id_usuario", p.id_usuario);
  return data;
}
export async function MostrarPermisosConfiguracion(p) {
  const { data } = await supabase
    .from(tabla)
    .select(`*, modulos!inner(*)`)
    .eq("modulos.etiquetas", "#configuracion")
    .eq("id_usuario", p.id_usuario);
  return data;
}
export async function MostrarPermisosDefault() {
  const { data } = await supabase.from("permisos_dafault").select();
  return data;
}
export async function InsertarPermisos(p) {
  const { error } = await supabase.from(tabla).insert(p).select();
  if (error) {
    throw new Error(error.message);
  }
}

export async function EliminarPermisos(p) {
  const { error } = await supabase
    .from(tabla)
    .delete()
    .eq("id_usuario", p.id_usuario);
  if (error) {
    throw new Error(error.message);
  }
}

export async function MostrarPermisosGlobales(p) {
  const { data } = await supabase
    .from(tabla)
    .select(`*, modulos(*)`)
    .eq("id_usuario", p.id_usuario);
  return data;
}

export async function AsignarPermisosDefault(p) {
  try {
    const { data: defaultPermisos } = await supabase.from("permisos_dafault").select("id_modulo");
    if (!defaultPermisos) return;

    const permisosToInsert = defaultPermisos.map((item) => ({
      id_usuario: p.id_usuario,
      id_modulo: item.id_modulo,
    }));

    const { error } = await supabase.from(tabla).insert(permisosToInsert);
    if (error) throw error;
  } catch (error) {
    throw new Error(error.message);
  }
}
