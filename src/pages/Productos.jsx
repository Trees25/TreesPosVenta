import { useQuery } from "@tanstack/react-query";
import {
  ProductosTemplate,
  Spinner1,
  useAlmacenesStore,
  useCategoriasStore,
  useEmpresaStore,
  useProductosStore,
  useSucursalesStore,
} from "../index";

export function Productos() {
  const { mostrarCategorias } = useCategoriasStore();
  const { mostrarSucursales } = useSucursalesStore();
  const { mostrarAlmacenesXSucursal } = useAlmacenesStore();
  const { mostrarProductos, buscarProductos, buscador } = useProductosStore();
  const { dataempresa } = useEmpresaStore();

  const {
    isLoading: isLoadingProductos,
    error: errorProductos,
    refetch,
  } = useQuery({
    queryKey: ["mostrar productos", dataempresa?.id, buscador],
    queryFn: async () => {
      if (buscador) {
        return buscarProductos({ id_empresa: dataempresa?.id, buscador: buscador });
      }
      return mostrarProductos({ id_empresa: dataempresa?.id, refetchs: refetch });
    },
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales", dataempresa?.id],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingAlmacenes } = useQuery({
    queryKey: ["mostrar almacenes x sucursal", dataempresa?.id],
    queryFn: () => mostrarAlmacenesXSucursal({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    isLoadingProductos ||
    isLoadingSucursales ||
    isLoadingCategorias ||
    isLoadingAlmacenes;
  const error = errorProductos;

  if (isLoading) {
    return <Spinner1 />;
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return <ProductosTemplate />;
}
