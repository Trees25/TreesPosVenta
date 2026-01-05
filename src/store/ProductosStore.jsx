import { create } from "zustand";
import {
  BuscarProductos, MostrarProductos, EliminarProductos, InsertarProductos, EditarProductos, Generarcodigo, ActualizarPreciosMasivo,
  supabase
} from "../index";
const tabla = "productos"
export const useProductosStore = create((set, get) => ({
  refetchs: null,
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productosItemSelect: {
    id: 1
  },
  parametros: {},
  mostrarProductos: async (p) => {
    const response = await MostrarProductos(p);
    set({ parametros: p });
    if (response && response.length > 0) {
      set({ dataProductos: response });
      set({ productosItemSelect: response[0] });
    } else {
      set({ dataProductos: [] });
      set({ productosItemSelect: null });
    }
    set({ refetchs: p.refetchs });
    return response || [];
  },
  selectProductos: (p) => {

    set({ productosItemSelect: p });

  },
  resetProductosItemSelect: () => {
    set({ productosItemSelect: null });
  },
  insertarProductos: async (p) => {
    const response = await InsertarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
    return response;
  },
  eliminarProductos: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
  },
  editarProductos: async (p) => {
    await EditarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
  },
  buscarProductos: async (p) => {
    const response = await BuscarProductos(p);
    if (response) {
      set({ dataProductos: response });
    } else {
      set({ dataProductos: [] });
    }
    return response || [];
  },
  codigogenerado: 0,
  generarCodigo: () => {
    const response = Generarcodigo({ id: 2 })
    set({ codigogenerado: response })


  },
  editarPreciosProductos: async (p) => {
    const { error } = await supabase.from(tabla).update(p).eq("id", p.id);
    if (error) {
      throw new Error(error.message);
    }
  },
  actualizarPreciosMasivo: async (p) => {
    await ActualizarPreciosMasivo(p);
    const { mostrarProductos, parametros, refetchs } = get();
    if (refetchs) {
      refetchs();
    } else {
      await mostrarProductos(parametros);
    }
  },
}));
