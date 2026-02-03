import { useQuery } from "@tanstack/react-query";
import {
  verificarSuscripcionInicial,
  insertarClienteiInicial,
  insertarSuscripcionInicial,
  useSuscripcionesStore,
} from "../store/SuscripcionStore";

// 🧠 Esta función verifica si existe una suscripción inicial, y si no, la crea
export const VerificarOCrearSuscripcionInicial = async (p) => {
  try {
    const responseVerificado = await verificarSuscripcionInicial({ id_auth: p.id_auth });
    if (responseVerificado) return; // Si ya existe, no hace nada
  } catch (error) {
    console.warn("Error verificando suscripción inicial (Dev/Offline):", error.message);
    return; // Fallback: asumimos que no se puede verificar/crear y seguimos
  }

  const pCliente = {
    id_auth: p.id_auth,
    email: p.email,
    id_producto: 1,
  };

  const responseCliente = await insertarClienteiInicial(pCliente);

  const pSuscripcion = {
    id_cliente: responseCliente?.id,
    id_plan: 1,
    id_auth: p.id_auth,
  };

  await insertarSuscripcionInicial(pSuscripcion);
};



// ✅ Hook para mostrar planes
export const useMostrarPlanesQuery = () => {
  const { mostrarPlanes } = useSuscripcionesStore();

  return useQuery({
    queryKey: ["mostrar planes"],
    queryFn: mostrarPlanes,
  });
};



// ✅ Hook para mostrar suscripción actual
export const useMostrarSuscripcionQuery = (id_auth) => {
  const { mostrarSuscripcion } = useSuscripcionesStore();

  return useQuery({
    queryKey: ["mostrar suscripcion", id_auth],
    queryFn: () => mostrarSuscripcion({ id_auth }),
    enabled: !!id_auth, // solo se ejecuta si existe el id_auth
    refetchOnWindowFocus: false,
  });
};



// ✅ Hook para mostrar restricciones del plan actual
export const useMostrarRestriccionesQuery = (id_plan) => {
  const { mostrarRestriccionesPorPlan } = useSuscripcionesStore();

  return useQuery({
    queryKey: ["mostrar restricciones por plan", id_plan],
    queryFn: () => mostrarRestriccionesPorPlan({ id_plan }),
    enabled: !!id_plan, // solo se ejecuta si existe el id_plan
    refetchOnWindowFocus: false,
  });
};
