import { supabase } from "../supabase";

export const VentaService = {
    procesarVenta: async (ventaData) => {
        // La venta DEBE ser atómica: Registrar venta, detalles y restar stock.
        // Usaremos un RPC en Supabase para asegurar integridad referencial y de stock.
        const { data, error } = await supabase.rpc("finalizar_venta_atomica", {
            _venta: ventaData.venta, // Datos maestros (total, id_usuario, id_cliente, etc)
            _detalles: ventaData.detalles, // Array de items (id_producto, cantidad, precio)
            _pagos: ventaData.pagos // Array de cobros realizados (monto, id_metodo_pago)
        });

        if (error) throw error;
        return data;
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
