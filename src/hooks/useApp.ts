import { useState, useEffect } from 'react';
import { User, Ticket } from '../types';
import { useNavigate } from 'react-router-dom';
import { apiUrls } from '../configs/api';

export const useApp = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<'login' | 'client' | 'admin'>('login');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTickets = localStorage.getItem('countryag-tickets');
    if (savedTickets) {
      try {
        const parsedTickets = JSON.parse(savedTickets).map((ticket: any) => ({
          ...ticket,
          purchaseDate: new Date(ticket.purchaseDate)
        }));
        setTickets(parsedTickets);
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    }

    // Persistencia de sesión: si hay token, validar con backend y rehidratar usuario
    setIsAuthLoading(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(apiUrls.users.me, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (!res.ok) throw new Error('Token inválido o expirado');
          const data = await res.json();
          const user = {
            id: data.id?.toString() || '',
            name: `${data.nombre || ''} ${data.apellido || ''}`.trim(),
            role: data.rol?.toLowerCase() || 'usuario',
            nombre: data.nombre,
            apellido: data.apellido
          };
          setCurrentUser(user);
          setView(user.role);
          localStorage.setItem('countryag-user', JSON.stringify(user));
        })
        .catch((err) => {
          setCurrentUser(null);
          setView('login');
          localStorage.removeItem('countryag-user');
          localStorage.removeItem('access_token');
        })
        .finally(() => setIsAuthLoading(false));
    } else {
      setCurrentUser(null);
      setView('login');
      setIsAuthLoading(false);
    }

    // Escuchar cambios en localStorage para sincronizar usuario
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'countryag-user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentUser(newUser);
        setView(newUser ? newUser.role : 'login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save tickets to localStorage whenever tickets change
  useEffect(() => {
    localStorage.setItem('countryag-tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('countryag-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('countryag-user');
    }
  }, [currentUser]);

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('countryag-user');
    localStorage.removeItem('countryag-tickets');
    
    // Limpiar estado
    setCurrentUser(null);
    setView('login');
    setTickets([]);
    
    // Redirigir a login
    window.location.href = '/login';
    // Forzar sincronización inmediata en otras pestañas
    window.dispatchEvent(new StorageEvent('storage', { key: 'countryag-user', newValue: null }));
  };

  const purchaseTicket = (destination: string) => {
    if (!currentUser) return;

    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: currentUser.id,
      clientName: currentUser.name,
      destination,
      purchaseDate: new Date(),
      status: 'pending',
      uses: {
        ida: false,
        vuelta: false
      }
    };

    setTickets(prev => [...prev, newTicket]);
  };

  const confirmTicket = (ticketId: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'confirmed' }
          : ticket
      )
    );
  };

  const useTicket = (ticketId: string, type: 'ida' | 'vuelta') => {
    setTickets(prev => 
      prev.map(ticket => {
        if (ticket.id === ticketId) {
          const newUses = { ...ticket.uses, [type]: true };
          const status = newUses.ida && newUses.vuelta ? 'completed' : 
                        newUses.ida ? 'used-ida' : ticket.status;
          return { ...ticket, uses: newUses, status };
        }
        return ticket;
      })
    );
  };

  const getUserTickets = () => {
    if (!currentUser) return [];
    return tickets.filter(ticket => ticket.clientId === currentUser.id);
  };

  const getPendingTickets = () => {
    return tickets.filter(ticket => ticket.status === 'pending');
  };

  const getConfirmedTickets = () => {
    return tickets.filter(ticket => ticket.status === 'confirmed' || ticket.status === 'used-ida');
  };

  return {
    currentUser,
    view,
    logout,
    purchaseTicket,
    confirmTicket,
    useTicket,
    getUserTickets,
    getPendingTickets,
    getConfirmedTickets,
    isAuthLoading
  };
};