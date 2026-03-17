import styled from "styled-components";
import { useState, useEffect } from "react";
import { DocumentoService } from "../services/DocumentoService";
import { EmpresaService } from "../services/EmpresaService";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { ImpresoraService } from "../services/ImpresoraService";
import { useVentaStore } from "../store/VentaStore";

export const ConfigurarPlantillas = () => {
    const { profile } = useAuthStore();
    const [tipos, setTipos] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [tab, setTab] = useState("diseño"); // "diseño", "fiscal", "impresora"

    const { idCaja } = useVentaStore();
    const [impresorasLocales, setImpresorasLocales] = useState([]);
    const [printerConfig, setPrinterConfig] = useState({
        nombre: "",
        estado: false
    });
    const [loadingPrinter, setLoadingPrinter] = useState(false);
    const [serviceConnected, setServiceConnected] = useState(false);
    const [pcIp, setPcIp] = useState("localhost");

    // Estado para datos fiscales
    const [fiscalData, setFiscalData] = useState({
        razon_social: "",
        cuit: "",
        nro_iibb: "",
        punto_venta: 1,
        id_condicion_iva: "",
        fecha_inicio_actividades: ""
    });
    const [condicionesIva, setCondicionesIva] = useState([]);
    const [logoUrl, setLogoUrl] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Estado para diseño (Formulario amigable)
    const [diseño, setDiseño] = useState({
        header: "",
        subheader: "",
        footer: "",
        showLogo: true,
        showAddress: true,
        showPhone: true,
        columns: {
            codigo: false,
            nombre: true,
            cantidad: true,
            precio: true,
            total: true
        }
    });

    useEffect(() => {
        if (profile?.id_empresa) fetchInitialData();
    }, [profile]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [tiposList, plantillasList, condiciones, empresa, impresorasList] = await Promise.all([
                DocumentoService.listarTiposComprobantes(),
                DocumentoService.listarPlantillas(profile.id_empresa),
                EmpresaService.listarCondicionesIva(),
                EmpresaService.getEmpresaByUserId(profile.id_auth),
                ImpresoraService.listarImpresorasLocales()
            ]);
            setTipos(tiposList);
            setPlantillas(plantillasList);
            setCondicionesIva(condiciones);
            setImpresorasLocales(impresorasList.list || []);
            setServiceConnected(impresorasList.connected);

            if (impresorasList.connected) {
                const ip = await ImpresoraService.obtenerIpLocal();
                setPcIp(ip);
            }

            if (idCaja) {
                const config = await ImpresoraService.obtenerImpresoraPorCaja(idCaja);
                if (config) {
                    setPrinterConfig({
                        nombre: config.nombre || "",
                        estado: config.estado || false
                    });
                }
            }

            if (empresa) {
                setFiscalData({
                    razon_social: empresa.razon_social || empresa.nombre || "",
                    cuit: empresa.cuit || "",
                    nro_iibb: empresa.nro_iibb || "",
                    punto_venta: empresa.punto_venta || 1,
                    id_condicion_iva: empresa.id_condicion_iva || "",
                    fecha_inicio_actividades: empresa.fecha_inicio_actividades || ""
                });
                setLogoUrl(empresa.logo || "");
            }

            if (tiposList.length > 0) handleSelectTipo(tiposList[0], plantillasList);
        } catch (error) {
            toast.error("Error al cargar configuraciones: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTipo = (tipo, allPlantillas = plantillas) => {
        setSelectedTipo(tipo);
        const plantilla = allPlantillas.find(p => p.id_tipo_comprobante === tipo.id);
        if (plantilla && plantilla.contenido_json) {
            const json = plantilla.contenido_json;
            setDiseño({
                header: json.header || "",
                subheader: json.subheader || "",
                footer: json.footer || "",
                showLogo: json.showLogo ?? true,
                showAddress: json.showAddress ?? true,
                showPhone: json.showPhone ?? true,
                columns: json.columns || {
                    codigo: false,
                    nombre: true,
                    cantidad: true,
                    precio: true,
                    total: true
                }
            });
        } else {
            setDiseño({
                header: profile?.empresa?.nombre || "MI NEGOCIO",
                subheader: "Dirección - Teléfono",
                footer: "Gracias por su compra",
                showLogo: true,
                showAddress: true,
                showPhone: true,
                columns: {
                    codigo: false,
                    nombre: true,
                    cantidad: true,
                    precio: true,
                    total: true
                }
            });
        }
    };

    const handleSaveDiseño = async () => {
        try {
            const existing = plantillas.find(p => p.id_tipo_comprobante === selectedTipo.id);

            const data = {
                id_empresa: profile.id_empresa,
                id_tipo_comprobante: selectedTipo.id,
                nombre: `Plantilla ${selectedTipo.nombre}`,
                contenido_json: diseño,
                es_defecto: true
            };

            if (existing) data.id = existing.id;

            await DocumentoService.guardarPlantilla(data);
            toast.success("Diseño guardado correctamente");
            fetchInitialData();
        } catch (error) {
            toast.error("Error al guardar: " + error.message);
        }
    };

    const handleSaveFiscal = async () => {
        try {
            await EmpresaService.updateEmpresa(profile.id_empresa, fiscalData);
            toast.success("Datos fiscales actualizados");
        } catch (error) {
            toast.error("Error al guardar datos fiscales: " + error.message);
        }
    };

    const handleSavePrinter = async () => {
        if (!idCaja) return toast.error("No se detectó una caja activa. Abra la caja antes de configurar la impresora.");
        try {
            setLoadingPrinter(true);
            await ImpresoraService.guardarConfiguracion(idCaja, printerConfig.nombre, printerConfig.estado, pcIp);
            toast.success("Configuración de impresora guardada");
        } catch (error) {
            toast.error("Error al guardar configuración: " + error.message);
        } finally {
            setLoadingPrinter(false);
        }
    };

    const compressImage = (file, maxWidth = 400, maxHeight = 400, targetSizeKB = 50) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.9;
                    const compress = (q) => {
                        canvas.toBlob((blob) => {
                            if (blob.size / 1024 <= targetSizeKB || q <= 0.1) {
                                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                            } else {
                                compress(q - 0.1);
                            }
                        }, 'image/jpeg', q);
                    };
                    compress(quality);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingLogo(true);
            toast.info("Procesando imagen...");
            const compressedFile = await compressImage(file);
            const url = await EmpresaService.subirLogo(profile.id_empresa, compressedFile);
            setLogoUrl(url);
            toast.success("Logo subido y optimizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar/subir el logo: " + error.message);
        } finally {
            setUploadingLogo(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>;

    return (
        <Container className="animate-fade">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/" style={{ fontSize: '24px', textDecoration: 'none' }}>🏠</Link>
                    <h1>Panel de Configuración</h1>
                </div>
                <div className="tabs">
                    <TabButton $active={tab === "diseño"} onClick={() => setTab("diseño")}>🖌️ Diseño de Ticket</TabButton>
                    <TabButton $active={tab === "fiscal"} onClick={() => setTab("fiscal")}>💼 Datos Fiscales (AFIP)</TabButton>
                    <TabButton $active={tab === "impresora"} onClick={() => setTab("impresora")}>🖨️ Impresora Térmica</TabButton>
                </div>
            </header>

            {tab === "diseño" ? (
                <Layout>
                    <Sidebar>
                        <h3>Documento</h3>
                        {tipos.map(t => (
                            <TipoCard
                                key={t.id}
                                $active={selectedTipo?.id === t.id}
                                onClick={() => handleSelectTipo(t)}
                            >
                                <Icon icon="mdi:ticket-outline" />
                                {t.nombre}
                            </TipoCard>
                        ))}
                    </Sidebar>

                    <Main>
                        <EditorForm>
                            <div className="section">
                                <h3><Icon icon="mdi:format-header-1" /> Encabezado</h3>
                                <div className="field">
                                    <label>Título / Nombre</label>
                                    <input
                                        type="text"
                                        value={diseño.header}
                                        onChange={(e) => setDiseño({ ...diseño, header: e.target.value })}
                                        placeholder="Ej: MI EMPRESA S.A."
                                    />
                                </div>
                                <div className="field">
                                    <label>Subtítulo / Información adicional</label>
                                    <input
                                        type="text"
                                        value={diseño.subheader}
                                        onChange={(e) => setDiseño({ ...diseño, subheader: e.target.value })}
                                        placeholder="Ej: Sucursal Centro - Tel 123456"
                                    />
                                </div>
                                <div className="toggles">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={diseño.showLogo}
                                            onChange={(e) => setDiseño({ ...diseño, showLogo: e.target.checked })}
                                        />
                                        <span>Mostrar Logo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="section">
                                <h3><Icon icon="mdi:table-settings" /> Columnas del Detalle</h3>
                                <div className="columns-grid">
                                    {Object.keys(diseño.columns).map(col => (
                                        <label key={col} className="checkbox-field">
                                            <input
                                                type="checkbox"
                                                checked={diseño.columns[col]}
                                                onChange={(e) => setDiseño({
                                                    ...diseño,
                                                    columns: { ...diseño.columns, [col]: e.target.checked }
                                                })}
                                            />
                                            <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="section">
                                <h3><Icon icon="mdi:format-footer-segment" /> Pie de Página</h3>
                                <div className="field">
                                    <label>Mensaje de Agradecimiento</label>
                                    <textarea
                                        value={diseño.footer}
                                        onChange={(e) => setDiseño({ ...diseño, footer: e.target.value })}
                                        placeholder="Ej: Gracias por confiar en nosotros!"
                                    />
                                </div>
                            </div>

                            <button className="primary" onClick={handleSaveDiseño}>
                                <Icon icon="mdi:content-save-check" /> Guardar Cambios
                            </button>
                        </EditorForm>

                        <PreviewContainer>
                            <div className="sticky">
                                <h3><Icon icon="mdi:eye-outline" /> Vista Previa</h3>
                                <TicketPreview diseño={diseño} fiscal={fiscalData} tipo={selectedTipo} />
                            </div>
                        </PreviewContainer>
                    </Main>
                </Layout>
            ) : tab === "fiscal" ? (
                <FiscalLayout>
                    <div className="form-card">
                        <h3>Información de mi Empresa (Argentina)</h3>
                        <p>Estos datos aparecerán en tus facturas y tickets fiscales.</p>

                        <div className="grid">
                            <div className="field logo-upload-field" style={{ gridColumn: '1 / -1' }}>
                                <label>Logo de la Empresa</label>
                                <div className="logo-flex">
                                    {logoUrl ? (
                                        <div className="logo-preview-container">
                                            <img src={logoUrl} alt="Logo" />
                                        </div>
                                    ) : (
                                        <div className="logo-placeholder-empty">
                                            <Icon icon="mdi:image-outline" />
                                            <span>Sin Logo</span>
                                        </div>
                                    )}
                                    <div className="upload-controls">
                                        <input
                                            type="file"
                                            id="logo-input"
                                            accept="image/*"
                                            onChange={handleUploadLogo}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="logo-input" className="upload-btn">
                                            <Icon icon={uploadingLogo ? "mdi:loading" : "mdi:upload"} className={uploadingLogo ? "animate-spin" : ""} />
                                            {uploadingLogo ? "Subiendo..." : "Subir Nuevo Logo"}
                                        </label>
                                        <p>Máximo 500KB. El nuevo logo reemplazará al anterior.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label>Razón Social / Nombre Fantasía</label>
                                <input
                                    type="text"
                                    value={fiscalData.razon_social}
                                    onChange={(e) => setFiscalData({ ...fiscalData, razon_social: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label>CUIT (Solo números)</label>
                                <input
                                    type="text"
                                    value={fiscalData.cuit}
                                    onChange={(e) => setFiscalData({ ...fiscalData, cuit: e.target.value })}
                                    placeholder="20123456789"
                                />
                            </div>
                            <div className="field">
                                <label>Nro. de Ingresos Brutos (IIBB)</label>
                                <input
                                    type="text"
                                    value={fiscalData.nro_iibb}
                                    onChange={(e) => setFiscalData({ ...fiscalData, nro_iibb: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label>Condición frente al IVA</label>
                                <select
                                    value={fiscalData.id_condicion_iva}
                                    onChange={(e) => setFiscalData({ ...fiscalData, id_condicion_iva: e.target.value })}
                                >
                                    <option value="">Seleccione condición...</option>
                                    {condicionesIva.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Punto de Venta</label>
                                <input
                                    type="number"
                                    value={fiscalData.punto_venta}
                                    onChange={(e) => setFiscalData({ ...fiscalData, punto_venta: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="field">
                                <label>Fecha Inicio Actividades</label>
                                <input
                                    type="date"
                                    value={fiscalData.fecha_inicio_actividades}
                                    onChange={(e) => setFiscalData({ ...fiscalData, fecha_inicio_actividades: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="primary" onClick={handleSaveFiscal}>
                                <Icon icon="mdi:check-circle" /> Guardar Datos Fiscales
                            </button>
                        </div>
                    </div>
                </FiscalLayout>
            ) : (
                <FiscalLayout>
                    <div className="form-card animate-fade">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0 }}>Configuración de Impresora Local</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <DownloadLink href="/asistente-impresion.zip" title="Descargar Asistente para otras PCs">
                                    <Icon icon="mdi:download" /> Descargar Software
                                </DownloadLink>
                                <StatusBadge $connected={serviceConnected}>
                                    <Icon icon={serviceConnected ? "mdi:check-circle" : "mdi:alert-circle"} />
                                    {serviceConnected ? "Servicio Activo" : "Servicio Desconectado"}
                                </StatusBadge>
                            </div>
                        </div>
                        {serviceConnected && (
                            <p style={{ fontSize: '12px', color: '#2ecc71', fontWeight: 600, marginBottom: '15px' }}>
                                <Icon icon="mdi:ip-network" /> IP del Servidor: {pcIp} (Usa esta IP en tus smartphones)
                            </p>
                        )}
                        <p>Configure la impresora térmica conectada a esta computadora.</p>

                        {!serviceConnected ? (
                            <ServiceWarning className="animate-up">
                                <div className="icon">🛑</div>
                                <div className="text">
                                    <h4>Asistente de impresión no detectado</h4>
                                    <p>Para imprimir directamente, debes tener ejecutando el programa <strong>PrintServicePosventa.exe</strong> en esta computadora.</p>
                                    <div className="actions">
                                        <button className="download-btn" onClick={() => window.open('/asistente-impresion.zip')}>
                                            <Icon icon="mdi:download" /> Descargar Asistente
                                        </button>
                                        <button className="retry-btn" onClick={fetchInitialData}>
                                            <Icon icon="mdi:refresh" /> Reintentar Conexión
                                        </button>
                                    </div>
                                </div>
                            </ServiceWarning>
                        ) : (
                            <div className="grid">
                                <div className="field" style={{ gridColumn: '1 / -1' }}>
                                    <label>Seleccionar Impresora</label>
                                    <select
                                        value={printerConfig.nombre}
                                        onChange={(e) => setPrinterConfig({ ...printerConfig, nombre: e.target.value })}
                                    >
                                        <option value="">-- Seleccione una impresora --</option>
                                        {impresorasLocales.map((p, i) => (
                                            <option key={i} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    {impresorasLocales.length === 0 && (
                                        <p style={{ color: '#ff6a00', fontSize: '12px', marginTop: '5px' }}>
                                            ⚠️ No se encontraron impresoras instaladas en este equipo.
                                        </p>
                                    )}
                                </div>

                                <div className="field" style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '12px' }}>
                                        <div className="toggles" style={{ margin: 0 }}>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={printerConfig.estado}
                                                    onChange={(e) => setPrinterConfig({ ...printerConfig, estado: e.target.checked })}
                                                />
                                                <span>Impresión Directa (Sin vista previa)</span>
                                            </label>
                                        </div>
                                        <Icon icon="mdi:flash-outline" style={{ color: printerConfig.estado ? '#0aca21' : '#ccc', fontSize: '24px' }} />
                                    </div>
                                    <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>
                                        Si habilitas esta opción, el ticket se enviará automáticamente a la impresora al confirmar el cobro.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="primary" onClick={handleSavePrinter} disabled={loadingPrinter || !serviceConnected}>
                                <Icon icon={loadingPrinter ? "mdi:loading" : "mdi:content-save-check"} className={loadingPrinter ? "animate-spin" : ""} />
                                {loadingPrinter ? "Guardando..." : "Guardar Configuración"}
                            </button>
                        </div>
                    </div>
                </FiscalLayout>
            )}
        </Container>
    );
};

const TicketPreview = ({ diseño, fiscal, tipo }) => {
    return (
        <PreviewCard>
            <div className="ticket-body">
                {diseño.showLogo && <div className="logo-placeholder">LOGO</div>}
                <div className="header-info">
                    <div className="title">{diseño.header || "NOMBRE EMPRESA"}</div>
                    <div className="subtitle">{diseño.subheader || "Dirección - Tel"}</div>
                </div>

                <div className="fiscal-header">
                    <div className="letter">{tipo?.nombre?.includes('Factura A') ? 'A' : tipo?.nombre?.includes('Factura B') ? 'B' : 'X'}</div>
                    <div className="afip-data">
                        <span>CUIT: {fiscal.cuit || "00-00000000-0"}</span>
                        <span>PV: {fiscal.punto_venta.toString().padStart(4, '0')}</span>
                    </div>
                </div>

                <div className="doc-info">
                    <strong>{tipo?.nombre || 'DOCUMENTO'}</strong>
                    <span>N° 0001-00001234</span>
                    <span>FECHA: {new Date().toLocaleDateString()}</span>
                </div>

                <div className="table-header">
                    {diseño.columns.cantidad && <span>CANT</span>}
                    {diseño.columns.nombre && <span className="flex">DESC</span>}
                    {diseño.columns.precio && <span>P.UNIT</span>}
                    {diseño.columns.total && <span>TOTAL</span>}
                </div>
                <div className="table-body">
                    <div className="row">
                        {diseño.columns.cantidad && <span>1.0</span>}
                        {diseño.columns.nombre && <span className="flex">EJEMPLO PRODUCTO</span>}
                        {diseño.columns.precio && <span>$100.00</span>}
                        {diseño.columns.total && <span>$100.00</span>}
                    </div>
                </div>

                <div className="totals">
                    <div className="row">
                        <span>TOTAL</span>
                        <span>$100.00</span>
                    </div>
                </div>

                <div className="footer-msg">
                    {diseño.footer}
                </div>
                <div className="cae-mock">
                    CAE: 71234567890123
                </div>
            </div>
        </PreviewCard>
    );
};

const PreviewCard = styled.div`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #ddd;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);

    .ticket-body {
        background: white;
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
        padding: 15px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        text-align: center;
        
        .logo-placeholder { border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px; color: #999; }
        .title { font-size: 12px; font-weight: 900; }
        .subtitle { font-size: 8px; opacity: 0.7; border-bottom: 1px dashed #eee; padding-bottom: 5px; margin-bottom: 5px; }
        
        .fiscal-header {
            display: flex; justify-content: space-between; align-items: center; padding-bottom: 5px; border-bottom: 1px dashed #eee;
            .letter { border: 1px solid #000; width: 15px; height: 15px; font-weight: 900; }
            .afip-data { display: flex; flex-direction: column; font-size: 7px; text-align: right; }
        }

        .doc-info { display: flex; flex-direction: column; text-align: left; padding: 5px 0; border-bottom: 1px solid #eee; }

        .table-header { 
            display: flex; font-weight: 900; padding: 5px 0; border-bottom: 1px solid #eee; 
            span { width: 30px; text-align: left; &.flex { flex: 1; } }
        }
        .table-body .row { 
            display: flex; padding: 5px 0; 
            span { width: 30px; text-align: left; &.flex { flex: 1; word-break: break-all; } }
        }

        .totals { 
            border-top: 2px solid #000; margin-top: 5px; padding-top: 5px;
            .row { display: flex; justify-content: space-between; font-weight: 900; font-size: 12px; }
        }

        .footer-msg { margin-top: 15px; font-style: italic; font-size: 8px; }
        .cae-mock { margin-top: 10px; font-size: 7px; font-weight: 900; border: 1px solid #000; padding: 2px; }
    }
`;

const Container = styled.div`
    padding: 30px;
    max-width: 1300px;
    margin: 0 auto;
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        h1 { margin: 0; font-size: 28px; font-weight: 800; }
        .tabs { display: flex; gap: 10px; }
    }
`;

const TabButton = styled.button`
    padding: 12px 25px;
    border-radius: 12px;
    border: 1px solid ${({ theme, $active }) => $active ? theme.primary : theme.borderColor};
    background: ${({ theme, $active }) => $active ? theme.primary : theme.cardBg};
    color: ${({ theme, $active }) => $active ? 'white' : theme.text};
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
    &:hover { transform: translateY(-2px); }
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 30px;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    h3 { font-size: 13px; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; }
`;

const TipoCard = styled.div`
    background: ${({ theme, $active }) => $active ? theme.primary : theme.cardBg};
    color: ${({ theme, $active }) => $active ? 'white' : theme.text};
    padding: 15px 20px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
    border: 1px solid ${({ theme, $active }) => $active ? theme.primary : theme.borderColor}55;
    &:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
`;

const Main = styled.div`
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 30px;
    align-items: start;
`;

const EditorForm = styled.div`
    background: ${({ theme }) => theme.cardBg};
    padding: 30px;
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.borderColor}55;
    display: flex;
    flex-direction: column;
    gap: 25px;

    .section {
        display: flex;
        flex-direction: column;
        gap: 15px;
        h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; color: ${({ theme }) => theme.primary}; }
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        label { font-size: 13px; font-weight: 700; opacity: 0.7; }
        input, textarea {
            padding: 12px;
            border-radius: 10px;
            background: ${({ theme }) => theme.softBg};
            border: 1px solid ${({ theme }) => theme.borderColor};
            color: ${({ theme }) => theme.text};
            font-weight: 600;
            &:focus { border-color: ${({ theme }) => theme.primary}; outline: none; }
        }
        textarea { height: 80px; resize: none; }
    }

    .columns-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }

    .checkbox-field {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        span { opacity: 0.8; }
        input { width: 18px; height: 18px; accent-color: ${({ theme }) => theme.primary}; }
    }

    .switch {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-weight: 700;
        input { display: none; }
        span { 
            position: relative; padding-left: 45px;
            &::before {
                content: ''; position: absolute; left: 0; width: 35px; height: 20px;
                background: ${({ theme }) => theme.softBg}; border-radius: 20px; border: 1px solid ${({ theme }) => theme.borderColor};
            }
            &::after {
                content: ''; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px;
                background: ${({ theme }) => theme.text}55; border-radius: 50%; transition: 0.2s;
            }
        }
        input:checked + span::before { background: ${({ theme }) => theme.primary};; }
        input:checked + span::after { transform: translateX(15px); background: white; }
    }

    button.primary {
        margin-top: 10px;
        background: ${({ theme }) => theme.primary};
        color: white;
        padding: 15px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        font-size: 16px;
        box-shadow: 0 10px 20px ${({ theme }) => theme.primary}44;
    }
`;

const PreviewContainer = styled.div`
    .sticky { position: sticky; top: 30px; display: flex; flex-direction: column; gap: 15px; }
    h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; opacity: 0.7; }
`;

const FiscalLayout = styled.div`
    .form-card {
        background: ${({ theme }) => theme.cardBg};
        padding: 40px;
        border-radius: 20px;
        border: 1px solid ${({ theme }) => theme.borderColor}55;
        max-width: 800px;
        margin: 0 auto;
        h3 { margin: 0 0 10px; font-size: 22px; }
        p { margin: 0 0 30px; opacity: 0.6; }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .field {
            display: flex;
            flex-direction: column;
            gap: 8px;
            label { font-size: 13px; font-weight: 700; opacity: 0.8; }
            input, select {
                padding: 12px;
                border-radius: 10px;
                background: ${({ theme }) => theme.softBg};
                border: 1px solid ${({ theme }) => theme.borderColor};
                color: ${({ theme }) => theme.text};
                font-weight: 600;
                &:focus { border-color: ${({ theme }) => theme.primary}; outline: none; }
            }
        }
        .logo-flex {
            display: flex;
            align-items: center;
            gap: 20px;
            background: ${({ theme }) => theme.softBg};
            padding: 20px;
            border-radius: 15px;
            border: 1px dashed ${({ theme }) => theme.borderColor};
        }
        .logo-preview-container {
            width: 100px;
            height: 100px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid ${({ theme }) => theme.borderColor};
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
        }
        .logo-placeholder-empty {
            width: 100px;
            height: 100px;
            background: ${({ theme }) => theme.cardBg};
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0.5;
            border: 1px dashed ${({ theme }) => theme.borderColor};
            span { font-size: 10px; margin-top: 5px; }
        }
        .upload-controls {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            p { font-size: 11px; margin: 0; opacity: 0.5; }
        }
        .upload-btn {
            background: ${({ theme }) => theme.primary}22;
            color: ${({ theme }) => theme.primary};
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            width: fit-content;
            transition: all 0.2s;
            &:hover { background: ${({ theme }) => theme.primary}; color: white; }
        }
        button.primary {
            background: ${({ theme }) => theme.primary};
            color: white;
            padding: 15px 30px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 800;
            border: none;
            cursor: pointer;
        }
    }
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $connected }) => $connected ? '#2ecc7122' : '#e74c3c22'};
    color: ${({ $connected }) => $connected ? '#2ecc71' : '#e74c3c'};
    border: 1px solid ${({ $connected }) => $connected ? '#2ecc7144' : '#e74c3c44'};
`;

const ServiceWarning = styled.div`
    background: ${({ theme }) => theme.danger}11;
    border: 1px solid ${({ theme }) => theme.danger}33;
    padding: 25px;
    border-radius: 15px;
    display: flex;
    gap: 20px;
    margin: 20px 0;
    .icon { font-size: 32px; }
    .text {
        flex: 1;
        h4 { margin: 0 0 5px; color: ${({ theme }) => theme.danger}; }
        p { margin: 0 0 15px; font-size: 14px; opacity: 0.8; }
        .actions {
            display: flex;
            gap: 10px;
            button {
                padding: 10px 18px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .download-btn {
                background: ${({ theme }) => theme.primary};
                color: white;
                border: none;
                &:hover { opacity: 0.9; transform: translateY(-2px); }
            }
            .retry-btn {
                background: transparent;
                border: 1px solid ${({ theme }) => theme.borderColor};
                color: ${({ theme }) => theme.text};
                &:hover { background: ${({ theme }) => theme.softBg}; }
            }
        }
    }
`;

const DownloadLink = styled.a`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    background: ${({ theme }) => theme.softBg};
    color: ${({ theme }) => theme.primary};
    border: 1px solid ${({ theme }) => theme.primary}33;
    text-decoration: none;
    transition: all 0.2s;
    &:hover { background: ${({ theme }) => theme.primary}; color: white; transform: translateY(-2px); }
`;
