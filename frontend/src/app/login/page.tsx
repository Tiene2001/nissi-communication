'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.ok) {
      router.push('/admin')
    } else {
      setError('Identifiants incorrects')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: '#ECEAE7',
        backgroundImage: 'radial-gradient(circle at 60% 40%, rgba(255,128,0,0.06) 0%, transparent 60%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Fenêtre flottante */}
      <div
        className="w-full max-w-[420px] bg-white overflow-hidden"
        style={{
          boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Barre titre de la fenêtre */}
        <div className="bg-[#121414] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="font-bold uppercase text-brand leading-none"
              style={{ fontFamily: "'Epilogue', sans-serif", fontSize: '1.1rem', letterSpacing: '-0.01em' }}
            >
              NISSI
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Administration</span>
          </div>
          {/* Boutons décoratifs style fenêtre OS */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-brand/60" />
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="px-8 py-10">
          <h1
            className="text-[#121414] font-bold mb-1"
            style={{ fontSize: '1.5rem', fontFamily: "'Epilogue', sans-serif", letterSpacing: '-0.02em' }}
          >
            Connexion
          </h1>
          <p className="text-[#121414]/40 text-xs mb-8">
            Entrez vos identifiants pour accéder à l&apos;espace d&apos;administration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#121414]/50 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                required
                autoComplete="email"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#F5F4F2] border border-[#121414]/10 focus:border-brand text-[#121414] px-4 py-3 outline-none transition-colors text-sm"
                placeholder="admin@nissi-communication.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#121414]/50 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                required
                autoComplete="current-password"
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-[#F5F4F2] border border-[#121414]/10 focus:border-brand text-[#121414] px-4 py-3 outline-none transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 py-3 px-4 border border-red-400/30 bg-red-50">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: '1rem' }}>error</span>
                <p className="text-red-500 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark transition-colors text-black font-bold text-xs uppercase tracking-[0.15em] py-4 flex items-center justify-center gap-2 mt-2"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '1rem' }}>progress_activity</span>
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Pied de fenêtre */}
        <div className="px-8 py-4 bg-[#F5F4F2] border-t border-[#121414]/5">
          <p className="text-[#121414]/30 text-[10px] text-center uppercase tracking-widest">
            Accès réservé · NISSI Communication
          </p>
        </div>
      </div>
    </div>
  )
}
