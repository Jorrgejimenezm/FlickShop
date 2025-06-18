import axios from 'axios';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    weight: number;
    category_id: number;
    category: Category;
    imageUrl?: string;
}
interface Category {
    id: number;
    name: string;
    description: string
}

export interface ProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    weight: number;
    category_id: number;
    image?: File | null;
}

const API_URL = 'https://apistoreorders.azurewebsites.net/api/products';

// Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get<Product[]>(API_URL);
    return response.data;
};

// Obtener un producto por ID
export const getProductById = async (id: number): Promise<Product> => {
    const response = await axios.get<Product>(`${API_URL}/${id}`);
    return response.data;
};

// Crear producto
export const createProduct = async (productData: ProductDto, token: string): Promise<Product> => {
    const formData = new FormData();
    formData.append('Name', productData.name);
    formData.append('Description', productData.description);
    formData.append('Price', productData.price.toString());
    formData.append('Stock', productData.stock.toString());
    formData.append('Weight', productData.weight.toString());
    formData.append('CategoryId', productData.category_id.toString());
    if (productData.image) {
        formData.append('Image', productData.image);
    }

    const response = await axios.post<Product>(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

// Actualizar producto
export const updateProduct = async (id: number, productData: ProductDto, token: string): Promise<void> => {
    const formData = new FormData();
    formData.append('Name', productData.name);
    formData.append('Description', productData.description);
    formData.append('Price', productData.price.toString());
    formData.append('Stock', productData.stock.toString());
    formData.append('weight', productData.weight.toString());
    formData.append('CategoryId', productData.category_id.toString());
    if (productData.image) {
        formData.append('Image', productData.image);
    }

    await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    });
};

// Eliminar producto
export const deleteProduct = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
