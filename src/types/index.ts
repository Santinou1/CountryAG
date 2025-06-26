export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'usuario' | 'chofer';
  nombre?: string;
  apellido?: string;
  dni?: string;
  celular?: string;
}

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  destination: string;
  purchaseDate: Date;
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'used-ida' | 'completed';
  uses: {
    ida: boolean;
    vuelta: boolean;
  };
  contador?: number;
  dni?: string;
  celular?: string;
  email?: string;
  rol?: string;
  createdAt?: string;
  validoHasta?: string;
  qrValidoHasta?: string;
  estado?: string;
  fechaCreacion?: string;
  primerUso?: string;
  paymentId?: string;
  tipo?: 'diario' | 'unico';
}

export interface Lote {
  id: string;
  name: string;
  number: string;
  description: string;
  price: number;
  available: boolean;
  type: 'ida-vuelta';
}

export interface LoginCredentials {
  email: string;
  contraseña: string;
  rol: 'usuario' | 'admin' | 'chofer';
  nombre: string;
}

// Interfaces para Métricas
export interface MetricasGenerales {
  totalBoletos: number;
  totalUsuarios: number;
  totalIngresos: number;
  totalUsos: string | number;
  promedioUsosPorBoleto: number;
  tasaUso: number;
}

export interface MetricasPorEstado {
  pendientes: number;
  aprobados: number;
  rechazados: number;
  ingresosPendientes: number;
  ingresosAprobados: number;
  ingresosRechazados: number;
}

export interface MetricasPorLote {
  lote: string;
  cantidadBoletos: number;
  ingresos: number;
  usos: number;
  promedioUsos: number;
}

export interface MetricasPorPeriodo {
  periodo: string;
  boletosCreados: number;
  boletosUsados: number;
  ingresos: number;
  usos: number;
}

export interface MetricasTopUsuarios {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  cantidadBoletos: number;
  totalUsos: number;
  totalGastado: number;
}

export interface MetricasUso {
  boletosSinUso: number;
  boletosConUnUso: number;
  boletosConDosUsos: number;
  boletosConMasUsos: number;
  porcentajeSinUso: number;
  porcentajeConUso: number;
}

export interface MetricasCompletas {
  generales: MetricasGenerales;
  porEstado: MetricasPorEstado;
  porLote: MetricasPorLote[];
  porPeriodo: MetricasPorPeriodo[];
  topUsuarios: MetricasTopUsuarios[];
  uso: MetricasUso;
}

export interface MetricasResumen {
  generales: MetricasGenerales;
  porEstado: MetricasPorEstado;
  uso: MetricasUso;
}

// Aquí puedes agregar otros tipos globales si los necesitas en el futuro