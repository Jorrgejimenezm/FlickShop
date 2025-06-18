import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product, type ProductDto } from "../../services/productsService";
import { categoryService, type Category } from "../../services/categoriesService";
import { getToken } from "../../services/authService";
import Paginator from "../../components/paginator";
import styles from "../../css/AdminStylePages.module.css";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductDto>({ name: "", description: "", price: 0, stock: 0, weight:0, category_id: 0, image: null });
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: number | null }>({ open: false, id: null });
    const [currentPage, setCurrentPage] = useState(1);

    // Estados para búsqueda y filtro
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    const token = getToken();

    // Carga productos
    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            setError("Error al cargar productos");
        }
    };

    // Carga categorías
    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            setError("Error al cargar categorías");
        }
    };

    // Al montar, carga productos y categorías
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setForm(prev => ({ ...prev, image: file, preview: event.target?.result || null }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!token) return setError("Token no disponible");

            if (editingProduct) {
                await updateProduct(editingProduct.id, form, token);
                setEditingProduct(null);
            } else {
                await createProduct(form, token);
            }

            setForm({ name: "", description: "", price: 0, stock: 0, weight:0, category_id: 0, image: null });
            await loadProducts();
            setModalOpen(false);
            setCurrentPage(1);
        } catch (err) {
            setError("Error al guardar producto");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, weight: product.weight, category_id: product.category_id, image: null });
        setModalOpen(true);
    };

    const handleDeleteConfirm = (id: number) => {
        setConfirmDelete({ open: true, id });
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;

        try {
            if (!token) return setError("Token no disponible");
            await deleteProduct(confirmDelete.id, token);
            loadProducts();
            setConfirmDelete({ open: false, id: null });
            setCurrentPage(1);
        } catch {
            setError("Error al eliminar producto");
        }
    };

    // Aquí hacemos la búsqueda y filtro por categoría solo al enviar el form
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        let filtered = products;

        // Si hay texto, filtrar por nombre o descripción
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Si hay categoría seleccionada, filtrar por categoría
        if (selectedCategoryId !== "") {
            filtered = filtered.filter(product => product.category.id === selectedCategoryId);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <div>
            <div className={styles["title-container"]}>
                <h2 className={styles.title}>Gestión de Productos</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button className={`px-4 py-2 fw-bold ${styles.btn} ${styles["btn-green"]} mb-3`} onClick={() => {
                setEditingProduct(null);
                setForm({ name: "", description: "", price: 0, stock: 0, weight: 0, category_id: 0, image: null });
                setModalOpen(true);
            }}>
                <i className="bi bi-plus-circle"></i> Agregar Producto
            </button>

            {/* Formulario de búsqueda con dropdown de categorías */}
            <form className="d-flex align-items-center mb-3" onSubmit={handleSearch}>
                <input
                    className="form-control me-2"
                    style={{ width: "70%" }}
                    type="search"
                    placeholder="Buscar por producto o descripción..."
                    aria-label="Buscar productos"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    className="form-select me-2"
                    style={{ width: "30%" }}
                    value={selectedCategoryId}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCategoryId(val === "" ? "" : Number(val));
                    }}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <button className={styles["btn-outline-custom"]} type="submit">
                    <i className="bi bi-search"></i>
                </button>
            </form>

            {modalOpen && (
                <div className="modal show d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className={`modal-header ${editingProduct ? styles["modal-header-orange"] : styles["modal-header-green"]}`}>
                                <h5 className="modal-title">{editingProduct ? "Editar Producto" : "Crear Producto"}</h5>
                                <button type="button" className="btn text-white ms-auto" onClick={() => setModalOpen(false)}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-tag"></i> Nombre</label>
                                        <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-grid"></i> Categoría</label>
                                        <select name="category_id" className="form-control" value={form.category_id} onChange={handleChange} required>
                                            <option value="">Seleccione una categoría</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-card-text"></i> Descripción</label>
                                        <textarea name="description" className="form-control" value={form.description} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-currency-dollar"></i> Precio</label>
                                        <input type="number" name="price" className="form-control" value={form.price} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-box-seam"></i> Stock</label>
                                        <input type="number" name="stock" className="form-control" value={form.stock} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="bi bi-duffle"></i> Peso</label>
                                        <input type="number" name="weight" className="form-control" value={form.weight} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nueva imagen</label>
                                        <input type="file" name="image" className="form-control" onChange={handleFileChange} />

                                        {editingProduct?.imageUrl && (
                                            <img src={editingProduct.imageUrl} alt="Imagen del producto" className="img-thumbnail mt-2" style={{ maxWidth: "200px" }} />
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <button className={`${styles.btn} ${editingProduct ? styles["btn-primary"] : styles["btn-green"]}`} type="submit">
                                        <i className="bi bi-save"></i> {editingProduct ? "Actualizar" : "Crear"}
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles["btn-secondary"]} ms-2`}
                                            onClick={() => setModalOpen(false)}
                                        >
                                            <i className="bi bi-x-circle"></i> Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete.open && (
                <div className="modal show d-block">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className={`modal-header ${styles["modal-header-danger"]}`}>
                                <h5 className="modal-title">Confirmar Eliminación</h5>
                                <button
                                    type="button"
                                    className="btn text-white ms-auto"
                                    onClick={() => setConfirmDelete({ open: false, id: null })}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <div className="modal-body">
                                <p className="mb-4">
                                    <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                                    ¿Estás seguro de que deseas eliminar este producto?
                                </p>

                                <div className="d-flex justify-content-end">
                                    <button
                                        className={`${styles.btn} ${styles["btn-danger"]}`}
                                        onClick={handleDelete}
                                    >
                                        <i className="bi bi-trash-fill"></i> Eliminar
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles["btn-secondary"]} ms-2`}
                                        onClick={() => setConfirmDelete({ open: false, id: null })}
                                    >
                                        <i className="bi bi-x-circle"></i> Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <table className={styles["table-custom"]}>
                <thead style={{ textAlign: 'center' }}>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Peso</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody style={{ textAlign: 'center' }}>
                    {paginatedProducts.map((prod) => (
                        <tr key={prod.id}>
                            <td>{prod.name}</td>
                            <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.description}
                            </td>
                            <td>{prod.category.name}</td>
                            <td>{prod.price}€</td>
                            <td>{prod.stock}</td>
                            <td>{prod.weight}Kg</td>
                            <td>
                                <button className={`${styles.btnsm} ${styles["btn-primary"]} btn-sm me-2`} onClick={() => handleEdit(prod)}>
                                    <i className="bi bi-pencil-square"></i> Editar
                                </button>
                                <button className={`${styles.btnsm} ${styles["btn-danger"]}`} onClick={() => handleDeleteConfirm(prod.id)}>
                                    <i className="bi bi-trash"></i> Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Paginator
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
