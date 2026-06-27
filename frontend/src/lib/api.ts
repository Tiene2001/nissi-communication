import axios from 'axios'
import { getSession } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`
  }
  return config
})

export default api
