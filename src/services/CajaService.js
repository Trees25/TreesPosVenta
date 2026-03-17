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
                id_empresa: cajaData.id_empresa,
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
    },

    obtenerResumenCaja: async (idCierre) => {
        // 1. Obtener datos maestros del cierre (monto apertura)
        const { data: cierre, error: errorCierre } = await supabase
            .from("cierrecaja")
            .select("*")
            .eq("id", idCierre)
            .single();

        if (errorCierre) throw errorCierre;

        // 2. Obtener movimientos agrupados por método de pago
        const { data: movimientos, error: errorMovs } = await supabase
            .from("movimientos_caja")
            .select("*, metodos_pago(nombre)")
            .eq("id_cierre_caja", idCierre);

        if (errorMovs) throw errorMovs;

        // 3. Procesar resumen
        const resumen = {
            monto_apertura: cierre.monto_apertura || 0,
            ingresos: {},
            total_ingresos: 0,
            total_egresos: 0,
            efectivo_esperado: cierre.monto_apertura || 0
        };

        movimientos.forEach(m => {
            const metodo = m.metodos_pago?.nombre || "Otros";
            const montoNeto = m.tipo === "ingreso" ? (m.monto - m.vuelto) : -m.monto;

            if (m.tipo === "ingreso") {
                resumen.ingresos[metodo] = (resumen.ingresos[metodo] || 0) + montoNeto;
                resumen.total_ingresos += montoNeto;
                if (metodo.toLowerCase() === "efectivo") {
                    resumen.efectivo_esperado += montoNeto;
                }
            } else {
                resumen.total_egresos += m.monto;
                if (metodo.toLowerCase() === "efectivo") {
                    resumen.efectivo_esperado -= m.monto;
                }
            }
        });

        return resumen;
    }
};
