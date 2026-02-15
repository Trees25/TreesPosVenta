import { supabase } from "../supabase";

export const DashboardService = {
    obtenerMétricas: async (idEmpresa, fechaInicio, fechaFin) => {
        // Usamos RPCs para cálculos pesados y eficientes
        const [totalVentas, totalProductos, ganancias] = await Promise.all([
            supabase.rpc("rpc_sumar_ventas", { p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin }),
            supabase.rpc("rpc_sumar_cantidad_productos", { p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin }),
            supabase.rpc("rpc_sumar_ganancias", { p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin })
        ]);

        return {
            totalVentas: totalVentas.data || 0,
            totalProductos: totalProductos.data || 0,
            ganancias: ganancias.data || 0
        };
    },

    obtenerVentasPorDia: async (idEmpresa, dias = 7) => {
        const { data, error } = await supabase.rpc("rpc_ventas_historico", {
            p_dias: dias,
            p_id_empresa: idEmpresa
        });

        if (error) throw error;
        return data || [];
    },

    obtenerTopProductos: async (idEmpresa, fechaInicio, fechaFin) => {
        const { data, error } = await supabase.rpc("rpc_top_productos", {
            p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin
        });
        if (error) throw error;
        return data || [];
    },

    obtenerVentasPorCategoria: async (idEmpresa, fechaInicio, fechaFin) => {
        const { data, error } = await supabase.rpc("rpc_ventas_por_categoria", {
            p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin
        });
        if (error) throw error;
        return data || [];
    },

    obtenerVentasPorMetodo: async (idEmpresa, fechaInicio, fechaFin) => {
        const { data, error } = await supabase.rpc("rpc_ventas_por_metodo", {
            p_id_empresa: idEmpresa, fecha_ini: fechaInicio, fecha_fin: fechaFin
        });
        if (error) throw error;
        return data || [];
    }
};
