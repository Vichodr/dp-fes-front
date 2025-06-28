import { apiRequest, LoginRequest, LoginResponse, User } from './api';

export class AuthService {
  // Login de usuario
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Intentando login con:', credentials.email);
    
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('✅ Login exitoso:', response);

    // Guardar token en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('userRole', response.user_role);
      localStorage.setItem('userId', response.user_id.toString());
      localStorage.setItem('userName', response.user_name);
      
      console.log('💾 Token guardado en localStorage:', {
        accessToken: response.access_token,
        userRole: response.user_role,
        userId: response.user_id,
        userName: response.user_name
      });
    }

    return response;
  }

  // Logout de usuario
  static logout(): void {
    console.log('🚪 Cerrando sesión...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('🔍 Verificando autenticación, token existe:', !!token);
      return !!token;
    }
    return false;
  }

  // Obtener información del usuario actual
  static getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');

      console.log('👤 Obteniendo usuario actual:', { userId, userName, userRole });

      if (userId && userName && userRole) {
        return {
          id: parseInt(userId),
          name: userName,
          email: '', // No se guarda en localStorage por seguridad
          role: userRole as any,
          is_active: true,
          created_at: new Date().toISOString(),
        };
      }
    }
    return null;
  }

  // Obtener rol del usuario actual
  static getCurrentUserRole(): string | null {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      console.log('🎭 Rol actual:', role);
      return role;
    }
    return null;
  }

  // Obtener información completa del usuario desde el servidor
  static async getCurrentUserInfo(): Promise<User> {
    console.log('📡 Obteniendo información completa del usuario...');
    return await apiRequest<User>('/auth/me');
  }

  // Verificar si el token es válido
  static async validateToken(): Promise<boolean> {
    try {
      console.log('🔍 Validando token...');
      await this.getCurrentUserInfo();
      console.log('✅ Token válido');
      return true;
    } catch (error) {
      console.log('❌ Token inválido:', error);
      this.logout();
      return false;
    }
  }

  // Obtener el token actual (para debugging)
  static getCurrentToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('🎫 Token actual:', token ? `${token.substring(0, 20)}...` : 'No hay token');
      return token;
    }
    return null;
  }
} 