import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContent";
import { usePermisosStore } from "../store/PermisosStore";
import { useQuery } from "@tanstack/react-query";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useEmpresaStore } from "../store/EmpresaStore";

export const ProtectedRoute = ({ children, accessBy }) => {
  const { user } = UserAuth();
  const { mostrarPermisosGlobales } = usePermisosStore();
  const location = useLocation();
  const { datausuarios } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();

  const {
    data: dataPermisosGlobales,
    isLoading: isLoadingPermisosGlobales,
  } = useQuery({
    queryKey: ["mostrar permisos globales", datausuarios?.id],
    queryFn: () => mostrarPermisosGlobales({ id_usuario: datausuarios?.id }),
    enabled: !!datausuarios,
  });

  if (isLoadingPermisosGlobales) {
    return <span>cargando permisos...</span>;
  }

  const hasPermission = dataPermisosGlobales?.some(
    (item) => item.modulos?.link === location.pathname
  );

  if (accessBy === "non-authenticated") {
    if (!user) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  } else if (accessBy === "authenticated") {
    if (user) {
      // 1. Verificar si tiene plan asignado (salvo que esté en /planes)
      if (location.pathname !== "/planes" && !dataempresa?.id_plan) {
        return <Navigate to="/planes" />;
      }

      // --- LOGIC DE VENCIMIENTO ---
      const esInvitado = datausuarios?.email === "tester1@gmail.com";
      const now = new Date();
      let diasRestantes = 100; // Valor seguro por defecto

      if (esInvitado && user?.created_at) {
        // Invitado: Vence a las 24hs de crearse
        const fechaCreacion = new Date(user.created_at);
        const fechaVencimiento = new Date(fechaCreacion.getTime() + (24 * 60 * 60 * 1000));
        const diffTime = fechaVencimiento - now;
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Bloqueo estricto para invitado si ya venció
        if (diasRestantes <= 0 && location.pathname !== "/membresias") {
          return <Navigate to="/membresias" />;
        }

      } else if (dataempresa?.fecha_vencimiento) {
        // Usuario Normal: Vence según fecha en DB
        const fechaVencimiento = new Date(dataempresa.fecha_vencimiento);
        const diffTime = fechaVencimiento - now;
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Bloqueo Progresivo
        // > 0: OK (Prueba activa)
        // 0 a -30: Gracia (Aviso molesto en Layout, pero deja pasar)
        // < -30: Bloqueo Total (Redirección a Membresías)

        if (diasRestantes < -30 && location.pathname !== "/membresias") {
          return <Navigate to="/membresias" />;
        }
      }

      if (!hasPermission) {
        // return <Navigate to="/404" />;
      }

      return children;
    }
  }
  return <Navigate to="/login" />;
};
