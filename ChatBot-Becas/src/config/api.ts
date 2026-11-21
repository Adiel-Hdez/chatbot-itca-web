// Configuración centralizada de URL base para la API
// En desarrollo local apunta a http://localhost:8080
// En producción (Netlify u otro hosting) usa rutas relativas /api/... que se redirigen automáticamente
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : ''

export default API_BASE_URL
