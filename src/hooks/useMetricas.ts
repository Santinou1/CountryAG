import { useState, useCallback } from 'react';
import { apiUrls } from '../configs/api';
import {
  MetricasCompletas,
  MetricasGenerales,
  MetricasPorEstado,
  MetricasPorLote,
  MetricasPorPeriodo,
  MetricasTopUsuarios,
  MetricasUso,
  MetricasResumen,
} from '../types';

interface UseMetricasReturn {
  metricasCompletas: MetricasCompletas | null;
  metricasGenerales: MetricasGenerales | null;
  metricasPorEstado: MetricasPorEstado | null;
  metricasPorLote: MetricasPorLote[] | null;
  metricasPorPeriodo: MetricasPorPeriodo[] | null;
  topUsuarios: MetricasTopUsuarios[] | null;
  metricasUso: MetricasUso | null;
  metricasResumen: MetricasResumen | null;
  isLoading: boolean;
  error: string | null;
  obtenerMetricasCompletas: () => Promise<void>;
  obtenerMetricasGenerales: () => Promise<void>;
  obtenerMetricasPorEstado: () => Promise<void>;
  obtenerMetricasPorLote: () => Promise<void>;
  obtenerMetricasPorPeriodo: () => Promise<void>;
  obtenerTopUsuarios: () => Promise<void>;
  obtenerMetricasUso: () => Promise<void>;
  obtenerMetricasResumen: () => Promise<void>;
  refreshMetricas: () => Promise<void>;
}

const validarAutenticacion = (): string => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return token;
};

export const useMetricas = (): UseMetricasReturn => {
  const [metricasCompletas, setMetricasCompletas] = useState<MetricasCompletas | null>(null);
  const [metricasGenerales, setMetricasGenerales] = useState<MetricasGenerales | null>(null);
  const [metricasPorEstado, setMetricasPorEstado] = useState<MetricasPorEstado | null>(null);
  const [metricasPorLote, setMetricasPorLote] = useState<MetricasPorLote[] | null>(null);
  const [metricasPorPeriodo, setMetricasPorPeriodo] = useState<MetricasPorPeriodo[] | null>(null);
  const [topUsuarios, setTopUsuarios] = useState<MetricasTopUsuarios[] | null>(null);
  const [metricasUso, setMetricasUso] = useState<MetricasUso | null>(null);
  const [metricasResumen, setMetricasResumen] = useState<MetricasResumen | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerMetricasCompletas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.completas, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas' }));
        throw new Error(errorData.message || 'Error al obtener las métricas');
      }

      const data: MetricasCompletas = await response.json();
      setMetricasCompletas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas';
      setError(errorMessage);
      console.error('Error al obtener métricas completas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasGenerales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.generales, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas generales' }));
        throw new Error(errorData.message || 'Error al obtener las métricas generales');
      }

      const data: MetricasGenerales = await response.json();
      setMetricasGenerales(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas generales';
      setError(errorMessage);
      console.error('Error al obtener métricas generales:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasPorEstado = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.estado, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas por estado' }));
        throw new Error(errorData.message || 'Error al obtener las métricas por estado');
      }

      const data: MetricasPorEstado = await response.json();
      setMetricasPorEstado(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas por estado';
      setError(errorMessage);
      console.error('Error al obtener métricas por estado:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasPorLote = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.lotes, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas por lote' }));
        throw new Error(errorData.message || 'Error al obtener las métricas por lote');
      }

      const data: MetricasPorLote[] = await response.json();
      setMetricasPorLote(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas por lote';
      setError(errorMessage);
      console.error('Error al obtener métricas por lote:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasPorPeriodo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.periodo, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas por período' }));
        throw new Error(errorData.message || 'Error al obtener las métricas por período');
      }

      const data: MetricasPorPeriodo[] = await response.json();
      setMetricasPorPeriodo(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas por período';
      setError(errorMessage);
      console.error('Error al obtener métricas por período:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerTopUsuarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.topUsuarios, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener el top de usuarios' }));
        throw new Error(errorData.message || 'Error al obtener el top de usuarios');
      }

      const data: MetricasTopUsuarios[] = await response.json();
      setTopUsuarios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el top de usuarios';
      setError(errorMessage);
      console.error('Error al obtener top usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasUso = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.uso, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener las métricas de uso' }));
        throw new Error(errorData.message || 'Error al obtener las métricas de uso');
      }

      const data: MetricasUso = await response.json();
      setMetricasUso(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las métricas de uso';
      setError(errorMessage);
      console.error('Error al obtener métricas de uso:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerMetricasResumen = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = validarAutenticacion();

      const response = await fetch(apiUrls.metricas.resumen, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener el resumen de métricas' }));
        throw new Error(errorData.message || 'Error al obtener el resumen de métricas');
      }

      const data: MetricasResumen = await response.json();
      setMetricasResumen(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el resumen de métricas';
      setError(errorMessage);
      console.error('Error al obtener resumen de métricas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMetricas = useCallback(async () => {
    await obtenerMetricasCompletas();
  }, [obtenerMetricasCompletas]);

  return {
    metricasCompletas,
    metricasGenerales,
    metricasPorEstado,
    metricasPorLote,
    metricasPorPeriodo,
    topUsuarios,
    metricasUso,
    metricasResumen,
    isLoading,
    error,
    obtenerMetricasCompletas,
    obtenerMetricasGenerales,
    obtenerMetricasPorEstado,
    obtenerMetricasPorLote,
    obtenerMetricasPorPeriodo,
    obtenerTopUsuarios,
    obtenerMetricasUso,
    obtenerMetricasResumen,
    refreshMetricas,
  };
}; 