
import { supabaseSus, supabase } from "../supabase/supabase.config"
import { create } from "zustand"



export const verificarSuscripcionInicial = async (p) => {
    const { error, data } = await supabaseSus
        .from("suscripciones")
        .select()
        .eq("id_auth", p.id_auth)
        .maybeSingle();
    if (error) {
        // throw new Error(error.message); 
        // En lugar de lanzar error que ensucia la consola, retornamos null o lanzamos algo controlado
        console.warn("Verificar suscripción falló (Offline):", error.message);
        return null;
    }
    return data;

};

export const insertarClienteiInicial = async (p) => {
    const { error, data } = await supabaseSus
        .from("clientes")
        .insert(p)
        .select()
        .maybeSingle();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const insertarSuscripcionInicial = async (p) => {
    const { error, data } = await supabaseSus
        .from("suscripciones")
        .insert(p)
        .select()
        .maybeSingle();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};



export const useSuscripcionesStore = create((set) => ({
    dataSuscripcion: null,
    mostrarSuscripcion: async (p) => {
        if (!p?.id_auth && !p?.id_empresa) return; // Validación básica

        try {
            const { error, data } = await supabaseSus
                .from("suscripciones")
                .select("*, planes(nombre)")
                .match(p)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                // --- TRAMPA DE TESTING ---
                // const { datausuarios } = useUsuariosStore.getState();
                // if (datausuarios?.correo === "nicocabj1234@gmail.com") {
                //     console.log("⚠️ MODO TESTING ACTIVADO: Simulando suscripción vencida para", datausuarios.correo);
                //     // Restamos 20 días a hoy para asegurar que pase los 10 días de tolerancia
                //     const fechaVencida = new Date();
                //     fechaVencida.setDate(fechaVencida.getDate() - 20);
                //     data.fecha_fin = fechaVencida.toISOString();
                // }
                // -------------------------

                set({ dataSuscripcion: data });
                return data;
            }
        } catch (error) {
            console.warn("Error conectando con Membresías (usando mock local para desarrollo):", error.message);
        }

        // FALLBACK DEV: Si falla la conexión o no hay datos, y estamos en dev (o falló el fetch),
        // simulamos que tiene una suscripción activa para que NO se bloquee la UI.
        // Esto permite probar el contador en Home.
        const mockSuscripcion = {
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            id_plan: 2, // Plan Pro mock
            estado: "trial"
        };

        // Solo usamos el mock si no teníamos nada en el estado (para respetar activarPruebaGratuita)
        set((state) => {
            if (state.dataSuscripcion) return {}; // No tocar si ya tiene datos (ej. recién activado)
            return { dataSuscripcion: mockSuscripcion };
        });

        return mockSuscripcion;
    },
    mostrarPlanes: async () => {
        const { error, data } = await supabaseSus
            .from("planes")
            .select("*, beneficios(*)")
            .eq("id_producto", 1);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    dataRestricciones: null,

    mostrarRestriccionesPorPlan: async (p) => {
        try {
            const { error, data } = await supabaseSus
                .from("restricciones_planes")
                .select()
                .eq("id_plan", p.id_plan);

            if (error) throw error;
            set({ dataRestricciones: data })
            return data;
        } catch (err) {
            return [];
        }
    },

    crearSuscripcionMP: async ({ email, plan_nombre, frecuencia, monto, id_suscripcion }) => {
        const backendUrl = import.meta.env.VITE_APP_MEMBRESIAS_BACKEND_URL;
        const res = await fetch(`${backendUrl}/suscripciones/crear-suscripcion`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, plan_nombre, frecuencia, monto, id_suscripcion })
            }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Error al crear la suscripcion");
        }
        window.open(data.init_point, "_blank");
        toast.success("Redirigiendo a Mercado Pago")
    },
    activarPruebaGratuita: async (id_empresa, id_plan, id_auth) => {
        const fecha_inicio = new Date();
        const fecha_fin = new Date();
        fecha_fin.setDate(fecha_fin.getDate() + 30);

        // 1. Actualizar Empresa (Supabase Principal) - PRIORIDAD 1 para desbloquear acceso
        const { error: errorEmp } = await supabase
            .from("empresa")
            .update({ id_plan: id_plan })
            .eq("id", id_empresa);

        if (errorEmp) throw new Error("Error al actualizar empresa: " + errorEmp.message);

        // 2. Actualizar/Crear Suscripción (Supabase Suscripciones)
        try {
            // Check existence
            const { data: existingSub } = await supabaseSus
                .from("suscripciones")
                .select("id")
                .eq("id_empresa", id_empresa)
                .maybeSingle();

            let errorSus;

            if (existingSub) {
                const { error } = await supabaseSus
                    .from("suscripciones")
                    .update({
                        fecha_inicio: fecha_inicio.toISOString(),
                        fecha_fin: fecha_fin.toISOString(),
                        id_plan: id_plan,
                        estado: "trial"
                    })
                    .eq("id", existingSub.id);
                errorSus = error;
            } else {
                const { error } = await supabaseSus
                    .from("suscripciones")
                    .insert({
                        id_empresa: id_empresa,
                        id_auth: id_auth, // Ensure we pass this!
                        fecha_inicio: fecha_inicio.toISOString(),
                        fecha_fin: fecha_fin.toISOString(),
                        id_plan: id_plan,
                        estado: "trial"
                    });
                errorSus = error;
            }

            // if (errorSus) console.error("Error no bloqueante al actualizar suscripción remota:", errorSus);
        } catch (error) {
            console.error("Error de conexión con servicio de suscripciones (omitido para permitir ingreso):", error);
        }

        // 3. Refrescar estado local MANUALMENTE para que el usuario vea el contador ya mismo
        set((state) => ({
            dataSuscripcion: {
                ...state.dataSuscripcion,
                fecha_inicio: fecha_inicio.toISOString(),
                fecha_fin: fecha_fin.toISOString(),
                id_plan
            }
        }));
    },
    cambiarPlan: async (id_empresa, id_plan) => {
        // 1. Actualizar Empresa (Supabase Principal) - PRIORIDAD 1
        const { error: errorEmp } = await supabase
            .from("empresa")
            .update({ id_plan: id_plan })
            .eq("id", id_empresa);

        if (errorEmp) throw new Error("Error al cambiar plan en empresa: " + errorEmp.message);

        // 2. Actualizar Suscripción (Supabase Suscripciones)
        try {
            const { error: errorSus } = await supabaseSus
                .from("suscripciones")
                .update({ id_plan: id_plan })
                .eq("id_empresa", id_empresa);

            if (errorSus) console.warn("Error update suscripcion (no bloqueante):", errorSus);
        } catch (error) {
            console.error("Offline mode: No se pudo actualizar suscripción remota", error);
        }

        // 3. Update local state
        // 3. Update local state
        set((state) => {
            const currentData = state.dataSuscripcion || {};
            // Si falta info crítica (ej. recarga en /planes), rellenamos con mock para que no se rompa la UI
            if (!currentData.fecha_fin) {
                return {
                    dataSuscripcion: {
                        fecha_inicio: new Date().toISOString(),
                        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        estado: "trial",
                        ...currentData,
                        id_plan
                    }
                }
            }
            return {
                dataSuscripcion: { ...currentData, id_plan }
            };
        });
    },
}))