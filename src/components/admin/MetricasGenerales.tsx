import React from 'react';
import { Users, Ticket, DollarSign, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { MetricasGenerales as MetricasGeneralesType } from '../../types';

interface MetricasGeneralesProps {
  metricas: MetricasGeneralesType;
}

export const MetricasGenerales: React.FC<MetricasGeneralesProps> = ({ metricas }) => {
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

  const cards = [
    {
      title: 'Total Boletos',
      value: formatNumber(metricas.totalBoletos),
      icon: Ticket,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Usuarios',
      value: formatNumber(metricas.totalUsuarios),
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Ingresos Reales',
      value: formatCurrency(metricas.totalIngresos),
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Total Usos',
      value: formatNumber(Number(metricas.totalUsos)),
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Promedio Usos/Boleto',
      value: metricas.promedioUsosPorBoleto.toFixed(1),
      icon: BarChart3,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Tasa de Uso',
      value: `${metricas.tasaUso.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Métricas Generales</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg p-4 border border-gray-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 