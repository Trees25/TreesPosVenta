# Análisis del Sistema POS Ventas

Este documento detalla un análisis profundo del estado actual del sistema, identificando áreas críticas para mejorar el rendimiento, la seguridad y la estabilidad.

## 1. Rendimiento y Escalabilidad (Crítico)

### 🚨 Hallazgo Principal: Cálculos en el Frontend
Actualmente, el Dashboard y los Reportes descargan **todas las ventas** de la base de datos para sumar los totales en el navegador (JavaScript).
-   **Ubicación**: `src/store/ReportesStore.jsx` (`mostrarVentasDashboard`, `mostrarVentasDashboardPeriodoAnterior`).
-   **Riesgo**: A medida que el negocio crezca (1,000+ ventas), el Dashboard se volverá extremadamente lento y eventualmente bloqueará el navegador del usuario al intentar descargar megabytes de datos JSON solo para mostrar un número "Total".
-   **Solución Recomendada**: Mover esta lógica al servidor (Supabase). Crear funciones RPC que devuelvan directamente la suma (`SUM(total)`), retornando solo un número en lugar de miles de filas.

### ⚠️ Paginación Faltante
-   **Movimientos de Stock (Kardex)**: `src/supabase/crudMovStock.jsx` descarga todo el historial de movimientos de un producto. Productos antiguos con miles de movimientos tardarán mucho en cargar.
    -   **Solución**: Implementar paginación (similiar a Productos) o cargar solo los últimos 50 movimientos por defecto.
-   **Ventas Históricas**: No se encontró una función clara para listar el historial completo de ventas con paginación. Si se planea agregar un módulo de "Historial de Ventas", debe nacer paginado.

---

## 2. Seguridad

### ⚠️ Dependencia de RLS (Eliminar Venta)
-   **Ubicación**: `src/supabase/crudVenta.jsx` -> `EliminarVenta`.
-   **Hallazgo**: La función elimina por `id` sin verificar explícitamente `id_empresa` en el código.
-   **Riesgo**: Si las **Row Level Security (RLS)** de Supabase no están configuradas perfectamente, un atacante que adivine un ID de venta podría eliminar ventas de otra empresa.
-   **Solución**: Agregar `.eq("id_empresa", id_empresa)` a la consulta de eliminación como capa de seguridad redundante.

### 🔒 Autenticación
-   La gestión de sesión en `AuthStore.jsx` y `supabase.config.jsx` parece correcta y utiliza los estándares de Supabase.
-   **Observación**: Existe una duplicidad en `supabase.config.jsx` (`supabase` y `supabaseSus` son idénticos). Se recomienda unificarlos para evitar conexiones redundantes.

---

## 3. Optimización de Código y Estabilidad

### 📉 Reducción de Carga en Movimientos de Caja
-   **Ubicación**: `src/store/MovCajaStore.jsx`.
-   **Hallazgo**: Al igual que en reportes, se descargan los movimientos para filtrar y sumar en el cliente (`reduce`, `filter`).
-   **Mejora**: Usar RPCs en Supabase para obtener los balances de caja (Apertura, Ingresos, Gastos) directamente.

### 📦 Paquetes y Dependencias
-   El proyecto usa `vite` v5 y `react-router-dom` v6, lo cual es moderno.
-   `@supabase/supabase-js` y `@tanstack/react-query` están en versiones recientes.
-   **Recomendación**: Ejecutar `npm audit` para detectar vulnerabilidades menores, pero la base tecnológica es sólida.

---

## Plan de Acción Recomendado

1.  **Prioridad Alta**: Refactorizar `ReportesStore.jsx` para usar consultas SQL (RPC) de suma en lugar de procesar arrays en el cliente.
2.  **Prioridad Media**: Agregar filtro de `id_empresa` en eliminaciones críticas (`crudVenta`).
3.  **Prioridad Media**: Limpiar `supabase.config.jsx`.
4.  **Prioridad Baja**: Paginación en Kardex/Movimientos (a realizar cuando la tabla crezca).
