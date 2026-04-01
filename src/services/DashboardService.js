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
            p_id_empresa: idEmpresa,
            p_dias: dias
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
        const { data, error } = await supabase
            .from("movimientos_caja")
            .select("monto, metodos_pago(nombre)")
            .eq("id_empresa", idEmpresa)
            .gte("fecha", `${fechaInicio}T00:00:00`)
            .lte("fecha", `${fechaFin}T23:59:59`);

        if (error) throw error;

        // Agrupar por nombre de método
        const agrupado = (data || []).reduce((acc, curr) => {
            const nombre = curr.metodos_pago?.nombre || "Efectivo/Otros";
            if (!acc[nombre]) acc[nombre] = 0;
            acc[nombre] += parseFloat(curr.monto) || 0;
            return acc;
        }, {});

        return Object.entries(agrupado).map(([metodo, total]) => ({ metodo, total }));
    }
};
