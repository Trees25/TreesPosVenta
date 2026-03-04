import styled from "styled-components";
import { useState, useEffect } from "react";
import { DocumentoService } from "../services/DocumentoService";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export const ConfigurarPlantillas = () => {
    const { profile } = useAuthStore();
    const [tipos, setTipos] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        if (profile?.id_empresa) fetchInitialData();
    }, [profile]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [tiposList, plantillasList] = await Promise.all([
                DocumentoService.listarTiposComprobantes(),
                DocumentoService.listarPlantillas(profile.id_empresa)
            ]);
            setTipos(tiposList);
            setPlantillas(plantillasList);
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
        if (plantilla) {
            setEditContent(JSON.stringify(plantilla.contenido_json, null, 2));
        } else {
            // Default template if none exists
            const defaultTemplate = {
                header: "NOMBRE DE TU EMPRESA",
                subheader: "Dirección - Teléfono",
                footer: "Gracias por su compra",
                showLogo: true,
                fields: ["nombre", "cantidad", "subtotal"]
            };
            setEditContent(JSON.stringify(defaultTemplate, null, 2));
        }
    };

    const handleSave = async () => {
        try {
            let json;
            try {
                json = JSON.parse(editContent);
            } catch (e) {
                return toast.error("Error en el formato JSON");
            }

            const existing = plantillas.find(p => p.id_tipo_comprobante === selectedTipo.id);

            const data = {
                id_empresa: profile.id_empresa,
                id_tipo_comprobante: selectedTipo.id,
                nombre: `Plantilla ${selectedTipo.nombre}`,
                contenido_json: json,
                es_defecto: true
            };

            if (existing) data.id = existing.id;

            await DocumentoService.guardarPlantilla(data);
            toast.success("Plantilla guardada correctamente");
            fetchInitialData();
        } catch (error) {
            toast.error("Error al guardar: " + error.message);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>;

    return (
        <Container className="animate-fade">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/" style={{ fontSize: '24px', textDecoration: 'none' }}>🏠</Link>
                    <h1>Diseño de Comprobantes</h1>
                </div>
                <button className="primary" onClick={handleSave}>
                    <Icon icon="mdi:content-save" /> Guardar Cambios
                </button>
            </header>

            <Layout>
                <Sidebar>
                    <h3>Tipos de Documento</h3>
                    {tipos.map(t => (
                        <TipoCard
                            key={t.id}
                            active={selectedTipo?.id === t.id}
                            onClick={() => handleSelectTipo(t)}
                        >
                            <Icon icon="mdi:file-document-edit-outline" />
                            {t.nombre}
                        </TipoCard>
                    ))}
                </Sidebar>

                <Main>
                    <div className="section-title">
                        <h3>Editor de Plantilla: {selectedTipo?.nombre}</h3>
                        <p>Modifica el formato JSON para personalizar el diseño del comprobante.</p>
                    </div>

                    <EditorContainer>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            spellCheck="false"
                        />
                    </EditorContainer>

                    <PreviewSection>
                        <h3>Previsualización (Próximamente)</h3>
                        <div className="preview-placeholder">
                            Aquí aparecerá una vista previa visual mientras edites el JSON.
                        </div>
                    </PreviewSection>
                </Main>
            </Layout>
        </Container>
    );
};

const Container = styled.div`
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        h1 { margin: 0; font-size: 28px; font-weight: 800; }
        button.primary {
            background: ${({ theme }) => theme.primary};
            color: white;
            padding: 12px 25px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
        }
    }
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 30px;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    h3 { font-size: 14px; opacity: 0.6; text-transform: uppercase; margin-bottom: 15px; }
`;

const TipoCard = styled.div`
    background: ${({ theme, active }) => active ? theme.primary : theme.cardBg};
    color: ${({ theme, active }) => active ? 'white' : theme.text};
    padding: 15px 20px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    border: 1px solid ${({ theme, active }) => active ? theme.primary : theme.borderColor}44;
    &:hover {
        transform: translateX(5px);
        border-color: ${({ theme }) => theme.primary};
    }
`;

const Main = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    .section-title {
        h3 { margin: 0; font-size: 20px; }
        p { margin: 5px 0 0; opacity: 0.7; font-size: 14px; }
    }
`;

const EditorContainer = styled.div`
    flex: 1;
    min-height: 400px;
    textarea {
        width: 100%;
        height: 100%;
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Fira Code', monospace;
        padding: 20px;
        border-radius: 15px;
        border: 1px solid ${({ theme }) => theme.borderColor};
        font-size: 14px;
        line-height: 1.6;
        resize: none;
        outline: none;
        &:focus { border-color: ${({ theme }) => theme.primary}; }
    }
`;

const PreviewSection = styled.div`
    background: ${({ theme }) => theme.softBg};
    border-radius: 15px;
    padding: 20px;
    border: 1px dashed ${({ theme }) => theme.borderColor};
    .preview-placeholder {
        padding: 40px;
        text-align: center;
        opacity: 0.5;
        font-style: italic;
    }
`;
