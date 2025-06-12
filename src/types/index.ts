export interface User {
  id: string;
  name: string;
  role: 'client' | 'admin';
}

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  destination: string;
  purchaseDate: Date;
  status: 'pending' | 'confirmed' | 'used-ida' | 'completed';
  uses: {
    ida: boolean;
    vuelta: boolean;
  };
}

export interface Lote {
  id: string;
  name: string;
  number: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: 'client' | 'admin';
  name: string;
}