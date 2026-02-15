import { supabase } from "../supabase";

export const ProductoService = {
    listarProductos: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("productos")
            .select("*, categorias(nombre), stock(stock, stock_minimo, id_almacen)")
            .eq("id_empresa", idEmpresa)
            .order("nombre", { ascending: true });
        if (error) throw error;
        return data;
    },

    insertarProducto: async (productoData) => {
        // Nota: El insert de producto debe gatillar la creación de stock inicial
        // Se recomienda usar el RPC 'insertarproductos' que definimos en bd.sql
        const { data, error } = await supabase.rpc("insertarproductos", {
            p: productoData
        });

        if (error) {
            console.warn("RPC insertarproductos falló, usando fallback directo:", error.message);
            const { data: directData, error: directError } = await supabase
                .from("productos")
                .insert(productoData)
                .select();
            if (directError) throw directError;
            return directData?.[0] || null;
        }

        return data;
    },

    actualizarProducto: async (id, productoData) => {
        const { data, error } = await supabase
            .from("productos")
            .update(productoData)
            .eq("id", id)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    eliminarProducto: async (id) => {
        const { error } = await supabase
            .from("productos")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }
};
