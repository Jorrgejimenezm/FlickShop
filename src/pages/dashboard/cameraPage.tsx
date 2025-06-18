import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import styles from "../../css/AdminStylePages.module.css";
import orderService, { type OrderDto } from "../../services/orderService";

const QRScannerPage = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        if (!scanning) return;

        const codeReaderInstance = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReaderInstance;

        codeReaderInstance
            .listVideoInputDevices()
            .then((videoInputDevices) => {
                if (videoInputDevices.length === 0) {
                    Swal.fire("Error", "No se encontraron cámaras disponibles.", "error");
                    setScanning(false);
                    return;
                }

                const deviceId = videoInputDevices[0].deviceId;
                if (videoRef.current) {
                    codeReaderInstance.decodeFromVideoDevice(
                        deviceId,
                        videoRef.current,
                        async (result, err) => {
                            if (result) {
                                console.log("QR detectado:", result.getText());
                                setScanning(false);
                                await codeReaderInstance.reset();

                                const orderId = parseInt(result.getText());
                                if (isNaN(orderId)) {
                                    Swal.fire("Error", "Código QR inválido", "error").then(() => {
                                        setScanning(true);
                                    });
                                    return;
                                }

                                try {
                                    const order: OrderDto = await orderService.getOrderById(orderId);

                                    if (order.shipped) {
                                        Swal.fire(
                                            "Atención",
                                            `El pedido ${orderId} ya está marcado como enviado.`,
                                            "info"
                                        ).then(() => setScanning(true));
                                        return;
                                    }

                                    await orderService.markOrderAsShipped(orderId);

                                    Swal.fire("Éxito", `Pedido ${orderId} marcado como enviado.`, "success");
                                } catch (error: any) {
                                    console.error(error);

                                    let errorMessage = "No se pudo actualizar el pedido. Revisa la consola.";
                                    if (error.response && error.response.data) {
                                        errorMessage = error.response.data;
                                    }

                                    Swal.fire(
                                        "Error",
                                        errorMessage,
                                        "error"
                                    ).then(() => setScanning(true));
                                }
                            }

                            if (err && err.name !== "NotFoundException") {
                                console.error("Error de escaneo:", err);
                            }
                        }
                    );
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire("Error", "No se pudo acceder a la cámara", "error");
                setScanning(false);
            });

        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
                codeReaderRef.current = null;
            }
        };
    }, [scanning]);

    return (
        <div>
            <div className={styles["title-container"]}>
                <h2 className={styles.title}>Escanear Código QR de Pedidos</h2>
            </div>
            {scanning ? (
                <video ref={videoRef} className={styles.scanner} />
            ) : (
                <button
                        className={`px-4 py-2 fw-bold ${styles.btn} ${styles["btn-green"]} mt-3`}
                    onClick={() => setScanning(true)}
                >
                    Escanear otro pedido
                </button>
            )}
        </div>
    );
};

export default QRScannerPage;
