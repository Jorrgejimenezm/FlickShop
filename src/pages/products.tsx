import { useEffect, useState } from 'react';
import { getProducts, type Product } from '../services/productsService';
import { categoryService, type Category } from '../services/categoriesService';
import Paginator from '../components/paginator';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../components/cartContext';
import styles from "../css/products.module.css";
import { Range } from 'react-range';

const PRODUCTS_PER_PAGE = 12;

const categoriesFilter = [
    { name: "Electrónica", image: "https://sonilec.mx/wp-content/uploads/productos-electronicos-768x768.jpg" },
    { name: "Moda", image: "https://www.paxinasgalegas.es/imagenes/tiendas-de-moda-ropa-mujer-marin_img2211t6m0w800h800.jpg" },
    { name: "Deportes", image: "https://www.ceoe.es/sites/ceoe-corporativo/files/styles/image_1200/public/content/image/2021/03/25/104/diseno-sin-titulo-27.png?itok=aiH46YuA" },
    { name: "Mascotas", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT06zArLG1jp7C2ozPlfK61EgLutfFAWaHClA&s" },
];

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const query = useQuery();
    const search = query.get('search')?.toLowerCase() || '';
    const urlCategory = query.get('category');

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    useEffect(() => {
        categoryService.getAll().then(setCategories);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    useEffect(() => {
        if (urlCategory) {
            setSelectedCategory(urlCategory);
        }
    }, [urlCategory]);

    const filteredProducts = products.filter(product =>
        (!selectedCategory || product.category?.name === selectedCategory) &&
        typeof product.price === 'number' &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        (search === '' || product.name.toLowerCase().includes(search) || product.description.toLowerCase().includes(search))
    );

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
        <div className={styles.background}>
            <div className="container mt-4">

                {/* Filtros y botones de categoría */}
                <div className={styles.filtersContainer}>
                    <motion.button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={styles.filterToggleBtn}
                        onMouseDown={(e) => e.preventDefault()}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        Filtros <i className="bi bi-sort-down"></i>
                    </motion.button>

                    <div className={styles.separator} />

                    <AnimatePresence>
                        {categoriesFilter.map(category => {
                            const isActive = selectedCategory === category.name;

                            return (
                                <motion.button
                                    key={category.name}
                                    onClick={() => {
                                        setSelectedCategory(category.name);
                                        setCurrentPage(1);
                                        navigate('/products');
                                    }}
                                    className={styles.categoryButton}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.img
                                        src={category.image}
                                        alt={category.name}
                                        className={`${styles.categoryImage} ${isActive ? styles.categoryActive : ''}`}
                                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    />
                                    <p className={`${styles.categoryTitle} ${isActive ? styles.categoryActiveTitle : ''}`}>
                                        {category.name}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Filtros avanzados */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            className={styles.advancedFilters}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <h5 className="text-center">Filtros avanzados</h5>

                            <label className="form-label">Categoría</label>
                            <select
                                className="form-select"
                                value={selectedCategory || ""}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value || null);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Todas</option>
                                {categories.map(category => (
                                    <option key={category.name} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <label className="form-label mt-3">Precio</label>
                            <div className="my-3">
                                <Range
                                    step={10}
                                    min={0}
                                    max={1000}
                                    values={priceRange}
                                    onChange={(values) => setPriceRange([values[0], values[1]])}
                                    renderTrack={({ props, children }) => (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '6px',
                                                width: '100%',
                                                backgroundColor: '#ddd',
                                                marginTop: '1rem',
                                            }}
                                        >
                                            {children}
                                        </div>
                                    )}
                                    renderThumb={({ props }) => (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '20px',
                                                width: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#002147',
                                                outline: 'none'
                                            }}
                                        />
                                    )}
                                />
                                <p className="text-center mt-2">{priceRange[0]}€ - {priceRange[1]}€</p>
                            </div>

                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setPriceRange([0, 1000]);
                                    setCurrentPage(1);
                                }}
                            >
                                <span className={styles.button__text}>Limpiar</span>
                                <span className={styles.button__icon}>
                                    <svg
                                        className={styles.svg}
                                        height="512"
                                        viewBox="0 0 512 512"
                                        width="512"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
                                            style={{ fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}
                                        />
                                        <line
                                            x1="80"
                                            y1="112"
                                            x2="432"
                                            y2="112"
                                            style={{ stroke: "#fff", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: "32px" }}
                                        />
                                        <path
                                            d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
                                            style={{ fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}
                                        />
                                        <line
                                            x1="256"
                                            y1="176"
                                            x2="256"
                                            y2="400"
                                            style={{ fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}
                                        />
                                        <line
                                            x1="184"
                                            y1="176"
                                            x2="192"
                                            y2="400"
                                            style={{ fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}
                                        />
                                        <line
                                            x1="328"
                                            y1="176"
                                            x2="320"
                                            y2="400"
                                            style={{ fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "32px" }}
                                        />
                                    </svg>
                                </span>
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Productos */}
                {products.length === 0 ? (
                    <p>Cargando productos...</p>
                ) : (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentPage}-${selectedCategory}-${priceRange[0]}-${priceRange[1]}-${search}`}
                                className="row"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {filteredProducts
                                    .slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
                                    .map(product => {
                                        const quantity = quantities[product.id] || 1;
                                        return (
                                            <motion.div
                                                key={product.id}
                                                className="col-md-3 mb-4"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className={styles.productCard} onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                                                    {product.imageUrl && (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className={styles.productImage}
                                                        />
                                                    )}
                                                    <div className="p-3 d-flex flex-column h-100">
                                                        <h5 className={styles.productTitle}>{product.name}</h5>
                                                        <p className={styles.productDescription}>{product.description}</p>

                                                        <div className="mt-auto">
                                                            <p className={styles.productPrice}>
                                                                <i className="bi bi-tag-fill me-1"></i>{product.price.toFixed(2)}€
                                                            </p>
                                                            {product.stock === 0 ? (
                                                                <p className={styles.outOfStock}>
                                                                    <i className="bi bi-x-circle-fill me-1"></i>
                                                                    No quedan unidades en stock
                                                                </p>
                                                            ) : product.stock < 10 && (
                                                                    <p className={styles.lowStock}>
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
                                                                    className={styles.quantitySelector}
                                                                />
                                                            </div>

                                                            <button
                                                                className={`${styles.addToCartBtn} mt-2 w-100`}
                                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                                            >
                                                                <svg className={styles.cart} fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                                                                </svg>
                                                                Añadir al carrito
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" className={styles.product}>
                                                                    <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </motion.div>
                        </AnimatePresence>

                        <AnimatePresence>
                            {totalPages > 1 && (
                                <motion.div
                                    key="paginator"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Paginator
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
            
        </div>      
    );


};

export default Products;