import { useEffect, useState } from 'react';
import orderService, { type OrderDto, type ProductDto } from '../services/orderService';
import styles from '../css/myorders.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
    const [selectedTab, setSelectedTab] = useState<'shipped' | 'pending'>('shipped');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await orderService.getMyOrders();
                setOrders(data);
            } catch (err) {
                setError('No tienes ningún pedido pendiente.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleDetails = (id: number) => {
        setExpandedOrderIds((prev) =>
            prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
        );
    };

    const filteredOrders = orders
        .filter(order => selectedTab === 'shipped' ? order.shipped : !order.shipped)
        .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    if (loading) return <p>Cargando pedidos...</p>;

    if (error && orders.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                    <i className="bi bi-box"></i>
                </div>
                <div className={styles.emptyStateTitle}>No tienes ningún pedido pendiente</div>
                <div className={styles.emptyStateText}>Cuando compres productos, aparecerán aquí.</div>
                <button
                    className={styles.browseButton}
                    onClick={() => navigate('/products')}
                >
                    Ir a Productos
                </button>
            </div>
        );
    }

    return (
        <div className={`container ${styles.container}`}>
            <h2 className={styles.title}>Mis Pedidos</h2>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${selectedTab === 'shipped' ? styles.activeTab : ''}`}
                    onClick={() => setSelectedTab('shipped')}
                >
                    <i className="bi bi-truck me-2"></i>Enviados
                </button>
                <button
                    className={`${styles.tab} ${selectedTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setSelectedTab('pending')}
                >
                    <i className="bi bi-clock-history me-2"></i>Pendientes de Envío
                </button>
            </div>

            {/* Orders */}
            <AnimatePresence mode="wait">
                {filteredOrders.length === 0 ? (
                    <motion.div
                        key="empty"
                        className={styles.emptyState}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.emptyStateIcon}>
                            <i className="bi bi-box-seam"></i>
                        </div>
                        <div className={styles.emptyStateTitle}>
                            No hay pedidos {selectedTab === 'shipped' ? 'enviados' : 'pendientes'}
                        </div>
                        <div className={styles.emptyStateText}>
                            Aún no tienes pedidos {selectedTab === 'shipped' ? 'que hayan sido enviados.' : 'pendientes de envío.'}
                        </div>
                        <button
                            className={styles.browseButton}
                            onClick={() => navigate('/products')}
                        >
                            Ir a Productos
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={selectedTab}
                        className="accordion"
                        id="ordersAccordion"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrderIds.includes(order.id);
                            return (
                                <motion.div
                                    className={`accordion-item ${styles.accordionItem}`}
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="accordion-header" id={`heading${order.id}`}>
                                        <button
                                            className={`accordion-button ${!isExpanded ? 'collapsed' : ''} ${styles.accordionButton}`}
                                            type="button"
                                            onClick={() => toggleDetails(order.id)}
                                            aria-expanded={isExpanded}
                                            aria-controls={`collapse${order.id}`}
                                        >
                                            <div className={styles.orderHeaderContent}>
                                                <span className={styles.orderId}>Pedido #{order.id}</span>
                                                <span className={styles.orderDate}>{new Date(order.order_date).toLocaleDateString()}</span>
                                                <span className={styles.orderTotal}>Total: {order.total_price.toFixed(2)}€</span>
                                            </div>
                                        </button>
                                    </h2>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                id={`collapse${order.id}`}
                                                className={`accordion-collapse ${styles.accordionBody}`}
                                                aria-labelledby={`heading${order.id}`}
                                                data-bs-parent="#ordersAccordion"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <p><strong>Email:</strong> {order.customer_email}</p>
                                                <p><strong>Teléfono:</strong> {order.phone_number}</p>
                                                <p><strong>Dirección:</strong> {order.shipping_address}</p>
                                                <p className={styles.status}>
                                                    <strong>Estado:</strong>{' '}
                                                    <span className={order.shipped ? styles.textShipped : styles.textPending}>
                                                        <i className={`bi ${order.shipped ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-1`}></i>
                                                        {order.shipped ? 'Enviado' : 'Pendiente'}
                                                    </span>
                                                </p>
                                                <hr />
                                                <h5>Productos:</h5>
                                                <ul className="list-group mt-2">
                                                    {order.products.map((product: ProductDto) => (
                                                        <li className="list-group-item" key={product.id}>
                                                            <div className={styles.productItem}>
                                                                <div className={styles.productLeft}>
                                                                    <img
                                                                        src={product.imageUrl}
                                                                        alt={product.name}
                                                                        className={styles.productImage}
                                                                    />
                                                                    <div className={styles.productInfo}>
                                                                        <strong>{product.name}</strong>
                                                                        <span className={styles.truncatedDescription}>{product.description}</span>
                                                                    </div>
                                                                </div>
                                                                <div className={styles.productRight}>
                                                                    <div>Precio: <strong>{product.price.toFixed(2)}€</strong></div>
                                                                    <div>Cantidad: <strong>{product.quantity}</strong></div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyOrders;
