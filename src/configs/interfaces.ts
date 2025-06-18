// Tipos para los enums de la base de datos
export enum UserRol {
  USUARIO = 'usuario',
  ADMIN = 'admin',
  PROPIETARIO = 'propietario',
  PROVEEDOR = 'proveedor'
}

export enum TipoEscaneo {
  IDA = 'ida',
  VUELTA = 'vuelta'
}

// Interfaces que reflejan las tablas de la base de datos
export interface CreatePersonaBody {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  rol: UserRol;
  dni: string;
  celular: string;
  area?: string;
  lote?: string;
  ocupacion?: string;
  esPropietario?: boolean;
  esProveedor?: boolean;
}

export interface UpdatePersonaBody {
  nombre?: string;
  apellido?: string;
  email?: string;
  contraseña?: string;
  rol?: UserRol;
}

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRol;
}

export interface CreateBoletoBody {
  lote: string;  // Solo necesitamos el lote, el idUsers viene en la URL
}

export interface Boleto {
  id: number;
  idUsers: number;
  codigo_boleto: string;
  lote: string;
  ida: boolean;
  vuelta: boolean;
  estado?: string;
  createdAt?: string;
  validoHasta?: string;
  qrValidoHasta?: string;
}

export interface EscaneoQR {
  id: number;
  boleto_id: number;
  tipo: TipoEscaneo;
  fecha_escaneo: string;
  escaneado_por: number;
} 