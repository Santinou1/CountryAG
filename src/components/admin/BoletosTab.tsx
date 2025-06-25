import React, { useState, useMemo } from 'react';
import { Ticket, User, Calendar, CheckCircle, XCircle, Clock, MoreVertical, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket as TicketType } from '../../types';
import { SearchBar } from './SearchBar';
import { filterBoletos } from '../../utils/searchUtils';

interface BoletosTabProps {
  boletos: TicketType[];
  onAprobarBoleto: (boletoId: string, userId: string) => Promise<void>;
  onRechazarBoleto: (boletoId: string, userId: string) => Promise<void>;
  onConsumoManual: (boletoId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const BoletosTab: React.FC<BoletosTabProps> = ({
  boletos,
  onAprobarBoleto,
  onRechazarBoleto,
  onConsumoManual,
  onRefresh
}) => {
  const [expandedBoleto, setExpandedBoleto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar boletos basado en el término de búsqueda
  const filteredBoletos = useMemo(() => {
    return filterBoletos(boletos, searchTerm);
  }, [boletos, searchTerm]);

  const handleAprobarBoleto = async (boletoId: string, userId: string) => {
    setIsLoading(boletoId);
    try {
      await onAprobarBoleto(boletoId, userId);
    } catch (error) {
      console.error('Error al aprobar boleto:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRechazarBoleto = async (boletoId: string, userId: string) => {
    setIsLoading(boletoId);
    try {
      await onRechazarBoleto(boletoId, userId);
    } catch (error) {
      console.error('Error al rechazar boleto:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleConsumoManual = async (boletoId: string) => {
    if (!confirm('¿Confirmar consumo manual de este boleto?')) {
      return;
    }
    
    setIsLoading(boletoId);
    try {
      await onConsumoManual(boletoId);
    } catch (error) {
      console.error('Error al registrar consumo manual:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'completed':
        return 'Completado';
      case 'used-ida':
        return 'Usado Ida';
      default:
        return status;
    }
  };

  const getUsesText = (uses: { ida: boolean; vuelta: boolean }, contador?: number) => {
    if (contador !== undefined) {
      if (contador === 0) return 'Sin uso';
      if (contador === 1) return '1 uso (Ida)';
      if (contador === 2) return '2 usos (Ida y Vuelta)';
      return `${contador} usos`;
    }
    
    // Fallback a la lógica anterior si no hay contador
    if (uses.ida && uses.vuelta) return 'Ida y Vuelta';
    if (uses.ida) return 'Solo Ida';
    if (uses.vuelta) return 'Solo Vuelta';
    return 'Sin uso';
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SearchBar
          placeholder="Buscar por nombre del cliente o DNI..."
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredBoletos.length} de {boletos.length} boletos encontrados
          </div>
        )}
      </div>

      {/* Lista de boletos */}
      {filteredBoletos.length === 0 ? (
        <div className="text-center py-8">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron boletos con ese criterio' : 'No hay boletos registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBoletos.map((boleto) => (
            <motion.div
              key={boleto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {boleto.clientName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{boleto.destination}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{getUsesText(boleto.uses, boleto.contador)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(boleto.status)}`}>
                      {getStatusText(boleto.status)}
                    </span>
                    <button
                      onClick={() => setExpandedBoleto(expandedBoleto === boleto.id ? null : boleto.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedBoleto === boleto.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Comprado:</span>
                            <div className="text-gray-900">{formatDate(boleto.createdAt)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Válido hasta:</span>
                            <div className="text-gray-900">{formatDate(boleto.validoHasta)}</div>
                          </div>
                        </div>

                        {/* Información del usuario */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Usuario</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {boleto.email && (
                              <div>
                                <span className="text-gray-600">Email:</span>
                                <div className="text-gray-900">{boleto.email}</div>
                              </div>
                            )}
                            {boleto.celular && (
                              <div>
                                <span className="text-gray-600">Celular:</span>
                                <div className="text-gray-900">{boleto.celular}</div>
                              </div>
                            )}
                            {boleto.dni && (
                              <div>
                                <span className="text-gray-600">DNI:</span>
                                <div className="text-gray-900">{boleto.dni}</div>
                              </div>
                            )}
                            {boleto.rol && (
                              <div>
                                <span className="text-gray-600">Rol:</span>
                                <div className="text-gray-900 capitalize">{boleto.rol}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Usos:</span>
                          <div className="flex items-center gap-1">
                            {boleto.contador !== undefined ? (
                              <span className="text-gray-900 font-medium">{boleto.contador} uso{boleto.contador !== 1 ? 's' : ''}</span>
                            ) : (
                              <>
                                {boleto.uses.ida ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-900">Ida</span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                {boleto.uses.vuelta ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-900">Vuelta</span>
                              </>
                            )}
                          </div>
                        </div>

                        {boleto.status === 'pendiente' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAprobarBoleto(boleto.id, boleto.clientId)}
                              disabled={isLoading === boleto.id}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazarBoleto(boleto.id, boleto.clientId)}
                              disabled={isLoading === boleto.id}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        )}

                        {boleto.status === 'aprobado' && !boleto.uses.ida && (
                          <button
                            onClick={() => handleConsumoManual(boleto.id)}
                            disabled={isLoading === boleto.id}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Consumo Manual Ida
                          </button>
                        )}

                        {boleto.status === 'aprobado' && boleto.uses.ida && !boleto.uses.vuelta && (
                          <button
                            onClick={() => handleConsumoManual(boleto.id)}
                            disabled={isLoading === boleto.id}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Consumo Manual Vuelta
                          </button>
                        )}
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