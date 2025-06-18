import axios from 'axios';
export interface ProductDto {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface OrderDto {
    id: number;
    customer_name: string;
    customer_email: string;
    phone_number: string;
    shipping_address: string;
    total_price: number;
    order_date: string;
    shipped: boolean;
    products: ProductDto[];
}

const API_BASE_URL = 'https://apistoreorders.azurewebsites.net/api/Orders';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const orderService = {
    // GET: api/Orders (Admin)
    getAllOrders: async (): Promise<OrderDto[]> => {
        const response = await axios.get<OrderDto[]>(`${API_BASE_URL}`, getAuthHeaders());
        return response.data;
    },

    // GET: api/Orders/{id}
    getOrderById: async (id: number): Promise<OrderDto> => {
        const response = await axios.get<OrderDto>(`${API_BASE_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    // GET: api/Orders/my-order (User)
    getMyOrders: async (): Promise<OrderDto[]> => {
        const response = await axios.get<OrderDto[]>(`${API_BASE_URL}/my-order`, getAuthHeaders());
        return response.data;
    },

    // POST: api/Orders (User)
    createOrder: async (order: Partial<OrderDto>): Promise<void> => {
        await axios.post(`${API_BASE_URL}`, order, getAuthHeaders());
    },

    // PUT: api/Orders/{id} (Admin)
    updateOrder: async (id: number, order: OrderDto): Promise<void> => {
        await axios.put(`${API_BASE_URL}/${id}`, order, getAuthHeaders());
    },

    // PATCH: api/Orders/{id}/ship (Admin)
    markOrderAsShipped: async (id: number): Promise<void> => {
        await axios.patch(`${API_BASE_URL}/${id}/ship`, {}, getAuthHeaders());
    },

    // DELETE: api/Orders/{id} (Admin)
    deleteOrder: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders());
    }
};

export default orderService;
