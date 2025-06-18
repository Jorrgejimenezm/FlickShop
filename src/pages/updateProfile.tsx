import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../css/loginRegister.module.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const API_URL = 'https://apistoreorders.azurewebsites.net/api/auth';

const UpdateProfile = () => {
    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        direccion: '',
        telefono: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            setForm({
                nombre: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || '',
                apellidos: decoded.Apellido || '',
                direccion: decoded.Direccion || '',
                telefono: decoded.Telefono || ''
            });
        } catch (e) {
            console.error('Error al decodificar el token:', e);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/update-profile`, form, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newToken = response.data.token;
            if (newToken) {
                localStorage.setItem('token', newToken);
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Perfil actualizado!',
                text: response.data.message || 'Tus datos se han guardado correctamente.',
                confirmButtonColor: '#ffa73f'
            });

            window.location.reload();

        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Error al actualizar el perfil.';

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: msg,
                confirmButtonColor: '#d33'
            });
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
                <p className={styles.title}>Actualizar Perfil</p>

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
                        <label htmlFor="direccion">Dirección</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={form.direccion}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles['input-group']}>
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.sign}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <i className="bi bi-person-lines-fill" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                        Guardar cambios
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdateProfile;