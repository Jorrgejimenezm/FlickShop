import Navbar from '../components/navbar';
import { Outlet } from 'react-router-dom';
import { CartProvider } from '../components/cartContext'; 
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Footer from '../components/footer';

const PublicLayout = () => (
  <PayPalScriptProvider options={{ clientId: "AYzaRyNhJX7sckO8FH9sz_VPoDRW8LnALIelXOuqJeUZuRjwy7tPE1lfUvyfi3mZIPpTpjNBxpV_dP2V", currency: "EUR" }}>
    <CartProvider>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>

        <Footer />
      </div>
    </CartProvider>
  </PayPalScriptProvider>
);


export default PublicLayout;
