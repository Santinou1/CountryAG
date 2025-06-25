import { User } from '../types';
import { Ticket } from '../types';

export const filterUsers = (users: User[], searchTerm: string): User[] => {
  if (!searchTerm.trim()) return users;
  
  const term = searchTerm.toLowerCase().trim();
  
  return users.filter(user => {
    const fullName = `${user.nombre || ''} ${user.apellido || ''}`.toLowerCase();
    const dni = user.dni?.toLowerCase() || '';
    
    return fullName.includes(term) || dni.includes(term);
  });
};

export const filterBoletos = (boletos: Ticket[], searchTerm: string): Ticket[] => {
  if (!searchTerm.trim()) return boletos;
  
  const term = searchTerm.toLowerCase().trim();
  
  return boletos.filter(boleto => {
    const clientName = boleto.clientName.toLowerCase();
    const dni = boleto.dni?.toLowerCase() || '';
    
    return clientName.includes(term) || dni.includes(term);
  });
}; 