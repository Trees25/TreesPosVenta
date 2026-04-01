import { supabase } from "../supabase";

export const ProductoService = {
    listarProductos: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("productos")
            .select("*, categorias(nombre), stock(stock, stock_minimo, id_almacen, almacen(id_sucursal, nombre, sucursales(nombre)))")
            .eq("id_empresa", idEmpresa)
            .eq("activo", true)
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

            // Limpiar campos que NO pertenecen a la tabla 'productos'
            const { id_usuario, stock_inicial, stock_minimo, ubicacion, maneja_inventarios, id_sucursal, ...cleanData } = productoData;

            const { data: directData, error: directError } = await supabase
                .from("productos")
                .insert(cleanData)
                .select();
            
            if (directError) throw directError;
            const nuevoProducto = directData?.[0];

            // Si hay un stock inicial y el producto se creó correctamente, insertarlo manualmente en la tabla correspondiente
            if (nuevoProducto) {
                try {
                    // Obtener almacen según sucursal
                    let idAlmacen = null;
                    if (productoData.id_sucursal) {
                        const { data: almacenData } = await supabase.from('almacen').select('id').eq('id_sucursal', productoData.id_sucursal).limit(1);
                        idAlmacen = almacenData?.[0]?.id;
                    }

                    if (idAlmacen && productoData.stock_inicial > 0) {
                        await supabase.from("stock").insert({
                            id_producto: nuevoProducto.id,
                            id_almacen: idAlmacen,
                            stock: productoData.stock_inicial || 0,
                            stock_minimo: productoData.stock_minimo || 0
                        });
                    }
                } catch (stockError) {
                    console.error("Fallo al insertar stock manual tras fallback:", stockError);
                }
            }

            return nuevoProducto;
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
            .update({ activo: false })
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

    actualizarPreciosMasivo: async (filters) => {
        const { data, error } = await supabase.rpc("actualizar_precios_masivo", {
            p_id_empresa: filters.id_empresa,
            p_id_categoria: filters.id_categoria || null,
            p_id_proveedor: filters.id_proveedor || null,
            p_valor: filters.valor || 0,
            p_tipo_precio: filters.tipo_precio || 'venta',
            p_modo: filters.modo || 'porcentaje'
        });
        if (error) throw error;
        return data;
    },

    exportarModeloCSV: () => {
        const headers = ["nombre", "precio_venta", "precio_compra", "codigo_barras", "codigo_interno", "categoria", "sevende_por", "stock_inicial"];
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
