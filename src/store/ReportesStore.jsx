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
    console.log("RPC rpc_sumar_ventas Result:", data);
    const total = data ?? 0;
    set({ totalventas: total });
    get().setCalcularPorcentajeCambio();
    return total;
  },
  mostrarVentasDashboard: async (p) => {
    const { data } = await supabase.rpc("dashboartotalventasconfechas", {
      _id_empresa: p._id_empresa,
      _fecha_inicio: p._fecha_inicio,
      _fecha_fin: p._fecha_fin
    });
    return data;
  },
  mostrarCantidadDetalleVentasDashboard: async (p) => {
    const { data } = await supabase.rpc(
      "rpc_sumar_cantidad_productos",
      {
        p_id_empresa: p._id_empresa,
        fecha_ini: p._fecha_inicio,
        fecha_fin: p._fecha_fin
      }
    );
    console.log("RPC rpc_sumar_cantidad_productos Result:", data);
    const total = data ?? 0;
    set({ totalCantidadDetalleVentas: total });
    return total;
  },
  mostrarVentasDashboardPeriodoAnterior: async (p) => {
    const { data, error } = await supabase.rpc(
      "dashboardsumarventasporempresaperiodoanterior",
      {
        _id_empresa: p._id_empresa,
        _fecha_inicio: p._fecha_inicio,
        _fecha_fin: p._fecha_fin
      }
    );
    const total = data?.[0]?.total_ventas ?? data ?? 0;
    set({ totalventasAnterior: total });
    get().setCalcularPorcentajeCambio();
    if (error) {
      throw new Error(error.message);
    }
    return total;
  },
  mostrarGananciasDetalleVenta: async (p) => {
    const { data, error } = await supabase.rpc(
      "rpc_sumar_ganancias",
      {
        p_id_empresa: p._id_empresa,
        fecha_ini: p._fecha_inicio,
        fecha_fin: p._fecha_fin
      }
    );
    if (error) {
      console.error("Error calculating total ganancias:", error);
      throw new Error(error.message);
    }
    console.log("RPC rpc_sumar_ganancias Result:", data);
    const total = data ?? 0;
    set({ totalGanancias: total });
    return total;
  },
  mostrarVentasXMetodoPago: async (p) => {
    const { data, error } = await supabase.rpc("reporte_ventas_metodo_pago", {
      _id_empresa: p._id_empresa,
      _fecha_inicio: p._fecha_inicio,
      _fecha_fin: p._fecha_fin
    });
    if (error) {
      console.error("Error en mostrarVentasXMetodoPago:", error);
      throw new Error(error.message);
    }
    set({ ventasXMetodoPago: data });
    return data;
  },
  mostrarVentasXCategoria: async (p) => {
    const { data, error } = await supabase.rpc("reporte_ventas_categoria", {
      _id_empresa: p._id_empresa,
      _fecha_inicio: p._fecha_inicio,
      _fecha_fin: p._fecha_fin
    });
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
