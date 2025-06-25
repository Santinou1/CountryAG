import React, { useState, useMemo } from 'react';
import { User, Mail, Shield, Edit, Trash2, MoreVertical, CheckCircle, XCircle, CreditCard, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { filterUsers } from '../../utils/searchUtils';

interface AdminUser {
  id: string;
  nombre?: string;
  apellido?: string;
  email: string;
  rol: 'admin' | 'usuario' | 'chofer';
  createdAt?: string;
  dni?: string;
  celular?: string;
}

interface UsersTabProps {
  users: AdminUser[];
  onUpdateUser: (id: string, userData: any) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  onUpdateUser,
  onDeleteUser,
  onRefresh
}) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchTerm);
  }, [users, searchTerm]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    setIsLoading(userId);
    try {
      await onDeleteUser(userId);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'usuario' | 'chofer') => {
    const newRole = currentRole === 'admin' ? 'usuario' : currentRole === 'usuario' ? 'chofer' : 'admin';
    setIsLoading(userId);
    try {
      await onUpdateUser(userId, { rol: newRole });
    } catch (error) {
      console.error('Error al actualizar rol:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'chofer':
        return 'bg-orange-100 text-orange-800';
      case 'usuario':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SearchBar
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredUsers.length} de {users.length} usuarios encontrados
          </div>
        )}
      </div>

      {/* Lista de usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.nombre && user.apellido 
                          ? `${user.nombre} ${user.apellido}`
                          : user.email
                        }
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                      {user.dni && (
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">DNI: {user.dni}</span>
                        </div>
                      )}
                      {user.celular && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">Tel: {user.celular}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                      {user.rol === 'admin' ? 'Admin' : user.rol === 'chofer' ? 'Chofer' : 'Usuario'}
                    </span>
                    <button
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedUser === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.rol)}
                            disabled={isLoading === user.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            {user.rol === 'admin' ? 'Quitar Admin' : user.rol === 'chofer' ? 'Hacer Usuario' : 'Hacer Chofer'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoading === user.id}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}; 