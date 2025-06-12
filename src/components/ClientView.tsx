import React from 'react';
import { MapPin, LogOut, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { lotes } from '../data/lotes';
import { User, Ticket } from '../types';

interface ClientViewProps {
  user: User;
  tickets: Ticket[];
  onPurchase: (destination: string) => void;
  onLogout: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ user, tickets, onPurchase, onLogout }) => {
  const handlePurchase = (loteId: string) => {
    const lote = lotes.find(l => l.id === loteId);
    if (lote) {
      onPurchase(lote.name);
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
      <div className="flex items-center gap-4 mt-2">
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mis Boletos</h1>
            <p className="text-sm text-gray-600">Hola, {user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Lotes Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Lote</h2>
          <div className="grid grid-cols-2 gap-3">
            {lotes.map(lote => (
              <button
                key={lote.id}
                onClick={() => handlePurchase(lote.id)}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="font-medium text-gray-900 group-hover:text-green-600">{lote.name}</div>
                <div className="text-sm text-gray-500">Lote #{lote.number}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Mis Boletos</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes boletos aún</p>
              <p className="text-sm text-gray-400">Selecciona un lote para comprar tu primer boleto</p>
            </div>
          ) : (
            tickets
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
        </div>
      </div>
    </div>
  );
};