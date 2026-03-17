import { supabase } from "../supabase";
import { OfflineService } from "./OfflineService";

export const VentaService = {
    procesarVenta: async (ventaData) => {
        try {
            // Verificar conexión antes de intentar
            if (!navigator.onLine) {
                throw new Error("Sin conexión a internet");
            }

            const { data, error } = await supabase.rpc("finalizar_venta_atomica", {
                _venta: ventaData.venta,
                _detalles: ventaData.detalles,
                _pagos: ventaData.pagos
            });

            if (error) throw error;
            return data;
        } catch (error) {
            // Si el error es de conexión, guardamos offline
            const isNetworkError = error.message.includes("fetch") || 
                                  error.message.includes("connection") || 
                                  error.message.includes("Sin conexión");

            if (isNetworkError) {
                console.warn("Detectado fallo de red, guardando venta en modo offline...");
                const idLocal = OfflineService.guardarVentaPendiente(ventaData);
                if (idLocal) {
                    throw new Error("OFFLINE_SAVED");
                }
            }
            throw error;
        }
    },

    listarVentasUsuario: async (idUsuario, fechaIni, fechaFin) => {
        const { data, error } = await supabase
            .from("ventas")
            .select("*, clientes_proveedores(nombres)")
            .eq("id_usuario", idUsuario)
            .gte("fecha", `${fechaIni}T00:00:00`)
            .lte("fecha", `${fechaFin}T23:59:59`)
            .order("fecha", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    obtenerDetalleVenta: async (idVenta) => {
        const { data: items, error: errorItems } = await supabase
            .from("detalle_venta")
            .select("*, productos(nombre)")
            .eq("id_venta", idVenta);

        if (errorItems) throw errorItems;

        const { data: pagos, error: errorPagos } = await supabase
            .from("movimientos_caja")
            .select("*, metodos_pago(nombre)")
            .eq("id_venta", idVenta);

        if (errorPagos) throw errorPagos;

        return { items, pagos };
    }
};
