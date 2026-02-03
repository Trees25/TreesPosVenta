import { create } from "zustand";
import {
  BuscarProductos, MostrarProductos, EliminarProductos, InsertarProductos, EditarProductos, Generarcodigo, ActualizarPreciosMasivo, InsertarProductosMasivo,
  supabase
} from "../index";
const tabla = "productos"
export const useProductosStore = create((set, get) => ({
  refetchs: null,
  insertarProductosMasivo: async (data) => {
    await InsertarProductosMasivo(data);
    const { refetchs } = get();
    refetchs && refetchs();
  },
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productosItemSelect: {
    id: 1
  },
  idCategoria: null,
  setIdCategoria: (p) => {
    set({ idCategoria: p });
  },
  idProveedor: null,
  setIdProveedor: (p) => {
    set({ idProveedor: p });
  },
  pagina: 1,
  setPagina: (p) => {
    set({ pagina: p });
  },
  totalRegistros: 0,
  parametros: {},
  mostrarProductos: async (p) => {
    const { idCategoria, idProveedor, pagina } = get();
    const response = await MostrarProductos({ ...p, id_categoria: idCategoria?.id, id_proveedor: idProveedor?.id, pagina: pagina });
    set({ parametros: p });
    set({ totalRegistros: response.count });

    if (response.data && response.data.length > 0) {
      set({ dataProductos: response.data });
      set({ productosItemSelect: response.data[0] });
    } else {
      set({ dataProductos: [] });
      set({ productosItemSelect: null });
    }
    set({ refetchs: p.refetchs });
    return response.data || [];
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
    const { idCategoria, idProveedor } = get();
    const response = await BuscarProductos({ ...p, id_categoria: idCategoria?.id, id_proveedor: idProveedor?.id });
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
