import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/publicLayout';
import AdminLayout from './layouts/adminLayout';
import Home from './pages/home';
import Products from './pages/products';
import Login from './pages/login';
import Register from './pages/register';
import AdminHome from './pages/dashboard/adminHome';
import CategoriesPage from './pages/dashboard/categoriesPage';
import ProductsPage from './pages/dashboard/productsPage';
import OrdersPage from './pages/dashboard/ordersPage';
import CameraPage from './pages/dashboard/cameraPage';
import CartPage from './pages/cart';
import MyOrders from './pages/myOrders';
import AdminRoute from './components/adminRoute';
import ScrollToTop from './components/scrollToTop';
import ProductDetail from './pages/productdetails';
import UpdateProfile from './pages/updateProfile';

function App() {
    return (
        <Router>
            <ScrollToTop />
                <Routes>

                    {/* Rutas públicas con Navbar */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail/>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/perfil" element={<UpdateProfile/>} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/orders" element={<MyOrders />} />
                    </Route>

                    {/* Rutas privadas para admin */}
                    <Route path="/dashboard" element={<AdminRoute> <AdminLayout /> </AdminRoute> }>
                        <Route index element={<AdminHome />} />
                        <Route path="categoriesPage" element={<CategoriesPage />} />
                        <Route path="productsPage" element={<ProductsPage />} />
                        <Route path="ordersPage" element={<OrdersPage />} />
                        <Route path="cameraPage" element={<CameraPage />} />
                    </Route>

                </Routes>
        </Router>
    );
}

export default App;
