import axios from 'axios';

const API_URL = 'https://apistoreorders.azurewebsites.net/api/auth';

export interface RegisterData {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UpdateProfileData {
    nombre: string;
    apellidos: string;
    direccion: string;
    telefono: string;
}

const extractError = (error: any) => {
    return error?.response?.data?.message || 'Error en la solicitud';
};

export const register = async (data: RegisterData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, data);
        return response.data;
    } catch (error: any) {
        throw extractError(error);
    }
};

export const login = async (data: LoginData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, data);
        const { token } = response.data;
        localStorage.setItem('token', token);
        return token;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.response?.data ||
            'Error al iniciar sesión.';
        throw new Error(message);
    }
};

export const updateProfile = async (data: UpdateProfileData) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_URL}/update-profile`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const newToken = response.data.token;
        if (newToken) {
            localStorage.setItem('token', newToken);
        }

        return response.data;
    } catch (error: any) {
        throw extractError(error);
    }
};


export const confirmEmail = async (userId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/confirmemail`, {
            params: { userId, token },
        });
        return response.data;
    } catch (error: any) {
        throw extractError(error);
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isAuthenticated = () => {
    return !!getToken();
};
