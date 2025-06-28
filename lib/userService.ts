import { apiRequest, User, UserCreate, UserUpdate, UserListResponse } from './api';

export class UserService {
  // Obtener lista de usuarios con filtros
  static async getUsers(params?: {
    skip?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
  }): Promise<UserListResponse> {
    console.log("👥 UserService: Iniciando getUsers con params:", params);
    
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const endpoint = `/auth/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🌐 UserService: Endpoint final:", endpoint);
    
    try {
      const response = await apiRequest<UserListResponse>(endpoint);
      console.log("✅ UserService: Respuesta exitosa:", response);
      return response;
    } catch (error) {
      console.error("❌ UserService: Error en getUsers:", error);
      throw error;
    }
  }

  // Obtener un usuario específico
  static async getUser(userId: number): Promise<User> {
    console.log("👤 UserService: Obteniendo usuario:", userId);
    return await apiRequest<User>(`/auth/users/${userId}`);
  }

  // Crear un nuevo usuario
  static async createUser(userData: UserCreate): Promise<User> {
    console.log("➕ UserService: Creando usuario:", userData);
    return await apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Actualizar un usuario
  static async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    console.log("✏️ UserService: Actualizando usuario:", userId, userData);
    return await apiRequest<User>(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Eliminar un usuario
  static async deleteUser(userId: number): Promise<void> {
    console.log("🗑️ UserService: Eliminando usuario:", userId);
    await apiRequest<void>(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Cambiar estado de un usuario (activar/desactivar)
  static async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    console.log("🔄 UserService: Cambiando estado de usuario:", userId, "a:", isActive);
    return await this.updateUser(userId, { is_active: isActive });
  }

  // Mapear roles del backend a roles del frontend
  static mapRoleToFrontend(role: string): string {
    const roleMap: { [key: string]: string } = {
      'EMPLOYEE': 'empleado',
      'SUPERVISOR': 'supervisor',
      'SIGNER': 'firmante',
      'INSTITUTIONAL_MANAGER': 'gestor',
      'ADMIN': 'admin',
    };
    return roleMap[role] || role;
  }

  // Mapear roles del frontend a roles del backend
  static mapRoleToBackend(role: string): string {
    const roleMap: { [key: string]: string } = {
      'empleado': 'EMPLOYEE',
      'supervisor': 'SUPERVISOR',
      'firmante': 'SIGNER',
      'gestor': 'INSTITUTIONAL_MANAGER',
      'admin': 'ADMIN',
    };
    return roleMap[role] || role;
  }
} 