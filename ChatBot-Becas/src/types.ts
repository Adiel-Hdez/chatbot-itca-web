export interface UserData {
  id: number
  nombre: string
  apellido: string
  correo: string
}

export interface Faq {
  id: number
  categoria: string
  pregunta: string
  palabrasClave: string
  respuesta: string
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminUser {
  adminId: number
  nombre: string
  correo: string
  rol: string
}

export interface DashboardStats {
  totalFaqs: number
  activeFaqs: number
  totalCategories: number
  totalMessagesHandled: number
  categories: string[]
}

export interface WhatsAppLog {
  id: number
  remitente: string
  mensajeUsuario: string
  respuestaEnviada: string
  coincidenciaTipo: string
  createdAt: string
}
