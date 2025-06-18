import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken, logout, isAuthenticated } from '../services/authService';
import { useCart } from '../components/cartContext';
import styles from "../css/navbarUser.module.css";
import img from "../img/logo1.png";


const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [userFullName, setUserFullName] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { totalItems } = useCart();
    const { reloadCart } = useCart(); 


    useEffect(() => {
        if (isAuthenticated()) {
            const token = getToken();
            if (token) {
                try {
                    const decoded = jwtDecode<any>(token);
                    const nameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
                    const nombre = decoded[nameClaim] || '';
                    const fullName = `${nombre}`.trim();
                    setUserFullName(fullName);

                    const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
                    const role = decoded[roleClaim];
                    if (Array.isArray(role)) {
                        setIsAdmin(role.includes("Admin"));
                    } else if (typeof role === 'string') {
                        setIsAdmin(role === "Admin");
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Token inválido", error);
                    logout();
                    setUserFullName(null);
                    setIsAdmin(false);
                }
            }
        } else {
            setUserFullName(null);
            setIsAdmin(false);
        }
    }, [location]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim() === '') {
            navigate('/products');
        }
    };

    const handleLogout = () => {
        logout();
        setUserFullName(null);
        setIsAdmin(false);
        reloadCart();
        navigate('/');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <ul className={styles.navLinks}>
                    <li><NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink></li>
                    <li><NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>Productos</NavLink></li>
                    {isAdmin && (
                        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>Admin</NavLink></li>
                    )}
                </ul>
                <form className={styles.searchForm} onSubmit={handleSearch}>
                    <input
                        type="search"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <i className="bi bi-search"></i>
                    </button>
                </form>
            </div>

            <div className={styles.logoSection}>
                <Link to="/">
                    <img src={img} alt="Logo" className={styles.logo} />
                </Link>
            </div>

            <div className={styles.rightSection}>
                {!isAdmin && (
                    <Link to="/cart" className={styles.cartButton}>
                        <i className="bi bi-cart"></i>
                        {totalItems > 0 && (
                            <span className={styles.cartBadge}>{totalItems}</span>
                        )}
                    </Link>
                )}

                {userFullName ? (
                    <div className={styles.userMenu}>
                        <label className={styles.main} onClick={() => setMenuOpen(prev => !prev)}>
                            <div className={styles.userInfo}>
                                <i className="bi bi-person-circle"></i> {userFullName}
                            </div>
                            <div className={styles.bar}>
                                <span className={`${styles.top} ${styles.barList} ${menuOpen ? styles.openTop : ''}`}></span>
                                <span className={`${styles.middle} ${styles.barList} ${menuOpen ? styles.openMiddle : ''}`}></span>
                                <span className={`${styles.bottom} ${styles.barList} ${menuOpen ? styles.openBottom : ''}`}></span>
                            </div>
                            <section className={`${styles.menuContainer} ${menuOpen ? styles.openMenu : ''}`}>
                                {!isAdmin && (
                                    <div className={styles.menuList} onClick={() => { navigate('/orders'); setMenuOpen(false); }}>
                                        <i className="bi bi-bag"></i> Pedidos
                                    </div>
                                )}
                                <div className={styles.menuList} onClick={() => { navigate('/perfil'); setMenuOpen(false); }}>
                                    <i className="bi bi-person"></i> Perfil
                                    </div>
                                <div className={`${styles.menuList} ${styles.logoutItem}`} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                                    <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                                </div>
                            </section>
                        </label>
                    </div>
                ) : (
                    <>
                        <NavLink to="/login" className={styles.loginButton}>
                            <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                        </NavLink>
                        <NavLink to="/register" className={styles.registerButton}>
                            <i className="bi bi-person-plus-fill"></i> Registrarse
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;