import { supabase } from "../supabase";

export const DocumentoService = {
    listarTiposComprobantes: async () => {
        const { data, error } = await supabase
            .from("tipo_comprobantes")
            .select("*")
            .order("nombre", { ascending: true });

        if (error) throw error;
        return data;
    },

    obtenerSerializacion: async (idSucursal, idTipoComprobante) => {
        const { data, error } = await supabase
            .from("serializacion_comprobantes")
            .select("*")
            .eq("sucursal_id", idSucursal)
            .eq("tipo_comprobante_id", idTipoComprobante)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data;
    },

    listarPlantillas: async (idEmpresa) => {
        const { data, error } = await supabase
            .from("plantillas_comprobantes")
            .select("*, tipo_comprobantes(nombre)")
            .eq("id_empresa", idEmpresa);

        if (error) throw error;
        return data;
    },

    guardarPlantilla: async (plantillaData) => {
        const { data, error } = await supabase
            .from("plantillas_comprobantes")
            .upsert(plantillaData)
            .select();

        if (error) throw error;
        return data?.[0];
    }
};
