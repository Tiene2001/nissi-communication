import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          })
          if (res.data?.access_token) {
            return { ...res.data.user, accessToken: res.data.access_token }
          }
          return null
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken
      ;(session.user as any).role = token.role
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy:  'jwt',
    maxAge:    8 * 60 * 60,   // déconnexion après 8h d'inactivité
    updateAge: 60 * 60,       // renouvelle le cookie chaque heure si actif
  },
  secret: process.env.NEXTAUTH_SECRET,
}
