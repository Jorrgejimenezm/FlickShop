import { useEffect, useState } from "react";
import orderService, { type OrderDto, type ProductDto } from "../../services/orderService";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import logo from "../../img/fotoPdf.png";
import styles from "../../css/AdminStylePages.module.css";

const OrdersPage = () => {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const [error, setError] = useState("");
    const [showPendingOnly, setShowPendingOnly] = useState(false);

    const loadOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err) {
            setError("Error al cargar los pedidos");
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleViewDetails = (order: OrderDto) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    const generateLabelPdf = async (order: OrderDto) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(order.id.toString());
            const doc = new jsPDF();
            doc.addImage(logo, "PNG", 20, 10, 50, 20);
            doc.setFontSize(18);
            doc.text(`Etiqueta del Pedido #${order.id}`, 80, 20);
            doc.setLineWidth(0.5);
            doc.line(10, 30, 200, 30);
            doc.setFontSize(12);
            doc.text(`Cliente: ${order.customer_name}`, 20, 40);
            doc.text(`Fecha de pedido: ${new Intl.DateTimeFormat("es-ES", {
                day: "2-digit", month: "2-digit", year: "numeric"
            }).format(new Date(order.order_date))}`, 20, 50);
            doc.text(`Dirección: ${order.shipping_address}`, 20, 60);
            doc.text(`Teléfono: ${order.phone_number}`, 20, 70);
            doc.addImage(qrDataUrl, "PNG", 140, 40, 60, 60);
            doc.line(10, 110, 200, 110);
            doc.save(`etiqueta_pedido_${order.id}.pdf`);
        } catch (error) {
            console.error("Error generando el PDF:", error);
        }
    };

    const filteredOrders = showPendingOnly ? orders.filter(order => !order.shipped) : orders;

    return (
        <div>
            <div className={styles["title-container"]}>
                <h2 className={styles.title}>Gestión de Pedidos</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Switch */}
            <div className={styles["switch-wrapper"]}>
                <label className={styles["toggle-wrapper"]}>
                    <input
                        className={styles["toggle-checkbox"]}
                        type="checkbox"
                        checked={showPendingOnly}
                        onChange={() => setShowPendingOnly(!showPendingOnly)}
                    />
                    <div className={styles["toggle-container"]}>
                        <div className={styles["toggle-button"]}>
                            <div className={styles["toggle-button-circles-container"]}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className={styles["toggle-button-circle"]}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </label>
                <span className={styles["switch-label"]}>
                    {showPendingOnly ? "Mostrando sólo pendientes" : "Mostrando todos los pedidos"}
                </span>
            </div>


            <table className={styles["table-custom"]}>
                <thead style={{ textAlign: 'center' }}>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Enviado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody style={{ textAlign: 'center' }}>
                    {filteredOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customer_name}</td>
                            <td>{order.customer_email}</td>
                            <td>{order.phone_number}</td>
                            <td>{new Date(order.order_date).toLocaleDateString("es-ES").split("/").map((part) => part.padStart(2, "0")).join("/")}</td>
                            <td>{order.total_price.toFixed(2)}€</td>
                            <td>
                              {order.shipped ? (
                                <i className="bi bi-check-circle-fill text-success"></i>
                              ) : (
                                <i className="bi bi-x-circle-fill text-danger"></i>
                              )}
                            </td>
                            <td>
                                <button className={`${styles.btnsm} ${styles["btn-secondary"]} ms-2`} onClick={() => handleViewDetails(order)}>Ver detalles</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal*/}
            {selectedOrder && (
                <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className={`modal-header ${styles["modal-header-orange"]}`}>
                                <h5 className="modal-title">Detalle del Pedido #{selectedOrder.id}</h5>
                                <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={closeModal}></button>
                            </div>

                            <div className="modal-body">
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <p><strong>Cliente:</strong> {selectedOrder.customer_name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                        <p><strong>Teléfono:</strong> {selectedOrder.phone_number}</p>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <p><strong>Dirección de envío:</strong> {selectedOrder.shipping_address}</p>
                                        <p><strong>Fecha del pedido:</strong> {new Date(selectedOrder.order_date).toLocaleDateString("es-ES").split("/").map((part) => part.padStart(2, "0")).join("/")}</p>
                                        <p><strong>Total:</strong> {selectedOrder.total_price.toFixed(2)}€</p>
                                    </div>
                                </div>

                                <h6 className="mt-4"><strong>Productos:</strong></h6>
                                <table className={styles["table-modal"]}>
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th>Precio unitario</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.products.map((prod: ProductDto) => (
                                            <tr key={prod.id}>
                                                <td>
                                                    {prod.imageUrl ? (
                                                        <img
                                                            src={prod.imageUrl}
                                                            alt={prod.name}
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "cover",
                                                                borderRadius: "8px",
                                                                border: "1px solid #ccc"
                                                            }}
                                                        />
                                                    ) : "Sin imagen"}
                                                </td>
                                                <td>{prod.name}</td>
                                                <td>
                                                    <div style={{
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.2em',
                                                        maxHeight: '2.4em'
                                                    }}>
                                                        {prod.description}
                                                    </div>
                                                </td>


                                                <td>{prod.price.toFixed(2)}€</td>
                                                <td>{prod.quantity}</td>
                                                <td>{(prod.price * prod.quantity).toFixed(2)}€</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                                    <button
                                        className={`${styles.btnsm} ${styles["btn-primary"]}`}
                                        onClick={() => generateLabelPdf(selectedOrder)}
                                    >
                                        <i className="bi bi-printer"></i> Imprimir Etiqueta
                                    </button>
                                    <button
                                        className={`${styles.btnsm} ${styles["btn-secondary"]}`}
                                        onClick={closeModal}
                                    >
                                        <i className="bi bi-x-circle"></i> Cerrar
                                    </button>
                                </div>
                            </div>                           
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default OrdersPage;
