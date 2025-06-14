import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '../configs/api';
import { Ticket } from '../types';

interface UseAdminBoletosReturn {
  boletos: Ticket[];
  isLoading: boolean;
  error: Error | null;
  refreshBoletos: () => Promise<void>;
}

export const useAdminBoletos = (): UseAdminBoletosReturn => {
  const [boletos, setBoletos] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchBoletos = useCallback(async (isRetry: boolean = false) => {
    try {
      // Si es un reintento, esperamos un poco más
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
      
      // Transformar los datos al formato de Ticket
      const transformedBoletos: Ticket[] = data.map((boleto: any) => ({
        id: boleto.id.toString(),
        clientName: `${boleto.usuario.nombre} ${boleto.usuario.apellido}`,
        destination: boleto.lote,
        purchaseDate: new Date(boleto.createdAt || Date.now()),
        status: boleto.ida && boleto.vuelta ? 'completed' : 
                boleto.ida ? 'used-ida' : 'confirmed',
        uses: {
          ida: boleto.ida,
          vuelta: boleto.vuelta
        }
      }));

      setBoletos(transformedBoletos);
      setError(null);
      setRetryCount(0); // Resetear el contador de reintentos al tener éxito
    } catch (err) {
      console.error('Error al obtener boletos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      
      // Si es un error de red o servidor, incrementamos el contador de reintentos
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

  // Efecto para actualización periódica
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isLoading) {
        fetchBoletos();
      }
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(intervalId);
  }, [fetchBoletos, isLoading]);

  return {
    boletos,
    isLoading,
    error,
    refreshBoletos: () => fetchBoletos()
  };
}; 