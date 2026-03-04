import { supabase } from "../supabase";

export const PersonalService = {
    // Listar todos los usuarios de la empresa
    getPersonalByEmpresa: async (empresaId) => {
        const { data, error } = await supabase.rpc('listar_personal_empresa', {
            p_id_empresa: empresaId
        });
        if (error) throw error;
        return data;
    },

    // Registrar un nuevo empleado vía RPC (Seguro)
    crearEmpleado: async (empleadoData) => {
        console.log("Enviando datos RPC:", empleadoData);
        const { data, error } = await supabase.rpc('registrar_empleado', {
            p_email: empleadoData.email,
            p_password: empleadoData.password,
            p_nombres: empleadoData.nombres,
            p_rol: empleadoData.rol,
            p_id_empresa: empleadoData.id_empresa,
            p_id_sucursal: empleadoData.id_sucursal
        });
        if (error) {
            console.error("Error RPC registrar_empleado:", error);
            throw error;
        }
        return data;
    },

    // Actualizar un empleado vía RPC (Sincroniza Auth)
    actualizarEmpleado: async (empleadoData) => {
        const { data, error } = await supabase.rpc('editar_empleado', {
            p_id_usuario: empleadoData.id_usuario,
            p_id_auth: empleadoData.id_auth,
            p_nombres: empleadoData.nombres,
            p_rol: empleadoData.rol,
            p_id_sucursal: empleadoData.id_sucursal
        });
        if (error) throw error;
        return data;
    },
    getModulos: async () => {
        const { data, error } = await supabase
            .from("modulos")
            .select("*");
        if (error) throw error;
        return data;
    },

    // Actualizar permisos de un usuario
    actualizarPermisos: async (usuarioId, modulosIds) => {
        // 1. Eliminar permisos actuales
        const { error: resetError } = await supabase
            .from("permisos")
            .delete()
            .eq("id_usuario", usuarioId);

        if (resetError) throw resetError;

        // 2. Insertar nuevos permisos
        if (modulosIds.length > 0) {
            const nuevosPermisos = modulosIds.map(modId => ({
                id_usuario: usuarioId,
                id_modulo: modId
            }));

            const { error: insertError } = await supabase
                .from("permisos")
                .insert(nuevosPermisos);

            if (insertError) throw insertError;
        }
        return true;
    },

    // Cambiar estado de un empleado
    cambiarEstado: async (id, estado) => {
        const { data, error, count } = await supabase
            .from("usuarios")
            .update({ estado })
            .eq("id", id)
            .select(); // Forzar devolución de datos para verificar

        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error("No tienes permisos suficientes para cambiar el estado de este empleado o el empleado no existe.");
        }
        return data;
    },

    // Eliminar un empleado vía RPC (Borrado atómico en Auth y Public)
    eliminarEmpleado: async (id_usuario, id_auth) => {
        const { data, error } = await supabase.rpc('borrar_empleado', {
            p_id_usuario: id_usuario,
            p_id_auth: id_auth
        });
        if (error || !data) throw error || new Error("No se pudo eliminar el empleado");
        return true;
    },

    // Validar si puede agregar más personal a una SUCURSAL específica
    canAddPersonalToBranch: async (idEmpresa, idSucursal, idPlan) => {
        // 1. Obtener conteo actual de empleados en ESA sucursal
        const { count: currentCount, error: countErr } = await supabase
            .from("usuarios")
            .select("*", { count: 'exact', head: true })
            .eq("id_empresa", idEmpresa)
            .eq("id_sucursal", idSucursal);

        if (countErr) throw countErr;

        // 2. Obtener el límite del plan (3 por defecto)
        const { data: restriction } = await supabase
            .from("restricciones_planes")
            .select("valor")
            .eq("id_plan", idPlan)
            .eq("clave", "max_empleados_per_sucursal")
            .single();

        const limitPerBranch = parseInt(restriction?.valor || "3");

        return currentCount < limitPerBranch;
    }
};
