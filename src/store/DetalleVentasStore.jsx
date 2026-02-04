import { create } from "zustand";
import {
  InsertarDetalleVentas,
  MostrarDetalleVenta,
  EliminarDetalleVentas,
  Mostrartop5productosmasvendidosxcantidad,
  Mostrartop10productosmasvendidosxmonto,
  EditarCantidadDetalleVenta,
} from "../supabase/crudDetalleVenta";
function calcularTotal(items) {
  return items.reduce(
    (total, item) => total + item.precio_venta * item.cantidad,
    0
  );
}
export const useDetalleVentasStore = create((set, get) => ({
  datadetalleventa: [],
  parametros: {},
  total: 0,
  totalNeto: 0,
  descuento: 0,
  tipoDescuento: "monto", // "monto" | "porcentaje"

  aplicarDescuento: (valor, tipo) => {
    const { totalNeto } = get();
    let nuevoTotal = totalNeto;

    if (tipo === "porcentaje") {
      const descuentoValor = totalNeto * (valor / 100);
      nuevoTotal = totalNeto - descuentoValor;
    } else {
      nuevoTotal = totalNeto - valor;
    }

    set({
      descuento: valor,
      tipoDescuento: tipo,
      total: nuevoTotal < 0 ? 0 : nuevoTotal
    });
  },

  mostrardetalleventa: async (p) => {
    const response = await MostrarDetalleVenta(p);
    set({ datadetalleventa: response });

    const subtotal = calcularTotal(response);
    const { descuento, tipoDescuento } = get();

    let totalConDescuento = subtotal;
    if (tipoDescuento === "porcentaje") {
      totalConDescuento = subtotal - (subtotal * (descuento / 100));
    } else {
      totalConDescuento = subtotal - descuento;
    }

    set({
      totalNeto: subtotal,
      total: totalConDescuento < 0 ? 0 : totalConDescuento
    });
    return response;
  },
  insertarDetalleVentas: async (p) => {
    await InsertarDetalleVentas(p);
    // Recalculate is triggered by refetch usually, but let's be safe if UI updates optimistic
  },
  eliminardetalleventa: async (p) => {
    await EliminarDetalleVentas(p);
  },
  mostrartop5productosmasvendidosxcantidad: async (p) => {
    const response = Mostrartop5productosmasvendidosxcantidad(p);
    return response;
  },
  mostrartop10productosmasvendidosxmonto: async (p) => {
    const response = Mostrartop10productosmasvendidosxmonto(p);
    return response;
  },
  editarCantidadDetalleVenta: async (p) => {
    await EditarCantidadDetalleVenta(p);
  },
  resetearDescuento: () => set({ descuento: 0, tipoDescuento: "monto", total: get().totalNeto }),
}));
