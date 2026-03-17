import { supabase } from "../supabase";

export const MetodoPagoService = {
    METODOS_ESTANDAR: [
        { nombre: 'Efectivo', icono: 'mdi:cash' },
        { nombre: 'Tarjeta de Débito', icono: 'mdi:credit-card' },
        { nombre: 'Tarjeta de Crédito', icono: 'mdi:credit-card' },
        { nombre: 'Transferencia', icono: 'mdi:bank' },
        { nombre: 'QR / Billetera Virtual', icono: 'mdi:qrcode' }
    ],

    listarMetodosPorEmpresa: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("metodos_pago")
            .select("*")
            .eq("id_empresa", idEmpresa)
            .order("nombre", { ascending: true });

        if (error) throw error;
        return data;
    },

    activarMetodo: async (idEmpresa, metodo) => {
        const { data, error } = await supabase
            .from("metodos_pago")
            .insert({
                nombre: metodo.nombre,
                icono: metodo.icono,
                id_empresa: idEmpresa
            })
            .select();

        if (error) throw error;
        return data?.[0];
    },

    desactivarMetodo: async (id) => {
        const { error } = await supabase
            .from("metodos_pago")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
