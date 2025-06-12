export const baseUrl = import.meta.env.VITE_BACKEND_URL;

// URLs de la API
export const apiUrls = {
  users: {
    create: `${baseUrl}/api/users`,
    getAll: `${baseUrl}/api/users`,
    getById: (id: string) => `${baseUrl}/api/users/${id}`,
    update: (id: string) => `${baseUrl}/api/users/${id}`,
    delete: (id: string) => `${baseUrl}/api/users/${id}`,
    login: `${baseUrl}/api/auth/login`,
    logout: `${baseUrl}/api/auth/logout`,
    me: `${baseUrl}/api/users/me`,
  },
  boletos: {
    crear: (userId: string) => `${baseUrl}/api/boletos/crear/${userId}`,
    getByUser: (userId: string) => `${baseUrl}/api/boletos/usuario/${userId}`,
    marcarIda: (boletoId: string, userId: string) => 
      `${baseUrl}/api/boletos/${boletoId}/marcar-ida/${userId}`,
    marcarVuelta: (boletoId: string, userId: string) => 
      `${baseUrl}/api/boletos/${boletoId}/marcar-vuelta/${userId}`,
  },
  qr: {
    generarIda: (boletoId: string, userId: string) => 
      `${baseUrl}/api/qr/generar/ida/${boletoId}/${userId}`,
    generarVuelta: (boletoId: string, userId: string) => 
      `${baseUrl}/api/qr/generar/vuelta/${boletoId}/${userId}`,
    escanear: (adminId: string) => `${baseUrl}/api/qr/escanear/${adminId}`,
    historial: (boletoId: string) => `${baseUrl}/api/qr/historial/${boletoId}`,
  },
}; 