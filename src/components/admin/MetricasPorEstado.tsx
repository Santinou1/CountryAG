import React from 'react';
import { Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { MetricasPorEstado as MetricasPorEstadoType } from '../../types';

interface MetricasPorEstadoProps {
  metricas: MetricasPorEstadoType;
}

export const MetricasPorEstado: React.FC<MetricasPorEstadoProps> = ({ metricas }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  const estados = [
    {
      title: 'Pendientes',
      cantidad: metricas.pendientes,
      ingresos: metricas.ingresosPendientes,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      tipoIngreso: 'potencial',
    },
    {
      title: 'Aprobados',
      cantidad: metricas.aprobados,
      ingresos: metricas.ingresosAprobados,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tipoIngreso: 'real',
    },
    {
      title: 'Rechazados',
      cantidad: metricas.rechazados,
      ingresos: metricas.ingresosRechazados,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      tipoIngreso: 'perdido',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Métricas por Estado</h2>
      <div className="space-y-3">
        {estados.map((estado, index) => {
          const IconComponent = estado.icon;
          const getTipoIngresoText = () => {
            switch (estado.tipoIngreso) {
              case 'real':
                return 'Ingresos reales';
              case 'potencial':
                return 'Ingresos potenciales';
              case 'perdido':
                return 'Ingresos perdidos';
              default:
                return 'Ingresos';
            }
          };

          const getTipoIngresoColor = () => {
            switch (estado.tipoIngreso) {
              case 'real':
                return 'text-green-600';
              case 'potencial':
                return 'text-yellow-600';
              case 'perdido':
                return 'text-red-600';
              default:
                return 'text-gray-600';
            }
          };

          return (
            <div
              key={index}
              className={`${estado.bgColor} ${estado.borderColor} rounded-lg p-4 border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${estado.color} p-2 rounded-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{estado.title}</h3>
                    <p className="text-sm text-gray-600">
                      {formatNumber(estado.cantidad)} boletos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <DollarSign className={`w-4 h-4 ${getTipoIngresoColor()}`} />
                    <span className={`font-medium ${getTipoIngresoColor()}`}>
                      {formatCurrency(estado.ingresos)}
                    </span>
                  </div>
                  <p className={`text-xs ${getTipoIngresoColor()}`}>
                    {getTipoIngresoText()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 