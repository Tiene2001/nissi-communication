'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Step = 'form' | 'sending' | 'otp' | 'submitting' | 'success'

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
  })
  const [step,     setStep]     = useState<Step>('form')
  const [otp,      setOtp]      = useState('')
  const [error,    setError]    = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const requestOtp = async () => {
    setStep('sending')
    setError('')
    try {
      await axios.post(`${API}/api/contact/send-otp`, { email: form.email })
      setStep('otp')
      setResendIn(60)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(typeof msg === 'string' ? msg : "Impossible d'envoyer le code. Vérifiez votre email.")
      setStep('form')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requestOtp()
  }

  const handleConfirm = async () => {
    if (otp.length !== 6) return
    setStep('submitting')
    setError('')
    try {
      await axios.post(`${API}/api/contact`, {
        name:    `${form.firstName} ${form.lastName}`.trim(),
        email:   form.email,
        phone:   form.phone,
        subject: form.subject,
        message: form.message,
        otp,
      })
      setStep('success')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue. Réessayez.')
      setStep('otp')
    }
  }

  const resendCode = async () => {
    if (resendIn > 0) return
    setOtp('')
    setError('')
    try {
      await axios.post(`${API}/api/contact/send-otp`, { email: form.email })
      setResendIn(60)
    } catch {
      setError('Impossible de renvoyer le code.')
    }
  }

  const reset = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
    setStep('form')
    setOtp('')
    setError('')
  }

  const inputCls = 'w-full bg-white border-0 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF8000] transition-shadow'

  return (
    <section id="contact" data-nav-theme="light" className="bg-[#E5E5E5] py-12 px-8 md:px-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* Colonne gauche : Image décorative */}
        <div className="relative overflow-hidden min-h-[280px]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWdO5BqfP-79-_QYC4CCxJMEDCe1qedsgC9iHjj5J9TBoLF1yMJzLiaVAKREKuwG-wHYfOLb_kJ5oME_lFSmCzM12gUDLDew2UbAghDCmTO_spZhs0NBDoll2a2U_XsLtaOuPGZqvMlmcvvXVtgZCQ0moINZGoC-YD8tKt19Rbp8rFT2WPTflsrTTSYmrhxmK04YBS3ZX9G7dpYhnNTmYwnOz5V06YPiimF4a1_e2g_k_EAT00ZN0XOPkfwtwLBpDCuDEmfpxbFyc"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Colonne droite */}
        <div className="bg-[#D9D9D9] p-8 flex flex-col justify-center min-h-[380px]">

          {/* ── Succès ── */}
          {step === 'success' ? (
            <div
              className="flex flex-col items-center gap-5 text-center"
              style={{ animation: 'contact-success 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              <div className="w-16 h-16 bg-[#121414] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#FF8000]" style={{ fontSize: '2rem' }}>check_circle</span>
              </div>
              <div>
                <h3 className="text-[#121414] font-bold text-xl mb-2">Message envoyé !</h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  Notre équipe reviendra vers vous dans les meilleurs délais.
                </p>
              </div>
              <button
                onClick={reset}
                className="mt-2 text-[#FF8000] font-bold text-xs uppercase tracking-widest border-b border-[#FF8000]/40 hover:border-[#FF8000] transition-colors pb-0.5"
              >
                Envoyer un autre message
              </button>
            </div>

          ) : step === 'otp' || step === 'submitting' ? (
            /* ── Étape OTP ── */
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-[#121414] font-bold text-lg mb-1">Vérifiez votre email</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Un code à 6 chiffres a été envoyé à{' '}
                  <strong className="text-[#121414]">{form.email}</strong>
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="text-center text-2xl font-black tracking-[0.8em] bg-white border-0 px-4 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF8000] placeholder:tracking-[0.4em] placeholder:text-gray-300"
              />

              {error && (
                <p className="text-red-600 font-semibold text-xs bg-red-50 px-3 py-2 border-l-2 border-red-500">
                  {error}
                </p>
              )}

              <button
                onClick={handleConfirm}
                disabled={otp.length !== 6 || step === 'submitting'}
                className="bg-[#FF8000] text-white px-8 py-2.5 font-bold text-sm uppercase hover:bg-[#cc6600] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {step === 'submitting' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Vérification...
                  </>
                ) : 'Confirmer et envoyer'}
              </button>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtp(''); setError('') }}
                  className="text-gray-500 text-xs hover:text-gray-700 transition-colors"
                >
                  ← Modifier le formulaire
                </button>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendIn > 0}
                  className="text-xs font-semibold transition-colors disabled:text-gray-400 text-[#FF8000] hover:text-[#cc6600]"
                >
                  {resendIn > 0 ? `Renvoyer (${resendIn}s)` : 'Renvoyer le code'}
                </button>
              </div>
            </div>

          ) : (
            /* ── Formulaire ── */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 text-sm font-semibold">Nom</label>
                  <input
                    type="text" name="lastName" value={form.lastName}
                    onChange={handleChange} required placeholder="Votre nom"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 text-sm font-semibold">Prénom</label>
                  <input
                    type="text" name="firstName" value={form.firstName}
                    onChange={handleChange} required placeholder="Votre prénom"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 text-sm font-semibold">E-mail</label>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} required placeholder="votre@email.com"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 text-sm font-semibold">Téléphone</label>
                  <input
                    type="tel" name="phone" value={form.phone}
                    onChange={handleChange} placeholder="+225 07 XX XX XX XX"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-700 text-sm font-semibold">Objet</label>
                <input
                  type="text" name="subject" value={form.subject}
                  onChange={handleChange} required placeholder="Objet de votre message"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-700 text-sm font-semibold">Votre Prière</label>
                <textarea
                  name="message" rows={3} value={form.message}
                  onChange={handleChange} required
                  placeholder="Décrivez votre projet ou votre demande..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {error && (
                <p className="text-red-600 font-semibold text-xs bg-red-50 px-3 py-2 border-l-2 border-red-500">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  Un code de vérification sera envoyé à votre email
                </p>
                <button
                  type="submit"
                  disabled={step === 'sending'}
                  className="bg-[#FF8000] text-white px-8 py-2.5 font-bold text-sm uppercase hover:bg-[#cc6600] transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {step === 'sending' ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi du code...
                    </>
                  ) : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
