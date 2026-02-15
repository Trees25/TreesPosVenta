import { supabase } from "../supabase";

export const SuscripcionService = {
    obtenerPlanes: async () => {
        const { data, error } = await supabase
            .from("planes")
            .select("*")
            .order("precio", { ascending: true });
        if (error) throw error;
        return data;
    },

    obtenerSuscripcionActiva: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("suscripciones")
            .select("*, planes(*)")
            .eq("id_empresa", idEmpresa)
            .eq("estado", "activo")
            .limit(1);
        if (error) throw error;
        return data?.[0] || null;
    },

    cancelarSuscripcion: async (idSuscripcion) => {
        const { error } = await supabase
            .from("suscripciones")
            .update({ estado: "cancelado" })
            .eq("id", idSuscripcion);
        if (error) throw error;
    }
};
