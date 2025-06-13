import { useState, useEffect } from 'react';
import { User, Ticket } from '../types';
import { useNavigate } from 'react-router-dom';

export const useApp = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<'login' | 'client' | 'admin'>('login');

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

    // Check if user is already logged in
    const savedUser = localStorage.getItem('countryag-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setView(user.role);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
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
    getConfirmedTickets
  };
};