import React, { useState } from 'react';
import { LogOut, Clock, CheckCircle, MapPin, User, ArrowRight, ArrowLeft, History } from 'lucide-react';
import { User as UserType, Ticket } from '../types';

interface AdminViewProps {
  user: UserType;
  pendingTickets: Ticket[];
  confirmedTickets: Ticket[];
  onConfirm: (ticketId: string) => void;
  onUseTicket: (ticketId: string, type: 'ida' | 'vuelta') => void;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  user, 
  pendingTickets, 
  confirmedTickets, 
  onConfirm, 
  onUseTicket, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');

  // Debug: mostrar información del usuario
  console.log('AdminView - User data:', user);

  const handleUseTicket = (ticketId: string, type: 'ida' | 'vuelta') => {
    onUseTicket(ticketId, type);
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
              Hola, {user?.name}
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

        <div className="p-4 space-y-4">
          {activeTab === 'pending' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Boletos Pendientes</h2>
              {pendingTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay boletos pendientes</p>
                </div>
              ) : (
                pendingTickets
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                  .map(ticket => (
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
                        </div>
                      </div>
                      <button
                        onClick={() => onConfirm(ticket.id)}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmar Boleto
                      </button>
                    </div>
                  ))
              )}
            </>
          )}

          {activeTab === 'confirmed' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Boletos Confirmados</h2>
              {confirmedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay boletos confirmados</p>
                </div>
              ) : (
                confirmedTickets
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                  .map(ticket => getTicketCard(ticket))
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Historial de Boletos</h2>
              {confirmedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay boletos en el historial</p>
                </div>
              ) : (
                confirmedTickets
                  .filter(ticket => ticket.status === 'completed' || ticket.uses.ida)
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                  .map(ticket => getTicketCard(ticket, false))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};