import React from 'react';
import { Shield, User, Truck, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: 'admin' | 'usuario' | 'chofer') => void;
  currentRole: 'admin' | 'usuario' | 'chofer';
  userName: string;
  isLoading?: boolean;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentRole,
  userName,
  isLoading = false,
}) => {
  const roleOptions = [
    {
      value: 'usuario' as const,
      label: 'Usuario',
      description: 'Acceso básico al sistema',
      icon: User,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-300',
    },
    {
      value: 'chofer' as const,
      label: 'Chofer',
      description: 'Acceso a vista de conductor',
      icon: Truck,
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      selectedColor: 'bg-orange-100 border-orange-300',
    },
    {
      value: 'admin' as const,
      label: 'Administrador',
      description: 'Acceso completo al sistema',
      icon: Shield,
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      selectedColor: 'bg-purple-100 border-purple-300',
    },
  ];

  const [selectedRole, setSelectedRole] = React.useState<'admin' | 'usuario' | 'chofer'>(currentRole);

  const handleConfirm = () => {
    if (selectedRole !== currentRole) {
      onConfirm(selectedRole);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-50">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cambiar Rol de Usuario</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Selecciona el nuevo rol para <span className="font-medium">{userName}</span>
                </p>
                
                <div className="space-y-3">
                  {roleOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedRole === option.value;
                    const isCurrent = currentRole === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedRole(option.value)}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? option.selectedColor 
                            : option.color
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{option.label}</span>
                              {isCurrent && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                  Actual
                                </span>
                              )}
                              {isSelected && (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                            <p className="text-sm opacity-80 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || selectedRole === currentRole}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar Rol'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 