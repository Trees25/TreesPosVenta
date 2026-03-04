import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { email, id_suscripcion_id_plan } = body
        // El monto y plan_nombre que vienen del cliente ahora se usarán solo como referencia o se ignorarán para validación

        if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return new Response(
                JSON.stringify({ error: "Faltan variables de entorno (Secretos) en Supabase." }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // 1. Extraer IDs de la referencia
        if (!id_suscripcion_id_plan || !id_suscripcion_id_plan.includes("|")) {
            throw new Error("Referencia de suscripción inválida.");
        }
        const [id_suscripcion, id_plan, id_empresa] = id_suscripcion_id_plan.split("|");

        // 2. BUSCAR PRECIO REAL EN LA BASE DE DATOS (Validación Server-Side)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: plan, error: planError } = await supabase
            .from('planes')
            .select('nombre, monto')
            .eq('id', Number(id_plan))
            .single();

        if (planError || !plan) {
            throw new Error("El plan seleccionado no existe o no pudo ser validado.");
        }

        // 3. Calcular Recargo por Mora (Si aplica)
        // Opcional: Podríamos re-calcularlo aquí consultando la suscripción actual, 
        // pero por ahora validamos que el monto base sea correcto.
        // Si el cliente envió un monto, validamos que sea >= al monto del plan.
        const montoBase = Number(plan.monto);
        const montoCliente = Number(body.monto);

        if (montoCliente < montoBase) {
            throw new Error("El monto enviado no coincide con el precio oficial del plan.");
        }

        // Payload para Mercado Pago
        const mpPayload = {
            items: [
                {
                    title: `Suscripción ${plan.nombre}`,
                    quantity: 1,
                    unit_price: montoCliente, // Usamos el del cliente si pasó la validación (incluye recargo)
                    currency_id: "ARS"
                }
            ],
            payer: { email },
            back_urls: {
                success: `${SUPABASE_URL}/functions/v1/pago-exitoso`,
                failure: `${SUPABASE_URL}/functions/v1/pago-exitoso`,
                pending: `${SUPABASE_URL}/functions/v1/pago-exitoso`
            },
            auto_return: "all",
            external_reference: id_suscripcion_id_plan,
        }

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mpPayload),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
            return new Response(
                JSON.stringify({ error: `Mercado Pago Error: ${mpData.message}`, details: mpData }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(
            JSON.stringify({ init_point: mpData.init_point }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
