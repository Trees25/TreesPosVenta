import { supabase } from "../supabase";

export const EmpresaService = {
    getEmpresaByUserId: async (userId) => {
        // Usamos el RPC que definimos en bd.sql para eficiencia
        const { data, error } = await supabase.rpc("mostrarempresaxiduser", {
            _id_auth_user: userId,
        });

        // Si el RPC no existe aún o falla, usamos consulta directa (fallback)
        if (error) {
            console.warn("RPC mostrarempresaxiduser falló, usando fallback:", error.message);
            const { data: directData, error: directError } = await supabase
                .from("empresa")
                .select("*")
                .eq("id_auth_user", userId)
                .limit(1);

            if (directError) throw directError;
            return directData?.[0] || null;
        }

        return data;
    },

    insertEmpresa: async (empresaData) => {
        const { data, error } = await supabase
            .from("empresa")
            .insert(empresaData)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    },

    updateEmpresa: async (id, empresaData) => {
        const { data, error } = await supabase
            .from("empresa")
            .update(empresaData)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    }
};
