import React, { useState, useEffect } from 'react';
import { LogOut, Clock, CheckCircle, MapPin, User, ArrowRight, ArrowLeft, History, Loader2, Search, X } from 'lucide-react';
import { User as UserType, Ticket } from '../types';
import { useAdminBoletos } from '../hooks/useAdminBoletos';
import { apiUrls } from '../configs/api';

interface AdminViewProps {
  user: UserType;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { boletos, isLoading, error, refreshBoletos } = useAdminBoletos();

  // Filtrar boletos según la pestaña activa y la búsqueda
  const filteredBoletos = boletos.filter(ticket => {
    const matchesSearch = searchQuery === '' || 
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'pending') {
      return matchesSearch && ticket.status === 'confirmed';
    } else if (activeTab === 'confirmed') {
      return matchesSearch && (ticket.status === 'used-ida' || ticket.status === 'completed');
    } else {
      return matchesSearch && (ticket.status === 'completed' || ticket.uses.ida);
    }
  });

  const pendingTickets = filteredBoletos.filter(ticket => ticket.status === 'confirmed');
  const confirmedTickets = filteredBoletos.filter(ticket => 
    ticket.status === 'used-ida' || ticket.status === 'completed'
  );

  const handleUseTicket = async (ticketId: string, type: 'ida' | 'vuelta') => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');

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

      await refreshBoletos();
    } catch (err) {
      console.error('Error al usar boleto:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleConfirm = async (ticketId: string) => {
    // Aquí implementarías la lógica de confirmación si es necesaria
    await refreshBoletos();
  };

  const getUsageButtons = (ticket: Ticket) => {
    return (
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleUseTicket(ticket.id, 'ida')}
          disabled={ticket.uses.ida}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            ticket.uses.ida
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ArrowRight className="w-3 h-3" />
          {ticket.uses.ida ? 'Ida Usada' : 'Usar Ida'}
          {ticket.uses.ida && <CheckCircle className="w-3 h-3" />}
        </button>
        <button
          onClick={() => handleUseTicket(ticket.id, 'vuelta')}
          disabled={ticket.uses.vuelta}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            ticket.uses.vuelta
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          <ArrowLeft className="w-3 h-3" />
          {ticket.uses.vuelta ? 'Vuelta Usada' : 'Usar Vuelta'}
          {ticket.uses.vuelta && <CheckCircle className="w-3 h-3" />}
        </button>
      </div>
    );
  };

  const getTicketCard = (ticket: Ticket, showActions: boolean = true) => (
    <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">{ticket.clientName}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">{ticket.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            {ticket.purchaseDate.toLocaleDateString('es-AR')} {ticket.purchaseDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              ticket.status === 'completed' 
                ? 'bg-gray-100 text-gray-800' 
                : ticket.status === 'used-ida'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {ticket.status === 'completed' ? 'Completado' : 
               ticket.status === 'used-ida' ? 'Ida Usada' : 'Confirmado'}
            </span>
          </div>
        </div>
      </div>
      {showActions && getUsageButtons(ticket)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Panel Chofer</h1>
            <p className="text-sm text-gray-600">
              Hola, {user?.nombre} {user?.apellido}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendientes ({pendingTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === 'confirmed'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Confirmados ({confirmedTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre del cliente..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span className="ml-2 text-gray-600">Cargando boletos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error al cargar los boletos: {error.message}</p>
              <button 
                onClick={() => refreshBoletos()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'pending' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Boletos Pendientes
                    {searchQuery && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({pendingTickets.length} resultados)
                      </span>
                    )}
                  </h2>
                  {pendingTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchQuery 
                          ? 'No se encontraron boletos pendientes con ese nombre'
                          : 'No hay boletos pendientes'}
                      </p>
                    </div>
                  ) : (
                    pendingTickets.map(ticket => getTicketCard(ticket))
                  )}
                </>
              )}

              {activeTab === 'confirmed' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Boletos Confirmados
                    {searchQuery && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({confirmedTickets.length} resultados)
                      </span>
                    )}
                  </h2>
                  {confirmedTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchQuery 
                          ? 'No se encontraron boletos confirmados con ese nombre'
                          : 'No hay boletos confirmados'}
                      </p>
                    </div>
                  ) : (
                    confirmedTickets.map(ticket => getTicketCard(ticket))
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Historial de Boletos
                    {searchQuery && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({filteredBoletos.length} resultados)
                      </span>
                    )}
                  </h2>
                  {filteredBoletos.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchQuery 
                          ? 'No se encontraron boletos en el historial con ese nombre'
                          : 'No hay boletos en el historial'}
                      </p>
                    </div>
                  ) : (
                    filteredBoletos.map(ticket => getTicketCard(ticket, false))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};