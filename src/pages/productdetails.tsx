import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts, type Product } from '../services/productsService';
import { useCart } from '../components/cartContext';
import styles from '../css/productDetail.module.css';
import { motion } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        getProducts().then(products => {
            const foundProduct = products.find(p => p.id === parseInt(id || '0'));
            setProduct(foundProduct || null);
            setShowFullDescription(false);
        });
    }, [id]);

    if (!product) {
        return <div className={styles.notFound}>Producto no encontrado...</div>;
    }

    const handleQuantityChange = (value: number) => {
        if (!product) return;
        if (value < 1) value = 1;
        if (value > product.stock) value = product.stock;
        setQuantity(value);
    };

    const descriptionPreview = product.description.length > 300
        ? product.description.slice(0, 300) + '...'
        : product.description;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Botón Volver */}
            <button
                className={styles.backButton}
                onClick={() => navigate(-1)}
            >
                <i className="bi bi-arrow-left"></i> Volver
            </button>

            {/* Imagen debajo del botón */}
            <motion.div
                className={styles.imageContainer}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <img src={product.imageUrl} alt={product.name} className={styles.image} />
            </motion.div>

            {/* Info a la derecha */}
            <div className={styles.infoContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{product.name}</h1>
                    <div className={styles.price}>{product.price.toFixed(2)}€</div>
                </div>

                <p className={styles.category}>Categoría: <span>{product.category?.name}</span></p>
                <p className={styles.weight}>Peso: <span>{product.weight} kg</span></p>

                <p className={styles.description}>
                    {showFullDescription ? product.description : descriptionPreview}
                    {product.description.length > 300 && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className={styles.showMoreBtn}
                        >
                            {showFullDescription ? ' Ver menos' : ' Ver más'}
                        </button>
                    )}
                </p>

                <div className="d-flex align-items-center mb-2">
                    <label htmlFor={`quantity-${product.id}`} className="me-2 mb-0">Cantidad:</label>
                    <input
                        id={`quantity-${product.id}`}
                        type="number"
                        min={1}
                        max={product.stock}
                        value={quantity}
                        onChange={e => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) val = 1;
                            if (val < 1) val = 1;
                            if (val > product.stock) val = product.stock;
                            handleQuantityChange(val);
                        }}
                        className={styles.quantitySelector}
                    />
                </div>

                <motion.button
                    className={`${styles.addToCartBtn} mt-2 w-100`}
                    onClick={() => addToCart(product, quantity)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <svg className={styles.cart} fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                    </svg>
                    Añadir al carrito
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProductDetail;
