const OFFLINE_SALES_KEY = "pos_ventas_pendientes";

export const OfflineService = {
    // Guardar una venta que falló por conexión
    guardarVentaPendiente: (ventaData) => {
        try {
            const pendientes = OfflineService.listarVentasPendientes();
            const nuevaVenta = {
                id_temp: Date.now(),
                fecha_local: new Date().toISOString(),
                data: ventaData
            };
            pendientes.push(nuevaVenta);
            localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(pendientes));
            return nuevaVenta.id_temp;
        } catch (error) {
            console.error("Error guardando venta offline:", error);
            return null;
        }
    },

    // Listar todas las ventas guardadas localmente
    listarVentasPendientes: () => {
        try {
            const stored = localStorage.getItem(OFFLINE_SALES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Error listando ventas offline:", error);
            return [];
        }
    },

    // Eliminar una venta ya sincronizada
    eliminarVentaPendiente: (idTemp) => {
        try {
            const pendientes = OfflineService.listarVentasPendientes();
            const filtrados = pendientes.filter(v => v.id_temp !== idTemp);
            localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(filtrados));
        } catch (error) {
            console.error("Error eliminando venta offline:", error);
        }
    },

    // Limpiar todo (uso cauteloso)
    limpiarTodo: () => {
        localStorage.removeItem(OFFLINE_SALES_KEY);
    }
};
