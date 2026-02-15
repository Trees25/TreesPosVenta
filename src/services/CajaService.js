import { supabase } from "../supabase";

export const CajaService = {
    obtenerCajaAbierta: async (idUsuario) => {
        const { data, error } = await supabase
            .from("cierrecaja")
            .select("*")
            .eq("id_usuario", idUsuario)
            .eq("estado", 0) // 0 = abierta en bd.sql
            .order("fecha_apertura", { ascending: false })
            .limit(1);

        if (error) throw error;
        return data?.[0] || null;
    },

    abrirCaja: async (cajaData) => {
        const { data, error } = await supabase
            .from("cierrecaja")
            .insert({
                id_usuario: cajaData.id_usuario,
                id_caja: cajaData.id_caja,
                monto_apertura: cajaData.monto_inicial || 0,
                fecha_apertura: new Date().toISOString(),
                estado: 0
            })
            .select();

        if (error) throw error;
        return data?.[0] || null;
    },

    cerrarCaja: async (idCierre, cierreData) => {
        const { data, error } = await supabase
            .from("cierrecaja")
            .update({
                ...cierreData,
                fecha_cierre: new Date().toISOString(),
                estado: 1 // 1 = cerrada en bd.sql
            })
            .eq("id", idCierre)
            .select();

        if (error) throw error;
        return data?.[0] || null;
    }
};
