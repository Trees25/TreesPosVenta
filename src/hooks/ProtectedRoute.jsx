import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContent";
import { usePermisosStore } from "../store/PermisosStore";
import { useQuery } from "@tanstack/react-query";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useEmpresaStore } from "../store/EmpresaStore";

export const ProtectedRoute = ({ children, accessBy }) => {
  const { user } = UserAuth();
  const { mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa } = useEmpresaStore();
  const location = useLocation();

  // 1. Cargar datos del usuario (id interno y de auth)
  const { data: datausuarios, isLoading: isLoadingUser } = useQuery({
    queryKey: ["mostrar usuarios", user?.id],
    queryFn: () => mostrarusuarios({ id_auth: user?.id }),
    enabled: !!user?.id,
  });

  // 2. Cargar datos de la empresa (incluyendo id_plan)
  const { data: dataempresa, isLoading: isLoadingEmpresa } = useQuery({
    queryKey: ["mostrar empresa", datausuarios?.id],
    queryFn: () => mostrarempresa({ _id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
  });

  // Mientras carga la info crítica, no redirigimos
  if (isLoadingUser || isLoadingEmpresa) {
    return <Spinner1 />;
  }

  if (accessBy === "non-authenticated") {
    if (!user) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  }

  if (accessBy === "authenticated") {
    if (user) {
      // Si no tiene plan asignado, mandarlo a planes (salvo que ya esté ahí)
      if (!dataempresa?.id_plan) {
        if (location.pathname === "/planes") {
          return children;
        }
        return <Navigate to="/planes" />;
      }

      // Si tiene plan y está en /planes o /landing, mandarlo al inicio
      if (location.pathname === "/planes" || location.pathname === "/landing") {
        return <Navigate to="/" />;
      }

      return children;
    }
  }

  return <Navigate to="/landing" />;
};

