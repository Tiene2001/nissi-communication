'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

function smoothScrollTo(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV_LINKS = [
  { label: 'NOS SERVICES',    href: 'services' },
  { label: 'CRÉATION',        href: 'projets'  },
  { label: 'QUI SOMMES NOUS', href: 'about'    },
]

function isOverLight(x: number, y: number): boolean {
  const els = document.elementsFromPoint(x, y)
  // Ignorer les éléments du header lui-même
  const behind = els.find(el => !el.closest('header'))
  return !!behind?.closest('[data-nav-theme="light"]')
}

export default function Navigation() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [logoOnWhite, setLogoOnWhite] = useState(false)
  const [navOnWhite, setNavOnWhite]   = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const Y = 50 // centre vertical approximatif de la pill

    const check = () => {
      // Logo : zone gauche du header
      setLogoOnWhite(isOverLight(100, Y))
      // Liens de nav : zone droite du header
      setNavOnWhite(isOverLight(window.innerWidth - 160, Y))
    }

    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    check()
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const handleNav = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setMenuOpen(false)
    if (pathname === '/accueil') {
      smoothScrollTo(id)
    } else {
      router.push(`/accueil#${id}`)
    }
  }

  return (
    <header
      className="fixed top-4 left-6 right-6 z-[200] rounded-pill overflow-hidden transition-all duration-500"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(14px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%) brightness(1.05)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div className="px-8 md:px-12 flex items-center justify-between py-4">
        <a
          href="/"
          onClick={e => {
            e.preventDefault()
            if (pathname === '/accueil') {
              document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
            } else {
              router.push('/accueil')
            }
          }}
          className="flex items-center"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAXzN9MJvPDgD9EG5DMIQ_tkDamV5NNxoCW4alvzjhaGFw8grfOMD512UszGG37s7f_jzw4LFWT6p2Wx-AwD3Zk75pdmqdV7B6_SdkO2bqD_h8lgCKSbNnCPuiCUjHoYKX5bjnOpVjvJUMDvuAyPJ3MBUNDPEbyK9Ek_AAq4-pg2pIuqYLDeAR8WZwWbjoYjkoYkEasNHIGKzFS3rmkYvH-AFGx1fpTRgxgFZJDeemKW2YaviUpOCCTUxY3eJkc54NLtSxpIaCOp0"
            alt="NISSI Communication"
            className="h-16 w-auto object-contain transition-all duration-500"
            style={{ filter: logoOnWhite ? 'invert(1) hue-rotate(180deg)' : 'none' }}
          />
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(item => (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={e => handleNav(e, item.href)}
              className="font-body font-bold text-xs uppercase tracking-[0.05em] hover:text-[#FF8000] transition-colors"
              style={{
                color: navOnWhite ? '#121414' : '#ffffff',
                textShadow: navOnWhite ? 'none' : '0 1px 4px rgba(0,0,0,0.9)',
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={e => handleNav(e, 'contact')}
            className="font-body font-bold text-xs uppercase tracking-[0.05em] text-[#FF8000] hover:opacity-80 transition-opacity"
          >
            INVOQUEZ-NOUS
          </a>
        </nav>

        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <div
            className="w-6 h-0.5 origin-center"
            style={{
              background: navOnWhite ? '#121414' : '#ffffff',
              transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none',
              transition: 'transform 0.25s ease',
              marginBottom: menuOpen ? 0 : '5px',
            }}
          />
          <div
            className="w-6 h-0.5"
            style={{
              background: navOnWhite ? '#121414' : '#ffffff',
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 0.15s ease',
            }}
          />
          <div
            className="w-6 h-0.5 origin-center"
            style={{
              background: navOnWhite ? '#121414' : '#ffffff',
              transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
              transition: 'transform 0.25s ease',
              marginTop: menuOpen ? 0 : '5px',
            }}
          />
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-8 py-6 flex flex-col gap-5 mobile-menu-open"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          {NAV_LINKS.map((item, i) => (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={e => handleNav(e, item.href)}
              className="font-body font-bold text-sm uppercase tracking-[0.1em] text-white hover:text-[#FF8000] transition-colors"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={e => handleNav(e, 'contact')}
            className="font-body font-bold text-sm uppercase tracking-[0.1em] text-[#FF8000] w-fit border-b border-[#FF8000]/40 pb-0.5"
          >
            INVOQUEZ-NOUS
          </a>
        </div>
      )}
    </header>
  )
}
