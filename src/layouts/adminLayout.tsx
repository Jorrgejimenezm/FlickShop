import { Outlet, NavLink } from 'react-router-dom';
import styles from "../css/menuAdmin.module.css";
import { motion, AnimatePresence } from 'framer-motion';

const menuVariants = {
    hidden: { x: -250, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
};

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
};

const linkVariants = {
    hover: { scale: 1.05, color: "#f8d7da", transition: { duration: 0.2 } }
};

const AdminLayout = () => {
    return (
        <div className={styles.container}>
            <AnimatePresence>
                <motion.div
                    className={`text-white p-3 ${styles.sidebar}`}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={menuVariants}
                >
                    <h2 className="mb-4">Panel de Control</h2>
                    <ul className="list-unstyled">
                        <li>
                            <motion.div whileHover="hover" variants={linkVariants}>
                                <NavLink to="/dashboard" className="text-white text-decoration-none py-2 d-block">
                                    <i className="bi bi-speedometer2 me-2"></i>Panel Inicial
                                </NavLink>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div whileHover="hover" variants={linkVariants}>
                                <NavLink to="/dashboard/productsPage" className="text-white text-decoration-none py-2 d-block">
                                    <i className="bi bi-box-seam me-2"></i>Gestión Productos
                                </NavLink>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div whileHover="hover" variants={linkVariants}>
                                <NavLink to="/dashboard/categoriesPage" className="text-white text-decoration-none py-2 d-block">
                                    <i className="bi bi-grid-3x3-gap me-2"></i>Gestión Categorías
                                </NavLink>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div whileHover="hover" variants={linkVariants}>
                                <NavLink to="/dashboard/ordersPage" className="text-white text-decoration-none py-2 d-block">
                                    <i className="bi bi-card-checklist me-2"></i>Gestión Pedidos
                                </NavLink>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div whileHover="hover" variants={linkVariants}>
                                <NavLink to="/dashboard/cameraPage" className="text-white text-decoration-none py-2 d-block">
                                    <i className="bi bi-camera-video me-2"></i>Cámara Muelle
                                </NavLink>
                            </motion.div>
                        </li>
                    </ul>

                    <motion.button
                        className={`${styles.backButton} w-100 mt-auto`}
                        onClick={() => window.location.href = "/"}
                        whileHover="hover"
                        variants={buttonVariants}
                    >
                        <i className="bi bi-arrow-left"></i> Volver al inicio
                    </motion.button>
                </motion.div>
            </AnimatePresence>

            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;