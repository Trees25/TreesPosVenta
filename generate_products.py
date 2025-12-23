import csv
import random

# Configuration
NUM_PRODUCTS = 1000
OUTPUT_FILE = 'productos_1000.csv'

# Sample data
ADJECTIVES = ['Nuevo', 'Usado', 'Gran', 'Pequeño', 'Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Especial', 'Super', 'Mega', 'Ultra', 'Eco', 'Max']
NOUNS = ['Tornillo', 'Martillo', 'Clavo', 'Sierra', 'Taladro', 'Lija', 'Pintura', 'Brocha', 'Cinta', 'Cable', 'Tubo', 'Manguera', 'Llave', 'Tuerca', 'Arandela', 'Cemento']
CATEGORIES = list(range(1, 11)) # 1 to 10
EMPRESA_ID = 26

def generate_product(i):
    nombre = f"{random.choice(ADJECTIVES)} {random.choice(NOUNS)} {i}"
    # precio_venta between 10 and 500
    precio_venta = round(random.uniform(10.0, 500.0), 2)
    # precio_compra between 50% and 80% of precio_venta
    precio_compra = round(precio_venta * random.uniform(0.5, 0.8), 2)
    
    # Booleans - using lowercase string for PostgreSQL compatibility
    maneja_inventarios = 'true' if random.choice([True, False]) else 'false'
    maneja_multiprecios = 'true' if random.choice([True, False]) else 'false'

    return {
        'nombre': nombre,
        'precio_venta': precio_venta,
        'precio_compra': precio_compra,
        'id_categoria': random.choice(CATEGORIES),
        'codigo_barras': f'779{random.randint(100000000, 999999999)}',
        'codigo_interno': f'INT-{i:04d}',
        'id_empresa': EMPRESA_ID,
        'sevende_por': random.choice(['UNIDAD', 'GRANEL', 'LITRO']) if random.random() > 0.1 else 'UNIDAD',
        'maneja_inventarios': maneja_inventarios,
        'maneja_multiprecios': maneja_multiprecios
    }

def main():
    print(f"Generating {NUM_PRODUCTS} products...")
    
    products = [generate_product(i) for i in range(1, NUM_PRODUCTS + 1)]
    
    headers = [
        'nombre', 'precio_venta', 'precio_compra', 'id_categoria', 
        'codigo_barras', 'codigo_interno', 'id_empresa', 'sevende_por', 
        'maneja_inventarios', 'maneja_multiprecios'
    ]
    
    try:
        with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(products)
        print(f"Successfully generated {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error generating CSV: {e}")

if __name__ == "__main__":
    main()
