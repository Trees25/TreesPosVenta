import printJS from "print-js";
import * as pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

/**
 * Genera un PDF o lo envía a imprimir usando print-js
 * @param {Object} props - { pageSize, pageMargins, info, styles, content }
 * @param {string} output - "print" | "b64" | "blob"
 */
const createPdf = async (props, output = "print") => {
    return new Promise((resolve, reject) => {
        try {
            const {
                pageSize = {
                    width: 226.77, // ~80mm
                    height: 841.88,
                },
                pageMargins = [5.66, 5.66, 5.66, 5.66],
                info = {},
                styles = {},
                content,
            } = props;

            const docDefinition = {
                pageSize,
                pageMargins,
                info,
                styles,
                content,
            };

            const pdfMakeCreatePdf = pdfMake.createPdf(docDefinition);

            if (output === "b64") {
                pdfMakeCreatePdf.getBase64((data) => {
                    resolve({
                        success: true,
                        content: data,
                        message: "Archivo generado correctamente.",
                    });
                });
            } else if (output === "blob") {
                pdfMakeCreatePdf.getBlob((blob) => {
                    resolve(blob);
                });
            } else if (output === "print") {
                pdfMakeCreatePdf.getBase64((data) => {
                    printJS({
                        printable: data,
                        type: "pdf",
                        base64: true,
                    });
                    resolve({
                        success: true,
                        content: null,
                        message: "Documento enviado a impresión.",
                    });
                });
            } else {
                reject(new Error("Tipo de salida no válido"));
            }
        } catch (error) {
            reject(error);
        }
    });
};

export default createPdf;
