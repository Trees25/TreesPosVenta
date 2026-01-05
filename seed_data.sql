DO $$
DECLARE
    v_id_empresa INT := 26; -- <--- REEMPLACE CON SU ID DE EMPRESA AQUÍ
    v_categoria_id INT;
    v_proveedor_id INT;
    v_counter INT;
BEGIN
    -- 0. Limpiar datos existentes (En orden para evitar errores de FK)
    -- ADVERTENCIA: Esto borrará datos reales si se ejecuta en producción.
    
    -- Limpiar detalle_venta (hijo de ventas y productos)
    -- Eliminamos los detalles de ventas de las sucursales de la empresa O que referencien a productos de la empresa
    BEGIN
        DELETE FROM detalle_venta WHERE id_venta IN (
            SELECT id FROM ventas WHERE id_sucursal IN (
                SELECT id FROM sucursales WHERE id_empresa = v_id_empresa
            )
        ) OR id_producto IN (
            SELECT id FROM productos WHERE id_empresa = v_id_empresa
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error al intentar borrar detalle_venta. Puede que la tabla no exista o tenga otro nombre.';
    END;

    -- Limpiar ventas (hijo de sucursales y clientes)
    BEGIN
        DELETE FROM ventas WHERE id_sucursal IN (
            SELECT id FROM sucursales WHERE id_empresa = v_id_empresa
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error al intentar borrar ventas.';
    END;

    -- Limpiar stock
    BEGIN
        DELETE FROM stock WHERE id_almacen IN (
            SELECT id FROM almacenes WHERE id_sucursal IN (
                SELECT id FROM sucursales WHERE id_empresa = v_id_empresa
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo eliminar stock o la tabla no existe/no es accesible directamente';
    END;

    DELETE FROM productos WHERE id_empresa = v_id_empresa;
    DELETE FROM clientes_proveedores WHERE id_empresa = v_id_empresa AND tipo IN ('cliente', 'proveedor');
    DELETE FROM categorias WHERE id_empresa = v_id_empresa;

    -- 1. Insertar Categorías (5 registros)
    FOR v_counter IN 1..5 LOOP
        INSERT INTO categorias (nombre, id_empresa, icono, color)
        VALUES (
            'Categoría ' || v_counter,
            v_id_empresa,
            '-',
            '#F44336'
        );
    END LOOP;

    -- 2. Insertar Proveedores (5 registros)
    FOR v_counter IN 1..5 LOOP
        INSERT INTO clientes_proveedores (
            nombres, id_empresa, direccion, telefono, email, 
            identificador_nacional, identificador_fiscal, tipo
        )
        VALUES (
            'Proveedor ' || v_counter,
            v_id_empresa,
            'Dirección Prov ' || v_counter,
            '555-000' || v_counter,
            'proveedor' || v_counter || '@email.com',
            'NIT-P-' || v_counter,
            'FISCAL-P-' || v_counter,
            'proveedor'
        );
    END LOOP;

    -- 3. Insertar Clientes (100 registros)
    FOR v_counter IN 1..100 LOOP
        INSERT INTO clientes_proveedores (
            nombres, id_empresa, direccion, telefono, email, 
            identificador_nacional, identificador_fiscal, tipo
        )
        VALUES (
            'Cliente ' || v_counter,
            v_id_empresa,
            'Dirección CLI ' || v_counter,
            '999-000' || v_counter,
            'cliente' || v_counter || '@email.com',
            'DNI-C-' || v_counter,
            NULL,
            'cliente'
        );
    END LOOP;

    -- 4. Insertar Productos (1000 registros)
    FOR v_counter IN 1..1000 LOOP
        -- Seleccionar una categoría y proveedor aleatorios de los recién insertados (o existentes)
        SELECT id INTO v_categoria_id FROM categorias WHERE id_empresa = v_id_empresa ORDER BY RANDOM() LIMIT 1;
        SELECT id INTO v_proveedor_id FROM clientes_proveedores WHERE id_empresa = v_id_empresa AND tipo = 'proveedor' ORDER BY RANDOM() LIMIT 1;

        INSERT INTO productos (
            nombre, 
            precio_venta, 
            precio_compra, 
            codigo_barras, 
            codigo_interno, 
            id_empresa, 
            id_categoria, 
            id_proveedor, 
            sevende_por, 
            maneja_inventarios
        )
        VALUES (
            'Producto ' || v_counter,
            (random() * 100 + 10)::numeric(10,2), -- Precio venta entre 10 y 110
            (random() * 50 + 5)::numeric(10,2),   -- Precio compra entre 5 y 55
            'BAR' || floor(random() * 1000000)::text,
            'INT' || floor(random() * 1000000)::text,
            v_id_empresa,
            v_categoria_id,
            v_proveedor_id,
            'UNIDAD',
            true -- maneja_inventarios
        );
    END LOOP;

RAISE NOTICE 'Datos semilla insertados correctamente.';
END $$;
