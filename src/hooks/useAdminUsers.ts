import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '../configs/api';
import { User } from '../types';

interface AdminUser extends User {
  nombre?: string;
  apellido?: string;
  email: string;
  rol: 'admin' | 'usuario' | 'chofer';
  createdAt?: string;
  dni?: string;
  celular?: string;
}

interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  rol: 'admin' | 'usuario' | 'chofer';
  dni: string;
  celular: string;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUser: (id: string, userData: Partial<CreateUserData>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validarAutenticacion = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return token;
  }, []);

  const obtenerUsuarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.users.getAll, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para ver la lista de usuarios. Solo los administradores pueden acceder a esta función.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener los usuarios' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data: AdminUser[] = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      setError(errorMessage);
      console.error('Error al obtener usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [validarAutenticacion]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.users.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para crear usuarios. Solo los administradores pueden realizar esta acción.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al crear el usuario' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      await obtenerUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el usuario';
      setError(errorMessage);
      console.error('Error al crear usuario:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerUsuarios]);

  const updateUser = useCallback(async (id: string, userData: Partial<CreateUserData>) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.users.update(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para actualizar usuarios. Solo los administradores pueden realizar esta acción.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el usuario' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      await obtenerUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el usuario';
      setError(errorMessage);
      console.error('Error al actualizar usuario:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerUsuarios]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.users.delete(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para eliminar usuarios. Solo los administradores pueden realizar esta acción.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al eliminar el usuario' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      await obtenerUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el usuario';
      setError(errorMessage);
      console.error('Error al eliminar usuario:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerUsuarios]);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: obtenerUsuarios,
  };
}; 