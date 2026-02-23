import { supabase } from "../supabase";

export const SucursalService = {
    getSucursalesByEmpresa: async (empresaId) => {
        const { data, error } = await supabase
            .from("sucursales")
            .select("*")
            .eq("id_empresa", empresaId);
        if (error) throw error;
        return data;
    },

    insertSucursal: async (sucursalData) => {
        const { data, error } = await supabase
            .from("sucursales")
            .insert(sucursalData)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    },

    updateSucursal: async (id, sucursalData) => {
        const { data, error } = await supabase.rpc('editar_sucursal', {
            p_id: id,
            p_nombre: sucursalData.nombre,
            p_direccion: sucursalData.direccion
        });
        if (error) throw error;
        return data;
    },

    deleteSucursal: async (id) => {
        const { error } = await supabase
            .from("sucursales")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },

    // Validar si puede agregar más sucursales según el plan
    canAddSucursal: async (empresaId, idPlan) => {
        // En un flujo real, esto consultaría las restricciones_planes
        // Por ahora lo haremos basándonos en los IDs de los planes que conocemos
        const { count, error: countError } = await supabase
            .from("sucursales")
            .select("*", { count: 'exact', head: true })
            .eq("id_empresa", empresaId);

        if (countError) throw countError;

        // Plan Base (asumimos id=1 si es el primero en el seed) -> max 1
        // Plan Premium (asumimos id=2) -> max 3
        const { data: planRestriccion } = await supabase
            .from("restricciones_planes")
            .select("valor")
            .eq("id_plan", idPlan)
            .eq("clave", "max_sucursales")
            .single();

        const max = parseInt(planRestriccion?.valor || "1");
        return count < max;
    }
};
