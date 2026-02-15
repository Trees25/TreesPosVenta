import styled from "styled-components";
import { useState, useEffect } from "react";
import { DashboardService } from "../services/DashboardService";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from "sonner";

const COLORS = ['#ff6a00', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'];

export const Dashboard = () => {
    const { user } = useAuthStore();
    const [metrics, setMetrics] = useState(null);
    const [chartVentas, setChartVentas] = useState([]);
    const [chartTopProd, setChartTopProd] = useState([]);
    const [chartCategorias, setChartCategorias] = useState([]);
    const [chartMetodos, setChartMetodos] = useState([]);
    const [periodo, setPeriodo] = useState(7); // Días
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user, periodo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: uDatas, error: uError } = await supabase.from("usuarios").select("id_empresa").eq("id_auth", user.id).limit(1);

            if (uError) throw uError;
            const usuario = uDatas?.[0];

            if (!usuario) {
                toast.error("No se encontró perfil de usuario. Registra tu empresa primero.");
                setLoading(false);
                return;
            }

            const idEmpresa = usuario.id_empresa;
            if (!idEmpresa) {
                toast.error("Usuario no vinculado a ninguna empresa.");
                setLoading(false);
                return;
            }

            const fechaFin = new Date().toISOString().split('T')[0];
            const fechaInicio = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const [m, c, top, cats, mets] = await Promise.all([
                DashboardService.obtenerMétricas(idEmpresa, fechaInicio, fechaFin),
                DashboardService.obtenerVentasPorDia(idEmpresa, periodo),
                DashboardService.obtenerTopProductos(idEmpresa, fechaInicio, fechaFin),
                DashboardService.obtenerVentasPorCategoria(idEmpresa, fechaInicio, fechaFin),
                DashboardService.obtenerVentasPorMetodo(idEmpresa, fechaInicio, fechaFin)
            ]);

            setMetrics(m);
            setChartTopProd(top);
            setChartCategorias(cats);
            setChartMetodos(mets);
            setChartVentas(c || []);
        } catch (error) {
            console.error("Dashboard error:", error);
            toast.error("Error al cargar dashboard: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading>Analizando tu éxito...</Loading>;

    return (
        <Container>
            <header className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Panel de Control 📊</h1>
                </div>
                <p>Análisis en tiempo real de tu éxito empresarial</p>
            </header>

            <MetricsGrid>
                <MetricCard className="glass animate-scale" style={{ animationDelay: "0.1s" }}>
                    <div className="label">Total Ventas</div>
                    <div className="value">${metrics?.totalVentas?.toLocaleString()}</div>
                    <div className="trend success">Crecimiento Orgánico</div>
                </MetricCard>
                <MetricCard className="glass animate-scale" style={{ animationDelay: "0.2s" }}>
                    <div className="label">Ganancias Brutas</div>
                    <div className="value primary">${metrics?.ganancias?.toLocaleString()}</div>
                    <div className="trend secondary">Margen optimizado</div>
                </MetricCard>
                <MetricCard className="glass animate-scale" style={{ animationDelay: "0.3s" }}>
                    <div className="label">Items Vendidos</div>
                    <div className="value">{metrics?.totalProductos}</div>
                    <div className="trend warning">Inventario dinámico</div>
                </MetricCard>
            </MetricsGrid>

            <MainGrid>
                <ChartSection className="glass animate-up" style={{ gridArea: 'ventas' }}>
                    <div className="section-header">
                        <h3>Histórico de Ventas</h3>
                        <FilterBox>
                            <button className={periodo === 7 ? "active" : ""} onClick={() => setPeriodo(7)}>7d</button>
                            <button className={periodo === 30 ? "active" : ""} onClick={() => setPeriodo(30)}>30d</button>
                            <button className={periodo === 365 ? "active" : ""} onClick={() => setPeriodo(365)}>1 año</button>
                        </FilterBox>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartVentas}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ff6a00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                                <YAxis stroke="#888" fontSize={11} tickFormatter={(val) => `$${val}`} />
                                <Tooltip contentStyle={{ background: '#1c1c1c', border: 'none', borderRadius: '10px' }} />
                                <Area type="monotone" dataKey="ventas" stroke="#ff6a00" strokeWidth={3} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartSection>

                <ChartSection className="glass animate-up" style={{ gridArea: 'top' }}>
                    <h3>Top 5 Productos</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartTopProd} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="nombre" type="category" stroke="#888" fontSize={10} width={80} />
                                <Tooltip contentStyle={{ background: '#1c1c1c', border: 'none' }} />
                                <Bar dataKey="cantidad" fill="#ff6a00" radius={[0, 5, 5, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartSection>

                <ChartSection className="glass animate-up" style={{ gridArea: 'cats' }}>
                    <h3>Ventas por Categoría</h3>
                    <div className="chart-container flex">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartCategorias}
                                    dataKey="total"
                                    nameKey="categoria"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                >
                                    {chartCategorias.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartSection>

                <ChartSection className="glass animate-up" style={{ gridArea: 'mets' }}>
                    <h3>Métodos de Pago</h3>
                    <div className="chart-container flex">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartMetodos}
                                    dataKey="total"
                                    nameKey="metodo"
                                    outerRadius={80}
                                >
                                    {chartMetodos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartSection>
            </MainGrid>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    min-height: 100vh;
    header {
        margin-bottom: 40px;
        h1 {
            font-size: 36px;
            font-weight: 900;
            background: linear-gradient(90deg, #fff, #ff6a00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            filter: drop-shadow(0 2px 10px rgba(255, 106, 0, 0.2));
        }
        p {
            color: ${({ theme }) => theme.text}66;
            font-size: 18px;
        }
    }
`;

const Loading = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: 800;
    color: ${({ theme }) => theme.primary};
    letter-spacing: -1px;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
`;

const MetricCard = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.borderColor}33;
    padding: 32px;
    border-radius: 32px;
    backdrop-filter: blur(10px);
    .label {
        font-size: 13px;
        font-weight: 700;
        color: ${({ theme }) => theme.text}66;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
    }
    .value {
        font-size: 42px;
        font-weight: 900;
        &.primary {
            color: ${({ theme }) => theme.primary};
        }
    }
    .trend {
        font-size: 12px;
        margin-top: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 20px;
        display: inline-block;
        &.success {
            background: #2ecc7122;
            color: #2ecc71;
        }
        &.secondary {
            background: #3498db22;
            color: #3498db;
        }
        &.warning {
            background: #f1c40f22;
            color: #f1c40f;
        }
    }
`;

const MainGrid = styled.div`
    display: grid;
    grid-template-areas:
        "ventas ventas top"
        "cats mets top";
    grid-template-columns: 1fr 1fr 350px;
    grid-template-rows: auto auto;
    gap: 24px;
    @media (max-width: 1200px) {
        grid-template-areas: "ventas ventas" "cats mets" "top top";
        grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 768px) {
        grid-template-areas: "ventas" "top" "cats" "mets";
        grid-template-columns: 1fr;
    }
`;

const ChartSection = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border: 1px solid ${({ theme }) => theme.borderColor}33;
    padding: 28px;
    border-radius: 32px;
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
    }
    .chart-container {
        height: 300px;
        &.flex {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 250px;
        }
    }
`;

const FilterBox = styled.div`
    display: flex;
    gap: 8px;
    background: ${({ theme }) => theme.softBg};
    padding: 4px;
    border-radius: 12px;
    button {
        padding: 6px 12px;
        border: none;
        background: transparent;
        color: ${({ theme }) => theme.text}88;
        font-size: 12px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        &.active {
            background: ${({ theme }) => theme.primary};
            color: white;
            box-shadow: 0 4px 10px ${({ theme }) => theme.primary}44;
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

