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

// Aquí puedes agregar otros tipos globales si los necesitas en el futuro