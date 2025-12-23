-- BLOQUE ANONIMO PARA MANEJAR LOGICA Y EVITAR ERRORES
DO $$
DECLARE
    -- >>>>>>>>>>>> PON TU UID AQUI ABAJO EN LUGAR DE 'TU_UID_AQUI' <<<<<<<<<<<<
    v_uid text := 'TU_UID_AQUI'; 
    -- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
    v_user_id bigint;
BEGIN
    -- 0. Asegurar que existe la EMPRESA (ID 26)
    -- Esto es necesario para que las sucursales no fallen por FK
    INSERT INTO public.empresa (id, nombre, id_fiscal, direccion_fiscal, correo, id_auth)
    VALUES (26, 'Empresa Demo', '20123456789', 'Av. Principal 123', 'contacto@empresa.com', 'user_id_placeholder')
    ON CONFLICT (id) DO NOTHING;

    -- 0.1 Insertar 10 Categorias (IDs 1-10) vinculadas a la Empresa 26
    INSERT INTO public.categorias (id, nombre, id_empresa, color, icono) VALUES
    (1, 'Herramientas', 26, '#FF5733', '🔨'),
    (2, 'Construccion', 26, '#33FF57', '🧱'),
    (3, 'Pinturas', 26, '#3357FF', '🎨'),
    (4, 'Electricidad', 26, '#F3FF33', '⚡'),
    (5, 'Fontaneria', 26, '#FF33F3', '🚰'),
    (6, 'Jardineria', 26, '#33FFF3', '🌻'),
    (7, 'Maderas', 26, '#8B4513', '🪵'),
    (8, 'Metales', 26, '#708090', '🔩'),
    (9, 'Maquinaria', 26, '#FF4500', '🚜'),
    (10, 'Acabados', 26, '#DA70D6', '🏠')
    ON CONFLICT (id) DO NOTHING;
    PERFORM setval('public.categorias_id_seq', (SELECT MAX(id) FROM public.categorias));

    -- 1. Insertar ROL (Super Admin)
    INSERT INTO public.roles (id, nombre) VALUES (1, 'Super Admin') ON CONFLICT (id) DO NOTHING;

    -- 2. Obtener o Crear USUARIO
    -- Buscamos si ya existe el usuario con ese UID
    SELECT id INTO v_user_id FROM public.usuarios WHERE id_auth = v_uid;

    IF v_user_id IS NULL THEN
        -- Si no existe, lo creamos
        INSERT INTO public.usuarios (nombres, id_rol, correo, id_auth, estado) 
        VALUES ('Administrador', 1, 'admin@demo.com', v_uid, 'ACTIVO')
        RETURNING id INTO v_user_id;
    ELSE
        -- Si existe, le actualizamos el Rol a Admin por si acaso
        UPDATE public.usuarios SET id_rol = 1 WHERE id = v_user_id;
        RAISE NOTICE 'Usuario ya existe con ID: %, se usará este.', v_user_id;
    END IF;

    -- 3. Insertar SUCURSAL (De la empresa 26)
    INSERT INTO public.sucursales (id, nombre, id_empresa, delete) 
    VALUES (1, 'Sucursal Principal', 26, false)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insertar ALMACEN (Para controlar stock)
    INSERT INTO public.almacen (id, nombre, id_sucursal, "default", delete)
    VALUES (1, 'Almacen General', 1, true, false)
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insertar CAJA (De la sucursal 1)
    INSERT INTO public.caja (id, descripcion, id_sucursal, delete) 
    VALUES (1, 'Caja Principal', 1, false)
    ON CONFLICT (id) DO NOTHING;

    -- 6. ASIGNAR Usuario -> Sucursal -> Caja
    -- Borramos asignaciones previas de este usuario para evitar duplicadados o conflictos
    DELETE FROM public.asignacion_sucursal WHERE id_usuario = v_user_id;
    
    -- Insertamos la nueva asignación
    INSERT INTO public.asignacion_sucursal (id_sucursal, id_usuario, id_caja) 
    VALUES (1, v_user_id, 1);

    -- Ajustamos secuencias
    PERFORM setval('public.roles_id_seq', (SELECT MAX(id) FROM public.roles));
    PERFORM setval('public.usuarios_id_seq', (SELECT MAX(id) FROM public.usuarios));
    PERFORM setval('public.sucursales_id_seq', (SELECT MAX(id) FROM public.sucursales));
    PERFORM setval('public.almacen_id_seq', (SELECT MAX(id) FROM public.almacen));
    PERFORM setval('public.caja_id_seq', (SELECT MAX(id) FROM public.caja));
    PERFORM setval('public.asignacion_sucursal_id_seq', (SELECT MAX(id) FROM public.asignacion_sucursal));

END $$;
