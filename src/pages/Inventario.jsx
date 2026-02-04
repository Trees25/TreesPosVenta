import styled from "styled-components";
import { CrudTemplate } from "../components/templates/CrudTemplate";
import { RegistrarInventario } from "../components/organismos/formularios/RegistrarInventario";
import { TablaInventarios } from "../components/organismos/tablas/TablaInventarios";
import { useQuery } from "@tanstack/react-query";

import { useMovStockStore } from "../store/MovStockStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useProductosStore } from "../store/ProductosStore";
import { useStockStore } from "../store/StockStore";
import { Title } from "../components/atomos/Title";
import { Btn1 } from "../components/moleculas/Btn1";
import { useState } from "react";
import { BuscadorList } from "../components/ui/lists/BuscadorList";
import { useGlobalStore } from "../store/GlobalStore";
import { AlertasStockTablas } from "../components/organismos/tablas/AlertasStockTablas";
import { v } from "../styles/variables"; // Ensure variables are imported for icons if needed, though Btn1 usually takes text or icons

export const Inventario = () => {
  const { mostrarMovStock, pagina, setPagina, totalRegistros } = useMovStockStore();
  const { dataempresa } = useEmpresaStore();
  const { buscarProductos, buscador } = useProductosStore();
  const { mostrarStockAlertas } = useStockStore();
  const { productosItemSelect, setBuscador, selectProductos } =
    useProductosStore();
  const [openRegistro, SetopenRegistro] = useState(false);
  const { setStateClose, setAccion, stateClose, accion } = useGlobalStore();

  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const totalPaginas = Math.ceil(totalRegistros / 20) || 1;

  const { data: dataStockAlertas } = useQuery({
    queryKey: ["mostrar alertas stock", dataempresa?.id],
    queryFn: () => mostrarStockAlertas({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
  });

  const {
    data: dataproductos,
    isLoading: isLoadingBuscarProductos,
    error,
  } = useQuery({
    queryKey: ["buscar productos", buscador],
    queryFn: () =>
      buscarProductos({
        id_empresa: dataempresa?.id,
        buscador: buscador,
      }),
    enabled: !!dataempresa,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "mostrar movimientos de stock",
      {
        id_empresa: dataempresa?.id,
        id_producto: productosItemSelect?.id,
        pagina: pagina
      },
    ],
    queryFn: () =>
      mostrarMovStock({
        id_empresa: dataempresa?.id,
        id_producto: productosItemSelect?.id,
      }),
    enabled: !!dataempresa,
  });

  function nuevoRegistro() {
    setStateClose(true);
    setAccion("Nuevo");
    setItemSelect([]);
  }
  return (
    <Container>
      {stateClose && <RegistrarInventario />}
      <AlertasStockTablas data={dataStockAlertas} />

      <section className="area1">
        {productosItemSelect?.nombre && (
          <span>
            {" "}
            Producto: {" "}<strong>{productosItemSelect?.nombre}</strong>{" "}
          </span>
        )}
        <Title>Inventario</Title>
        <Btn1 funcion={nuevoRegistro} titulo="Registrar" />
      </section>
      <section className="area2">
        <BuscadorList
          setBuscador={setBuscador}
          data={dataproductos}
          onSelect={selectProductos}
        />
      </section>

      <section className="main">
        <TablaInventarios
          setdataSelect={setdataSelect}
          setAccion={setAccion}
          SetopenRegistro={SetopenRegistro}
          data={data}
        />
      </section>
      <section className="footer">
        <div className="pagination">
          <Btn1
            titulo="< Anterior"
            bgcolor="#f6f6f6"
            color="#000"
            disabled={pagina === 1}
            funcion={() => setPagina(pagina - 1)}
          />
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <Btn1
            titulo="Siguiente >"
            bgcolor="#f6f6f6"
            color="#000"
            disabled={pagina >= totalPaginas}
            funcion={() => setPagina(pagina + 1)}
          />
        </div>
      </section>
    </Container>
  );
};
const Container = styled.div`
  height: calc(100vh - 80px);

  margin-top: 50px;
  padding: 15px;
  display: grid;
  grid-template:
    "area1" auto
    "area2" auto
    "main" auto
    "footer" 60px;
  gap: 15px;

  @media (min-width: 768px) {
    grid-template:
      "area1" 60px
      "area2" 60px
      "main" auto
      "footer" 60px;
  }

  .area1 {
    grid-area: area1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: end;
      padding-bottom: 0;
      gap: 15px;
    }
  }
  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (min-width: 768px) {
      justify-content: end;
    }
  }
  .main {
    grid-area: main;
    /* background-color: rgba(237, 7, 221, 0.14); */
  }
  .footer {
    grid-area: footer;
    display: flex;
    justify-content: center;
    align-items: center;
    .pagination {
      display: flex;
      gap: 15px;
      align-items: center;
      span {
        font-weight: bold;
        color: ${({ theme }) => theme.text};
      }
    }
  }
`;
