import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

export const ProtectedRoute = ({ children, accessBy }) => {
    const { user, loading } = useAuthStore();

    if (loading) return <div>Cargando...</div>;

    if (accessBy === "non-authenticated") {
        if (!user) return children;
        return <Navigate to="/" />;
    }

    if (accessBy === "authenticated") {
        if (user) return children;
        return <Navigate to="/login" />;
    }

    return children;
};
