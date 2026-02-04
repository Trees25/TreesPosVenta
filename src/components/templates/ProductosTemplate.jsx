import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  useProductosStore,
  ModalMasivoPrecios,
  useCategoriasStore,
  useClientesProveedoresStore,
  useEmpresaStore,
  SelectList,
  Title,
  TablaProductos
} from "../../index";
import { v } from "../../styles/variables";
import { useEffect, useState, useRef } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster, toast } from "sonner";
import Swal from "sweetalert2";

export function ProductosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataProductos, setBuscador, generarCodigo, idCategoria, setIdCategoria, idProveedor, setIdProveedor, insertarProductosMasivo, pagina, setPagina, totalRegistros } = useProductosStore();
  const { datacategorias } = useCategoriasStore();
  const { dataclipro } = useClientesProveedoresStore();
  const { dataempresa } = useEmpresaStore();
  const fileInputRef = useRef(null);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [openMasivoPrecios, setOpenMasivoPrecios] = useState(false);

  const totalPaginas = Math.ceil(totalRegistros / 6) || 1;

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
    generarCodigo();

  }

  const handleDescargarPlantilla = () => {
    const headers = [
      "nombre",
      "precio_venta",
      "precio_compra",
      "categoria",
      "codigo_barras",
      "codigo_interno",
      "sevende_por",
      "stock",
      "stock_minimo",
      "proveedor",
      "fecha_vencimiento"
    ];
    const csvContent = "sep=;\n" + headers.join(";") + "\n" + "Ejemplo Producto;1500;1000;General;779123456789;COD001;UNIDAD;10;5;ProveedorX;2025-12-31";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_productos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      let rows = text.split("\n").map(row => row.trim()).filter(row => row.length > 0);

      // Remove specific Excel separator header if present
      if (rows.length > 0 && rows[0].startsWith("sep=")) {
        rows = rows.slice(1);
      }

      if (rows.length < 2) {
        toast.error("El archivo CSV parece estar vacío o sin datos.");
        return;
      }

      const headers = rows[0].split(";");
      const dataRows = rows.slice(1);

      const productosValidos = [];
      const errores = [];

      for (let i = 0; i < dataRows.length; i++) {
        const valores = dataRows[i].split(";");
        if (valores.length < headers.length) continue; // Skip incomplete lines

        // Mapping based on fixed header order from template
        const [
          nombre, precio_venta, precio_compra, categoriaNombre,
          codigo_barras, codigo_interno, sevende_por, stock,
          stock_minimo, proveedorNombre, fecha_vencimiento
        ] = valores;

        // Validations
        const categoriaFound = datacategorias?.find(c => c.nombre.toLowerCase() === categoriaNombre?.toLowerCase().trim());
        if (!categoriaFound) {
          errores.push(`Fila ${i + 2}: Categoría '${categoriaNombre}' no encontrada.`);
          continue;
        }

        const proveedorFound = dataclipro?.find(p => p.nombres.toLowerCase() === proveedorNombre?.toLowerCase().trim());

        // Build object
        productosValidos.push({
          nombre: nombre.trim(),
          precio_venta: parseFloat(precio_venta?.replace(",", ".")) || 0,
          precio_compra: parseFloat(precio_compra?.replace(",", ".")) || 0,
          id_categoria: categoriaFound.id,
          codigo_barras: codigo_barras?.trim() || Math.floor(Math.random() * 1000000000).toString(),
          codigo_interno: codigo_interno?.trim() || Math.floor(Math.random() * 1000000000).toString(),
          id_empresa: dataempresa?.id,
          sevende_por: sevende_por?.trim().toUpperCase() || "UNIDAD",
          maneja_inventarios: true,
          maneja_multiprecios: false,
          id_proveedor: proveedorFound?.id || null,
          fecha_vencimiento: fecha_vencimiento && fecha_vencimiento.includes("-") ? fecha_vencimiento.trim() : null
        });
      }

      if (errores.length > 0) {
        Swal.fire({
          title: "Errores detectados",
          html: `<div style="max-height: 200px; overflow-y: auto; text-align: left;">
                  <p>Se encontraron ${errores.length} errores. No se importaron estas filas:</p>
                  <ul>${errores.map(e => `<li>${e}</li>`).join('')}</ul>
                 </div>`,
          icon: "warning"
        });
      }

      if (productosValidos.length > 0) {
        try {
          await insertarProductosMasivo(productosValidos);
          Swal.fire({
            title: "Importación Exitosa",
            text: `Se han importado ${productosValidos.length} productos correctamente.`,
            icon: "success"
          });
          event.target.value = ""; // Reset input
        } catch (error) {
          toast.error("Error al guardar productos: " + error.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
          titulo="Nuevo"
          icono={<v.iconoagregar />}
        />
        <Btn1
          funcion={() => setOpenMasivoPrecios(true)}
          bgcolor="#F9D70B"
          titulo="Actualización Masiva"
          icono={<v.iconoflechaderecha />}
        />
        <Btn1
          funcion={handleDescargarPlantilla}
          bgcolor="#1cb0f6"
          titulo="Descargar Plantilla"
          icono={<v.iconoFlechabajo />}
        />
        <Btn1
          funcion={triggerFileInput}
          bgcolor="#25D366"
          titulo="Importar CSV"
          icono={<v.iconoflechaderecha />}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleFileUpload}
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

      <section className="footer">
        <div className="pagination">
          <Btn1
            titulo="< Anterior"
            bgcolor="#f6f6f6"
            color="#000"
            disabled={pagina === 1}
            funcion={() => setPagina(pagina - 1)}
          />
          <span>Página {pagina} de {totalPaginas}</span>
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
}
const Container = styled.div`
  height: calc(100vh - 80px);
  
  margin-top:50px;
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
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: end;
      gap: 15px;
      padding-bottom: 0;
    }
  }

  .area2 {
    grid-area: area2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: end;
      gap: 15px;
    }
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
