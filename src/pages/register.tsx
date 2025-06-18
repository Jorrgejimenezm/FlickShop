import { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from '../css/loginRegister.module.css';

const Register = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellidos: ''
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            await register(form);
            setSuccessMessage('Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.');
            setForm({
                email: '',
                password: '',
                confirmPassword: '',
                nombre: '',
                apellidos: ''
            });
        } catch (err: any) {
            setError(err);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: '#e68a00', transition: { duration: 0.3 } },
        tap: { scale: 0.95 }
    };

    return (
        <div className={styles.background}>
            <motion.div
                className={styles['form-container']}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ maxWidth: 500, margin: '50px auto' }}
            >
                <p className={styles.title}>Registro</p>

                {error && <div className={styles.error}>{error}</div>}

                {successMessage ? (
                    <motion.div
                        className={styles.successMessageBox}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#2ecc71', marginBottom: '0.5rem' }}></i>
                        <p className={styles.successText}>{successMessage}</p>
                        <button
                            className={styles.successButton}
                            onClick={() => navigate('/login')}
                        >
                            Ir a iniciar sesión
                        </button>
                    </motion.div>
                ) : (

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles['input-group']}>
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="apellidos">Apellidos</label>
                            <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['input-group']}>
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.sign}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            >
                                <i className="bi bi-person-plus-fill" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                            Registrarse
                            </motion.button>

                        <p className={styles.signup}>
                            ¿Ya tienes una cuenta? <a href="/login">Iniciar Sesión</a>
                        </p>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Register;
