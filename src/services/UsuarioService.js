import { supabase } from "../supabase";

export const UsuarioService = {
    getCurrentUser: async (authId) => {
        const { data, error } = await supabase
            .from("usuarios")
            .select("*, roles(*), empresa(*)")
            .eq("id_auth", authId)
            .limit(1);

        if (error) throw error;
        return data?.[0] || null;
    },

    insertUsuario: async (userData) => {
        const { data, error } = await supabase
            .from("usuarios")
            .insert(userData)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    },

    updateUsuario: async (id, userData) => {
        const { data, error } = await supabase
            .from("usuarios")
            .update(userData)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    }
};
