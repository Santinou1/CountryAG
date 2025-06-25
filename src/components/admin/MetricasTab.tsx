import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetricas } from '../../hooks/useMetricas';
import { MetricasGenerales } from './MetricasGenerales';
import { MetricasPorEstado } from './MetricasPorEstado';
import { MetricasUso } from './MetricasUso';

type MetricasSection = 'generales' | 'estado' | 'uso';

export const MetricasTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MetricasSection>('generales');
  const {
    metricasCompletas,
    isLoading,
    error,
    obtenerMetricasCompletas,
    refreshMetricas,
  } = useMetricas();

  useEffect(() => {
    obtenerMetricasCompletas();
  }, [obtenerMetricasCompletas]);

  const handleRefresh = async () => {
    await refreshMetricas();
  };

  const sections = [
    { id: 'generales' as MetricasSection, label: 'Generales', count: null },
    { id: 'estado' as MetricasSection, label: 'Por Estado', count: null },
    { id: 'uso' as MetricasSection, label: 'Análisis de Uso', count: null },
  ];

  if (isLoading && !metricasCompletas) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error al cargar las métricas</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!metricasCompletas) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay métricas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Métricas del Sistema</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeSection === section.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'generales' && (
            <MetricasGenerales metricas={metricasCompletas.generales} />
          )}
          {activeSection === 'estado' && (
            <MetricasPorEstado metricas={metricasCompletas.porEstado} />
          )}
          {activeSection === 'uso' && (
            <MetricasUso metricas={metricasCompletas.uso} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 