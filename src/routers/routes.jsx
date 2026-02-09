import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import {
  ProtectedRoute,
  Layout,
} from "../index";
import { Spinner1 } from "../components/moleculas/Spinner1";

const Categorias = lazy(() => import("../pages/Categorias").then(module => ({ default: module.Categorias })));
const Configuraciones = lazy(() => import("../pages/Configuraciones").then(module => ({ default: module.Configuraciones })));
const Home = lazy(() => import("../pages/Home").then(module => ({ default: module.Home })));
const Login = lazy(() => import("../pages/Login").then(module => ({ default: module.Login })));
const Productos = lazy(() => import("../pages/Productos").then(module => ({ default: module.Productos })));
const POS = lazy(() => import("../pages/POS").then(module => ({ default: module.POS })));
const PageNot = lazy(() => import("../components/templates/404").then(module => ({ default: module.PageNot })));
const Empresa = lazy(() => import("../pages/Empresa").then(module => ({ default: module.Empresa })));
const ClientesProveedores = lazy(() => import("../pages/ClientesProveedores").then(module => ({ default: module.ClientesProveedores })));
const Planes = lazy(() => import("../pages/Planes").then(module => ({ default: module.Planes })));

const BasicosConfig = lazy(() => import("../components/organismos/EmpresaConfigDesign/BasicosConfig").then(module => ({ default: module.BasicosConfig })));
const MonedaConfig = lazy(() => import("../components/organismos/EmpresaConfigDesign/MonedaConfig").then(module => ({ default: module.MonedaConfig })));
const MetodosPago = lazy(() => import("../pages/MetodosPago").then(module => ({ default: module.MetodosPago })));
const Dashboard = lazy(() => import("../pages/Dashboard").then(module => ({ default: module.Dashboard })));
const SucursalesCaja = lazy(() => import("../pages/SucursalesCaja").then(module => ({ default: module.SucursalesCaja })));
const Impresoras = lazy(() => import("../pages/Impresoras").then(module => ({ default: module.Impresoras })));
const Usuarios = lazy(() => import("../pages/Usuarios").then(module => ({ default: module.Usuarios })));
const Almacenes = lazy(() => import("../pages/Almacenes").then(module => ({ default: module.Almacenes })));
const Inventario = lazy(() => import("../pages/Inventario").then(module => ({ default: module.Inventario })));
const ConfiguracionTicket = lazy(() => import("../pages/ConfiguracionTicket").then(module => ({ default: module.ConfiguracionTicket })));
const MiPerfil = lazy(() => import("../pages/MiPerfil").then(module => ({ default: module.MiPerfil })));
const SerializacionComprobantes = lazy(() => import("../pages/SerializacionComprobantes").then(module => ({ default: module.SerializacionComprobantes })));
const Reportes = lazy(() => import("../pages/Reportes").then(module => ({ default: module.Reportes })));

export function MyRoutes() {
  return (
    <Suspense fallback={<Spinner1 />}>
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
          path="/configuracion"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Configuraciones />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/miperfil"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <MiPerfil />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/reportes"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Reportes />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/inventario"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Inventario />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/categorias"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Categorias />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/serializacion"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <SerializacionComprobantes />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/ticket"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <ConfiguracionTicket />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/productos"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Productos />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/empresa"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Empresa />
              </ProtectedRoute>
            </Layout>
          }
        >
          <Route index element={<Navigate to="empresabasicos" />} />
          <Route path="empresabasicos" element={<BasicosConfig />} />
          <Route path="monedaconfig" element={<MonedaConfig />} />
        </Route>
        <Route
          path="/pos"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <POS />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route path="*" element={<PageNot />} />
        <Route
          path="/configuracion/clientes"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <ClientesProveedores />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/proveedores"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <ClientesProveedores />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/metodospago"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <MetodosPago />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Home />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/sucursalcaja"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <SucursalesCaja />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/impresoras"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Impresoras />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/usuarios"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Usuarios />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/configuracion/almacenes"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Almacenes />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/planes"
          element={
            <Layout>
              <ProtectedRoute accessBy="authenticated">
                <Planes />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </Suspense>
  );
}
