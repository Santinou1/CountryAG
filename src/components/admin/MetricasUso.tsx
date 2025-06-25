import React from 'react';
import { Circle, CircleDot, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { MetricasUso as MetricasUsoType } from '../../types';

interface MetricasUsoProps {
  metricas: MetricasUsoType;
}

export const MetricasUso: React.FC<MetricasUsoProps> = ({ metricas }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  const categorias = [
    {
      title: 'Sin Uso',
      cantidad: metricas.boletosSinUso,
      porcentaje: metricas.porcentajeSinUso,
      icon: Circle,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    {
      title: '1 Uso',
      cantidad: metricas.boletosConUnUso,
      porcentaje: metricas.boletosConUnUso > 0 ? (metricas.boletosConUnUso / (metricas.boletosSinUso + metricas.boletosConUnUso + metricas.boletosConDosUsos + metricas.boletosConMasUsos)) * 100 : 0,
      icon: CircleDot,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: '2 Usos',
      cantidad: metricas.boletosConDosUsos,
      porcentaje: metricas.boletosConDosUsos > 0 ? (metricas.boletosConDosUsos / (metricas.boletosSinUso + metricas.boletosConUnUso + metricas.boletosConDosUsos + metricas.boletosConMasUsos)) * 100 : 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: '3+ Usos',
      cantidad: metricas.boletosConMasUsos,
      porcentaje: metricas.boletosConMasUsos > 0 ? (metricas.boletosConMasUsos / (metricas.boletosSinUso + metricas.boletosConUnUso + metricas.boletosConDosUsos + metricas.boletosConMasUsos)) * 100 : 0,
      icon: Star,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Análisis de Uso</h2>
      
      {/* Resumen general */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Resumen de Uso</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-700">Sin uso</p>
            <p className="text-lg font-bold text-blue-900">{metricas.porcentajeSinUso.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-purple-700">Con uso</p>
            <p className="text-lg font-bold text-purple-900">{metricas.porcentajeConUso.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Detalle por categoría */}
      <div className="space-y-3">
        {categorias.map((categoria, index) => {
          const IconComponent = categoria.icon;
          return (
            <div
              key={index}
              className={`${categoria.bgColor} ${categoria.borderColor} rounded-lg p-4 border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${categoria.color} p-2 rounded-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{categoria.title}</h3>
                    <p className="text-sm text-gray-600">
                      {formatNumber(categoria.cantidad)} boletos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {categoria.porcentaje.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">del total</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 