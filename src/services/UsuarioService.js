import { supabase } from "../supabase";

export const UsuarioService = {
    getCurrentUser: async (authId) => {
        const { data, error } = await supabase.rpc("obtener_perfil_usuario", {
            p_auth_id: authId
        });

        if (error) throw error;
        return data || null;
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
