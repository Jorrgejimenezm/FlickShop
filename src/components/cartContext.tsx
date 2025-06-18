import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product } from '../services/productsService';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

type CartItem = {
    product: Product;
    quantity: number;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number, quantity?: number) => void;
    incrementItem: (product: Product) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    reloadCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Obtener ID de usuario desde el token
    const getUserIdFromToken = (): string | undefined => {
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        try {
            const decoded = jwtDecode<{ "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string }>(token);
            return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        } catch (error) {
            console.error("Error decoding token", error);
            return undefined;
        }
    };

    // Cargar carrito desde cookie
    useEffect(() => {
        const userId = getUserIdFromToken();
        let storedCart: string | null = null;

        if (userId) {
            storedCart = Cookies.get(`cart-${userId}`) ?? null;
        } else {
            storedCart = localStorage.getItem('cart');
        }

        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Error parsing stored cart", e);
            }
        }

        setIsInitialized(true);
    }, []);

    // Guardar carrito cuando cambie, solo después de carga inicial
    useEffect(() => {
        if (!isInitialized) return;

        const userId = getUserIdFromToken();
        const cartString = JSON.stringify(cartItems);

        if (userId) {
            Cookies.set(`cart-${userId}`, cartString, { expires: 7 });
        } else {
            localStorage.setItem('cart', cartString);
        }
    }, [cartItems, isInitialized]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId: number, quantity?: number) => {
        setCartItems(prev => {
            return prev.flatMap(item => {
                if (item.product.id !== productId) {
                    return [item];
                }

                if (quantity === undefined || item.quantity <= quantity) {                   
                    return [];
                }

                return [{ ...item, quantity: item.quantity - quantity }];
            });
        });
    };

    const incrementItem = (product: Product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };



    const clearCart = () => {
        setCartItems([]);
    };

    const reloadCart = () => {
        const userId = getUserIdFromToken();
        let storedCart: string | null = null;

        if (userId) {
            storedCart = Cookies.get(`cart-${userId}`) ?? null;
        } else {
            storedCart = localStorage.getItem('cart');
        }

        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Error parsing stored cart", e);
            }
        } else {
            setCartItems([]);
        }
    };


    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, incrementItem, clearCart, totalItems, totalPrice, reloadCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook personalizado
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
};
