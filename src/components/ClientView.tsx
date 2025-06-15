import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, LogOut, Clock, CheckCircle, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Ticket as TicketIcon, Search, ChevronsLeft, ChevronsRight, PlusCircle, Loader2, QrCode } from 'lucide-react';
import { lotes } from '../data/lotes';
import { User, Ticket } from '../types';
import { useNavigate } from 'react-router-dom';
import { apiUrls } from '../configs/api';
import { useBoletos } from '../hooks/useBoletos';
import { QRModal } from './QRModal';
import './ClientView.css';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientViewProps {
  user: User;
}

interface QRData {
    qrCode: string;
    codigo: string;
    type: 'ida' | 'vuelta';
}

export const ClientView: React.FC<ClientViewProps> = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNumber, setSearchNumber] = useState('');
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrTitle, setQrTitle] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState<string | null>(null);
  const itemsPerPage = 4;

  const { 
    boletos, 
    isLoading, 
    error: boletosError, 
    comprarBoleto, 
    refreshBoletos,
    generarQR 
  } = useBoletos(user.id);

  const fetchUserInfo = useCallback(async () => {
      try {
      setIsLoadingUser(true);
      setUserError(null);
      
        const token = localStorage.getItem('access_token');
        if (!token) {
        throw new Error('No hay token de autenticación');
        }

        const response = await fetch(apiUrls.users.me, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('access_token');
        localStorage.removeItem('countryag-user');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

        if (!response.ok) {
          throw new Error('Error al obtener información del usuario');
        }

        const data = await response.json();
      
      // Actualizar el estado del usuario
      const updatedUser = {
        ...initialUser,
        id: data.id.toString(),
          nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol.toLowerCase()
      };
      
      setUser(updatedUser);
      
      // Actualizar el usuario en localStorage
      localStorage.setItem('countryag-user', JSON.stringify({
        id: updatedUser.id,
        name: `${updatedUser.nombre} ${updatedUser.apellido}`,
        role: updatedUser.rol
        }));

      if (data.rol.toLowerCase() === 'admin') {
          navigate('/admin');
        }
      } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      setUserError(error instanceof Error ? error.message : 'Error al cargar datos del usuario');
      
      if (error instanceof Error && (
        error.message.includes('Sesión expirada') || 
        error.message.includes('No hay token')
      )) {
        navigate('/login');
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [initialUser, navigate]);

  // Efecto para cargar la información del usuario
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Efecto para manejar cambios en el token
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (!e.newValue) {
          // Token eliminado
          navigate('/login');
        } else {
          // Token actualizado
          fetchUserInfo();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserInfo, navigate]);

  const handlePurchase = async (loteId: string) => {
    try {
      setPurchaseError(null);
      await comprarBoleto(loteId);
      setShowPurchaseSection(false); // Volver a la vista de boletos después de comprar
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Error al comprar el boleto');
    }
  };

  // Calcular lotes para la página actual
  const indexOfLastLote = currentPage * itemsPerPage;
  const indexOfFirstLote = indexOfLastLote - itemsPerPage;
  const currentLotes = lotes.slice(indexOfFirstLote, indexOfLastLote);
  const totalPages = Math.ceil(lotes.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleLogout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('countryag-user');
    localStorage.removeItem('countryag-tickets');
    
    // Limpiar estado
    setUser(initialUser);
    setUserError(null);
    
    // Redirigir a login
    navigate('/login');
  }, [initialUser, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const number = parseInt(searchNumber);
    if (!isNaN(number) && number >= 1 && number <= 100) {
      const page = Math.ceil(number / itemsPerPage);
      setCurrentPage(page);
      // Scroll al lote específico
      const element = document.getElementById(`lote-${number}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), 2000);
      }
    }
    setSearchNumber('');
  };

  const handleGenerarQR = async (boletoId: string, tipo: 'ida' | 'vuelta') => {
    try {
      setIsGeneratingQR(boletoId);
      setQrTitle(`Código QR - ${tipo === 'ida' ? 'Ida' : 'Vuelta'}`);
      setQrData(null);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const qrResponse = await generarQR(boletoId, tipo);
      setQrData(qrResponse);
    } catch (err) {
      console.error('Error al generar QR:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsGeneratingQR(null);
    }
  };

  const getStatusBadge = (ticket: Ticket) => {
    switch (ticket.status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pendiente</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Confirmado</span>;
      case 'used-ida':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Ida Usada</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Completado</span>;
      default:
        return null;
    }
  };

  const getUsageInfo = (ticket: Ticket) => {
    const isGeneratingThisTicket = isGeneratingQR === ticket.id;
    
    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-1 ${ticket.uses.ida ? 'text-green-600' : 'text-gray-400'}`}
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">Ida</span>
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
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`flex items-center gap-1 ${ticket.uses.vuelta ? 'text-green-600' : 'text-gray-400'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vuelta</span>
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
        </div>
        
        {/* Botones de QR con animaciones mejoradas */}
        <div className="flex gap-2 mt-2">
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleGenerarQR(ticket.id, 'ida')}
            disabled={ticket.uses.ida || isGeneratingQR !== null}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 relative overflow-hidden ${
              ticket.uses.ida
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGeneratingThisTicket && (
              <motion.div
                className="absolute inset-0 bg-blue-700"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            )}
            <motion.div
              className="relative z-10 flex items-center gap-1"
              animate={isGeneratingThisTicket ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
          >
            <QrCode className="w-4 h-4" />
              {isGeneratingThisTicket ? 'Generando...' : 'QR Ida'}
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => handleGenerarQR(ticket.id, 'vuelta')}
            disabled={ticket.uses.vuelta || isGeneratingQR !== null}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 relative overflow-hidden ${
              ticket.uses.vuelta
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isGeneratingThisTicket && (
              <motion.div
                className="absolute inset-0 bg-orange-700"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            )}
            <motion.div
              className="relative z-10 flex items-center gap-1"
              animate={isGeneratingThisTicket ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
          >
            <QrCode className="w-4 h-4" />
              {isGeneratingThisTicket ? 'Generando...' : 'QR Vuelta'}
            </motion.div>
          </motion.button>
        </div>
      </div>
    );
  };

  // Función para obtener el rango de páginas a mostrar
  const getPageRange = () => {
    const totalVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    let endPage = startPage + totalVisiblePages - 1;

    // Ajustar si estamos cerca del final
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
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
            <h1 className="text-xl font-bold text-gray-900">Mis Boletos</h1>
            {isLoadingUser ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando datos...
              </div>
            ) : userError ? (
              <p className="text-sm text-red-600">{userError}</p>
            ) : (
            <p className="text-sm text-gray-600">
                Hola, {user.nombre} {user.apellido}
            </p>
            )}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={showPurchaseSection ? 'purchase' : 'tickets'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Mis Boletos</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={() => setShowPurchaseSection(!showPurchaseSection)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              {showPurchaseSection ? 'Ver Mis Boletos' : 'Comprar Nuevo Boleto'}
              </motion.button>
          </div>
          
          {!showPurchaseSection && (
              <AnimatePresence mode="wait">
              {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">Cargando boletos...</p>
                  </motion.div>
              ) : boletosError ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-center py-8 bg-white rounded-xl shadow-sm border border-red-100"
                  >
                  <p className="text-red-600 mb-2">Error al cargar los boletos</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    onClick={() => refreshBoletos()}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Intentar de nuevo
                    </motion.button>
                  </motion.div>
              ) : boletos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes boletos aún</p>
                  <p className="text-sm text-gray-400 mb-4">Compra tu primer boleto para visitar nuestros lotes</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPurchaseSection(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Comprar Boleto
                    </motion.button>
                  </motion.div>
              ) : (
                  <div className="space-y-4">
                    {boletos
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                      .map((ticket, index) => (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{ticket.destination}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {ticket.purchaseDate.toLocaleDateString('es-AR')} {ticket.purchaseDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {getStatusBadge(ticket)}
                      </div>
                      {getUsageInfo(ticket)}
                        </motion.div>
                      ))}
                    </div>
              )}
              </AnimatePresence>
          )}

          {showPurchaseSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
              {purchaseError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4"
                  >
                  {purchaseError}
                  </motion.div>
              )}
              
                {/* Buscador de Lotes con animación */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchNumber}
                      onChange={(e) => setSearchNumber(e.target.value)}
                      placeholder="Buscar por número de lote (1-100)"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Buscar
                    </motion.button>
                </form>
                </motion.div>

                {/* Grid de Lotes con animaciones */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Lote</h2>
                <div className="grid grid-cols-1 gap-4">
                    {currentLotes.map((lote, index) => (
                      <motion.button
                      key={lote.id}
                      id={`lote-${lote.number}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => handlePurchase(lote.id)}
                        className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-green-600">{lote.name}</div>
                          <div className="text-sm text-gray-500">Lote #{lote.number}</div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          ${lote.price.toLocaleString('es-AR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TicketIcon className="w-4 h-4" />
                        <span>{lote.description}</span>
                      </div>
                      </motion.button>
                  ))}
                </div>

                  {/* Paginación con animaciones */}
                {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center items-center gap-2 mt-6"
                    >
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="Ir al inicio"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {getPageRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-lg ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="Página siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="Ir al final"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </button>
                    </motion.div>
                )}
              </div>
              </motion.div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de QR con animación */}
      <AnimatePresence>
        {(qrData || isGeneratingQR) && (
        <QRModal
            isOpen={!!qrData}
            onClose={() => setQrData(null)}
            title={qrTitle}
            qrCode={qrData?.qrCode || ''}
            codigo={qrData?.codigo || ''}
        />
      )}
      </AnimatePresence>
    </motion.div>
  );
};