import axios from 'axios';

const API_BASE_URL = 'https://apistoreorders.azurewebsites.net/api/Categories';

export interface Category {
    id: number;
    name: string;
    description: string;
}

const getAuthHeaders = (token?: string) => ({
    headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
        : {
            'Content-Type': 'application/json',
        },
});

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await axios.get<Category[]>(API_BASE_URL);
        return response.data;
    },

    getById: async (id: number): Promise<Category> => {
        const response = await axios.get<Category>(`${API_BASE_URL}/${id}`);
        return response.data;
    },

    create: async (category: Omit<Category, 'id'>, token: string): Promise<Category> => {
        const response = await axios.post<Category>(API_BASE_URL, category, getAuthHeaders(token));
        return response.data;
    },

    update: async (id: number, category: Category, token: string): Promise<void> => {
        await axios.put(`${API_BASE_URL}/${id}`, category, getAuthHeaders(token));
    },

    delete: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders(token));
    },
};
