import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { PersonalService } from "../services/PersonalService";
import { EmpresaService } from "../services/EmpresaService";
import { SucursalService } from "../services/SucursalService"; // Añadido
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export const GestionUsuarios = () => {
    const { user } = useAuthStore();
    const [personal, setPersonal] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [sucursales, setSucursales] = useState([]); // Añadido
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const eData = await EmpresaService.getEmpresaByUserId(user.id);
            console.log("Cargando empresa para personal:", eData);
            setEmpresa(eData);
            if (eData) {
                const [pData, mData, sData] = await Promise.all([
                    PersonalService.getPersonalByEmpresa(eData.id),
                    PersonalService.getModulos(),
                    SucursalService.getSucursalesByEmpresa(eData.id) // Cargar sucursales
                ]);
                // Filtrar el usuario actual de la lista para no verse a sí mismo
                const filteredPersonal = pData.filter(p => p.id_auth !== user.id);
                setPersonal(filteredPersonal);
                setModulos(mData);
                setSucursales(sData);
            }
        } catch (error) {
            toast.error("Error al cargar personal");
        } finally {
            setLoading(false);
        }
    };

    const handleCrearEmpleado = async () => {
        try {
            if (!empresa?.id) {
                throw new Error("No se pudo identificar tu empresa. Por favor, recarga la página.");
            }

            if (sucursales.length === 0) {
                return Swal.fire({
                    title: "Sin Sucursales",
                    text: "Debes crear al menos una sucursal antes de invitar personal.",
                    icon: "info",
                    confirmButtonText: "Ir a Sucursales",
                    showCancelButton: true
                }).then((res) => {
                    if (res.isConfirmed) {
                        // Navegar a sucursales si fuera necesario, o simplemente cerrar
                    }
                });
            }

            const { isConfirmed } = await Swal.fire({
                title: 'Registrar Nuevo Empleado',
                html: `
                    <input id="swal-input1" class="swal2-input" placeholder="Nombre completo">
                    <input id="swal-input-email" class="swal2-input" placeholder="Correo Electrónico">
                    <input id="swal-input3" class="swal2-input" type="password" placeholder="Contraseña">
                    <div style="margin-top: 15px; text-align: left; padding: 0 20px;">
                        <label style="font-size: 14px; color: #666;">Seleccionar Sucursal:</label>
                        <select id="swal-input5" class="swal2-input" style="margin-top: 5px;">
                            ${sucursales.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-top: 10px; text-align: left; padding: 0 20px;">
                        <label style="font-size: 14px; color: #666;">Rol:</label>
                        <select id="swal-input4" class="swal2-input" style="margin-top: 5px;">
                            <option value="vendedor">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Crear Cuenta',
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    const nombres = document.getElementById('swal-input1').value;
                    const email = document.getElementById('swal-input-email').value;
                    const password = document.getElementById('swal-input3').value;
                    const rol = document.getElementById('swal-input4').value;
                    const id_sucursal = document.getElementById('swal-input5').value;

                    if (!nombres || !email || !password || !id_sucursal) {
                        Swal.showValidationMessage('Todos los campos son obligatorios');
                        return false;
                    }

                    // 1. Validar límites de sucursal
                    try {
                        const canAdd = await PersonalService.canAddPersonalToBranch(empresa.id, id_sucursal, empresa.id_plan);
                        if (!canAdd) {
                            Swal.showValidationMessage('Esta sucursal ya tiene el máximo de empleados permitidos por tu plan.');
                            return false;
                        }
                    } catch (err) {
                        Swal.showValidationMessage('Error al validar límites');
                        return false;
                    }

                    // 2. Ejecutar creación
                    try {
                        await PersonalService.crearEmpleado({
                            nombres,
                            email,
                            password,
                            rol,
                            id_empresa: empresa.id,
                            id_sucursal: parseInt(id_sucursal)
                        });
                        return true;
                    } catch (error) {
                        Swal.showValidationMessage(`Error: ${error.message}`);
                        return false;
                    }
                }
            });

            if (isConfirmed) {
                toast.success('Empleado registrado con éxito');
                // Pequeño retraso para que el trigger de Supabase termine (aunque ya no hay trigger, es buena práctica)
                setTimeout(fetchData, 500);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al procesar el registro");
        }
    };

    const handlePermisos = async (empleado) => {
        const checkMap = {};
        (empleado.permisos || []).forEach(p => checkMap[p.id_modulo] = true);

        const { value: selectedModulos } = await Swal.fire({
            title: `Permisos para ${empleado.nombres}`,
            html: `
                <div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px;">
                    ${modulos.map(m => `
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" value="${m.id}" ${checkMap[m.id] ? 'checked' : ''} class="swal-perm-check"> ${m.nombre}
                        </label>
                    `).join('')}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Permisos',
            preConfirm: () => {
                const checks = document.querySelectorAll('.swal-perm-check:checked');
                return Array.from(checks).map(c => parseInt(c.value));
            }
        });

        if (selectedModulos !== undefined) {
            try {
                await PersonalService.actualizarPermisos(empleado.id, selectedModulos);
                toast.success("Permisos actualizados");
                fetchData();
            } catch (error) {
                toast.error("Error al guardar permisos");
            }
        }
    };

    const handleEditar = async (empleado) => {
        const { value: formValues } = await Swal.fire({
            title: `Editar Empleado: ${empleado.nombres}`,
            html: `
                <input id="swal-edit1" class="swal2-input" placeholder="Nombre completo" value="${empleado.nombres}">
                <div style="margin-top: 15px; text-align: left; padding: 0 20px;">
                    <label style="font-size: 14px; color: #666;">Rol:</label>
                    <select id="swal-edit2" class="swal2-input" style="margin-top: 5px;">
                        <option value="vendedor" ${empleado.rol === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                        <option value="admin" ${empleado.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div style="margin-top: 15px; text-align: left; padding: 0 20px;">
                    <label style="font-size: 14px; color: #666;">Asignar a Sucursal:</label>
                    <select id="swal-edit3" class="swal2-input" style="margin-top: 5px;">
                        ${sucursales.map(s => `<option value="${s.id}" ${s.id === empleado.id_sucursal ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            preConfirm: () => {
                const nombres = document.getElementById('swal-edit1').value;
                const rol = document.getElementById('swal-edit2').value;
                const id_sucursal = document.getElementById('swal-edit3').value;
                if (!nombres || !rol || !id_sucursal) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }
                return { nombres, rol, id_sucursal };
            }
        });

        if (formValues) {
            try {
                await toast.promise(
                    PersonalService.actualizarEmpleado({
                        ...formValues,
                        id_usuario: empleado.id,
                        id_auth: empleado.id_auth
                    }),
                    {
                        loading: 'Actualizando datos...',
                        success: 'Empleado actualizado con éxito',
                        error: (err) => 'Error: ' + err.message
                    }
                );
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleToggleEstado = async (empleado) => {
        const nuevoEstado = empleado.estado === 'activo' ? 'inactivo' : 'activo';
        try {
            await PersonalService.cambiarEstado(empleado.id, nuevoEstado);
            toast.success(`Cuenta ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'}`);
            fetchData();
        } catch (error) {
            toast.error("Error al cambiar estado");
        }
    };

    const handleEliminar = async (empleado) => {
        if (empleado.id_auth === user.id) {
            toast.error("No puedes eliminar tu propia cuenta de administrador");
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminarás permanentemente a ${empleado.nombres}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await PersonalService.eliminarEmpleado(empleado.id, empleado.id_auth);
                toast.success("Empleado eliminado");
                fetchData();
            } catch (error) {
                toast.error("Error al eliminar");
            }
        }
    };

    if (loading) return <Loading>Cargando personal...</Loading>;

    return (
        <Container>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Gestión de Personal 👥</h1>
                </div>
                <button className="add-btn" onClick={handleCrearEmpleado}>+ Invitar Personal</button>
            </header>

            <TableContainer className="glass animate-up">
                <table>
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Email</th>
                            <th>Sucursal</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Permisos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {personal.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div className="name-cell">
                                        <div className="avatar">{p.nombres?.charAt(0)}</div>
                                        <span>{p.nombres}</span>
                                    </div>
                                </td>
                                <td>{p.email}</td>
                                <td>
                                    {sucursales.find(s => s.id === p.id_sucursal)?.nombre || "Sin Asignar"}
                                </td>
                                <td>
                                    <Badge className={p.rol}>{p.rol}</Badge>
                                </td>
                                <td>
                                    <span className={`status ${p.estado}`}>{p.estado}</span>
                                </td>
                                <td>
                                    <div className="perm-bubbles">
                                        {p.permisos?.length > 0 ? (
                                            p.permisos.map(perm => {
                                                const mod = modulos.find(m => m.id === (perm.id_modulo || perm.modulos?.id));
                                                return <span key={mod?.id} className="bubble">{mod?.nombre}</span>;
                                            })
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '12px' }}>Sin accesos</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Actions>
                                        <button title="Editar Datos" onClick={() => handleEditar(p)}>✏️</button>
                                        <button title="Editar Permisos" onClick={() => handlePermisos(p)}>🔑</button>
                                        <button
                                            title={p.estado === 'activo' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                            onClick={() => handleToggleEstado(p)}
                                        >
                                            {p.estado === 'activo' ? '🚫' : '✅'}
                                        </button>
                                        <button title="Eliminar Empleado" onClick={() => handleEliminar(p)}>🗑️</button>
                                    </Actions>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableContainer>
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
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 700;
            box-shadow: 0 10px 20px -5px ${({ theme }) => theme.primary}66;
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
    &:hover { transform: scale(1.05); }
`;

const TableContainer = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.borderColor};
    table {
        width: 100%;
        border-collapse: collapse;
        th { text-align: left; padding: 20px; background: rgba(0,0,0,0.2); color: ${({ theme }) => theme.primary}; font-size: 13px; text-transform: uppercase; }
        td { padding: 15px 20px; border-bottom: 1px solid ${({ theme }) => theme.borderColor}22; vertical-align: middle; }
    }
    .name-cell { display: flex; align-items: center; gap: 12px; .avatar { width: 32px; height: 32px; background: ${({ theme }) => theme.primary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; } }
    .status { font-size: 12px; text-transform: capitalize; &.activo { color: #4caf50; } &.inactivo { color: #f44336; } }
    .perm-bubbles { display: flex; flex-wrap: wrap; gap: 5px; .bubble { background: rgba(255,106,0,0.1); color: #ff6a00; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(255,106,0,0.2); } }
`;

const Badge = styled.span`
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    &.admin { background: #6c5ce7; color: white; }
    &.vendedor { background: #00b894; color: white; }
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
    button { background: ${({ theme }) => theme.softBg}; padding: 8px; border-radius: 8px; border: 1px solid ${({ theme }) => theme.borderColor}22; &:hover { background: ${({ theme }) => theme.primary}22; } }
`;

const Loading = styled.div` height: 80vh; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${({ theme }) => theme.primary}; `;
