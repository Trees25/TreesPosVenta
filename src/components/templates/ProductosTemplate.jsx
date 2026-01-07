import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  useProductosStore,
  ModalMasivoPrecios,
  useCategoriasStore,
  useClientesProveedoresStore,
  SelectList,
  Title,
  TablaProductos
} from "../../index";
import { v } from "../../styles/variables";
import { useEffect, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster } from "sonner";
export function ProductosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataProductos, setBuscador, generarCodigo, idCategoria, setIdCategoria, idProveedor, setIdProveedor } = useProductosStore();
  const { datacategorias } = useCategoriasStore();
  const { dataclipro } = useClientesProveedoresStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [openMasivoPrecios, setOpenMasivoPrecios] = useState(false);
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
    generarCodigo();

  }

  return (
    <Container>
      <Toaster />
      {
        openRegistro && <RegistrarProductos setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion} state={openRegistro}
        />
      }
      {
        openMasivoPrecios && <ModalMasivoPrecios onClose={() => setOpenMasivoPrecios(false)} />
      }


      <section className="area1">
        <Title>Productos</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
        <Btn1
          funcion={() => setOpenMasivoPrecios(true)}
          bgcolor="#F9D70B"
          titulo="Actualización Masiva"
          icono={<v.iconoflechaderecha />}
        />
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador} />
        <div className="filtros">
          <SelectList
            data={[{ nombre: "Todas las categorías", id: null }, ...(datacategorias || [])]}
            itemSelect={idCategoria || { nombre: "Todas las categorías", id: null }}
            onSelect={setIdCategoria}
            displayField="nombre"
          />
          <SelectList
            data={[{ nombres: "Todos los proveedores", id: null }, ...(dataclipro || [])]}
            itemSelect={idProveedor || { nombres: "Todos los proveedores", id: null }}
            onSelect={setIdProveedor}
            displayField="nombres"
          />
        </div>
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaProductos setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={dataProductos} />
      </section>

    </Container>
  );
}
const Container = styled.div`
  height: calc(100vh - 80px);
  
  margin-top:50px;
  padding: 15px;
  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;
  .area1 {
    grid-area: area1;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 15px;
  }
  .area2 {
    grid-area: area2;
    /* background-color: rgba(7, 237, 45, 0.14); */
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 15px;
    .filtros {
       display: flex;
       gap: 10px;
       align-items: center;
    }
  }
  .main {
    grid-area: main;
    /* background-color: rgba(237, 7, 221, 0.14); */
  }
`;
