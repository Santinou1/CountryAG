import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '../configs/api';
import { Ticket } from '../types';

interface UseAdminBoletosReturn {
  boletos: Ticket[];
  isLoading: boolean;
  error: Error | null;
  refreshBoletos: () => Promise<void>;
  fetchBoletosByTab: (tab: 'pending' | 'confirmed' | 'history') => Promise<void>;
}

export const useAdminBoletos = (): UseAdminBoletosReturn => {
  const [boletos, setBoletos] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const transformBoleto = (boleto: any): Ticket => {
    console.log('Transformando boleto raw:', boleto);
    
    // Primero determinamos el estado base
    let status: Ticket['status'];
    
    // Verificamos el estado exacto que viene del backend
    console.log('Estado del boleto del backend:', {
      estado: boleto.estado,
      ida: boleto.ida,
      vuelta: boleto.vuelta
    });
    
    // Si el boleto tiene ida y vuelta, está completado
    if (boleto.ida && boleto.vuelta) {
      status = 'completed';
    }
    // Si solo tiene ida, está en used-ida
    else if (boleto.ida) {
      status = 'used-ida';
    }
    // Si no tiene usos, depende del estado
    else if (boleto.estado === 'PENDIENTE' || boleto.estado === 'pendiente') {
      status = 'pendiente';
    } else if (boleto.estado === 'APROBADO' || boleto.estado === 'aprobado') {
      status = 'aprobado';
    } else if (boleto.estado === 'RECHAZADO' || boleto.estado === 'rechazado') {
      status = 'rechazado';
    } else {
      // Si no hay estado definido, asumimos pendiente
      console.warn('Boleto sin estado definido, asumiendo pendiente:', boleto);
      status = 'pendiente';
    }

    const transformed = {
      id: boleto.id.toString(),
      clientName: `${boleto.usuario.nombre} ${boleto.usuario.apellido}`,
      destination: boleto.lote,
      purchaseDate: new Date(boleto.createdAt || Date.now()),
      status,
      uses: {
        ida: Boolean(boleto.ida),
        vuelta: Boolean(boleto.vuelta)
      },
      dni: boleto.usuario?.dni || '',
      createdAt: boleto.createdAt,
      validoHasta: boleto.validoHasta,
      qrValidoHasta: boleto.qrValidoHasta,
    };

    console.log('Boleto transformado:', transformed);
    return transformed;
  };

  const fetchBoletosByTab = useCallback(async (tab: 'pending' | 'confirmed' | 'history') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

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

      console.log('Fetching boletos from:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los boletos');
      }

      const data = await response.json();
      console.log('Datos recibidos del backend:', data);

      // Transformamos los boletos
      const transformedBoletos = data.map((boleto: any) => {
        const transformed = transformBoleto(boleto);
        console.log('Transformando boleto:', {
          original: boleto,
          transformed
        });
        return transformed;
      });

      console.log('Boletos transformados para pestaña', tab, ':', transformedBoletos);
      setBoletos(transformedBoletos);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error al obtener boletos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      
      if (err instanceof Error && (
        err.message.includes('network') || 
        err.message.includes('servidor') ||
        err.message.includes('timeout')
      )) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBoletos = useCallback(async (isRetry: boolean = false) => {
    try {
      if (isRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.min(retryCount + 1, 5)));
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(apiUrls.boletos.getAll, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los boletos');
      }

      const data = await response.json();
      const transformedBoletos: Ticket[] = data.map(transformBoleto);
      setBoletos(transformedBoletos);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error al obtener boletos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      
      if (err instanceof Error && (
        err.message.includes('network') || 
        err.message.includes('servidor') ||
        err.message.includes('timeout')
      )) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  // Efecto para la carga inicial
  useEffect(() => {
    fetchBoletos();
  }, [fetchBoletos]);

  // Efecto para reintentos automáticos en caso de error
  useEffect(() => {
    if (error && retryCount > 0 && retryCount <= 3) {
      const timer = setTimeout(() => {
        fetchBoletos(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, fetchBoletos]);

  return {
    boletos,
    isLoading,
    error,
    refreshBoletos: () => fetchBoletos(),
    fetchBoletosByTab
  };
}; 