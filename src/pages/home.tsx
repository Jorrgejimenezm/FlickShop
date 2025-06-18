import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Product, getProductById } from '../services/productsService';
import { useCart } from '../components/cartContext';
import styles from '../css/home.module.css';
import stylesProducts from "../css/products.module.css";
import { motion } from 'framer-motion';

const Home = () => {
    const [highlightsProducts, setHighlightsProducts] = useState<Product[]>([]);
    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const loadHighlightsProducts = async () => {
        try {
            const ids = [4, 57, 120,170];
            const promises = ids.map(id => getProductById(id));
            const products = await Promise.all(promises);
            setHighlightsProducts(products);
        } catch (error) {
            console.error('Error loading highlighted products:', error);
        }
    };

    useEffect(() => {
        loadHighlightsProducts();
    }, []);

    const handleQuantityChange = (productId: number, value: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: value,
        }));
    };

    const handleAddToCart = (product: Product) => {
        const quantity = quantities[product.id] || 1;
        addToCart(product, quantity);
    };

    return (
        <div className={styles.home}>
            {/* CABECERA */}
            <motion.section
                className={styles.hero}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className={styles.overlay}>
                    <motion.h1
                        className={styles.title}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        Bienvenido a Flick Shop
                    </motion.h1>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        Encuentra calidad, precio y estilo en un solo lugar
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <Link to="/products" className={styles.shopButton}>
                            <i className="bi bi-search me-2"></i> Explora Nuestro Catálogo
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* CATEGORÍAS DESTACADAS */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Categorías Destacadas</h2>
                <div className={styles.categories} style={{ textAlign: 'center' }}>
                    <Link to="/products?category=Electrónica" className={styles.categoryCard}>
                        <img src="https://sonilec.mx/wp-content/uploads/productos-electronicos-768x768.jpg" alt="Electrónica" />
                        <h3>Electrónica</h3>
                    </Link>
                    <Link to="/products?category=Moda" className={styles.categoryCard}>
                        <img src="https://www.paxinasgalegas.es/imagenes/tiendas-de-moda-ropa-mujer-marin_img2211t6m0w800h800.jpg" alt="Moda" />
                        <h3>Moda</h3>
                    </Link>
                    <Link to="/products?category=Deportes" className={styles.categoryCard}>
                        <img src="https://www.ceoe.es/sites/ceoe-corporativo/files/styles/image_1200/public/content/image/2021/03/25/104/diseno-sin-titulo-27.png?itok=aiH46YuA" alt="Deportes" />
                        <h3>Deportes</h3>
                    </Link>
                    <Link to="/products?category=Mascotas" className={styles.categoryCard}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT06zArLG1jp7C2ozPlfK61EgLutfFAWaHClA&s" alt="Mascotas" />
                        <h3>Mascotas</h3>
                    </Link>
                </div>
            </section>


            {/* PRODUCTOS POPULARES */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Lo Más Vendido</h2>
                <div className="container">
                    <div className="row">                    
                        {highlightsProducts.map(product => {
                            const quantity = quantities[product.id] || 1;
                            return (
                                <div key={product.id} className="col-md-3 mb-4">
                                    <div className={stylesProducts.productCard} onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className={stylesProducts.productImage}
                                            />
                                        )}
                                        <div className="p-3 d-flex flex-column h-100">
                                            <h5 className={stylesProducts.productTitle}>{product.name}</h5>
                                            <p className={stylesProducts.productDescription}>{product.description}</p>

                                            <div className="mt-auto">
                                                <p className={stylesProducts.productPrice}>
                                                    <i className="bi bi-tag-fill me-1"></i>{product.price.toFixed(2)}€
                                                </p>
                                                {product.stock === 0 ? (
                                                    <p className={stylesProducts.outOfStock}>
                                                        <i className="bi bi-x-circle-fill me-1"></i>
                                                        No quedan unidades en stock
                                                    </p>
                                                ) : product.stock < 10 && (
                                                    <p className={stylesProducts.lowStock}>
                                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                        ¡Quedan pocas unidades!
                                                    </p>
                                                )}

                                                {/* Selector de cantidad */}
                                                <div className="d-flex align-items-center mb-2">
                                                    <label htmlFor={`quantity-${product.id}`} className="me-2 mb-0">Cantidad:</label>
                                                    <input
                                                        id={`quantity-${product.id}`}
                                                        type="number"
                                                        min={1}
                                                        max={product.stock}
                                                        value={quantity}
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        onChange={e => {
                                                            let val = Number(e.target.value);
                                                            if (isNaN(val)) val = 1;
                                                            if (val < 1) val = 1;
                                                            if (val > product.stock) val = product.stock;
                                                            handleQuantityChange(product.id, val);
                                                        }}
                                                        className={stylesProducts.quantitySelector}
                                                    />
                                                </div>

                                                <button
                                                    className={`${stylesProducts.addToCartBtn} mt-2 w-100`}
                                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                                >
                                                    <svg className={stylesProducts.cart} fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                                                    </svg>
                                                    Añadir al carrito
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" className={stylesProducts.product}>
                                                        <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
