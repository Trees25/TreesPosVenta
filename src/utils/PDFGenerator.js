import createPdf from "./CreatePdf";
import { numeroALetras, urlToBase64 } from "./Conversiones";

/**
 * Genera el cuerpo del PDF para una impresora térmica de 80mm
 * @param {Object} data { venta, detalles, empresa, tipoComprobante, plantilla }
 */
export const generateTicketPDF = async (data, output = "blob") => {
    const { venta, detalles, empresa, tipoComprobante, plantilla } = data;
    const config = plantilla?.contenido_json || {
        header: empresa?.nombre || "MI NEGOCIO",
        subheader: "Comprobante de Venta",
        footer: "¡Gracias por su compra!",
        showLogo: true,
        columns: { codigo: false, nombre: true, cantidad: true, precio: true, total: true }
    };

    const col = config.columns || { codigo: false, nombre: true, cantidad: true, precio: true, total: true };
    const logoBase64 = config.showLogo ? await urlToBase64(empresa?.logo) : null;

    const fecha = new Date(venta.fecha || Date.now()).toLocaleString();

    // Determinar letra (AFIP)
    const letra = tipoComprobante?.nombre?.includes("Factura A") ? "A" :
        tipoComprobante?.nombre?.includes("Factura B") ? "B" : "X";

    // Cuerpo de la tabla
    const tableBody = [];

    // Header de la tabla
    const headerRow = [];
    if (col.cantidad) headerRow.push({ text: "CANT", style: "tHeader" });
    if (col.nombre) headerRow.push({ text: "DESCRIPCION", style: "tHeader" });
    if (col.precio) headerRow.push({ text: "P.UNIT", style: "tHeader", alignment: "right" });
    if (col.total) headerRow.push({ text: "TOTAL", style: "tHeader", alignment: "right" });
    tableBody.push(headerRow);

    // Items
    detalles.forEach(d => {
        const row = [];
        if (col.cantidad) row.push({ text: d.cantidad, style: "tBody" });
        if (col.nombre) row.push({ text: d.productos?.nombre || "Producto", style: "tBody" });
        if (col.precio) row.push({ text: `$${(d.precio_unitario || (d.subtotal / d.cantidad)).toFixed(2)}`, style: "tBody", alignment: "right" });
        if (col.total) row.push({ text: `$${d.subtotal.toFixed(2)}`, style: "tBody", alignment: "right" });
        tableBody.push(row);
    });

    const content = [];

    // Logo
    if (logoBase64) {
        content.push({
            image: logoBase64,
            width: 100,
            alignment: "center",
            margin: [0, 0, 0, 10]
        });
    }

    // Encabezado Empresa
    content.push(
        { text: empresa?.razon_social || config.header, style: "h1" },
        { text: config.subheader, style: "h2" },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 215, y2: 5, lineWidth: 1 }] }
    );

    // Datos Fiscales AFIP
    content.push({
        margin: [0, 10],
        columns: [
            {
                width: 30,
                stack: [
                    { text: letra, fontSize: 20, bold: true, alignment: 'center', border: [1, 1, 1, 1] }
                ]
            },
            {
                width: '*',
                stack: [
                    { text: `CUIT: ${empresa?.cuit || "-"}`, fontSize: 8 },
                    { text: `IIBB: ${empresa?.nro_iibb || "-"}`, fontSize: 8 },
                    { text: `Inicio Act.: ${empresa?.fecha_inicio_actividades || "-"}`, fontSize: 8 }
                ],
                alignment: 'right'
            }
        ]
    });

    // Info Venta
    content.push(
        { text: `${tipoComprobante?.nombre || "TICKET"} N° ${venta.numero_comprobante || "0000-00000000"}`, style: "h2", bold: true },
        { text: `FECHA: ${fecha}`, style: "h2" },
        { text: `P.VENTA: ${empresa?.punto_venta?.toString().padStart(4, '0') || "0001"}`, style: "h2" },
        { text: `CLIENTE: ${venta.clientes_proveedores?.nombres || "CONSUMIDOR FINAL"}`, style: "h2" },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 215, y2: 5, lineWidth: 1 }] }
    );

    // Tabla de Productos
    content.push({
        margin: [0, 10],
        table: {
            widths: col.cantidad && col.nombre && col.precio && col.total ? ['15%', '*', '25%', '25%'] : ['auto', '*', 'auto', 'auto'],
            body: tableBody
        },
        layout: 'noBorders'
    });

    // Totales
    content.push(
        { canvas: [{ type: 'line', x1: 100, y1: 5, x2: 215, y2: 5, lineWidth: 2 }] },
        {
            columns: [
                { text: "TOTAL", style: "totalLabel" },
                { text: `$${venta.total.toFixed(2)}`, style: "totalValue" }
            ],
            margin: [0, 5, 0, 10]
        },
        { text: numeroALetras(venta.total), fontSize: 8, italic: true, alignment: 'center' }
    );

    // Pie de página
    content.push(
        { text: config.footer, style: "footer", margin: [0, 20, 0, 0] },
        { text: "Sistema POS - Facturación AFIP", style: "footer", opacity: 0.5 },
        {
            margin: [0, 10],
            table: {
                widths: ['*'],
                body: [[{ text: `CAE: 71234567890123\nVto. CAE: ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}`, alignment: 'center', fontSize: 9, bold: true }]]
            }
        }
    );

    const styles = {
        h1: { fontSize: 14, bold: true, alignment: "center" },
        h2: { fontSize: 9, alignment: "left" },
        tHeader: { fontSize: 8, bold: true, border: [0, 0, 0, 1] },
        tBody: { fontSize: 9 },
        totalLabel: { fontSize: 13, bold: true, alignment: "right" },
        totalValue: { fontSize: 13, bold: true, alignment: "right" },
        footer: { fontSize: 8, alignment: "center" }
    };

    return await createPdf({ content, styles }, output);
};
