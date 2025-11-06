
import { supabaseSus } from "../supabase/supabase.config"
import { create } from "zustand"



export const verificarSuscripcionInicial = async(p)=>{
        const {error,data} = await supabaseSus
        .from("suscripciones")
        .select()
        .eq("id_auth",p.id_auth)
        .maybeSingle();
      if (error) {
            throw new Error(error.message);
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

    export const insertarSuscripcionInicial= async (p) => {
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

    export const useSuscripcionesStore = create ((set) => ({
        dataSuscripcion: null,
        mostrarSuscripcion: async(p) => {
            const {error, data } = await supabaseSus
            .from("suscripciones")
            .select()
            .eq("id_auth", p.id_auth)
            .maybeSingle();
        if (error) {
            throw new Error(error.message);
        }
        set({ dataSuscripcion: data })
        return data;
        },
     mostrarPlanes: async () => {
        const {error, data} = await supabaseSus
        .from("planes")
        .select("*, beneficios(*)")
        .eq("id_producto", 1);
    if (error) {
            throw new Error(error.message);
        }
        return data;
     },
     dataRestricciones: null,
     
     mostrarRestriccionesPorPlan: async(p) => {
        try {
            const {error, data} = await supabaseSus
            .from("restricciones_planes")
            .select()
            .eq("id_plan", p.id_plan);

            if(error) throw error;
            set({dataRestricciones:data})
            return data;
        }catch(err){
            return [];
        }
     },

     crearSuscripcionMP: async ({email, plan_nombre, frecuencia, monto, id_suscripcion}) => {
        const res = await fetch("https://3053fljf-3000.brs.devtunnels.ms/api/suscripciones/crear-suscripcion",
 {
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify({email, plan_nombre, frecuencia, monto, id_suscripcion})
        }
        );
        const data = await res.json();
        if(!res.ok){
            throw new Error(data.error || "Error al crear la suscripcion"); 
        }
        window.open(data.init_point, "_blank");
        toast.success("Redirigiendo a Mercado Pago")
     },

    }))