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
    getByDni: (dni: string) => `${baseUrl}/api/users/by-dni/${dni}`,
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
    comprarParaOtro: `${baseUrl}/api/mercadopago/comprar-para-otro`,
    comprarPack: `${baseUrl}/api/mercadopago/comprar-pack`,
  },
  metricas: {
    completas: `${baseUrl}/api/metricas`,
    generales: `${baseUrl}/api/metricas/generales`,
    estado: `${baseUrl}/api/metricas/estado`,
    lotes: `${baseUrl}/api/metricas/lotes`,
    periodo: `${baseUrl}/api/metricas/periodo`,
    topUsuarios: `${baseUrl}/api/metricas/top-usuarios`,
    uso: `${baseUrl}/api/metricas/uso`,
    resumen: `${baseUrl}/api/metricas/resumen`,
  },
}; 