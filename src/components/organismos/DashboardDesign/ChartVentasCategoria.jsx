import styled from "styled-components";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useThemeStore } from "../../../store/ThemeStore";
import { useMostrarVentasXCategoriaQuery } from "../../../tanstack/ReportesStack";

export const ChartVentasCategoria = () => {
    const { data, isLoading } = useMostrarVentasXCategoriaQuery();
    const { dataempresa } = useEmpresaStore();
    const { themeStyle } = useThemeStore();

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

    if (isLoading) return <LoadingContainer>Cargando categorías...</LoadingContainer>;
    if (!data || data.length === 0) return <EmptyContainer>No hay datos de ventas por categoría para este periodo</EmptyContainer>;

    return (
        <Container>
            <Header>
                <Title>Ventas por Categoría</Title>
            </Header>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="categoria"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: themeStyle.text, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" radius={[0, 10, 10, 0]}>
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Container>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    const { dataempresa } = useEmpresaStore();
    if (active && payload && payload.length) {
        return (
            <TooltipContainer>
                <Label>{label}</Label>
                <Value>
                    {FormatearNumeroDinero(
                        payload[0].value,
                        dataempresa?.currency,
                        dataempresa?.iso
                    )}
                </Value>
            </TooltipContainer>
        );
    }
    return null;
};

const Container = styled.div`
  padding: 20px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  padding: 50px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const EmptyContainer = styled.div`
  padding: 50px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  opacity: 0.6;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 10px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxshadow};
`;

const Label = styled.div`
  font-size: 14px;
`;

const Value = styled.div`
  font-size: 16px;
  font-weight: bold;
`;
