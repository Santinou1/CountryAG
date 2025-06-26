import React, { useState, useEffect } from 'react';
import { LogOut, Users, Ticket, Plus, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminBoletos } from '../hooks/useAdminBoletos';
import { CreateUserModal, UsersTab, BoletosTab, MetricasTab } from './admin';

interface AdminViewProps {
  user: User;
}

type TabType = 'users' | 'boletos' | 'metricas';

export const AdminView: React.FC<AdminViewProps> = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = initialUser.role === 'admin';

  const {
    users,
    isLoading: isLoadingUsers,
    error: usersError,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useAdminUsers();

  const {
    boletos,
    isLoading: isLoadingBoletos,
    error: boletosError,
    aprobarBoleto,
    rechazarBoleto,
    consumoManual,
    refreshBoletos
  } = useAdminBoletos();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('countryag-user');
    localStorage.removeItem('countryag-tickets');
    navigate('/login');
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
      setShowCreateUserModal(false);
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  // Si no es admin, mostrar solo la pestaña de boletos
  useEffect(() => {
    if (!isAdmin && (activeTab === 'users' || activeTab === 'metricas')) {
      setActiveTab('boletos');
    }
  }, [isAdmin, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'used-ida':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {initialUser.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'users'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Usuarios ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('boletos')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'boletos'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  Boletos ({boletos.length})
                </button>
                <button
                  onClick={() => setActiveTab('metricas')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'metricas'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Métricas
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm">
                <Ticket className="w-4 h-4" />
                Boletos ({boletos.length})
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {isAdmin && activeTab === 'users' ? (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo
                </button>
              </div>

              {usersError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{usersError}</span>
                  </div>
                </div>
              )}

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <UsersTab
                  users={users}
                  onUpdateUser={updateUser}
                  onDeleteUser={deleteUser}
                  onRefresh={refreshUsers}
                />
              )}
            </motion.div>
          ) : isAdmin && activeTab === 'metricas' ? (
            <motion.div
              key="metricas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MetricasTab />
            </motion.div>
          ) : (
            <motion.div
              key="boletos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? 'Gestión de Boletos' : 'Panel de Boletos'}
                </h2>
              </div>

              {boletosError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{boletosError}</span>
                  </div>
                </div>
              )}

              {isLoadingBoletos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <BoletosTab
                  boletos={boletos}
                  onAprobarBoleto={aprobarBoleto}
                  onRechazarBoleto={rechazarBoleto}
                  onConsumoManual={consumoManual}
                  onRefresh={refreshBoletos}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create User Modal - Solo para admins */}
      {isAdmin && (
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onCreateUser={handleCreateUser}
        />
      )}
    </motion.div>
  );
};

export default AdminView; 