import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useReportesStore = create((set, get) => ({
  totalventas: 0,
  totalventasAnterior: 0,
  porcentajeCambio: 0,
  totalCantidadDetalleVentas: 0,
  totalGanancias: 0,
  ventasXMetodoPago: [],
  ventasXCategoria: [],
  resetearventas: () =>
    set({
      idventa: 0,
    }),
  calcularTotalVentas: async (p) => {
    const { data, error } = await supabase.rpc("rpc_sumar_ventas", {
      p_id_empresa: p._id_empresa,
      fecha_ini: p._fecha_inicio,
      fecha_fin: p._fecha_fin
    });
    if (error) console.error("Error calculating total ventas:", error);
    set({ totalventas: data || 0 });
    get().setCalcularPorcentajeCambio();
    return data;
  },
  mostrarVentasDashboard: async (p) => {
    const { data } = await supabase.rpc("dashboartotalventasconfechas", p);
    return data;
  },
  mostrarCantidadDetalleVentasDashboard: async (p) => {
    const { data } = await supabase.rpc(
      "dashboardsumarcantidaddetalleventa",
      p
    );
    set({ totalCantidadDetalleVentas: data })
    return data;
  },
  mostrarVentasDashboardPeriodoAnterior: async (p) => {
    const { data, error } = await supabase.rpc(
      "dashboardsumarventasporempresaperiodoanterior",
      p
    );
    set({ totalventasAnterior: data });
    get().setCalcularPorcentajeCambio();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
  mostrarGananciasDetalleVenta: async (p) => {
    const { data, error } = await supabase.rpc(
      "dashboardsumargananciadetalleventa",
      p
    );
    if (error) {
      throw new Error(error.message);
    }
    set({ totalGanancias: data })
    return data;
  },
  mostrarVentasXMetodoPago: async (p) => {
    const { data, error } = await supabase.rpc("reporte_ventas_metodo_pago", p);
    if (error) {
      console.error("Error en mostrarVentasXMetodoPago:", error);
      throw new Error(error.message);
    }
    set({ ventasXMetodoPago: data });
    return data;
  },
  mostrarVentasXCategoria: async (p) => {
    const { data, error } = await supabase.rpc("reporte_ventas_categoria", p);
    if (error) {
      console.error("Error en mostrarVentasXCategoria:", error);
      throw new Error(error.message);
    }
    set({ ventasXCategoria: data });
    return data;
  },
  setCalcularPorcentajeCambio: () => {
    const { totalventas, totalventasAnterior } = get();

    const result =
      totalventasAnterior > 0
        ? ((totalventas - totalventasAnterior) / totalventasAnterior) * 100
        : 0;
    set({ porcentajeCambio: parseFloat(result.toFixed(2)) }); // Limita a 2 decimales y convierte a número
  },
}));
