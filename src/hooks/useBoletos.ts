import { useState, useEffect, useCallback } from 'react';
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

export const useBoletos = (userId: string | undefined): UseBoletosReturn => {
  const [boletos, setBoletos] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para validar el token y el userId
  const validarAutenticacion = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    if (!userId) {
      throw new Error('ID de usuario no válido');
    }
    return token;
  }, [userId]);

  // Función para convertir un Boleto de la API a un Ticket del frontend
  const convertirBoletoATicket = useCallback((boleto: Boleto): Ticket => {
    return {
      id: boleto.id.toString(),
      clientId: boleto.idUsers.toString(),
      clientName: '', // Se llenará cuando obtengamos los datos del usuario
      destination: boleto.lote,
      purchaseDate: new Date(boleto.createdAt || Date.now()),
      status: boleto.ida && boleto.vuelta ? 'completed' : 
              boleto.ida ? 'used-ida' : 
              'confirmed',
      uses: {
        ida: boleto.ida,
        vuelta: boleto.vuelta
      }
    };
  }, []);

  // Función para obtener los boletos del usuario
  const obtenerBoletos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validar autenticación
      const token = validarAutenticacion();

      // Obtener boletos
      const response = await fetch(apiUrls.boletos.getByUser(userId!), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener los boletos' }));
        throw new Error(errorData.message || 'Error al obtener los boletos');
      }

      const data: Boleto[] = await response.json();
      const tickets = data.map(convertirBoletoATicket);

      // Obtener información del usuario
      try {
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
      } catch (userError) {
        console.warn('Error al obtener datos del usuario:', userError);
        setBoletos(tickets);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los boletos';
      setError(errorMessage);
      console.error('Error al obtener boletos:', err);
      
      // Si es un error de autenticación, limpiar el estado
      if (errorMessage.includes('Sesión expirada') || errorMessage.includes('No hay token')) {
        setBoletos([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, validarAutenticacion, convertirBoletoATicket]);

  // Función para comprar un nuevo boleto
  const comprarBoleto = useCallback(async (loteId: string) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const body = {
        lote: loteId
      };

      const response = await fetch(apiUrls.boletos.crear(userId!), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al comprar el boleto' }));
        throw new Error(errorData.message || 'Error al comprar el boleto');
      }

      await obtenerBoletos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al comprar el boleto';
      setError(errorMessage);
      console.error('Error al comprar boleto:', err);
      throw err;
    }
  }, [userId, validarAutenticacion, obtenerBoletos]);

  // Función para generar el código QR
  const generarQR = useCallback(async (boletoId: string, tipo: 'ida' | 'vuelta'): Promise<string> => {
    try {
      const token = validarAutenticacion();

      const url = tipo === 'ida' 
        ? apiUrls.qr.generarIda(boletoId, userId!)
        : apiUrls.qr.generarVuelta(boletoId, userId!);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al generar QR' }));
        throw new Error(errorData.message || 'Error al generar QR');
      }

      const qrBase64 = await response.text();
      
      if (!qrBase64.startsWith('data:image/png;base64,')) {
        throw new Error('Formato de respuesta inválido');
      }

      return qrBase64;
    } catch (error) {
      console.error('Error al generar QR:', error);
      throw error;
    }
  }, [userId, validarAutenticacion]);

  // Efecto para cargar boletos
  useEffect(() => {
    if (userId) {
      obtenerBoletos();
    } else {
      setBoletos([]);
      setError('ID de usuario no válido');
      setIsLoading(false);
    }
  }, [userId, obtenerBoletos]);

  // Limpiar estado cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setBoletos([]);
      setError(null);
      setIsLoading(true);
    };
  }, []);

  return {
    boletos,
    isLoading,
    error,
    comprarBoleto,
    refreshBoletos: obtenerBoletos,
    generarQR
  };
}; 