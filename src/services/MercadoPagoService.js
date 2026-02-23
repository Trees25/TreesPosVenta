import { supabase } from "../supabase";

export const MercadoPagoService = {
    /**
     * Genera un enlace de pago para una suscripción o renovación.
     * Incluye el recargo del 3% si se detecta mora severa.
     */
    generarPreferencia: async (plan, idEmpresa, email, idSuscripcion, recargoMora = 0) => {
        const montoTotal = Number(plan.monto) + recargoMora;
        const reference = `${idSuscripcion}|${plan.id}|${idEmpresa}`;

        console.log(`Invocando pasarela para ${plan.nombre} - Total: $${montoTotal}`);

        const { data, error } = await supabase.functions.invoke('crear-suscripcion', {
            body: {
                email,
                plan_nombre: plan.nombre,
                monto: montoTotal,
                id_suscripcion_id_plan: reference
            }
        });

        if (error) throw error;
        if (data.error) {
            console.error("Detalles del error de pasarela:", data.details);
            throw new Error(data.error);
        }

        return {
            init_point: data.init_point,
            monto_total: montoTotal
        };
    },

    /**
     * Valida el estado de un pago después de la redirección.
     */
    verificarPago: async (paymentId) => {
        // Simulación de verificación
        return {
            status: "approved",
            payment_id: paymentId,
            date: new Date().toISOString()
        };
    }
};
