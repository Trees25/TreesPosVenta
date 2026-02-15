import { create } from "zustand";

export const useVentaStore = create((set, get) => ({
    carrito: [],
    idCaja: null,
    cliente: null,
    descuentoValor: 0,
    descuentoTipo: "monto", // "monto" | "porcentaje"

    setCaja: (id) => set({ idCaja: id }),
    setCliente: (cliente) => set({ cliente }),
    setDescuento: (valor, tipo) => set({ descuentoValor: valor, descuentoTipo: tipo }),

    agregarProducto: (producto) => {
        const { carrito } = get();
        const index = carrito.findIndex((item) => item.id === producto.id);

        if (index !== -1) {
            const nuevoCarrito = [...carrito];
            nuevoCarrito[index].cantidad += 1;
            nuevoCarrito[index].total = nuevoCarrito[index].cantidad * nuevoCarrito[index].precio_venta;
            set({ carrito: nuevoCarrito });
        } else {
            set({
                carrito: [
                    ...carrito,
                    {
                        ...producto,
                        cantidad: 1,
                        total: producto.precio_venta,
                    },
                ],
            });
        }
    },

    quitarProducto: (id) => {
        set({
            carrito: get().carrito.filter((item) => item.id !== id),
        });
    },

    actualizarCantidad: (id, cantidad) => {
        const nuevoCarrito = get().carrito.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    cantidad: Math.max(1, cantidad),
                    total: Math.max(1, cantidad) * item.precio_venta,
                };
            }
            return item;
        });
        set({ carrito: nuevoCarrito });
    },

    limpiarCarrito: () => set({
        carrito: [],
        cliente: null,
        descuentoValor: 0,
        descuentoTipo: "monto"
    }),

    getNeto: () => {
        return get().carrito.reduce((acc, item) => acc + item.total, 0);
    },

    getDescuentoCalculado: () => {
        const { descuentoValor, descuentoTipo } = get();
        const neto = get().getNeto();
        if (descuentoTipo === "monto") return parseFloat(descuentoValor);
        return (neto * parseFloat(descuentoValor)) / 100;
    },

    getTotal: () => {
        const neto = get().getNeto();
        const desc = get().getDescuentoCalculado();
        return Math.max(0, neto - desc);
    },
}));
