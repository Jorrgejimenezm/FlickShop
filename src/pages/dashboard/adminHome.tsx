import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from '../../css/adminHome.module.css';
import { categoryService, type Category } from '../../services/categoriesService';
import orderService, { type OrderDto } from '../../services/orderService';
import { getProducts, type Product } from '../../services/productsService';

const AdminHome = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, ords, cats] = await Promise.all([
          getProducts(),
          orderService.getAllOrders(),
          categoryService.getAll(),
        ]);
        setProducts(prods);
        setOrders(ords);
        setCategories(cats);

        const dataByMonth: { [key: string]: { pending: number; shipped: number } } = {};

        ords.forEach(order => {
          const date = new Date(order.order_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!dataByMonth[monthKey]) {
            dataByMonth[monthKey] = { pending: 0, shipped: 0 };
          }

          if (order.shipped) {
            dataByMonth[monthKey].shipped += 1;
          } else {
            dataByMonth[monthKey].pending += 1;
          }
        });

        const chartArray = Object.entries(dataByMonth)
          .map(([month, counts]) => ({ month, ...counts }))
          .sort((a, b) => (a.month > b.month ? 1 : -1));

        setChartData(chartArray);
      } catch (error) {
        console.error('Error cargando datos del admin:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingOrders = orders.filter(o => !o.shipped).length;
  const shippedOrders = orders.filter(o => o.shipped).length;

  if (loading) {
    return <p className={styles.loading}>Cargando datos...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles["title-container"]}>
        <h2 className={styles.title}>Panel de Control</h2>
      </div>
      <div className={styles.cards}>
        <div
          className={styles.card}
          onClick={() => navigate('/dashboard/productsPage')}
          style={{ cursor: 'pointer' }}
        >
          <h3>Productos</h3>
          <p className={styles.number}>{products.length}</p>
        </div>
        <div
          className={styles.card}
          onClick={() => navigate('/dashboard/categoriesPage')}
          style={{ cursor: 'pointer' }}
        >
          <h3>Categorías</h3>
          <p className={styles.number}>{categories.length}</p>
        </div>
        <div
          className={styles.card}
          onClick={() => navigate('/dashboard/ordersPage')}
          style={{ cursor: 'pointer' }}
        >
          <h3>Pedidos Pendientes</h3>
          <p className={styles.number}>{pendingOrders}</p>
        </div>
        <div
          className={styles.card}
          onClick={() => navigate('/dashboard/ordersPage')}
          style={{ cursor: 'pointer' }}
        >
          <h3>Pedidos Enviados</h3>
          <p className={styles.number}>{shippedOrders}</p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Pedidos por Mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="pending" stackId="a" fill="#ffa73f" name="Pendientes" />
            <Bar dataKey="shipped" stackId="a" fill="#002147" name="Enviados" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminHome;