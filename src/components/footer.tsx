import styles from '../css/home.module.css';

const Footer = () => {
    return (
        <section className={styles.benefits}>
            <div className={styles.benefit}>
                <i className="bi bi-truck"></i>
                <p>Envío gratuito desde 50€</p>
            </div>
            <div className={styles.benefit}>
                <i className="bi bi-shield-lock"></i>
                <p>Pago seguro con PayPal</p>
            </div>
            <div className={styles.benefit}>
                <i className="bi bi-arrow-counterclockwise"></i>
                <p>Devoluciones fáciles</p>
            </div>
        </section>
    );
};

export default Footer;
