import { supabase } from "../supabase";

export const CategoriaService = {
    listarCategorias: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("categorias")
            .select("*")
            .eq("id_empresa", idEmpresa)
            .order("nombre", { ascending: true });
        if (error) throw error;
        return data;
    },

    insertarCategoria: async (categoriaData) => {
        const { data, error } = await supabase
            .from("categorias")
            .insert(categoriaData)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    },

    actualizarCategoria: async (id, categoriaData) => {
        const { data, error } = await supabase
            .from("categorias")
            .update(categoriaData)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    },

    eliminarCategoria: async (id) => {
        const { error } = await supabase
            .from("categorias")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }
};
