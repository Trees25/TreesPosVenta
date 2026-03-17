import { supabase } from "../supabase";

const LOCAL_PRINTER_PORT = "5075";

export const ImpresoraService = {
    /**
     * Obtiene la IP local de la computadora donde corre el servicio
     */
    obtenerIpLocal: async () => {
        try {
            const response = await fetch(`http://localhost:${LOCAL_PRINTER_PORT}/api/get-local-ip`);
            if (!response.ok) return "localhost";
            const data = await response.json();
            return data.ip || "localhost";
        } catch (error) {
            return "localhost";
        }
    },

    /**
     * Obtiene la lista de impresoras instaladas en una PC (local o remota)
     */
    listarImpresorasLocales: async (ipTarget = "localhost") => {
        try {
            // Si el target es localhost, forzamos el uso de localhost literal para evitar problemas de DNS
            const host = (ipTarget === "localhost" || ipTarget === "127.0.0.1") ? "localhost" : ipTarget;
            const url = `http://${host}:${LOCAL_PRINTER_PORT}/api`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${url}/list`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Servicio no disponible");
            const data = await response.json();

            // Mapear de [{"name": "..."}] a ["..."] para que coincida con la UI
            const finalList = Array.isArray(data)
                ? data.map(item => typeof item === 'object' ? item.name : item)
                : [];

            return { connected: true, list: finalList };
        } catch (error) {
            console.error(`Error de conexión con ${ipTarget}:`, error);
            return { connected: false, list: [], error: error.message };
        }
    },

    /**
     * Obtiene la configuración de impresora guardada para una caja específica
     */
    obtenerImpresoraPorCaja: async (idCaja) => {
        const { data, error } = await supabase
            .from("impresoras")
            .select("*")
            .eq("id_caja", idCaja)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Guarda o actualiza la configuración de la impresora para una caja
     */
    guardarConfiguracion: async (idCaja, nombre, estado, ipPc = "localhost") => {
        const { data, error } = await supabase
            .from("impresoras")
            .upsert({
                id_caja: idCaja,
                nombre: nombre,
                estado: estado,
                ip_pc: ipPc
            }, { onConflict: "id_caja" })
            .select();

        if (error) throw error;
        return data?.[0];
    },

    /**
     * Envía un PDF (Blob o File) a la impresora térmica (local o remota)
     */
    imprimirDirecto: async (file, printerName, ipTarget = "localhost") => {
        const url = `http://${ipTarget}:${LOCAL_PRINTER_PORT}/api`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("printerName", printerName);

        const response = await fetch(`${url}/print-ticket`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || "Error al enviar a la impresora");
        }

        return true;
    }
};
