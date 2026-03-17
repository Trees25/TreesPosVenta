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

        // --- VALIDACIÓN DE ONBOARDING ---
        // Si el usuario está autenticado pero no tiene empresa (ej: entró por Google por primera vez)
        const needsOnboarding = profile && !profile.id_empresa;
        if (needsOnboarding && location.pathname !== "/onboarding") {
            return <Navigate to="/onboarding" />;
        }
        // Si ya tiene empresa y trata de entrar a onboarding, lo mandamos a home
        if (!needsOnboarding && location.pathname === "/onboarding") {
            return <Navigate to="/" />;
        }

        // Validación de suscripción para Administradores
        if (profile?.id_rol === 1) {
            const diasRestantes = profile.suscripcion?.dias_restantes;
            // Bloqueo total (Suspensión) solo tras 30 días de mora
            const isSuspended = diasRestantes !== undefined && diasRestantes < -30;
            const allowedPaths = ["/planes", "/mi-perfil", "/onboarding"];

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
