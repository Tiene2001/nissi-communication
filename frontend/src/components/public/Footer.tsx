'use client'
import { useEffect, useState } from 'react'

interface SiteSettings {
  phone1?:         string
  phone2?:         string
  address?:        string
  socialFacebook?: string
  socialTikTok?:   string
  socialLinkedin?: string
  socialInstagram?: string
}

const DEFAULT: SiteSettings = {
  phone1:          '+225 07 58 72 71 92',
  phone2:          '+225 05 74 24 71 71',
  address:         'Abidjan, Cocody, II Plateau\nCité les Versants 2, Rue Du Bandaman',
  socialFacebook:  '#',
  socialTikTok:    '#',
  socialLinkedin:  '#',
  socialInstagram: '#',
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}
function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

const SOCIALS = [
  { key: 'socialFacebook',  label: 'Facebook',  Icon: FacebookIcon  },
  { key: 'socialTikTok',    label: 'TikTok',    Icon: TikTokIcon    },
  { key: 'socialLinkedin',  label: 'LinkedIn',  Icon: LinkedInIcon  },
  { key: 'socialInstagram', label: 'Instagram', Icon: InstagramIcon },
] as const

export default function Footer() {
  const [s, setS] = useState<SiteSettings>(DEFAULT)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/content/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setS({ ...DEFAULT, ...(data.data ?? data) }) })
      .catch(() => {})
  }, [])

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: 'url("/images/footer-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff',
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-20 flex flex-col min-h-[600px]">

        {/* HAUT — Logo gauche + Réseaux droite */}
        <div className="flex items-start justify-between pt-12">
          <a href="/accueil">
            <img
              src="/images/logo_nissi_blanc.png"
              alt="NISSI Communication"
              className="h-24 w-auto object-contain hover:opacity-80 transition-opacity"
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
            />
          </a>

          <div className="flex flex-col items-stretch gap-3">
            <h4 className="text-[#121414] font-bold text-sm uppercase tracking-widest text-right">
              Suivez-nous
            </h4>
            <div className="h-0.5 bg-[#FF8000] w-full" />
            <div className="flex gap-3 justify-end">
              {SOCIALS.map(({ key, label, Icon }) => {
                const href = (s as any)[key]
                const hasUrl = href && href !== '#' && href !== ''
                return hasUrl ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-[#FF8000] text-black flex items-center justify-center hover:bg-[#e67300] transition-colors"
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    key={key}
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-[#FF8000] text-black flex items-center justify-center cursor-default"
                  >
                    <Icon />
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex-grow" />

        {/* BAS — Contacts gauche + Slogan droite */}
        <div className="flex items-end justify-between pb-12">
          <div className="space-y-3">
            {(s.phone1 || s.phone2) && (
              <div>
                <p className="text-[#FF8000] text-xs font-bold uppercase tracking-widest mb-1">Nos contacts</p>
                {s.phone1 && <p className="text-white/80 text-sm">{s.phone1}</p>}
                {s.phone2 && <p className="text-white/80 text-sm">{s.phone2}</p>}
              </div>
            )}
            {s.address && (
              <div>
                <p className="text-[#FF8000] text-xs font-bold uppercase tracking-widest mb-1">Retrouvez-nous</p>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{s.address}</p>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-white text-xl font-light">vous serez</p>
            <p className="text-[#FF8000] text-3xl font-bold leading-none">bien + que</p>
            <p className="text-[#FF8000] text-4xl font-extrabold uppercase tracking-tighter">satisfait</p>
          </div>
        </div>

      </div>

      {/* Barre orange copyright */}
      <div className="relative z-10 w-full bg-[#FF8000] py-3 px-8 md:px-20">
        <p className="text-black font-bold text-sm text-center">
          © NISSI Communication {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
