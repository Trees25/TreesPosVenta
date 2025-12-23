-- Insertar Empresa (ID 1)
INSERT INTO public.empresa (id, nombre, id_fiscal, direccion_fiscal, correo, id_auth)
VALUES (1, 'Empresa Demo', '20123456789', 'Av. Principal 123', 'contacto@empresa.com', 'user_id_placeholder')
ON CONFLICT (id) DO NOTHING;

-- Insertar 10 Categorias (IDs 1-10) vinculadas a la Empresa 1
INSERT INTO public.categorias (id, nombre, id_empresa, color, icono) VALUES
(1, 'Herramientas', 1, '#FF5733', '🔨'),
(2, 'Construccion', 1, '#33FF57', '🧱'),
(3, 'Pinturas', 1, '#3357FF', '🎨'),
(4, 'Electricidad', 1, '#F3FF33', '⚡'),
(5, 'Fontaneria', 1, '#FF33F3', '🚰'),
(6, 'Jardineria', 1, '#33FFF3', '🌻'),
(7, 'Maderas', 1, '#8B4513', '🪵'),
(8, 'Metales', 1, '#708090', '🔩'),
(9, 'Maquinaria', 1, '#FF4500', '🚜'),
(10, 'Acabados', 1, '#DA70D6', '🏠')
ON CONFLICT (id) DO NOTHING;

-- Ajustar secuencias para que los proximos inserts no fallen
SELECT setval('public.empresa_id_seq', (SELECT MAX(id) FROM public.empresa));
SELECT setval('public.categorias_id_seq', (SELECT MAX(id) FROM public.categorias));
