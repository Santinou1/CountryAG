import React, { useEffect, useState } from 'react';
import { MapPin, LogOut, Clock, CheckCircle, ArrowRight, ArrowLeft, Users, DollarSign, ChevronLeft, ChevronRight, Ticket as TicketIcon, Search, ChevronsLeft, ChevronsRight, PlusCircle, Loader2, QrCode } from 'lucide-react';
import { lotes } from '../data/lotes';
import { User, Ticket, Lote } from '../types';
import { useNavigate } from 'react-router-dom';
import { apiUrls } from '../configs/api';
import { useBoletos } from '../hooks/useBoletos';
import { QRModal } from './QRModal';
import './ClientView.css';

interface ClientViewProps {
  user: User;
  onLogout: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ user: initialUser, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [userData, setUserData] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNumber, setSearchNumber] = useState('');
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrTitle, setQrTitle] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const itemsPerPage = 4;

  const { 
    boletos, 
    isLoading, 
    error: boletosError, 
    comprarBoleto, 
    refreshBoletos,
    generarQR 
  } = useBoletos(user.id);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(apiUrls.users.me, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener información del usuario');
        }

        const data = await response.json();
        setUserData(data);
        setUser(prev => ({
          ...prev,
          nombre: data.nombre,
          apellido: data.apellido
        }));

        if (data.rol === 'admin') {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

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

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('countryag-user');
    localStorage.removeItem('countryag-tickets');
    
    // Redirigir a login
    navigate('/login');
  };

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
      setIsGeneratingQR(true);
      const qr = await generarQR(boletoId, tipo);
      setQrTitle(`Código QR - ${tipo === 'ida' ? 'Ida' : 'Vuelta'}`);
      setQrData(qr);
    } catch (err) {
      console.error('Error al generar QR:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsGeneratingQR(false);
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
    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 ${ticket.uses.ida ? 'text-green-600' : 'text-gray-400'}`}>
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">Ida</span>
            {ticket.uses.ida && <CheckCircle className="w-3 h-3" />}
          </div>
          <div className={`flex items-center gap-1 ${ticket.uses.vuelta ? 'text-green-600' : 'text-gray-400'}`}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vuelta</span>
            {ticket.uses.vuelta && <CheckCircle className="w-3 h-3" />}
          </div>
        </div>
        
        {/* Botones de QR */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleGenerarQR(ticket.id, 'ida')}
            disabled={ticket.uses.ida || isGeneratingQR}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              ticket.uses.ida
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            {isGeneratingQR ? 'Generando...' : 'QR Ida'}
          </button>
          <button
            onClick={() => handleGenerarQR(ticket.id, 'vuelta')}
            disabled={ticket.uses.vuelta || isGeneratingQR}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              ticket.uses.vuelta
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            {isGeneratingQR ? 'Generando...' : 'QR Vuelta'}
          </button>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mis Boletos</h1>
            <p className="text-sm text-gray-600">
              ¡Hola, {userData?.nombre && userData?.apellido ? `${userData.nombre} ${userData.apellido}` : user.name}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Tickets List - Ahora es la sección principal */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Mis Boletos</h2>
            <button
              onClick={() => setShowPurchaseSection(!showPurchaseSection)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              {showPurchaseSection ? 'Ver Mis Boletos' : 'Comprar Nuevo Boleto'}
            </button>
          </div>
          
          {!showPurchaseSection && (
            <>
              {isLoading ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">Cargando boletos...</p>
                </div>
              ) : boletosError ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-red-100">
                  <p className="text-red-600 mb-2">Error al cargar los boletos</p>
                  <button
                    onClick={() => refreshBoletos()}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : boletos.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes boletos aún</p>
                  <p className="text-sm text-gray-400 mb-4">Compra tu primer boleto para visitar nuestros lotes</p>
                  <button
                    onClick={() => setShowPurchaseSection(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Comprar Boleto
                  </button>
                </div>
              ) : (
                boletos
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                  .map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
                    </div>
                  ))
              )}
            </>
          )}

          {/* Sección de Compra */}
          {showPurchaseSection && (
            <>
              {purchaseError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {purchaseError}
                </div>
              )}
              
              {/* Buscador de Lotes */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchNumber}
                      onChange={(e) => setSearchNumber(e.target.value)}
                      placeholder="Buscar por número de lote (1-100)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Buscar
                  </button>
                </form>
              </div>

              {/* Lotes Grid */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Lote</h2>
                <div className="grid grid-cols-1 gap-4">
                  {currentLotes.map(lote => (
                    <button
                      key={lote.id}
                      id={`lote-${lote.number}`}
                      onClick={() => handlePurchase(lote.id)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
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
                    </button>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
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
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de QR */}
      {qrData && (
        <QRModal
          qrData={qrData}
          onClose={() => setQrData(null)}
          title={qrTitle}
        />
      )}
    </div>
  );
};