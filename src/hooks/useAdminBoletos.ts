import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '../configs/api';
import { Ticket } from '../types';
import { Boleto } from '../configs/interfaces';

interface UseAdminBoletosReturn {
  boletos: Ticket[];
  isLoading: boolean;
  error: string | null;
  aprobarBoleto: (boletoId: string, userId: string) => Promise<void>;
  rechazarBoleto: (boletoId: string, userId: string) => Promise<void>;
  consumoManual: (boletoId: string) => Promise<void>;
  refreshBoletos: () => Promise<void>;
  fetchBoletosByTab: (tab: 'pending' | 'confirmed' | 'history') => Promise<void>;
}

export const useAdminBoletos = (): UseAdminBoletosReturn => {
  const [boletos, setBoletos] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validarAutenticacion = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return token;
  }, []);

  const convertirBoletoATicket = useCallback((boleto: Boleto): Ticket => {
    const nombreCompleto = boleto.usuario 
      ? `${boleto.usuario.nombre} ${boleto.usuario.apellido}`
      : 'Usuario';

    return {
      id: boleto.id.toString(),
      clientId: boleto.idUsers.toString(),
      clientName: nombreCompleto,
      destination: boleto.lote,
      purchaseDate: new Date(boleto.createdAt || Date.now()),
      status: boleto.estado || 'pendiente',
      uses: {
        ida: boleto.contador > 0,
        vuelta: boleto.contador > 1
      },
      contador: boleto.contador,
      dni: boleto.usuario?.dni,
      celular: boleto.usuario?.celular,
      email: boleto.usuario?.email,
      rol: boleto.usuario?.rol,
      createdAt: boleto.createdAt,
      validoHasta: boleto.validoHasta,
      qrValidoHasta: boleto.qrValidoHasta,
      estado: boleto.estado,
    };
  }, []);

  const obtenerBoletos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.boletos.getAll, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener los boletos' }));
        throw new Error(errorData.message || 'Error al obtener los boletos');
      }

      const data: Boleto[] = await response.json();
      const tickets = data.map(convertirBoletoATicket);
      setBoletos(tickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los boletos';
      setError(errorMessage);
      console.error('Error al obtener boletos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [validarAutenticacion, convertirBoletoATicket]);

  const aprobarBoleto = useCallback(async (boletoId: string, userId: string) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.boletos.aprobar(boletoId, userId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al aprobar el boleto' }));
        throw new Error(errorData.message || 'Error al aprobar el boleto');
      }

      await obtenerBoletos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar el boleto';
      setError(errorMessage);
      console.error('Error al aprobar boleto:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerBoletos]);

  const rechazarBoleto = useCallback(async (boletoId: string, userId: string) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.boletos.rechazar(boletoId, userId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al rechazar el boleto' }));
        throw new Error(errorData.message || 'Error al rechazar el boleto');
      }

      await obtenerBoletos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar el boleto';
      setError(errorMessage);
      console.error('Error al rechazar boleto:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerBoletos]);

  const consumoManual = useCallback(async (boletoId: string) => {
    try {
      setError(null);
      const token = validarAutenticacion();

      const response = await fetch(apiUrls.boletos.consumoManual(boletoId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al registrar consumo manual' }));
        throw new Error(errorData.message || 'Error al registrar consumo manual');
      }

      await obtenerBoletos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar consumo manual';
      setError(errorMessage);
      console.error('Error al registrar consumo manual:', err);
      throw err;
    }
  }, [validarAutenticacion, obtenerBoletos]);

  const fetchBoletosByTab = useCallback(async (tab: 'pending' | 'confirmed' | 'history') => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      // Seleccionamos el endpoint según la pestaña
      let url: string;
      switch (tab) {
        case 'pending':
          url = apiUrls.boletos.getPendientes;
          break;
        case 'confirmed':
          url = apiUrls.boletos.getConfirmados;
          break;
        case 'history':
          url = apiUrls.boletos.getConsumidos;
          break;
        default:
          url = apiUrls.boletos.getAll;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener los boletos' }));
        throw new Error(errorData.message || 'Error al obtener los boletos');
      }

      const data: Boleto[] = await response.json();
      const tickets = data.map(convertirBoletoATicket);
      setBoletos(tickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los boletos';
      setError(errorMessage);
      console.error('Error al obtener boletos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [validarAutenticacion, convertirBoletoATicket]);

  useEffect(() => {
    obtenerBoletos();
  }, [obtenerBoletos]);

  return {
    boletos,
    isLoading,
    error,
    aprobarBoleto,
    rechazarBoleto,
    consumoManual,
    refreshBoletos: obtenerBoletos,
    fetchBoletosByTab,
  };
}; 