'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EntryPage() {
  const router   = useRouter()
  const [entered, setEntered] = useState(false)

  const handleEnter = () => {
    if (entered) return
    setEntered(true)
    setTimeout(() => router.push('/accueil?entered=1'), 820)
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center relative">

      {/* ── Fond — zoome vers l'avant au clic ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:    "url('/images/sanctuaire-bg.jpg')",
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
          backgroundColor:    '#000',
          transform:          entered ? 'scale(1.55)' : 'scale(1)',
          filter:             entered ? 'blur(6px) brightness(0.5)' : 'blur(0px) brightness(1)',
          transition:         entered
            ? 'transform 0.65s cubic-bezier(0.4, 0, 1, 1), filter 0.45s ease'
            : 'none',
          transformOrigin: 'center center',
        }}
      />

      {/* Voile sombre permanent */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {/* ── Contenu — disparaît au clic ── */}
      <div
        className="relative z-10 flex flex-col items-center entry-appear"
        style={{
          opacity:       entered ? 0 : 1,
          transform:     entered ? 'scale(0.92) translateY(8px)' : 'scale(1) translateY(0)',
          transition:    entered ? 'opacity 0.3s ease, transform 0.4s ease' : 'none',
          pointerEvents: entered ? 'none' : 'auto',
        }}
      >
        <div className="w-px h-16 bg-white/20" />

        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.5em] mt-5 mb-5"
          style={{ fontFamily: "'Epilogue', sans-serif" }}
        >
          Nissi Communication
        </p>

        {/* Bouton avec coins */}
        <button
          onClick={handleEnter}
          className="group relative block cursor-pointer bg-transparent border-0 p-0"
        >
          <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#FF8000]" />
          <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#FF8000]" />
          <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#FF8000]" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#FF8000]" />

          <span
            className="absolute inset-0 bg-[#FF8000] scale-x-0 group-hover:scale-x-100 origin-left"
            style={{ transition: 'transform 0.45s cubic-bezier(0.76, 0, 0.24, 1)' }}
          />

          <span
            className="relative z-10 block px-16 py-[22px] text-[2rem] md:text-[2.4rem] font-black uppercase text-white group-hover:text-black"
            style={{
              letterSpacing: '0.55em',
              fontFamily:    "'Epilogue', sans-serif",
              transition:    'color 0.45s cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            ENTRER
          </span>
        </button>

        <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.45em] mt-5 mb-5"
          style={{ fontFamily: "'Epilogue', sans-serif" }}
        >
          dans le sanctuaire
        </p>

        <div className="w-px h-16 bg-white/20" />
      </div>

      {/* ── Voile noir final — couvre tout avant la navigation ── */}
      <div
        className="fixed inset-0 z-[9999] bg-[#050505] pointer-events-none"
        style={{
          opacity:    entered ? 1 : 0,
          transition: entered ? 'opacity 0.45s ease 0.18s' : 'none',
        }}
      />
    </div>
  )
}
