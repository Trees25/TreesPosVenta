import { supabase } from "../supabase";

export const TercerosService = {
    getTerceros: async (empresaId, tipo = 'cliente') => {
        const { data, error } = await supabase
            .from("clientes_proveedores")
            .select("*")
            .eq("id_empresa", empresaId)
            .eq("tipo", tipo);
        if (error) throw error;
        return data;
    },

    insertTercero: async (terceroData) => {
        const { data, error } = await supabase
            .from("clientes_proveedores")
            .insert(terceroData)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    updateTercero: async (id, terceroData) => {
        const { data, error } = await supabase
            .from("clientes_proveedores")
            .update(terceroData)
            .eq("id", id)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    deleteTercero: async (id) => {
        const { error } = await supabase
            .from("clientes_proveedores")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }
};
