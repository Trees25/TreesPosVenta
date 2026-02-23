import { supabase } from "../supabase";

export const ProductoService = {
    listarProductos: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("productos")
            .select("*, categorias(nombre), stock(stock, stock_minimo, id_almacen, almacen(id_sucursal, nombre, sucursales(nombre)))")
            .eq("id_empresa", idEmpresa)
            .order("nombre", { ascending: true });

        if (error) throw error;
        return data;
    },

    insertarProducto: async (productoData) => {
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
    },

    importarProductosMasivo: async (productos, idEmpresa) => {
        const { data, error } = await supabase.rpc("upsert_productos_masivo", {
            p_productos: productos,
            p_id_empresa: idEmpresa
        });
        if (error) throw error;
        return data;
    },

    exportarModeloCSV: () => {
        const headers = ["nombre", "precio_venta", "precio_compra", "codigo_barras", "codigo_interno", "id_categoria", "sevende_por"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_productos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
