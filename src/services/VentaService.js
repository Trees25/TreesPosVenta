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
    }
};
