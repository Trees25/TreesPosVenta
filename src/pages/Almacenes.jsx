import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { AlmacenService } from "../services/AlmacenService";
import { SucursalService } from "../services/SucursalService";
import { EmpresaService } from "../services/EmpresaService";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Icon } from "@iconify/react";

export const Almacenes = () => {
    const { profile } = useAuthStore();
    const navigate = useNavigate();
    const [almacenes, setAlmacenes] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(1);

    useEffect(() => {
        if (profile?.empresa?.id) fetchData();
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const empresaId = profile.empresa.id;
            const planId = profile.empresa.id_plan || 1;

            const [aData, sData, restrictions] = await Promise.all([
                AlmacenService.getAlmacenesByEmpresa(empresaId),
                SucursalService.getSucursalesByEmpresa(empresaId),
                EmpresaService.getPlanRestrictions(planId)
            ]);

            setAlmacenes(aData);
            setSucursales(sData);

            // Límite de almacenes: 1 para Base, 3 para Premium (según requerimiento)
            const maxAlm = restrictions.find(r => r.clave === 'max_almacenes')?.valor || (planId === 1 ? "1" : "3");
            setLimit(parseInt(maxAlm));

        } catch (error) {
            console.error(error);
            toast.error("Error al cargar almacenes");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (almacenes.length >= limit) {
            const { isConfirmed } = await Swal.fire({
                title: "Límite alcanzado",
                text: "Tu plan actual no permite agregar más almacenes. ¡Cámbiate a Premium para tener múltiples depósitos!",
                icon: "warning",
                confirmButtonText: "Ver Planes",
                showCancelButton: true,
            });
            if (isConfirmed) navigate("/planes");
            return;
        }

        if (sucursales.length === 0) {
            toast.error("Debes crear al menos una sucursal primero");
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Almacén',
            html: `
                <div style="text-align: left; margin-top: 10px;">
                    <label style="font-weight: bold; font-size: 14px;">Nombre del Almacén</label>
                    <input id="alm-nombre" class="swal2-input" placeholder="Ej: Depósito Central, Salón Ventas..." style="margin-top: 5px;">
                    
                    <label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Sucursal Asociada</label>
                    <select id="alm-sucursal" class="swal2-input" style="margin-top: 5px; width: 100%; box-sizing: border-box;">
                        <option value="">-- Sin asignar sucursal --</option>
                        ${sucursales.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                    </select>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const idSuc = document.getElementById('alm-sucursal').value;
                return {
                    nombre: document.getElementById('alm-nombre').value,
                    id_sucursal: idSuc ? parseInt(idSuc) : null
                }
            }
        });

        if (formValues && formValues.nombre) {
            try {
                await AlmacenService.insertAlmacen({
                    nombre: formValues.nombre,
                    id_sucursal: parseInt(formValues.id_sucursal),
                    id_empresa: profile.empresa.id
                });
                toast.success("Almacén creado");
                fetchData();
            } catch (error) {
                toast.error("Error al crear almacén");
            }
        }
    };

    const handleEdit = async (almacen) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Almacén',
            html: `
                <div style="text-align: left; margin-top: 10px;">
                    <label style="font-weight: bold; font-size: 14px;">Nombre del Almacén</label>
                    <input id="alm-nombre" class="swal2-input" placeholder="Nombre" value="${almacen.nombre}" style="margin-top: 5px;">
                    
                    <label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Sucursal Asociada</label>
                    <select id="alm-sucursal" class="swal2-input" style="margin-top: 5px; width: 100%; box-sizing: border-box;">
                        ${sucursales.map(s => `<option value="${s.id}" ${s.id === almacen.id_sucursal ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                    </select>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('alm-nombre').value,
                    id_sucursal: document.getElementById('alm-sucursal').value
                }
            }
        });

        if (formValues && formValues.nombre) {
            try {
                await AlmacenService.updateAlmacen(almacen.id, {
                    nombre: formValues.nombre,
                    id_sucursal: parseInt(formValues.id_sucursal)
                });
                toast.success("Almacén actualizado");
                fetchData();
            } catch (error) {
                toast.error("Error al actualizar");
            }
        }
    };

    const handleDelete = async (almacen) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminarás el almacén "${almacen.nombre}". Si tiene stock asociado, podrías perder la trazabilidad.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await AlmacenService.deleteAlmacen(almacen.id);
                toast.success("Almacén eliminado");
                fetchData();
            } catch (error) {
                toast.error("No se puede eliminar un almacén con stock registrado");
            }
        }
    };

    if (loading) return <Loading>Cargando Almacenes...</Loading>;

    return (
        <Container>
            <header className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <div>
                        <h1>Maestro de Almacenes 📦</h1>
                        <p>Gestiona tus depósitos y puntos de almacenamiento</p>
                    </div>
                </div>
                <button className="add-btn" onClick={handleAdd}>+ Nuevo Almacén</button>
            </header>

            <PlanBadge className="glass">
                <Icon icon="mdi:shield-star" />
                <span>Plan Actual: <strong>{limit > 1 ? 'Premium' : 'Base'}</strong></span>
                <span className="sep">|</span>
                <span>Almacenes: <strong>{almacenes.length} / {limit}</strong></span>
            </PlanBadge>

            <Grid>
                {almacenes.map(a => (
                    <Card key={a.id} className="glass animate-up">
                        <IconContainer>
                            <Icon icon="mdi:warehouse" />
                        </IconContainer>
                        <CardBody>
                            <h3>{a.nombre}</h3>
                            <p className="suc">
                                <Icon icon="mdi:store-outline" />
                                Sucursal: {a.sucursales?.nombre || 'General'}
                            </p>
                            <div className="status">
                                <span className="tag">Punto de Acopio</span>
                            </div>
                        </CardBody>
                        <Actions>
                            <button onClick={() => handleEdit(a)} title="Editar">
                                <Icon icon="mdi:pencil-outline" />
                            </button>
                            <button className="del" onClick={() => handleDelete(a)} title="Eliminar">
                                <Icon icon="mdi:delete-outline" />
                            </button>
                        </Actions>
                    </Card>
                ))}

                {almacenes.length === 0 && (
                    <EmptyState className="glass animate-fade">
                        <Icon icon="mdi:package-variant-closed" />
                        <h3>Sin Almacenes</h3>
                        <p>No has registrado ningún almacén todavía.</p>
                        <button onClick={handleAdd}>Crear mi primer almacén</button>
                    </EmptyState>
                )}
            </Grid>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    max-width: 1200px;
    margin: 0 auto;
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        h1 { margin: 0; font-size: 28px; font-weight: 900; }
        p { margin: 5px 0 0; color: ${({ theme }) => theme.text}66; font-size: 14px; font-weight: 600; }
        .add-btn {
            background: ${({ theme }) => theme.primary};
            color: white;
            padding: 12px 24px;
            border-radius: 14px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 20px ${({ theme }) => theme.primary}33;
            transition: all 0.2s;
            &:hover { transform: translateY(-2px); box-shadow: 0 15px 30px ${({ theme }) => theme.primary}44; }
        }
    }
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
    &:hover { background: ${({ theme }) => theme.primary}22; border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); }
`;

const PlanBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 25px;
    border-radius: 18px;
    margin-bottom: 30px;
    border: 1px solid ${({ theme }) => theme.primary}22;
    background: ${({ theme }) => theme.primary}08;
    svg { font-size: 20px; color: ${({ theme }) => theme.primary}; }
    span { font-size: 15px; font-weight: 600; }
    strong { color: ${({ theme }) => theme.primary}; font-weight: 800; }
    .sep { color: ${({ theme }) => theme.text}22; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 25px;
`;

const Card = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 25px;
    border-radius: 24px;
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.borderColor}33;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
        border-color: ${({ theme }) => theme.primary}66;
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    }
`;

const IconContainer = styled.div`
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.primary}11;
    color: ${({ theme }) => theme.primary};
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
`;

const CardBody = styled.div`
    flex: 1;
    h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; }
    .suc { 
        display: flex; align-items: center; gap: 6px; 
        font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.text}88;
        margin-bottom: 12px;
        svg { font-size: 16px; }
    }
    .status {
        .tag {
            background: ${({ theme }) => theme.primary}08;
            color: ${({ theme }) => theme.primary};
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid ${({ theme }) => theme.primary}22;
        }
    }
`;

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    button {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid ${({ theme }) => theme.borderColor}44;
        background: ${({ theme }) => theme.softBg};
        color: ${({ theme }) => theme.text}aa;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: all 0.2s;
        &:hover {
            background: ${({ theme }) => theme.primary}11;
            color: ${({ theme }) => theme.primary};
            border-color: ${({ theme }) => theme.primary}44;
        }
        &.del:hover {
            color: #ff4757;
            background: #ff475711;
            border-color: #ff475744;
        }
    }
`;

const EmptyState = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    border-radius: 30px;
    border: 2px dashed ${({ theme }) => theme.borderColor}44;
    svg { font-size: 64px; color: ${({ theme }) => theme.borderColor}; margin-bottom: 20px; }
    h3 { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
    p { color: ${({ theme }) => theme.text}66; margin-bottom: 30px; font-weight: 600; }
    button {
        background: ${({ theme }) => theme.primary};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 800;
        border: none;
        cursor: pointer;
    }
`;

const Loading = styled.div` height: 80vh; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${({ theme }) => theme.primary}; `;
