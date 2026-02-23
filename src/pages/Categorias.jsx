import styled from "styled-components";
import { useState, useEffect } from "react";
import { CategoriaService } from "../services/CategoriaService";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../supabase";
import { Icon } from "@iconify/react";

export const Categorias = () => {
    const { user, profile } = useAuthStore();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const selectedIcon = watch("icono");

    const ICONS = [
        { name: 'Comida', icon: 'mdi:food' },
        { name: 'Bebidas', icon: 'mdi:bottle-soda' },
        { name: 'Bebidas Alcohol', icon: 'mdi:glass-wine' },
        { name: 'Frutas', icon: 'mdi:fruit-grapes' },
        { name: 'Vegetales', icon: 'mdi:corn' },
        { name: 'Carnicería', icon: 'mdi:food-steak' },
        { name: 'Panadería', icon: 'mdi:bread-slice' },
        { name: 'Lácteos', icon: 'mdi:cow' },
        { name: 'Congelados', icon: 'mdi:snowflake' },
        { name: 'Limpieza', icon: 'mdi:broom' },
        { name: 'Higiene', icon: 'mdi:hand-wash' },
        { name: 'Mascotas', icon: 'mdi:paw' },
        { name: 'Hogar', icon: 'mdi:home' },
        { name: 'Electrónica', icon: 'mdi:television' },
        { name: 'Juguetes', icon: 'mdi:toy-brick' },
        { name: 'Ferretería', icon: 'mdi:hammer' },
        { name: 'Farmacia', icon: 'mdi:pill' },
        { name: 'Snacks', icon: 'mdi:cookie' },
        { name: 'Kiosco', icon: 'mdi:candy' }
    ];

    useEffect(() => {
        if (user && profile) fetchCategorias();
    }, [user, profile]);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const empresaId = profile?.id_empresa || profile?.empresa?.id;

            if (empresaId) {
                console.log("Fetching categories for empresa:", empresaId);
                const data = await CategoriaService.listarCategorias(empresaId);
                setCategorias(data || []);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
            toast.error("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const empresaId = profile?.empresa?.id;
            if (!empresaId) throw new Error("No se encontró empresa");
            const payload = {
                ...data,
                id_empresa: empresaId,
                icono: data.icono || 'mdi:folder'
            };

            if (editingId) {
                await CategoriaService.actualizarCategoria(editingId, payload);
                toast.success("Categoría actualizada");
            } else {
                await CategoriaService.insertarCategoria(payload);
                toast.success("Categoría creada");
            }

            handleClose();
            fetchCategorias();
        } catch (error) {
            toast.error("Error al guardar categoría");
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setValue("nombre", cat.nombre);
        setValue("icono", cat.icono);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "¿Eliminar categoría?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff6a00",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await CategoriaService.eliminarCategoria(id);
                toast.success("Categoría eliminada");
                fetchCategorias();
            } catch (error) {
                toast.error("Error al eliminar categoría");
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        reset();
    };

    return (
        <Container>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Categorías</h1>
                </div>
                <AddBtn onClick={() => setShowModal(true)}>+ Nueva Categoría</AddBtn>
            </Header>

            <Grid>
                {loading ? (
                    <p>Cargando...</p>
                ) : categorias.length > 0 ? (
                    categorias.map((cat) => (
                        <CatCard key={cat.id} className="glass">
                            <div className="icon">
                                {(() => {
                                    const rawIcon = cat.icono || "";
                                    const iconTrimmed = rawIcon.trim();

                                    if (!iconTrimmed) return "📁";

                                    if (iconTrimmed.includes(":")) {
                                        return <Icon icon={iconTrimmed} width="40" height="40" />;
                                    }

                                    return iconTrimmed; // Emoji case
                                })()}
                            </div>
                            <h3>{cat.nombre}</h3>
                            <Actions>
                                <button onClick={() => handleEdit(cat)}>Editar</button>
                                <button className="del" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                            </Actions>
                        </CatCard>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>📂</div>
                        <h3>No se encontraron categorías</h3>
                        <p>Las categorías configuradas por el administrador aparecerán aquí.</p>
                    </div>
                )}
            </Grid>

            {showModal && (
                <ModalOverlay>
                    <Modal className="glass">
                        <h2>{editingId ? "Editar" : "Nueva"} Categoría</h2>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <InputGroup>
                                <label>Nombre</label>
                                <input {...register("nombre", { required: true })} placeholder="Ej: Bebidas" />
                            </InputGroup>
                            <InputGroup>
                                <label>Seleccionar Icono</label>
                                <IconGrid>
                                    {ICONS.map((item) => (
                                        <IconOption
                                            key={item.icon}
                                            type="button"
                                            $active={selectedIcon === item.icon}
                                            onClick={() => setValue("icono", item.icon)}
                                            title={item.name}
                                        >
                                            <Icon icon={item.icon} width="24" height="24" />
                                        </IconOption>
                                    ))}
                                </IconGrid>
                                <input {...register("icono")} type="hidden" />
                            </InputGroup>
                            <ModalActions>
                                <button type="button" onClick={handleClose}>Cancelar</button>
                                <button type="submit" className="primary">Guardar</button>
                            </ModalActions>
                        </form>
                    </Modal>
                </ModalOverlay>
            )}
        </Container>
    );
};

// ... Estilos simplificados (Container, Header, Grid, CatCard, Modal, etc.)
const Container = styled.div`
    padding: 40px 5%;
`;

const HomeBtn = styled(Link)`
    background: ${({ theme }) => theme.softBg};
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.borderColor}44;
    text-decoration: none;
    font-size: 20px;
    transition: all 0.2s;
    &:hover {
        background: ${({ theme }) => theme.primary}22;
        border-color: ${({ theme }) => theme.primary};
        transform: scale(1.05);
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const AddBtn = styled.button`
    background: ${({ theme }) => theme.primary};
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
`;

const CatCard = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.borderColor};
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    h3 {
        margin: 15px 0;
    }
    .icon {
        font-size: 40px;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
    button {
        font-size: 13px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 8px;
        background: ${({ theme }) => theme.softBg};
        color: ${({ theme }) => theme.text};
        &.del {
            background: ${({ theme }) => theme.danger}22;
            color: ${({ theme }) => theme.danger};
        }
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.cardBg};
    padding: 40px;
    border-radius: 24px;
    width: 100%;
    max-width: 400px;
    border: 1px solid ${({ theme }) => theme.borderColor};
    h2 {
        margin-bottom: 30px;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    label {
        font-size: 13px;
        font-weight: 600;
    }
    input {
        background: ${({ theme }) => theme.softBg};
        border: 1px solid ${({ theme }) => theme.borderColor};
        padding: 12px;
        border-radius: 8px;
        color: ${({ theme }) => theme.text};
    }
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
    button {
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        &.primary {
            background: ${({ theme }) => theme.primary};
            color: white;
            border: none;
        }
    }
`;

const IconGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    padding: 5px;
    background: ${({ theme }) => theme.softBg};
    border-radius: 12px;
`;

const IconOption = styled.button`
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: ${({ $active, theme }) => $active ? theme.primary : 'transparent'};
    color: ${({ $active, theme }) => $active ? 'white' : theme.text};
    border: 1px solid ${({ $active, theme }) => $active ? theme.primary : theme.borderColor}66;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        background: ${({ $active, theme }) => $active ? theme.primary : theme.primary + '22'};
        border-color: ${({ theme }) => theme.primary};
    }
`;
