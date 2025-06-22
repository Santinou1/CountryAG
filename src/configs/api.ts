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
    getAll: `${baseUrl}/api/boletos`,
    getPendientes: `${baseUrl}/api/boletos/pendientes`,
    getConfirmados: `${baseUrl}/api/boletos/confirmados`,
    getConsumidos: `${baseUrl}/api/boletos/consumidos`,
    aprobar: (boletoId: string, userId: string) =>
      `${baseUrl}/api/boletos/${boletoId}/aprobar/${userId}`,
    rechazar: (boletoId: string, userId: string) =>
      `${baseUrl}/api/boletos/${boletoId}/rechazar/${userId}`,
    consumoManual: (boletoId: string) => 
      `${baseUrl}/api/boletos/consumo-manual/${boletoId}`,
  },
  qr: {
    generar: (boletoId: string, userId: string) =>
      `${baseUrl}/api/qr/generar/${boletoId}/${userId}`,
    escanear: (boletoId: string) => `${baseUrl}/api/qr/escanear/${boletoId}`,
    historial: (boletoId: string) => `${baseUrl}/api/qr/historial/${boletoId}`,
  },
  mercadopago: {
    createPreference: `${baseUrl}/api/mercadopago/create-preference`,
  },
}; 