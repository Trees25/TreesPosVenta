DROP FUNCTION IF EXISTS buscar_productos_v2(integer, text) CASCADE;

CREATE OR REPLACE FUNCTION buscar_productos_v2(
  _id_empresa INT,
  buscador TEXT
)
RETURNS TABLE (
  id INT,
  nombre TEXT,
  codigo_barras TEXT,
  codigo_interno TEXT,
  precio_venta NUMERIC,
  precio_compra NUMERIC,
  sevende_por TEXT,
  maneja_inventarios BOOLEAN,
  id_categoria INT,
  id_proveedor INT,
  id_empresa INT,
  categoria TEXT,
  proveedor TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    p.codigo_barras,
    p.codigo_interno,
    p.precio_venta,
    p.precio_compra,
    p.sevende_por,
    p.maneja_inventarios,
    p.id_categoria,
    p.id_proveedor,
    p.id_empresa,
    c.nombre as categoria,
    cp.nombres as proveedor
  FROM productos p
  LEFT JOIN categorias c ON p.id_categoria = c.id
  LEFT JOIN clientes_proveedores cp ON p.id_proveedor = cp.id
  WHERE p.id_empresa = _id_empresa
  AND (
      p.nombre ILIKE '%' || buscador || '%' OR
      p.codigo_barras ILIKE '%' || buscador || '%' OR
      p.codigo_interno ILIKE '%' || buscador || '%' OR
      c.nombre ILIKE '%' || buscador || '%' OR
      cp.nombres ILIKE '%' || buscador || '%'
  );
END;
$$;
