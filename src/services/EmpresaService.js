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
                .select("*, planes(*)") // Incluimos el join con planes
                .eq("id_auth_user", userId)
                .limit(1);

            if (directError) throw directError;
            return directData?.[0] || null;
        }

        return Array.isArray(data) ? data[0] : data;
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
    },

    getPlanRestrictions: async (idPlan) => {
        const { data, error } = await supabase
            .from("restricciones_planes")
            .select("*")
            .eq("id_plan", idPlan);
        if (error) throw error;
        return data;
    },

    listarCondicionesIva: async () => {
        const { data, error } = await supabase
            .from("condiciones_iva")
            .select("*")
            .order("id", { ascending: true });
        if (error) throw error;
        return data;
    },

    subirLogo: async (idEmpresa, file) => {
        // Limite de 500KB
        if (file.size > 512 * 1024) throw new Error("El archivo es demasiado grande (Máximo 500KB)");

        const fileExt = file.name.split('.').pop();
        const fileName = `${idEmpresa}_logo.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // Subir con upsert: true para sobrescribir y que sea único
        const { error: uploadError } = await supabase.storage
            .from('empresa')
            .upload(filePath, file, {
                upsert: true,
                cacheControl: '0' // Evitar cache del navegador al sobrescribir
            });

        if (uploadError) throw uploadError;

        // Obtener URL pública (agregamos timestamp para romper cache)
        const { data: { publicUrl } } = supabase.storage
            .from('empresa')
            .getPublicUrl(filePath);

        const publicUrlWithCacheBurst = `${publicUrl}?t=${Date.now()}`;

        // Actualizar tabla empresa
        const { error: updateError } = await supabase
            .from("empresa")
            .update({ logo: publicUrlWithCacheBurst })
            .eq("id", idEmpresa);

        if (updateError) throw updateError;

        return publicUrlWithCacheBurst;
    }
};
