import React, { useState, useEffect } from 'react';
import { LogOut, Clock, CheckCircle, MapPin, User, ArrowRight, ArrowLeft, History, Loader2, Search, X, Camera, AlertTriangle, BadgeCheck } from 'lucide-react';
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
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<any | null>(null);

  // Efecto para cargar boletos cuando cambia la pestaña
  useEffect(() => {
    fetchBoletosByTab(activeTab);
  }, [activeTab, fetchBoletosByTab]);

  // Filtrar boletos según la búsqueda
  const filteredBoletos = boletos.filter(ticket => 
    searchQuery === '' || 
    ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.dni && ticket.dni.includes(searchQuery))
  );

  const handleTabChange = (tab: 'pending' | 'confirmed' | 'history') => {
    setActiveTab(tab);
    setSearchQuery(''); // Limpiar la búsqueda al cambiar de pestaña
  };

  const handleAprobarBoleto = async (ticketId: string) => {
    try {
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

      await refreshBoletos();
      // Cambiamos a la pestaña de confirmados después de aprobar
      setActiveTab('confirmed');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar el boleto');
      await refreshBoletos();
    }
  };

  const handleRechazarBoleto = async (ticketId: string) => {
    try {
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

      await refreshBoletos();
      // Mantenemos en la pestaña actual después de rechazar
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar el boleto');
      await refreshBoletos();
    }
  };

  const handleQRScan = async (qrData: { boletoId: number; userId: number; codigo: string; timestamp: string }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

      // Nuevo endpoint único de escaneo
      const url = apiUrls.qr.escanear(user.id);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorModal(errorData.message || 'Error al procesar el boleto');
        return;
      }

      setIsScannerOpen(false);
      await refreshBoletos();
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      setSuccessModal(data);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'Error al procesar el boleto');
    }
  };

  const getActionButtons = (ticket: Ticket) => {
    // Para boletos en la pestaña pendientes, mostrar botones de Confirmar/Rechazar
    if (activeTab === 'pending' && ticket.status === 'pendiente') {
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
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 bg-primary text-white hover:bg-secondary"
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
    return null;
  };

  const getTicketCard = (ticket: Ticket, showActions: boolean = true) => {
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
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-dark-gray">{ticket.clientName}</span>
              {ticket.dni && (
                <span className="ml-2 text-sm text-gray-500">DNI: {ticket.dni}</span>
              )}
              {ticket.createdAt && (
                <span className="ml-2 text-xs text-gray-400">Creado: {new Date(ticket.createdAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</span>
              )}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="hidden"
            >
              {/* Ubicación eliminada */}
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
                  ? 'bg-accent text-primary'
                  : ticket.status === 'aprobado'
                  ? 'bg-blue-100 text-primary'
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
            {(ticket.validoHasta || ticket.qrValidoHasta) && (
              <div className="mt-2 flex flex-col gap-1 text-xs text-gray-700 bg-gray-50 rounded-lg p-2 border border-gray-100">
                {ticket.validoHasta && (
                  <div><span className="font-semibold">Válido hasta:</span> {new Date(ticket.validoHasta).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</div>
                )}
                {ticket.qrValidoHasta && (
                  <div><span className="font-semibold">QR válido hasta:</span> {new Date(ticket.qrValidoHasta).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</div>
                )}
              </div>
            )}
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
      className="min-h-screen bg-gradient-to-b from-gray-50 to-accent"
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
            <h1 className="text-xl font-bold text-primary">Panel Chofer</h1>
            <p className="text-sm text-secondary">
              Hola, {user?.nombre} {user?.apellido}
            </p>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScannerOpen(true)}
              className="p-2 text-primary hover:text-secondary transition-colors rounded-full hover:bg-blue-50"
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
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                {tab === 'pending' && 'Pendientes (' + filteredBoletos.length + ')'}
                {tab === 'confirmed' && 'Confirmados (' + filteredBoletos.length + ')'}
                {tab === 'history' && 'Historial (' + filteredBoletos.length + ')'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all duration-300"
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
                  <Loader2 className="w-8 h-8 text-primary" />
                </motion.div>
                <span className="ml-2 text-secondary">Cargando boletos...</span>
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
                    <h2 className="text-lg font-semibold text-primary">
                      Boletos Pendientes
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-secondary ml-2">
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
                    <h2 className="text-lg font-semibold text-primary">
                      Boletos Confirmados
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-secondary ml-2">
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
                    <h2 className="text-lg font-semibold text-primary">
                      Historial de Boletos
                      {searchQuery && (
                        <motion.span className="text-sm font-normal text-secondary ml-2">
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

      <AnimatePresence>
        {errorModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setErrorModal(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="flex flex-col items-center gap-3 mb-4">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                <h2 className="text-xl font-bold text-dark-gray">Error al escanear QR</h2>
              </div>
              <div className="text-base text-secondary mb-4">{errorModal}</div>
              <button
                onClick={() => setErrorModal(null)}
                className="px-5 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition shadow-md mt-2"
              >
                Volver a intentar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de éxito al escanear QR */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setSuccessModal(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="flex flex-col items-center gap-3 mb-4">
                <BadgeCheck className="w-10 h-10 text-primary" />
                <h2 className="text-xl font-bold text-primary">¡Boleto escaneado correctamente!</h2>
              </div>
              <div className="text-base text-secondary mb-4">
                <div className="flex flex-col items-center gap-2">
                  {successModal.propietario && (
                    <>
                      <span className="font-semibold">DNI:</span> <span>{successModal.propietario.dni}</span>
                      <span className="font-semibold">Propietario:</span> <span>{successModal.propietario.nombre} {successModal.propietario.apellido}</span>
                    </>
                  )}
                  <span className="font-semibold">Código:</span> <span>{successModal.codigo}</span>
                  <span className="font-semibold">ID Boleto:</span> <span>{successModal.boletoId}</span>
                  {successModal.timestamp && (
                    <span className="font-semibold">Escaneado:</span>
                  )}
                  {successModal.timestamp && (
                    <span>{new Date(successModal.timestamp).toLocaleString('es-AR')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSuccessModal(null)}
                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition shadow-md mt-2"
              >
                Escanear otro boleto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};