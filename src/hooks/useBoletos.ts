import { useState, useEffect } from 'react';
import { apiUrls } from '../configs/api';
import { Boleto} from '../configs/interfaces';
import { Ticket } from '../types';

interface UseBoletosReturn {
  boletos: Ticket[];
  isLoading: boolean;
  error: string | null;
  comprarBoleto: (loteId: string) => Promise<void>;
  refreshBoletos: () => Promise<void>;
  generarQR: (boletoId: string, tipo: 'ida' | 'vuelta') => Promise<string>;
}

export const useBoletos = (userId: string): UseBoletosReturn => {
  const [boletos, setBoletos] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir un Boleto de la API a un Ticket del frontend
  const convertirBoletoATicket = (boleto: Boleto): Ticket => {
    return {
      id: boleto.id.toString(),
      clientId: boleto.idUsers.toString(),
      clientName: '', // Se llenará cuando obtengamos los datos del usuario
      destination: boleto.lote,
      purchaseDate: new Date(), // La API debería proporcionar esta fecha
      status: boleto.ida && boleto.vuelta ? 'completed' : 
              boleto.ida ? 'used-ida' : 
              'confirmed',
      uses: {
        ida: boleto.ida,
        vuelta: boleto.vuelta
      }
    };
  };

  // Función para obtener los boletos del usuario
  const obtenerBoletos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(apiUrls.boletos.getByUser(userId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los boletos');
      }

      const data: Boleto[] = await response.json();
      const tickets = data.map(convertirBoletoATicket);

      // Obtener información del usuario para cada boleto
      const userResponse = await fetch(apiUrls.users.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const ticketsConNombre = tickets.map(ticket => ({
          ...ticket,
          clientName: `${userData.nombre} ${userData.apellido}`
        }));
        setBoletos(ticketsConNombre);
      } else {
        setBoletos(tickets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los boletos');
      console.error('Error al obtener boletos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para comprar un nuevo boleto
  const comprarBoleto = async (loteId: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Simplificamos el body para que solo incluya el lote
      const body = {
        lote: loteId
      };

      const response = await fetch(apiUrls.boletos.crear(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al comprar el boleto');
      }

      // Actualizar la lista de boletos después de comprar
      await obtenerBoletos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comprar el boleto');
      console.error('Error al comprar boleto:', err);
      throw err;
    }
  };

  // Función para generar el código QR
  const generarQR = async (boletoId: string, tipo: 'ida' | 'vuelta'): Promise<string> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const url = tipo === 'ida' 
        ? apiUrls.qr.generarIda(boletoId, userId)
        : apiUrls.qr.generarVuelta(boletoId, userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al generar QR' }));
        throw new Error(errorData.message || 'Error al generar QR');
      }

      // El servidor devuelve directamente el base64 como texto
      const qrBase64 = await response.text();
      
      // Verificamos que sea un base64 válido
      if (!qrBase64.startsWith('data:image/png;base64,')) {
        throw new Error('Formato de respuesta inválido');
      }

      return qrBase64;
    } catch (error) {
      console.error('Error al generar QR:', error);
      throw error;
    }
  };

  // Cargar boletos al montar el componente
  useEffect(() => {
    obtenerBoletos();
  }, [userId]);

  return {
    boletos,
    isLoading,
    error,
    comprarBoleto,
    refreshBoletos: obtenerBoletos,
    generarQR
  };
}; 