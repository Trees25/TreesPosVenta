-- Función para obtener ventas por medio de pago
CREATE OR REPLACE FUNCTION reporte_ventas_metodo_pago(
    _id_empresa INT,
    _fecha_inicio DATE,
    _fecha_fin DATE
)
RETURNS TABLE (
    nombre_metodopago TEXT,
    total_monto NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.nombre::TEXT, 
        SUM(mc.monto)::NUMERIC
    FROM movimientos_caja mc
    JOIN metodos_pago mp ON mc.id_metodo_pago = mp.id
    JOIN ventas v ON mc.id_ventas = v.id
    JOIN sucursales s ON v.id_sucursal = s.id
    WHERE s.id_empresa = _id_empresa
      AND v.fecha >= _fecha_inicio
      AND v.fecha <= _fecha_fin
      AND mc.tipo_movimiento = 'ingreso'
    GROUP BY mp.nombre;
END;
$$;

-- Función para obtener ventas por categoría
CREATE OR REPLACE FUNCTION reporte_ventas_categoria(
    _id_empresa INT,
    _fecha_inicio DATE,
    _fecha_fin DATE
)
RETURNS TABLE (
    categoria TEXT,
    total NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.nombre::TEXT, 
        SUM(dv.total)::NUMERIC
    FROM detalle_venta dv
    JOIN productos p ON dv.id_producto = p.id
    JOIN categorias c ON p.id_categoria = c.id
    JOIN ventas v ON dv.id_venta = v.id
    JOIN sucursales s ON v.id_sucursal = s.id
    WHERE s.id_empresa = _id_empresa
      AND v.fecha >= _fecha_inicio
      AND v.fecha <= _fecha_fin
    GROUP BY c.nombre;
END;
$$;
