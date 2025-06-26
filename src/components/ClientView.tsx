import React, { useEffect, useState, useCallback } from 'react';
import { LogOut, Loader2, QrCode, PlusCircle, CheckCircle, Clock, Infinity, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrls } from '../configs/api';
import { useBoletos } from '../hooks/useBoletos';
import { QRModal } from './QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentSuccessModal } from './PaymentSuccessModal';

interface ClientViewProps {
  user: User;
}

const BOLETO_PRECIO = 7000; // Precio fijo
const BOLETO_DESCRIPCION = 'Válido por 24 horas desde el primer escaneo. Usos ilimitados.';

export const ClientView: React.FC<ClientViewProps> = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any | null>(null);
  const [qrTitle, setQrTitle] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tipoBoleto, setTipoBoleto] = useState<'diario' | 'unico'>('diario');

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
      if (!token) throw new Error('No hay token de autenticación');
      const response = await fetch(apiUrls.users.me, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('countryag-user');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      if (!response.ok) throw new Error('Error al obtener información del usuario');
      const data = await response.json();
      const updatedUser = {
        ...initialUser,
        id: data.id.toString(),
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol: data.rol.toLowerCase()
      };
      setUser(updatedUser);
      localStorage.setItem('countryag-user', JSON.stringify({
        id: updatedUser.id,
        name: `${updatedUser.nombre} ${updatedUser.apellido}`,
        role: updatedUser.rol
      }));
      if (data.rol.toLowerCase() === 'admin') navigate('/admin');
    } catch (error) {
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

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (searchParams.get('payment_status') === 'success') {
      setShowSuccessModal(true);
      refreshBoletos();
      // Limpiar el parámetro de la URL
      navigate('/home', { replace: true });
    }
  }, [searchParams, navigate, refreshBoletos]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (!e.newValue) navigate('/login');
        else fetchUserInfo();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserInfo, navigate]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(apiUrls.mercadopago.createPreference, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payer: {
            email: user.email,
          },
          tipo: tipoBoleto,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo generar el link de pago.');
      }

      const preference = await response.json();
      
      if (preference.init_point) {
        window.location.href = preference.init_point;
      } else {
        throw new Error('No se recibió un link de pago válido.');
      }
      
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Error al iniciar la compra');
      setIsPurchasing(false); // Detener el loading solo si hay error
    }
    // No detenemos el loading si todo va bien, porque la página redirigirá.
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('countryag-user');
    localStorage.removeItem('countryag-tickets');
    setUser(initialUser);
    setUserError(null);
    navigate('/login');
  }, [initialUser, navigate]);

  const handleGenerarQR = async (boletoId: string) => {
    try {
      setIsGeneratingQR(boletoId);
      setQrTitle('Código QR de tu boleto');
      setQrData(null);
      setQrError(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      const qrResponse = await generarQR(boletoId, undefined);
      setQrData(qrResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar el QR';
      setQrError(errorMessage);
      console.log('Error al generar QR:', errorMessage);
    } finally {
      setIsGeneratingQR(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Mis Boletos</h1>
            {isLoadingUser ? (
              <div className="flex items-center gap-2 text-sm text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando datos...
              </div>
            ) : userError ? (
              <p className="text-sm text-red-600">{userError}</p>
            ) : (
              <p className="text-sm text-dark-gray">
                Hola, {user.nombre} {user.apellido}
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-secondary transition-colors rounded-full hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Banner */}
        <img 
            src="/ENPUNTO_LARGO_Mesa de trabajo 1.png" 
            alt="En Punto Banner"
            className="w-full rounded-lg shadow-md mb-4" 
        />

        {/* Info del boleto */}
        <div className="bg-blue-50 border border-accent rounded-xl p-4 text-secondary mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">Boleto General</span>
          </div>
          <div className="text-sm mb-1">{tipoBoleto === 'diario' ? 'Válido por 24 horas desde el primer escaneo. Usos ilimitados.' : 'Válido para un solo viaje. Se desactiva tras el primer uso.'}</div>
          <div className="text-sm font-bold text-primary">Precio: {tipoBoleto === 'diario' ? '$7.000' : '$5.000'}</div>
        </div>

        {/* Selector de tipo de boleto */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg border font-semibold ${tipoBoleto === 'diario' ? 'bg-primary text-white' : 'bg-white text-primary border-primary'} transition`}
            onClick={() => setTipoBoleto('diario')}
            disabled={isPurchasing}
          >
            Diario
          </button>
          <button
            className={`px-4 py-2 rounded-lg border font-semibold ${tipoBoleto === 'unico' ? 'bg-primary text-white' : 'bg-white text-primary border-primary'} transition`}
            onClick={() => setTipoBoleto('unico')}
            disabled={isPurchasing}
          >
            Único
          </button>
        </div>

        {/* Botón para adquirir boleto */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirmModal(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-lg font-semibold shadow-md hover:bg-secondary transition-all duration-300"
        >
          <PlusCircle className="w-6 h-6" />
          Adquirir Boleto
        </motion.button>
        {purchaseError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mt-2 text-center">
            {purchaseError}
          </div>
        )}

        {/* Modal de confirmación */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                  onClick={() => setShowConfirmModal(false)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <div className="flex flex-col items-center gap-3 mb-4">
                  <CheckCircle className="w-10 h-10 text-primary" />
                  <h2 className="text-xl font-bold text-primary">Confirmar compra de boleto</h2>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-secondary">
                    <span>Precio:</span>
                    <span>{tipoBoleto === 'diario' ? '$7.000' : '$5.000'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-secondary">
                    <Clock className="w-5 h-5" />
                    <span>{tipoBoleto === 'diario' ? 'Duración: 24 horas desde el primer escaneo' : 'Duración: 1 viaje'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-secondary">
                    <Infinity className="w-5 h-5" />
                    <span>{tipoBoleto === 'diario' ? 'Usos ilimitados' : 'Único uso'}</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-6 justify-center">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition"
                    disabled={isPurchasing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition shadow-md"
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? 'Redirigiendo...' : 'Confirmar y Pagar'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de pago exitoso */}
        <PaymentSuccessModal 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        {/* Lista de boletos */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-primary">Tus Boletos</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => refreshBoletos()}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar boletos"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          {isLoading ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-secondary">Cargando boletos...</p>
            </div>
          ) : boletosError ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-red-100">
              <p className="text-red-600 mb-2">Error al cargar los boletos</p>
              <button
                onClick={() => refreshBoletos()}
                className="text-sm text-primary hover:text-secondary"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : boletos.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">No tienes boletos aún</p>
              <p className="text-sm text-gray-400 mb-4">Adquiere tu primer boleto para acceder al country</p>
            </div>
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
                          <span className="font-medium text-primary">{ticket.tipo === 'unico' ? 'Boleto Único' : 'Boleto Diario'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-dark-gray">
                          <span>Adquirido el {ticket.purchaseDate.toLocaleDateString('es-AR')} {ticket.purchaseDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {(ticket.validoHasta || ticket.qrValidoHasta) && (
                          <div className="mt-2 flex flex-col gap-1 text-xs text-secondary bg-gray-50 rounded-lg p-2 border border-gray-100">
                            {ticket.validoHasta && (
                              <div><span className="font-semibold">Válido hasta:</span> {new Date(ticket.validoHasta).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</div>
                            )}
                            {ticket.qrValidoHasta && (
                              <div><span className="font-semibold">QR válido hasta:</span> {new Date(ticket.qrValidoHasta).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</div>
                            )}
                          </div>
                        )}
                        {ticket.tipo === 'unico' && ticket.contador >= 1 && ticket.estado === 'aprobado' && (
                          <div className="mt-2 text-sm text-red-600 font-semibold">
                            Este boleto era de un solo uso y ya fue utilizado.
                          </div>
                        )}
                      </div>
                      {ticket.estado && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold
                            ${ticket.estado === 'aprobado' ? 'bg-blue-100 text-primary' : ''}
                            ${ticket.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${ticket.estado === 'rechazado' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      {!(ticket.tipo === 'unico' && ticket.contador >= 1 && ticket.estado === 'aprobado') && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleGenerarQR(ticket.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all duration-300 shadow-md w-fit"
                          disabled={isGeneratingQR !== null}
                        >
                          <QrCode className="w-5 h-5" />
                          {isGeneratingQR === ticket.id ? 'Generando...' : 'Mostrar QR'}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
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

      {/* Modal de error QR */}
      <AnimatePresence>
        {qrError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setQrError(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-dark-gray">No se puede generar el QR</h2>
              </div>
              <div className="text-base text-secondary mb-6">
                {qrError.includes('no está aprobado') 
                  ? 'Tu boleto aún está pendiente de aprobación. Por favor, espera a que sea confirmado por el administrador.'
                  : qrError
                }
              </div>
              <button
                onClick={() => setQrError(null)}
                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition shadow-md"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientView;