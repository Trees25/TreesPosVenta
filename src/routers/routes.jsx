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
const Registro = lazy(() => import("../pages/Registro").then(module => ({ default: module.Registro })));
const Sucursales = lazy(() => import("../pages/Sucursales").then(module => ({ default: module.Sucursales })));
const Terceros = lazy(() => import("../pages/Terceros").then(module => ({ default: module.Terceros })));
const GestionUsuarios = lazy(() => import("../pages/GestionUsuarios").then(module => ({ default: module.GestionUsuarios })));
const ReporteVentas = lazy(() => import("../pages/ReporteVentas").then(module => ({ default: module.ReporteVentas })));
const AjusteStock = lazy(() => import("../pages/AjusteStock").then(module => ({ default: module.AjusteStock })));
const Almacenes = lazy(() => import("../pages/Almacenes").then(module => ({ default: module.Almacenes })));
const ConfigurarPlantillas = lazy(() => import("../pages/ConfigurarPlantillas").then(module => ({ default: module.ConfigurarPlantillas })));
import { NotFound } from "../pages/NotFound";

export function AppRoutes() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                <Route
                    path="/personal"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Personal">
                            <GestionUsuarios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/sucursales"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Sucursales">
                            <Sucursales />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Clientes">
                            <Terceros tipo="cliente" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/proveedores"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Proveedores">
                            <Terceros tipo="proveedor" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute accessBy="non-authenticated">
                            <Login />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/registro"
                    element={
                        <ProtectedRoute accessBy="non-authenticated">
                            <Registro />
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
                        <ProtectedRoute accessBy="authenticated" module="Dashboard">
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
                        <ProtectedRoute accessBy="authenticated" module="Ventas">
                            <POS />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reporte-ventas"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Ventas">
                            <ReporteVentas />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/categorias"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Inventario">
                            <Categorias />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/productos"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Inventario">
                            <Productos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/ajuste"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Ajuste de Stock">
                            <AjusteStock />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventario/almacenes"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Inventario">
                            <Almacenes />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/configuracion/plantillas"
                    element={
                        <ProtectedRoute accessBy="authenticated" module="Personal">
                            <ConfigurarPlantillas />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
