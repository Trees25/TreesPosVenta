import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../hooks/ProtectedRoute";
import { Login } from "../pages/Login";
import { Home } from "../pages/Home";
import { lazy, Suspense } from "react";

const MiPerfil = lazy(() => import("../pages/MiPerfil").then(module => ({ default: module.MiPerfil })));
const Categorias = lazy(() => import("../pages/Categorias").then(module => ({ default: module.Categorias })));
const Productos = lazy(() => import("../pages/Productos").then(module => ({ default: module.Productos })));
const POS = lazy(() => import("../pages/POS").then(module => ({ default: module.POS })));
const Dashboard = lazy(() => import("../pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Planes = lazy(() => import("../pages/Planes").then(module => ({ default: module.Planes })));

export function AppRoutes() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute accessBy="non-authenticated">
                            <Login />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mi-perfil"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <MiPerfil />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/planes"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <Planes />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pos"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <POS />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/categorias"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <Categorias />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/productos"
                    element={
                        <ProtectedRoute accessBy="authenticated">
                            <Productos />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<div>Página no encontrada</div>} />
            </Routes>
        </Suspense>
    );
}
