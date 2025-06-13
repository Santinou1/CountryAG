import { useState, useEffect } from 'react';
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

  const fetchBoletos = async () => {
    try {
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
    } catch (err) {
      console.error('Error al obtener boletos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoletos();
  }, []);

  return {
    boletos,
    isLoading,
    error,
    refreshBoletos: fetchBoletos
  };
}; 