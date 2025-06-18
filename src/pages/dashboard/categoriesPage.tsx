import { useEffect, useState } from "react";
import { type Category, categoryService } from "../../services/categoriesService";
import { getToken } from "../../services/authService";
import styles from "../../css/AdminStylePages.module.css";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: "", description: "" });
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: number | null }>({ open: false, id: null });

    const token = getToken();

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            setError("Error al cargar categorías");
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!token) return setError("Token no disponible");

            if (editingCategory) {
                await categoryService.update(editingCategory.id, { ...editingCategory, ...form }, token);
                setEditingCategory(null);
            } else {
                await categoryService.create(form, token);
            }

            setForm({ name: "", description: "" });
            loadCategories();
            setModalOpen(false);
        } catch (err) {
            setError("Error al guardar categoría");
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setForm({ name: category.name, description: category.description });
        setModalOpen(true);
    };

    const handleDeleteConfirm = (id: number) => {
        setConfirmDelete({ open: true, id });
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;

        try {
            if (!token) return setError("Token no disponible");
            await categoryService.delete(confirmDelete.id, token);
            loadCategories();
            setConfirmDelete({ open: false, id: null });
        } catch {
            setError("Error al eliminar categoría");
        }
    };

    return (
        <div>
            <div className={styles["title-container"]}>
                <h2 className={styles.title}>Gestión de Categorías</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between mb-4">
                <button
                    className={`px-4 py-2 fw-bold ${styles.btn} ${styles["btn-green"]}`}
                    onClick={() => {setModalOpen(true); setEditingCategory(null); setForm({ name: "", description: ""}); }}
                >
                    <i className="bi bi-plus-circle"></i> Agregar categoría
                </button>
            </div>

            <div className="row">
                {categories.map((cat) => (
                    <div key={cat.id} className="col-md-4 mb-3">
                        <div className={`shadow-sm rounded ${styles.card}`}>
                            <div className="card-body text-center">
                                <h5 className="card-title text-dark fw-bold">{cat.name}</h5>
                                <p className="card-text text-muted">{cat.description}</p>
                                <div className="d-flex justify-content-center mt-3">
                                    <button
                                        className={`${styles.btnsm} ${styles["btn-primary"]} me-1`}
                                        onClick={() => handleEdit(cat)}
                                    >
                                        <i className="bi bi-pencil-square"></i> Editar
                                    </button>
                                    <button
                                        className={`${styles.btnsm} ${styles["btn-danger"]}`}
                                        onClick={() => handleDeleteConfirm(cat.id)}
                                    >
                                        <i className="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CREACIÓN / EDICIÓN */}
            {modalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className={`modal-content ${styles["modal-content"]}`}>
                            <div className={`modal-header ${editingCategory ? styles["modal-header-orange"] : styles["modal-header-green"]}`}>
                                <h5 className="modal-title">
                                    <i className={`bi ${editingCategory ? "bi-pencil-square" : "bi-plus-circle"}`}></i>
                                    {editingCategory ? " Editar Categoría" : " Crear Categoría"}
                                </h5>
                                <button type="button" className="btn text-white ms-auto" onClick={() => setModalOpen(false)}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className={`modal-body ${styles["modal-body"]}`}>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-card-text"></i> Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-file-text"></i> Descripción
                                        </label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            value={form.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="text-end">
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles["btn-secondary"]} me-2`}
                                            onClick={() => setModalOpen(false)}
                                        >
                                            <i className="bi bi-x-circle"></i> Cancelar
                                        </button>
                                        <button type="submit" className={`${styles.btn} ${editingCategory ? styles["btn-primary"] : styles["btn-success"]}`} >
                                            <i className={`bi ${editingCategory ? "bi-check-circle" : "bi-plus-lg"}`}></i>
                                            {editingCategory ? " Actualizar" : " Crear"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {confirmDelete.open && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className={`modal-content ${styles["modal-content"]}`}>
                            <div className={`modal-header ${styles["modal-header-danger"]}`}>
                                <h5 className="modal-title">Confirmar eliminación</h5>
                                <button
                                    type="button"
                                    className="btn text-white ms-auto"
                                    onClick={() => setConfirmDelete({ open: false, id: null })}
                                ><i className="bi bi-x-lg"></i></button>
                            </div>
                            <div className={`modal-body text-center ${styles["modal-body"]}`}>
                                <p className="fs-5">¿Estás seguro de que deseas eliminar esta categoría?</p>
                                <div className="d-flex justify-content-center">
                                    <button className={`${styles.btn} ${styles["btn-danger"]} me-2`} onClick={handleDelete}>
                                        <i className="bi bi-trash-fill"></i> Eliminar
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles["btn-secondary"]}`}
                                        onClick={() => setConfirmDelete({ open: false, id: null })}
                                    >
                                        <i className="bi bi-arrow-left-circle"></i> Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


};

export default CategoriesPage;
