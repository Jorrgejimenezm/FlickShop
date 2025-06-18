import { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import styles from '../css/loginRegister.module.css';
import { useCart } from '../components/cartContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { reloadCart } = useCart(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = await login({ email, password });
            reloadCart();
            const decoded = jwtDecode<any>(token);
            const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const isAdmin = Array.isArray(roles)
                ? roles.includes("Admin")
                : roles === "Admin";
            navigate(isAdmin ? '/dashboard' : '/');
        } catch (error: any) {
            const message = error?.message || "";
            if (message.includes("confirmar")) {
                Swal.fire({
                    icon: "warning",
                    title: "Correo no confirmado",
                    text: "Debes confirmar tu correo electrónico antes de iniciar sesión.",
                });
            } else if (message.includes("Credenciales inválidas")) {
                Swal.fire({
                    icon: "error",
                    title: "Credenciales incorrectas",
                    text: "El correo o la contraseña son incorrectos.",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ha ocurrido un error inesperado. Intenta de nuevo.",
                });
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#e68a00", transition: { duration: 0.3 } },
        tap: { scale: 0.95 }
    };

    return (
        <div className={styles.background}>
            <motion.div
                className={styles['form-container']}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <p className={styles.title}>Inicio de Sesión</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles['input-group']}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles['input-group']}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <motion.button
                        className={styles.sign}
                        type="submit"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <i className="bi bi-box-arrow-in-right" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                        Iniciar sesión
                    </motion.button>
                </form>
                <p className={styles.signup}>
                    ¿No tienes una cuenta? <a href="/register">Regístrate</a>
                </p>
            </motion.div>
        </div>
    );

};

export default Login;