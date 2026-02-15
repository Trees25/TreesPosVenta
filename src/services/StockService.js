import { supabase } from "../supabase";

export const StockService = {
    obtenerStockPorProducto: async (idProducto) => {
        const { data, error } = await supabase
            .from("stock")
            .select("*, almacen(nombre)")
            .eq("id_producto", idProducto);
        if (error) throw error;
        return data;
    },

    registrarMovimiento: async (movimientoData) => {
        // Este es un punto CRÍTICO: El movimiento de stock debe ser atómico.
        // Usamos una función RPC que actualiza la tabla 'stock' y registra el 'movimiento_stock'
        const { data, error } = await supabase.rpc("registrar_movimiento_stock_atomico", {
            _id_producto: movimientoData.id_producto,
            _id_almacen: movimientoData.id_almacen,
            _cantidad: movimientoData.cantidad,
            _tipo: movimientoData.tipo, // 'entrada' o 'salida'
            _id_usuario: movimientoData.id_usuario
        });

        if (error) throw error;
        return data;
    }
};
