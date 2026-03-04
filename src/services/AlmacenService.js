import { supabase } from "../supabase";

export const AlmacenService = {
    getAlmacenesByEmpresa: async (empresaId) => {
        const { data, error } = await supabase
            .from("almacen")
            .select("*, sucursales(nombre)")
            .eq("id_empresa", empresaId);
        if (error) throw error;
        return data;
    },

    insertAlmacen: async (almacenData) => {
        const { data, error } = await supabase
            .from("almacen")
            .insert(almacenData)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    updateAlmacen: async (id, almacenData) => {
        const { data, error } = await supabase
            .from("almacen")
            .update(almacenData)
            .eq("id", id)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    deleteAlmacen: async (id) => {
        const { error } = await supabase
            .from("almacen")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }
};
