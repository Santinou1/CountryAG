import { Lote } from '../types';

// Función para generar lotes del 1 al 100
const generateLotes = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: String(i + 1),
    name: `Lote ${i + 1}`,
    number: String(i + 1).padStart(3, '0'),
    description: 'Válido para ida y vuelta',
    price: 5000,
    available: true,
    type: 'ida-vuelta' as const
  }));
};

export const lotes = generateLotes();