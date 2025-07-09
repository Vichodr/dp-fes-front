const API_BASE_URL = 'http://localhost:8000';

// Tipos de datos
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'SUPERVISOR' | 'SIGNER' | 'INSTITUTIONAL_MANAGER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_name: string;
  user_role: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'SUPERVISOR' | 'SIGNER' | 'INSTITUTIONAL_MANAGER' | 'ADMIN';
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  role?: 'EMPLOYEE' | 'SUPERVISOR' | 'SIGNER' | 'INSTITUTIONAL_MANAGER' | 'ADMIN';
  is_active?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
}

export interface Document {
  id: number;
  name: string;
  status: string;
  upload_date: string;
  user_id: number;
  // Propiedades adicionales según la respuesta real del backend
  user?: User;
  file_size?: number;
  signatures?: any[];
  hash?: string;
  file_path?: string;
  rejection_date?: string | null;
  signed_date?: string | null;
  history?: any[];
}

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Función para configurar headers de autenticación
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('📤 Headers de la petición:', headers);
  return headers;
};

// Función para manejar errores de respuesta
export const handleResponse = async (response: Response) => {
  console.log('📥 Respuesta del servidor:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Error en la respuesta:', errorData);
    throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Datos recibidos:', data);
  return data;
};

// Función para hacer peticiones HTTP
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  console.log('🌐 Haciendo petición a:', url);
  console.log('⚙️ Configuración:', {
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body
  });

  const response = await fetch(url, config);
  return handleResponse(response);
}; 