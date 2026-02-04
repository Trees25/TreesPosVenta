import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";

import { useDashboardStore } from "../store/DashboardStore";
import { useReportesStore } from "../store/ReportesStore";

export const useMostrarVentasDashboardQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { mostrarVentasDashboard } = useReportesStore();
  return useQuery({
    queryKey: [
      "mostrar Ventas Dashboard",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarVentasDashboard({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
  });
};
export const useMostrarCantidadDetalleVentaDashboardQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { mostrarVentasDashboard, mostrarCantidadDetalleVentasDashboard } = useReportesStore();
  return useQuery({
    queryKey: [
      "mostrar cantidad detalle Ventas Dashboard",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarCantidadDetalleVentasDashboard({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
  });
};
export const useMostrarCantidadDetalleVentaPeriodoAnteriorDashboardQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { setFechasAnteriores } = useDashboardStore();
  const { mostrarCantidadDetalleVentasDashboard } = useReportesStore();
  const fechasAnteriores = setFechasAnteriores();
  return useQuery({
    queryKey: [
      "mostrar cantidad detalle Ventas Dashboard",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
        _fecha_fin: fechasAnteriores?.fechaAnteriorFin,
      },
    ],
    queryFn: () =>
      mostrarCantidadDetalleVentasDashboard({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
        _fecha_fin: fechasAnteriores?.fechaAnteriorFin,
      }),
    enabled: !!dataempresa,
  });
};
export const useMostrarVentasDashboardPeriodoAnteriorQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin, setFechasAnteriores } = useDashboardStore();

  const { mostrarVentasDashboardPeriodoAnterior, mostrarVentasDashboard } = useReportesStore();
  const fechasAnteriores = setFechasAnteriores();
  return useQuery({
    queryKey: [
      "mostrar Ventas Dashboard periodo anterior",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
        _fecha_fin: fechasAnteriores?.fechaAnteriorFin,
      },
    ],
    queryFn: () =>
      mostrarVentasDashboardPeriodoAnterior({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
        _fecha_fin: fechasAnteriores?.fechaAnteriorFin,
      }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
};
export const useMostrarVentasXMetodoPagoQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();

  const { mostrarVentasXMetodoPago } = useReportesStore();

  return useQuery({
    queryKey: [
      "mostrar ventas x metodo pago",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarVentasXMetodoPago({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
};
export const useMostrarVentasXCategoriaQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();

  const { mostrarVentasXCategoria } = useReportesStore();

  return useQuery({
    queryKey: [
      "mostrar ventas x categoria",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarVentasXCategoria({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
};
export const useGananciasDetalleVentaQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();

  const { mostrarGananciasDetalleVenta } = useReportesStore();

  return useQuery({
    queryKey: [
      "mostrar ganancias detalle venta",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarGananciasDetalleVenta({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
};

export const useCalcularTotalVentasQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { calcularTotalVentas } = useReportesStore();
  return useQuery({
    queryKey: [
      "calcular total ventas rpc",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      calcularTotalVentas({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
};