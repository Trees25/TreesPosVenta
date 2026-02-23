import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect } from "react";
import { usePenalty } from "./usePenalty";

export const ProtectedRoute = ({ children, accessBy, module }) => {
    const { user, profile, loading } = useAuthStore();
    const location = useLocation();
    const { triggerPenalty } = usePenalty();

    // Integración de Mora Global (10 a 30 días)
    // Se ejecuta solo para administradores en mora
    useEffect(() => {
        if (accessBy === "authenticated" && !loading && profile?.id_rol === 1) {
            const dias = profile.suscripcion?.dias_restantes;
            if (dias !== undefined && dias < -10 && dias >= -30 && location.pathname !== "/planes") {
                triggerPenalty();
            }
        }
    }, [location.pathname, profile, loading, accessBy, triggerPenalty]);

    if (loading) return <div>Cargando...</div>;

    if (accessBy === "non-authenticated") {
        if (!user) return children;
        return <Navigate to="/" />;
    }

    if (accessBy === "authenticated") {
        if (!user) return <Navigate to="/login" />;

        // Validación de suscripción para Administradores
        if (profile?.id_rol === 1) {
            const diasRestantes = profile.suscripcion?.dias_restantes;
            // Bloqueo total (Suspensión) solo tras 30 días de mora
            const isSuspended = diasRestantes !== undefined && diasRestantes < -30;
            const allowedPaths = ["/planes", "/mi-perfil"];

            if (isSuspended && !allowedPaths.includes(location.pathname)) {
                return <Navigate to="/planes?suspended=true" />;
            }
        }

        // Si se requiere un módulo específico, validar permisos
        if (module && profile) {
            const isAdmin = profile.id_rol === 1;
            const hasPerm = profile.permisos?.some(p => p.modulos?.nombre === module);

            if (!isAdmin && !hasPerm) {
                return <Navigate to="/" />;
            }
        }

        return children;
    }

    return children;
};
