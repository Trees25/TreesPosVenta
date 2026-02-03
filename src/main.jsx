import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSuscripcionesStore } from "./store/SuscripcionStore";
import { useUsuariosStore } from "./store/UsuariosStore";
import { toast } from "sonner";
import Swal from "sweetalert2";

// INTERCEPTOR GLOBAL DE CLICKS (LASER CLICK PENALTY) 🔫
const injectGlobalClickInterceptor = () => {
  // Evitar múltiples inyecciones
  if (window.__clickInterceptorInjected) return;
  window.__clickInterceptorInjected = true;

  window.addEventListener("click", async (e) => {
    // 0. Si el evento ya fue marcado como "reproducido" o "manejado", lo ignoramos.
    // Esto rompe el bucle infinito del target.click()
    if (e.__handledByPenalty) return;

    // 0.1 Ignorar en Login para permitir el ingreso
    if (window.location.pathname.includes("/login")) return;

    // 1. Ignorar clicks dentro del propio SweetAlert (para poder cerrarlo o esperar)
    if (e.target.closest(".swal2-container")) return;

    // 1.5 Ignorar elementos marcados como "libres de castigo" (ej. botones de pago)
    if (e.target.closest(".bypass-penalty")) return;

    // 2. Comprobar si es un elemento interactivo (boton, link, input submit)
    const target = e.target.closest("button, a, input[type='submit'], [role='button'], .clickable");
    if (!target) return;

    // 3. Chequear Estado del Usuario
    const { datausuarios } = useUsuariosStore.getState();
    const { dataSuscripcion } = useSuscripcionesStore.getState();

    // 👑 Bypass Super User
    if (datausuarios?.correo === "trees.sanjuan@gmail.com") return;

    // ⚠️ Test User o Deudor
    const isTestUser = datausuarios?.correo === "nicocabj1234@gmail.com";
    let isOverdue = false;

    if (isTestUser) {
      isOverdue = true;
    } else if (dataSuscripcion?.fecha_fin) {
      const diasVencidos = Math.ceil((new Date() - new Date(dataSuscripcion.fecha_fin)) / (1000 * 60 * 60 * 24));
      if (diasVencidos > 10) isOverdue = true;
    }

    if (isOverdue) {
      // 🛑 BLOQUEO
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      await Swal.fire({
        title: '🔒 Sistema Restringido',
        html: `Tu suscripción tiene una deuda de más de 10 días.<br/><br/>
               <b>Los desarrolladores tambien necesitamos comer, paga tu deuda 😭</b><br/><br/>
               <b>Espera 5 segundos para continuar...</b>`,
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // ▶️ REPLAY DEL CLICK
      // Creamos un nuevo evento de click sintético que SIEMPRE tiene la marca de "manejado"
      const newEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      // Marcamos el evento para que el interceptor lo ignore en la próxima vuelta
      newEvent.__handledByPenalty = true;

      target.dispatchEvent(newEvent);
    }

  }, true); // Capture phase 
};

// INTERCEPTOR GLOBAL DE MOROSIDAD
// Retrasa CUALQUIER petición de red si el usuario debe > 10 días
const injectGlobalInterceptor = () => {
  const originalFetch = window.fetch;
  let lastToast = 0;

  window.fetch = async (...args) => {
    try {
      // Obtenemos usuario
      const { datausuarios } = useUsuariosStore.getState();

      // 1. 👑 SUPER USER BYPASS (Dueño) -> Sin esperas
      if (datausuarios?.correo === "trees.sanjuan@gmail.com") {
        return originalFetch(...args);
      }

      const { dataSuscripcion } = useSuscripcionesStore.getState();

      // 2. ⚠️ TEST USER (nicocabj1234) -> Simular vencido siempre
      const isTestUser = datausuarios?.correo === "nicocabj1234@gmail.com";

      if (dataSuscripcion?.fecha_fin || isTestUser) {
        let diasVencidos = 0;

        if (isTestUser) {
          diasVencidos = 20; // Forzamos > 10
        } else if (dataSuscripcion?.fecha_fin) {
          const fechaFin = new Date(dataSuscripcion.fecha_fin);
          const hoy = new Date();
          const diffTime = hoy - fechaFin;
          diasVencidos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        if (diasVencidos > 10) {
          // Solo mostrar alerta cada 15 segundos para no saturar
          const now = Date.now();
          if (now - lastToast > 15000) {
            // toast.warning("Sistema ralentizado por suscripción vencida (+10 días)."); // Desactivado por redundancia con Modal de Click
            lastToast = now;
          }

          // 5 segundos de penalización
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (e) {
      console.error("Error en interceptor de morosidad:", e);
    }
    return originalFetch(...args);
  };
};

injectGlobalClickInterceptor();
injectGlobalInterceptor();

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>

  </React.StrictMode>
);
