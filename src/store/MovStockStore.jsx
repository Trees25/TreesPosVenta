import { create } from "zustand";
import { InsertarMovStock, MostrarMovStock } from "../supabase/crudMovStock";

export const useMovStockStore = create((set, get) => ({
  tipo: "ingreso",
  pagina: 1,
  totalRegistros: 0,
  setPagina: (p) => set({ pagina: p }),
  setTipo: (p) => {
    set({ tipo: p });
  },
  insertarMovStock: async (p) => {
    await InsertarMovStock(p);
  },
  mostrarMovStock: async (p) => {
    const { pagina } = get();
    const result = await MostrarMovStock({ ...p, pagina });
    set({ totalRegistros: result.count });
    return result.data;
  },
}));
