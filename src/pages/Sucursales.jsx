import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { SucursalService } from "../services/SucursalService";
import { EmpresaService } from "../services/EmpresaService";
import { AlmacenService } from "../services/AlmacenService";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Sucursales = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [sucursales, setSucursales] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(1);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const eData = await EmpresaService.getEmpresaByUserId(user.id);
            setEmpresa(eData);
            if (eData) {
                const planId = eData.id_plan || 1;
                const [sData, restrictions] = await Promise.all([
                    SucursalService.getSucursalesByEmpresa(eData.id),
                    EmpresaService.getPlanRestrictions(planId)
                ]);
                setSucursales(sData);

                // Buscar el límite de sucursales
                const maxSuc = restrictions.find(r => r.clave === 'max_sucursales')?.valor || "1";
                setLimit(parseInt(maxSuc));
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar sucursales");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const canAdd = await SucursalService.canAddSucursal(empresa.id, empresa.id_plan);
            if (!canAdd) {
                const { isConfirmed } = await Swal.fire({
                    title: "Límite alcanzado",
                    text: "Tu plan actual no permite agregar más sucursales. ¡Actualiza a Premium!",
                    icon: "warning",
                    confirmButtonText: "Ver Planes",
                    showCancelButton: true,
                });

                if (isConfirmed) {
                    navigate("/planes");
                }
                return;
            }

            // Obtener almacenes de la empresa que no tengan sucursal asignada
            const allAlmacenes = await AlmacenService.getAlmacenesByEmpresa(empresa.id);
            const availableAlmacenes = allAlmacenes.filter(a => !a.id_sucursal);

            if (availableAlmacenes.length === 0) {
                const { isConfirmed } = await Swal.fire({
                    title: "Almacén Requerido",
                    text: "Para crear una sucursal, primero debes tener un almacén libre (sin sucursal asignada) en el Maestro de Almacenes.",
                    icon: "info",
                    confirmButtonText: "Ir a Almacenes",
                    showCancelButton: true,
                });

                if (isConfirmed) {
                    navigate("/inventario/almacenes");
                }
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Nueva Sucursal',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <label style="font-weight: bold; font-size: 14px;">Nombre de la sucursal</label>
                        <input id="swal-input1" class="swal2-input" placeholder="Ej: Sucursal Centro" style="margin-top: 5px; width: 100%; box-sizing: border-box;">
                        
                        <label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Dirección</label>
                        <input id="swal-input2" class="swal2-input" placeholder="Ej: Av. Siempreviva 123" style="margin-top: 5px; width: 100%; box-sizing: border-box;">
                        
                        <label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Vincular Almacén</label>
                        <select id="swal-select-alm" class="swal2-input" style="margin-top: 5px; width: 100%; box-sizing: border-box;">
                            <option value="">-- Seleccionar almacén disponible --</option>
                            ${availableAlmacenes.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}
                        </select>
                        <p style="font-size: 12px; color: #666; margin-top: 5px;">Cada sucursal debe tener un almacén asignado para el stock.</p>
                    </div>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const nombre = document.getElementById('swal-input1').value;
                    const idAlmacen = document.getElementById('swal-select-alm').value;
                    if (!nombre) {
                        Swal.showValidationMessage('El nombre es obligatorio');
                        return false;
                    }
                    if (!idAlmacen) {
                        Swal.showValidationMessage('Debes seleccionar un almacén');
                        return false;
                    }
                    return [
                        nombre,
                        document.getElementById('swal-input2').value,
                        idAlmacen
                    ];
                }
            });

            if (formValues && formValues[0]) {
                const nuevaSucursal = await SucursalService.insertSucursal({
                    nombre: formValues[0],
                    direccion: formValues[1],
                    id_empresa: empresa.id
                });

                if (nuevaSucursal) {
                    // Actualizar el almacén con el ID de la nueva sucursal
                    await AlmacenService.updateAlmacen(formValues[2], {
                        id_sucursal: nuevaSucursal.id
                    });
                    toast.success("Sucursal y almacén vinculados exitosamente");
                }

                fetchData();
            }
        } catch (error) {
            toast.error("Error al agregar sucursal");
        }
    };

    const handleEdit = async (sucursal) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Sucursal',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${sucursal.nombre}">` +
                `<input id="swal-input2" class="swal2-input" placeholder="Dirección" value="${sucursal.direccion || ''}">`,
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ]
            }
        });

        if (formValues && formValues[0]) {
            try {
                await SucursalService.updateSucursal(sucursal.id, {
                    nombre: formValues[0],
                    direccion: formValues[1]
                });
                toast.success("Sucursal actualizada");
                fetchData();
            } catch (error) {
                toast.error("Error al actualizar");
            }
        }
    };

    return (
        <Container>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Sucursales 🏢</h1>
                </div>
                <button className="add-btn" onClick={handleAdd}>+ Nueva Sucursal</button>
            </header>

            <PlanInfo className="glass">
                <p>Plan Actual: <strong>{limit > 1 ? 'Premium' : 'Base'}</strong></p>
                <p>Sucursales: <strong>{sucursales.length} / {limit}</strong></p>
            </PlanInfo>

            <Grid>
                {sucursales.map(s => (
                    <Card key={s.id} className="glass animate-scale">
                        <h3>{s.nombre}</h3>
                        <p>📍 {s.direccion || "Sin dirección"}</p>
                        <Actions>
                            <button title="Editar Sucursal" onClick={() => handleEdit(s)}>✏️</button>
                            {/* Eliminación deshabilitada por seguridad según pedido del usuario */}
                        </Actions>
                    </Card>
                ))}
                {sucursales.length === 0 && <p>No hay sucursales registradas.</p>}
            </Grid>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        .add-btn {
            background: ${({ theme }) => theme.primary};
            color: white;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 700;
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
    &:hover {
        background: ${({ theme }) => theme.primary}22;
        border-color: ${({ theme }) => theme.primary};
        transform: scale(1.05);
    }
`;

const PlanInfo = styled.div`
    margin-bottom: 30px;
    padding: 20px;
    border-radius: 15px;
    display: flex;
    gap: 30px;
    border: 1px solid ${({ theme }) => theme.primary}44;
    p {
        font-size: 16px;
        strong { color: ${({ theme }) => theme.primary}; }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
`;

const Card = styled.div`
    padding: 25px;
    border-radius: 20px;
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.borderColor};
    h3 { margin-bottom: 10px; color: ${({ theme }) => theme.text}; }
    p { color: ${({ theme }) => theme.text}aa; font-size: 14px; margin-bottom: 20px; }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    button {
        padding: 8px;
        border-radius: 8px;
        background: ${({ theme }) => theme.softBg};
        &.del { &:hover { background: #ff5e5722; } }
    }
`;

const Loading = styled.div` height: 80vh; display: flex; align-items: center; justify-content: center; font-weight: 700; `;
