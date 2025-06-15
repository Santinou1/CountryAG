import React, { useState, useEffect } from 'react';
import { LogOut, Clock, CheckCircle, MapPin, User, ArrowRight, ArrowLeft, History, Loader2, Search, X, Camera } from 'lucide-react';
import { User as UserType, Ticket } from '../types';
import { useAdminBoletos } from '../hooks/useAdminBoletos';
import { apiUrls } from '../configs/api';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { QRScanner } from './QRScanner';

interface AdminViewProps {
  user: UserType;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { boletos, isLoading, error, refreshBoletos, fetchBoletosByTab } = useAdminBoletos();

  // Efecto para cargar boletos cuando cambia la pestaña
  useEffect(() => {
    console.log('Cambiando a pestaña:', activeTab);
    fetchBoletosByTab(activeTab);
  }, [activeTab, fetchBoletosByTab]);

  // Debug de boletos cuando cambian
  useEffect(() => {
    console.log('Estado actual de los boletos:', boletos.map(boleto => ({
      id: boleto.id,
      status: boleto.status,
      clientName: boleto.clientName,
      uses: boleto.uses
    })));
  }, [boletos]);

  // Filtrar boletos según la búsqueda
  const filteredBoletos = boletos.filter(ticket => 
    searchQuery === '' || 
    ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debug de boletos filtrados por pestaña
  useEffect(() => {
    if (activeTab === 'pending') {
      console.log('Boletos en pestaña pendientes:', filteredBoletos.map(b => ({ id: b.id, status: b.status })));
    } else if (activeTab === 'confirmed') {
      console.log('Boletos en pestaña confirmados:', filteredBoletos.map(b => ({ id: b.id, status: b.status })));
    } else if (activeTab === 'history') {
      console.log('Boletos en pestaña historial:', filteredBoletos.map(b => ({ id: b.id, status: b.status })));
    }
  }, [activeTab, filteredBoletos]);

  const handleTabChange = (tab: 'pending' | 'confirmed' | 'history') => {
    console.log('Cambiando a pestaña:', tab);
    setActiveTab(tab);
    setSearchQuery(''); // Limpiar la búsqueda al cambiar de pestaña
  };

  const handleAprobarBoleto = async (ticketId: string) => {
    try {
      console.log('Aprobando boleto:', ticketId);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(apiUrls.boletos.aprobar(ticketId, user.id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al aprobar el boleto');
      }

      console.log('Boleto aprobado exitosamente');
      await refreshBoletos();
      // Cambiamos a la pestaña de confirmados después de aprobar
      setActiveTab('confirmed');
    } catch (err) {
      console.error('Error al aprobar boleto:', err);
      alert(err instanceof Error ? err.message : 'Error al aprobar el boleto');
      await refreshBoletos();
    }
  };

  const handleRechazarBoleto = async (ticketId: string) => {
    try {
      console.log('Rechazando boleto:', ticketId);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(apiUrls.boletos.rechazar(ticketId, user.id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al rechazar el boleto');
      }

      console.log('Boleto rechazado exitosamente');
      await refreshBoletos();
      // Mantenemos en la pestaña actual después de rechazar
    } catch (err) {
      console.error('Error al rechazar boleto:', err);
      alert(err instanceof Error ? err.message : 'Error al rechazar el boleto');
      await refreshBoletos();
    }
  };

  const handleUseTicket = async (ticketId: string, type: 'ida' | 'vuelta') => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

      // Actualizar el estado local primero
      const updatedBoletos = boletos.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            uses: {
              ...ticket.uses,
              [type]: true
            },
            status: type === 'ida' ? 'used-ida' : 
                   (ticket.uses.ida && type === 'vuelta') ? 'completed' : 
                   ticket.status
          };
        }
        return ticket;
      });

      // Actualizar el estado local
      refreshBoletos();

      const url = type === 'ida' 
        ? apiUrls.boletos.marcarIda(ticketId, user.id)
        : apiUrls.boletos.marcarVuelta(ticketId, user.id);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar el boleto');
      }

      // Actualizar los datos después de la llamada exitosa
      await refreshBoletos();
    } catch (err) {
      console.error('Error al usar boleto:', err);
      // Si hay error, refrescar para asegurar que el estado está sincronizado
      await refreshBoletos();
    }
  };

  const handleQRScan = async (data: { boletoId: number; type: 'ida' | 'vuelta'; codigo: string }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

      // Usar directamente el endpoint de consumo según el tipo
      const url = data.type === 'ida' 
        ? apiUrls.boletos.consumirIda(data.codigo)
        : apiUrls.boletos.consumirVuelta(data.codigo);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el boleto');
      }

      alert('Boleto procesado exitosamente');
      setIsScannerOpen(false);
      await refreshBoletos();
    } catch (err) {
      console.error('Error al procesar boleto:', err);
      alert(err instanceof Error ? err.message : 'Error al procesar el boleto');
    }
  };

  const getActionButtons = (ticket: Ticket) => {
    console.log('Renderizando botones para boleto:', {
      id: ticket.id,
      status: ticket.status,
      uses: ticket.uses,
      clientName: ticket.clientName,
      activeTab
    });

    // Para boletos en la pestaña pendientes, mostrar botones de Confirmar/Rechazar
    if (activeTab === 'pending' && ticket.status === 'pendiente') {
      console.log('Boleto pendiente, mostrando botones Confirmar/Rechazar');
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2 mt-3"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAprobarBoleto(ticket.id)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 bg-green-600 text-white hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRechazarBoleto(ticket.id)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 bg-red-600 text-white hover:bg-red-700"
          >
            <X className="w-4 h-4" />
            Rechazar
          </motion.button>
        </motion.div>
      );
    }

    // Para boletos en la pestaña confirmados, mostrar botones de Usar Ida/Vuelta
    if (activeTab === 'confirmed' && (ticket.status === 'aprobado' || ticket.status === 'used-ida')) {
      console.log('Boleto aprobado o usado ida, mostrando botones Usar Ida/Vuelta');
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2 mt-3"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUseTicket(ticket.id, 'ida')}
            disabled={ticket.uses.ida}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 relative overflow-hidden ${
              ticket.uses.ida
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <motion.div
              className="flex items-center gap-1"
              animate={ticket.uses.ida ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <ArrowRight className="w-3 h-3" />
              {ticket.uses.ida ? 'Ida Usada' : 'Usar Ida'}
              {ticket.uses.ida && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <CheckCircle className="w-3 h-3" />
                </motion.div>
              )}
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUseTicket(ticket.id, 'vuelta')}
            disabled={ticket.uses.vuelta}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 relative overflow-hidden ${
              ticket.uses.vuelta
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <motion.div
              className="flex items-center gap-1"
              animate={ticket.uses.vuelta ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <ArrowLeft className="w-3 h-3" />
              {ticket.uses.vuelta ? 'Vuelta Usada' : 'Usar Vuelta'}
              {ticket.uses.vuelta && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <CheckCircle className="w-3 h-3" />
                </motion.div>
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      );
    }

    console.log('Boleto sin botones:', { status: ticket.status, activeTab });
    return null;
  };

  const getTicketCard = (ticket: Ticket, showActions: boolean = true) => {
    console.log('Renderizando tarjeta de boleto:', {
      id: ticket.id,
      status: ticket.status,
      showActions,
      clientName: ticket.clientName
    });

    return (
      <motion.div
        key={ticket.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-200 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 mb-1"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{ticket.clientName}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2 mb-1"
            >
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{ticket.destination}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <Clock className="w-3 h-3" />
              {ticket.purchaseDate.toLocaleDateString('es-AR')} {ticket.purchaseDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-2"
            >
              <span className={`px-2 py-1 text-xs rounded-full ${
                ticket.status === 'completed' 
                  ? 'bg-gray-100 text-gray-800' 
                  : ticket.status === 'used-ida'
                  ? 'bg-blue-100 text-blue-800'
                  : ticket.status === 'aprobado'
                  ? 'bg-green-100 text-green-800'
                  : ticket.status === 'rechazado'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {ticket.status === 'completed' ? 'Completado' : 
                 ticket.status === 'used-ida' ? 'Ida Usada' : 
                 ticket.status === 'aprobado' ? 'Confirmado' : 
                 ticket.status === 'rechazado' ? 'Rechazado' :
                 ticket.status === 'pendiente' ? 'Pendiente' : 'Pendiente'}
              </span>
            </motion.div>
          </div>
        </div>
        {showActions && getActionButtons(ticket)}
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
    >
      {/* Header con efecto glassmorphism */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl font-bold text-gray-900">Panel Chofer</h1>
            <p className="text-sm text-gray-600">
              Hola, {user?.nombre} {user?.apellido}
            </p>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScannerOpen(true)}
              className="p-2 text-blue-600 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-50"
            >
              <Camera className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto">
        {/* Tabs con animación */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-b border-gray-200"
        >
          <div className="flex">
            {['pending', 'confirmed', 'history'].map((tab, index) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabChange(tab as typeof activeTab)}
                className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-300 relative ${
                  activeTab === tab
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'pending' && 'Pendientes (' + filteredBoletos.length + ')'}
                {tab === 'confirmed' && 'Confirmados (' + filteredBoletos.length + ')'}
                {tab === 'history' && 'Historial (' + filteredBoletos.length + ')'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search Bar con animación */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-4 border-b border-gray-200"
        >
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Search className="h-5 w-5 text-gray-400" />
            </motion.div>
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre del cliente..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-300"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>


        <div className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-8 h-8 text-green-600" />
                </motion.div>
                <span className="ml-2 text-gray-600">Cargando boletos...</span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8 text-red-600"
              >
                <p>Error al cargar los boletos: {error.message}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshBoletos()}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
                >
                  Reintentar
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {activeTab === 'pending' && (
                  <motion.div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Boletos Pendientes
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-gray-500 ml-2">
                          ({filteredBoletos.length} resultados)
                        </motion.span>
                      )}
                    </h2>
                    <AnimatePresence mode="wait">
                      {filteredBoletos.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-8"
                        >
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {searchQuery 
                              ? 'No se encontraron boletos pendientes con ese nombre'
                              : 'No hay boletos pendientes'}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {filteredBoletos.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {getTicketCard(ticket)}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {activeTab === 'confirmed' && (
                  <motion.div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Boletos Confirmados
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-gray-500 ml-2">
                          ({filteredBoletos.length} resultados)
                        </motion.span>
                      )}
                    </h2>
                    <AnimatePresence mode="wait">
                      {filteredBoletos.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-8"
                        >
                          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {searchQuery 
                              ? 'No se encontraron boletos confirmados con ese nombre'
                              : 'No hay boletos confirmados'}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {filteredBoletos.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {getTicketCard(ticket)}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Historial de Boletos
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-gray-500 ml-2">
                          ({filteredBoletos.length} resultados)
                        </motion.span>
                      )}
                    </h2>
                    <AnimatePresence mode="wait">
                      {filteredBoletos.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-8"
                        >
                          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {searchQuery 
                              ? 'No se encontraron boletos en el historial con ese nombre'
                              : 'No hay boletos en el historial'}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {filteredBoletos.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {getTicketCard(ticket, false)}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQRScan}
      />
    </motion.div>
  );
};