// ==================== MÉDIAS ====================

export type MediaType = 'IMAGE' | 'VIDEO'

export interface Media {
  id: string
  url: string
  type: MediaType
  order: number
  projectId?: string
}

// ==================== PROJETS ====================

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  clientName?: string
  date: string
  description: string
  published: boolean
  media: Media[]
  results?: ProjectResult[]
  createdAt: string
  updatedAt: string
}

export interface ProjectResult {
  label: string
  value: string
}

export interface CreateProjectDto {
  title: string
  slug: string
  category: string
  clientName?: string
  date: string
  description: string
  published?: boolean
  media?: Omit<Media, 'id' | 'projectId'>[]
}

// ==================== SERVICES ====================

export interface Service {
  id: string
  title: string
  description: string
  icon?: string
  order: number
  createdAt: string
}

export interface CreateServiceDto {
  title: string
  description: string
  icon?: string
  order?: number
}

// ==================== CLIENTS ====================

export interface Client {
  id: string
  name: string
  logo: string
  order: number
}

export interface CreateClientDto {
  name: string
  logo: string
  order?: number
}

// ==================== CONTENU ====================

export type ContentBlockType = 'TEXT' | 'RICH_TEXT'

export interface ContentBlock {
  id: string
  key: string
  label: string
  value: string
  type: ContentBlockType
}

// ==================== CONTACT ====================

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  read: boolean
  createdAt: string
}

export interface CreateContactDto {
  name: string
  email: string
  phone?: string
  message: string
}

// ==================== AUTH ====================

export type UserRole = 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
  lastLogin?: string
}

export interface AuthSession {
  user: {
    email: string
    role: UserRole
  }
  accessToken: string
}

// ==================== PARAMÈTRES ====================

export interface SiteSettings {
  notificationEmail: string
  siteTitle: string
  siteDescription: string
  socialFacebook?: string
  socialInstagram?: string
  socialLinkedin?: string
}

// ==================== API ====================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
