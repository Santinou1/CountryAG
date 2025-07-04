import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LogOut, Loader2, QrCode, PlusCircle, CheckCircle, Clock, Infinity, RefreshCw, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
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

const BOLETO_DIARIO_PRECIO = 6000; // Precio actualizado
const BOLETO_UNICO_PRECIO = 2500; // Precio actualizado
const BOLETO_DIARIO_DESCRIPCION = 'Boleto DIARIO: $6000. Válido todo el día, usos ilimitados.';
const BOLETO_UNICO_DESCRIPCION = 'Boleto ÚNICO: $2500. Válido para un solo viaje.';

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
  const [showBuyForOtherModal, setShowBuyForOtherModal] = useState(false);
  const [compraPara, setCompraPara] = useState<'personal' | 'otro'>('personal');
  const [dniParaOtro, setDniParaOtro] = useState('');
  const [buyForOtherError, setBuyForOtherError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any | null>(null);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioError, setUsuarioError] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [cantidad, setCantidad] = useState(1);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showUsados, setShowUsados] = useState(false);
  const [showPendientes, setShowPendientes] = useState(false);

  const {
    boletos,
    isLoading,
    error: boletosError,
    comprarBoleto,
    refreshBoletos,
    generarQR
  } = useBoletos(user.id);

  // Agrupar boletos por estado
  const boletosAprobados = boletos.filter(b => b.tipo === 'unico' && b.estado === 'aprobado');
  const boletosDisponibles = boletosAprobados.filter(b => (b.contador ?? 0) < 1);
  const boletosUsados = boletosAprobados.filter(b => (b.contador ?? 0) >= 1);
  const boletosPendientes = boletos.filter(b => b.tipo === 'unico' && b.estado === 'pendiente');

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

  useEffect(() => {
    if (compraPara === 'otro' && dniParaOtro.trim().length >= 7) {
      setBuscandoUsuario(true);
      setUsuarioError(null);
      const token = localStorage.getItem('access_token');
      fetch(apiUrls.users.getByDni(dniParaOtro.trim()), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('No se encontró usuario con ese DNI');
          return res.json();
        })
        .then(data => setUsuarioSeleccionado(data))
        .catch(() => { setUsuarioSeleccionado(null); setUsuarioError(null); })
        .finally(() => setBuscandoUsuario(false));
    } else {
      setUsuarioSeleccionado(null);
      setUsuarioError(null);
    }
  }, [dniParaOtro, compraPara]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="text-sm mb-1">{BOLETO_UNICO_DESCRIPCION}</div>
          <div className="text-sm font-bold text-primary">Precio: $2.500</div>
        </div>

        {/* Selector de tipo de boleto */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg border font-semibold bg-primary text-white transition`}
            disabled
            style={{ display: 'none' }}
          >
            Diario
          </button>
          <button
            className={`px-4 py-2 rounded-lg border font-semibold bg-primary text-white transition`}
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
                  onClick={() => { setShowConfirmModal(false); setCompraPara('personal'); setDniParaOtro(''); setBuyForOtherError(null); }}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <div className="flex flex-col items-center gap-3 mb-4">
                  <CheckCircle className="w-10 h-10 text-primary" />
                  <h2 className="text-xl font-bold text-primary">Confirmar compra de boleto</h2>
                </div>
                {/* Selector para quién es el boleto */}
                <div className="flex justify-center gap-2 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-semibold transition ${compraPara === 'personal' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-300'}`}
                    onClick={() => setCompraPara('personal')}
                  >
                    Para mí
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-semibold transition ${compraPara === 'otro' ? 'bg-secondary text-white border-secondary' : 'bg-white text-secondary border-gray-300'}`}
                    onClick={() => setCompraPara('otro')}
                  >
                    Para otra persona
                  </button>
                </div>
                {/* Selector de cantidad */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-lg"
                    onClick={() => setCantidad(c => Math.max(1, c - 1))}
                    disabled={isPurchasing || cantidad <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{cantidad}</span>
                  <button
                    type="button"
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-lg"
                    onClick={() => setCantidad(c => c + 1)}
                    disabled={isPurchasing}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {compraPara === 'otro' && (
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary mb-2"
                      placeholder="DNI del destinatario"
                      value={dniParaOtro}
                      onChange={e => { setDniParaOtro(e.target.value); setUsuarioSeleccionado(null); setUsuarioError(null); }}
                      required
                      minLength={7}
                      maxLength={10}
                      pattern="[0-9]+"
                      disabled={isPurchasing}
                      autoComplete="off"
                    />
                    {/* Mostrar info del usuario seleccionado */}
                    {buscandoUsuario && (
                      <div className="mt-2 text-secondary text-sm">Buscando usuario...</div>
                    )}
                    {usuarioSeleccionado && !usuarioError && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-left text-sm">
                        <div><span className="font-semibold">Nombre:</span> {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</div>
                        <div><span className="font-semibold">DNI:</span> {usuarioSeleccionado.dni}</div>
                        <div><span className="font-semibold">Email:</span> {usuarioSeleccionado.email}</div>
                        {usuarioSeleccionado.rol && <div><span className="font-semibold">Rol:</span> {usuarioSeleccionado.rol}</div>}
                        <button
                          type="button"
                          className="mt-2 px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
                          onClick={() => { setDniParaOtro(''); setUsuarioSeleccionado(null); setUsuarioError(null); }}
                        >Editar DNI</button>
                      </div>
                    )}
                    {usuarioError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-left text-sm text-red-700">
                        {usuarioError}
                        <button
                          type="button"
                          className="ml-2 px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
                          onClick={() => { setDniParaOtro(''); setUsuarioSeleccionado(null); setUsuarioError(null); }}
                        >Editar DNI</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-secondary">
                    <span>Precio:</span>
                    <span>${(2500 * cantidad).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-secondary">
                    <Clock className="w-5 h-5" />
                    <span>Duración: {cantidad === 1 ? '1 viaje' : `${cantidad} viajes`}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-secondary">
                    <Infinity className="w-5 h-5" />
                    <span>{cantidad === 1 ? 'Único uso' : `Cada boleto es de un solo uso`}</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-6 justify-center">
                  <button
                    onClick={() => { setShowConfirmModal(false); setCompraPara('personal'); setDniParaOtro(''); setBuyForOtherError(null); }}
                    className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition"
                    disabled={isPurchasing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setBuyForOtherError(null);
                      setIsPurchasing(true);
                      try {
                        const token = localStorage.getItem('access_token');
                        if (compraPara === 'personal') {
                          await fetch(apiUrls.mercadopago.createPreference, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              payer: { email: user.email },
                              tipo: 'unico',
                              cantidad,
                            }),
                          })
                            .then(async response => {
                              if (!response.ok) {
                                const data = await response.json().catch(() => ({}));
                                throw new Error(data.message || 'No se pudo generar el link de pago.');
                              }
                              const preference = await response.json();
                              if (preference.init_point) {
                                window.location.href = preference.init_point;
                              } else {
                                throw new Error('No se recibió un link de pago válido.');
                              }
                            });
                        } else {
                          const response = await fetch(apiUrls.mercadopago.comprarParaOtro, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              payer: { email: user.email },
                              dni: dniParaOtro.trim(),
                              cantidad,
                            }),
                          });
                          if (!response.ok) {
                            const data = await response.json().catch(() => ({}));
                            throw new Error(data.message || 'No se pudo generar el link de pago.');
                          }
                          const preference = await response.json();
                          if (preference.init_point) {
                            window.location.href = preference.init_point;
                          } else {
                            throw new Error('No se recibió un link de pago válido.');
                          }
                        }
                      } catch (err: any) {
                        setBuyForOtherError(err.message || 'Error al iniciar la compra');
                        setIsPurchasing(false);
                      }
                    }}
                    className={`px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition shadow-md ${isPurchasing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isPurchasing || (compraPara === 'otro' && (!dniParaOtro.trim() || !usuarioSeleccionado))}
                  >
                    {isPurchasing ? 'Redirigiendo...' : 'Confirmar y Pagar'}
                  </button>
                </div>
                {buyForOtherError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mt-2 text-center">
                    {buyForOtherError}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de pago exitoso */}
        <PaymentSuccessModal 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        {/* Resumen de boletos */}
        <div className="max-w-md mx-auto mb-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🎟️</span>
              <span className="text-xl font-bold text-primary">Boletos Únicos Disponibles: {boletosDisponibles.length}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" />Usados: {boletosUsados.length}</span>
              <span className="flex items-center gap-1 text-yellow-700 font-semibold"><Clock className="w-4 h-4" />Pendientes: {boletosPendientes.length}</span>
            </div>
            <button
              className="mt-3 flex items-center gap-1 text-primary hover:text-secondary text-sm font-semibold focus:outline-none"
              onClick={() => setShowDetalles(v => !v)}
            >
              {showDetalles ? 'Ocultar detalles' : 'Ver detalles de mis boletos'}
              {showDetalles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lista de boletos agrupada y colapsable */}
        {showDetalles && (
          <div className="space-y-4 mt-2">
            {/* Disponibles */}
            {boletosDisponibles.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-primary mb-2">Disponibles</h3>
                <div className="space-y-2">
                  {boletosDisponibles.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                    >
                      <span className="font-medium text-primary">Boleto Único</span>
                      <span className="ml-auto text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">Disponible</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGenerarQR(ticket.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-secondary transition-all duration-300 shadow-md text-xs"
                        disabled={isGeneratingQR !== null}
                      >
                        <QrCode className="w-4 h-4" />QR
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {/* Usados - acordeón */}
            {boletosUsados.length > 0 && (
              <div>
                <button
                  className="w-full flex items-center justify-between text-md font-semibold text-primary mt-4 mb-2 focus:outline-none"
                  onClick={() => setShowUsados(v => !v)}
                >
                  <span>Usados</span>
                  {showUsados ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showUsados && (
                  <div className="space-y-2">
                    {boletosUsados.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 opacity-60"
                      >
                        <span className="font-medium text-primary">Boleto Único</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Usado</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Pendientes - acordeón */}
            {boletosPendientes.length > 0 && (
              <div>
                <button
                  className="w-full flex items-center justify-between text-md font-semibold text-primary mt-4 mb-2 focus:outline-none"
                  onClick={() => setShowPendientes(v => !v)}
                >
                  <span>Pendientes</span>
                  {showPendientes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showPendientes && (
                  <div className="space-y-2">
                    {boletosPendientes.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-yellow-50 rounded-xl p-3 shadow-sm border border-yellow-100 flex items-center gap-3"
                      >
                        <span className="font-medium text-primary">Boleto Único</span>
                        <span className="ml-auto text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">Pendiente</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Si no hay boletos */}
            {boletosDisponibles.length === 0 && boletosUsados.length === 0 && boletosPendientes.length === 0 && (
              <div className="text-center text-gray-500 py-8">No tienes boletos aún</div>
            )}
          </div>
        )}
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

      {/* Modal para comprar boleto para otra persona */}
      <AnimatePresence>
        {showBuyForOtherModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => { setShowBuyForOtherModal(false); setBuyForOtherError(null); setDniParaOtro(''); }}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="flex flex-col items-center gap-3 mb-4">
                <PlusCircle className="w-10 h-10 text-secondary" />
                <h2 className="text-xl font-bold text-secondary">Comprar boleto para otra persona</h2>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsBuyingForOther(true);
                  setBuyForOtherError(null);
                  try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch(apiUrls.mercadopago.comprarParaOtro, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        payer: { email: user.email },
                        dni: dniParaOtro.trim(),
                      }),
                    });
                    if (!response.ok) {
                      const data = await response.json().catch(() => ({}));
                      throw new Error(data.message || 'No se pudo generar el link de pago.');
                    }
                    const preference = await response.json();
                    if (preference.init_point) {
                      window.location.href = preference.init_point;
                    } else {
                      throw new Error('No se recibió un link de pago válido.');
                    }
                  } catch (err: any) {
                    setBuyForOtherError(err.message || 'Error al iniciar la compra');
                  } finally {
                    setIsBuyingForOther(false);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="DNI del destinatario"
                  value={dniParaOtro}
                  onChange={e => setDniParaOtro(e.target.value)}
                  required
                  minLength={7}
                  maxLength={10}
                  pattern="[0-9]+"
                  disabled={isBuyingForOther}
                />
                <button
                  type="submit"
                  className="w-full px-5 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary transition shadow-md"
                  disabled={isBuyingForOther || !dniParaOtro.trim()}
                >
                  {isBuyingForOther ? 'Redirigiendo...' : 'Comprar boleto'}
                </button>
                {buyForOtherError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mt-2 text-center">
                    {buyForOtherError}
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientView;