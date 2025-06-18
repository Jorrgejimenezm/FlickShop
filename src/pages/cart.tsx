import { useCart } from '../components/cartContext';
import { Link } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";
import orderService, { type OrderDto } from '../services/orderService';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import styles from '../css/cart.module.css';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenPayload {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
    "Apellido"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    Telefono?: string;
    Direccion?: string;
}

const getUserDataFromToken = (): { fullName: string, email: string, telefono?: string, direccion?: string } | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        const nombre = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
        const apellido = decoded["Apellido"] || "";
        const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
        const telefono = decoded.Telefono;
        const direccion = decoded.Direccion;

        return {
            fullName: `${nombre} ${apellido}`.trim(),
            email,
            telefono,
            direccion
        };
    } catch (error) {
        console.error("Error decoding token", error);
        return null;
    }
}

const CartPage = () => {
    const { cartItems, removeFromCart, incrementItem, clearCart, totalPrice } = useCart();
    const [showModal, setShowModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        const userData = getUserDataFromToken();
        if (userData) {
            if (userData.telefono && !phoneNumber) {
                const telefonoConPrefijo = /^\+/.test(userData.telefono)
                    ? userData.telefono
                    : `+34 ${userData.telefono}`;
            setPhoneNumber(telefonoConPrefijo);
            }
            if (userData.direccion && !shippingAddress) {
                setShippingAddress(userData.direccion);
            }
        }
    }, []);

    const handleProceedToPayment = () => {
        setShowModal(true);
    };

    const shippingCost = totalPrice < 50 && totalPrice > 0 ? 2.99 : 0;
    const finalTotal = totalPrice + shippingCost;

    if (cartItems.length === 0) {
        return (
            <motion.div
                className={styles.emptyCartContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className={styles.emptyCartTitle}>Tu carrito está vacío 🛒</h3>
                <p className={styles.emptyCartSubtitle}>Parece que no has añadido nada todavía.</p>
                <Link to="/products" className={styles.emptyCartButton}>
                    <i className="bi bi-cart-plus me-2"></i>
                    Ir a comprar
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={styles.cartPageContainer}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={styles.title}>Mi carrito</h2>

            <div className={styles.cartContent}>
                {/* Lista de productos */}
                <div className={styles.cartItems}>
                    <AnimatePresence>
                        {cartItems.map(item => (
                            <motion.div
                                key={item.product.id}
                                className={styles.cartItem}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.productInfo}>
                                    <img
                                        src={item.product.imageUrl || '/placeholder.png'}
                                        alt={item.product.name}
                                        className={styles.productImage}
                                    />
                                    <div className={styles.productDetails}>
                                        <h4 className={styles.productName}>{item.product.name}</h4>
                                        {item.product.description && (
                                            <p className={styles.productDescription}>{item.product.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.productActions}>
                                    <div className={styles.price}>{item.product.price.toFixed(2)}€</div>

                                    <div className={styles.quantityControl}>
                                        <button
                                            className={styles.quantityButton}
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    removeFromCart(item.product.id, 1);
                                                }
                                            }}
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantity}>{item.quantity}</span>
                                        <button
                                            className={styles.quantityButton}
                                            onClick={() => {
                                                if(item.quantity < item.product.stock){
                                                    incrementItem(item.product);
                                                }
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <motion.button
                                        className={styles.binButton}
                                        onClick={() => removeFromCart(item.product.id)}
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        whileTap={{ scale: 0.9 }}
                                        aria-label={`Eliminar ${item.product.name} del carrito`}
                                    >
                                        <svg
                                            className={styles.binTop}
                                            viewBox="0 0 39 7"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4" />
                                            <line x1="12" y1="1.5" x2="26.0357" y2="1.5" stroke="white" strokeWidth="3" />
                                        </svg>
                                        <svg
                                            className={styles.binBottom}
                                            viewBox="0 0 33 39"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <mask id="path-1-inside-1_8_19" fill="white">
                                                <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
                                            </mask>
                                            <path
                                                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                                fill="white"
                                                mask="url(#path-1-inside-1_8_19)"
                                            />
                                            <path d="M12 6L12 29" stroke="white" strokeWidth="4" />
                                            <path d="M21 6V29" stroke="white" strokeWidth="4" />
                                        </svg>
                                    </motion.button>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Resumen del pedido */}
                <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>{totalPrice.toFixed(2)}€</span>
                    </div>
                    {shippingCost > 0 && (
                        <div className={styles.summaryRow}>
                            <span>Gastos de envío:</span>
                            <span>{shippingCost.toFixed(2)}€</span>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <strong>Total:</strong>
                        <strong>{finalTotal.toFixed(2)}€</strong>
                    </div>
                    <button className={styles.checkoutButton} onClick={handleProceedToPayment}>
                        <i className="bi bi-shield-lock"></i> Proceder al pago
                    </button>
                </div>
            </div>

            {/* Modal para datos de envío */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton closeVariant="white" className={styles.modalHeader}>
                    <Modal.Title className={styles.modalTitle}>Datos de envío</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <i className="bi bi-telephone"></i> Teléfono:
                        </label>
                        <div className={styles.inputGroup}>
                            <div style={{ width: '100%', maxWidth: '120px' }}>
                                <Select
                                    options={[
                                        { value: '+34', label: '🇪🇸' },
                                        { value: '+1', label: '🇺🇸' },
                                        { value: '+44', label: '🇬🇧' },
                                        { value: '+49', label: '🇩🇪' },
                                        { value: '+33', label: '🇫🇷' },
                                        { value: '+52', label: '🇲🇽' },
                                        { value: '+57', label: '🇨🇴' },
                                        { value: '+55', label: '🇧🇷' },
                                        { value: '+81', label: '🇯🇵' },
                                        { value: '+61', label: '🇦🇺' },
                                        { value: '+91', label: '🇮🇳' },
                                    ]}
                                    value={{
                                        value: phoneNumber.split(' ')[0] || '+34',
                                        label: (() => {
                                            const prefix = phoneNumber.split(' ')[0] || '+34';
                                            const flagMap: { [key: string]: string } = {
                                                '+34': '🇪🇸',
                                                '+1': '🇺🇸',
                                                '+44': '🇬🇧',
                                                '+49': '🇩🇪',
                                                '+33': '🇫🇷',
                                                '+52': '🇲🇽',
                                                '+57': '🇨🇴',
                                                '+55': '🇧🇷',
                                                '+81': '🇯🇵',
                                                '+61': '🇦🇺',
                                                '+91': '🇮🇳',
                                            };
                                            return flagMap[prefix] || '🇪🇸';
                                        })()
                                    }}
                                    onChange={(selected) => {
                                        const number = phoneNumber.replace(/^\+\d+\s*/, '');
                                        setPhoneNumber(`${selected?.value} ${number}`);
                                    }}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '38px',
                                            fontSize: '18px',
                                            zIndex: 1000,
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            fontSize: '18px',
                                            zIndex: 9999,
                                        }),
                                        option: (base) => ({
                                            ...base,
                                            fontSize: '18px',
                                        }),
                                    }}
                                    isSearchable={false}
                                />
                            </div>
                            <input
                                type="text"
                                className={styles.formControl}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Número"
                                maxLength={15}
                                value={phoneNumber.replace(/^\+\d+\s*/, '')}
                                onChange={(e) => {
                                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 15);
                                    const prefix = phoneNumber.split(' ')[0] || '+34';
                                    setPhoneNumber(`${prefix} ${onlyDigits}`);
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <i className="bi bi-geo"></i> Dirección de envío:
                        </label>
                        <input
                            type="text"
                            className={styles.formControl}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            minLength={4}
                        />
                    </div>

                    <div className={styles.paypalSection}>
                        <PayPalButtons
                            style={{ layout: "vertical" }}
                            forceReRender={[finalTotal, phoneNumber, shippingAddress]}
                            disabled={!phoneNumber.trim() || !shippingAddress.trim() || shippingAddress.length < 5}
                            createOrder={(_, actions: any) => {
                                return actions.order.create({
                                    purchase_units: [{ amount: { value: finalTotal.toFixed(2) } }],
                                });
                            }}
                            onApprove={async (_, actions: any) => {
                                try {
                                    const details = await actions.order.capture();
                                    const userData = getUserDataFromToken();
                                    if (!userData) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: 'No se pudo obtener la información del usuario.',
                                        });
                                        return;
                                    }

                                    const order: Partial<OrderDto> = {
                                        customer_name: userData.fullName,
                                        customer_email: userData.email,
                                        phone_number: " " + phoneNumber,
                                        shipping_address: shippingAddress,
                                        total_price: finalTotal,
                                        order_date: new Date().toISOString(),
                                        shipped: false,
                                        products: cartItems.map(item => ({
                                            id: item.product.id,
                                            name: item.product.name,
                                            description: item.product.description,
                                            price: item.product.price,
                                            quantity: item.quantity,
                                            imageUrl: item.product.imageUrl || ""
                                        }))
                                    };

                                    await orderService.createOrder(order);

                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Pago completado',
                                        text: `Gracias por tu compra, ${details.payer.name.given_name}!`,
                                    });

                                    clearCart();
                                    setShowModal(false);

                                } catch (error) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: 'Hubo un problema al crear la orden. Por favor, intenta de nuevo.',
                                    });
                                    console.error('Error creando la orden:', error);
                                }
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                        <i className="bi bi-x-circle me-2" />Cancelar
                    </button>
                </Modal.Footer>
            </Modal>

        </motion.div>
    );
};

export default CartPage;