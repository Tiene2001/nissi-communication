'use client'
import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
function resolveUrl(url: string) {
  return url?.startsWith('/') ? `${API}${url}` : url
}

interface Project {
  id: string
  title: string
  slug: string
  category: string
  clientName?: string
  media: { url: string; type: string }[]
}

interface Props {
  projects: Project[]
  title?: string
  sectionId?: string
}

function getThumb(project: Project | null): string | null {
  if (!project) return null
  const url = project.media?.find(m => m.type === 'IMAGE')?.url ?? null
  return url ? resolveUrl(url) : null
}

function SideCard({ project, direction, onClick }: {
  project: Project | null
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const thumb = getThumb(project)
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {thumb ? (
        <img src={thumb} alt={project!.title} className="w-72 h-[420px] object-cover shadow-2xl" />
      ) : (
        <div className="w-72 h-[420px] bg-[#1e2020] flex items-center justify-center">
          <span className="text-white/20 text-sm uppercase tracking-widest">[ Projet ]</span>
        </div>
      )}
      {/* Overlay hover directionnel */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="material-symbols-outlined text-white/80" style={{ fontSize: '3rem' }}>
          {direction === 'left' ? 'chevron_left' : 'chevron_right'}
        </span>
      </div>
    </div>
  )
}

function CenterCard({ project }: { project: Project | null }) {
  const thumb = getThumb(project)

  const content = (
    <div className="relative group">
      {thumb ? (
        <img src={thumb} alt={project!.title} className="w-[350px] md:w-[560px] h-[420px] object-cover" />
      ) : (
        <div className="w-[350px] md:w-[560px] h-[420px] bg-[#1e2020] flex items-center justify-center">
          <span className="text-white/20 text-sm uppercase tracking-widest">[ Projet ]</span>
        </div>
      )}

      {/* Overlay hover avec CTA */}
      {project && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}
        >
          <p className="text-[#FF8000] text-xs font-bold uppercase tracking-[0.3em] mb-2">
            {project.category}
          </p>
          <h3 className="text-white text-xl font-extrabold uppercase tracking-tight mb-5">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 bg-[#FF8000] text-black font-bold text-xs uppercase tracking-widest px-6 py-3">
            <span>Voir le projet</span>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
          </div>
        </div>
      )}
    </div>
  )

  return project ? (
    <Link href={`/projets/${project.slug}`} className="block">{content}</Link>
  ) : (
    content
  )
}

export default function ProjectsCarousel({ projects, title = 'Création', sectionId = 'projets' }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const total = projects.length

  const getIndex = (offset: number) => {
    if (total === 0) return -1
    return ((current + offset) % total + total) % total
  }

  const prev = () => {
    setDirection('prev')
    setCurrent(c => ((c - 1) + Math.max(total, 1)) % Math.max(total, 1))
  }
  const next = () => {
    setDirection('next')
    setCurrent(c => (c + 1) % Math.max(total, 1))
  }

  const leftProject   = total >= 3 ? projects[getIndex(-1)] : null
  const centerProject = total > 0  ? projects[getIndex(0)]  : null
  const rightProject  = total >= 3 ? projects[getIndex(1)]  : null

  const indicators = total > 1 ? projects : [null, null, null]

  return (
    <section id={sectionId} className="py-16 bg-[#0d0d0d] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16">

        {/* Titre */}
        <div className="reveal flex justify-center mb-12">
          <h2 className="text-[#FF8000] text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
            {title}
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center">

          {/* Flèche gauche */}
          <button
            onClick={prev}
            aria-label="Précédent"
            className="rounded-full absolute left-0 z-50 p-4 flex items-center justify-center hover:bg-[#FF8000] transition-colors duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="material-symbols-outlined text-white group-hover:text-black">chevron_left</span>
          </button>

          {/* Items */}
          <div className="flex items-center">
            <div className="hidden lg:block opacity-30 scale-75 -translate-x-32 -rotate-[5deg] grayscale hover:opacity-50 transition-all duration-500">
              <SideCard project={leftProject} direction="left" onClick={prev} />
            </div>

            <div className="z-30 scale-110 transition-all duration-500" style={{ boxShadow: '0 40px 100px rgba(255,128,0,0.2)' }}>
              <div key={current} className={direction === 'next' ? 'carousel-enter-right' : 'carousel-enter-left'}>
                <CenterCard project={centerProject} />
              </div>
            </div>

            <div className="hidden lg:block opacity-30 scale-75 translate-x-32 rotate-[5deg] grayscale hover:opacity-50 transition-all duration-500">
              <SideCard project={rightProject} direction="right" onClick={next} />
            </div>
          </div>

          {/* Flèche droite */}
          <button
            onClick={next}
            aria-label="Suivant"
            className="rounded-full absolute right-0 z-50 p-4 flex items-center justify-center hover:bg-[#FF8000] transition-colors duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="material-symbols-outlined text-white group-hover:text-black">chevron_right</span>
          </button>
        </div>

        {/* Indicateurs */}
        <div className="flex justify-center gap-4 mt-10">
          {indicators.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (total === 0) return
                setDirection(i > current ? 'next' : 'prev')
                setCurrent(i)
              }}
              className={`w-16 h-1 transition-colors ${i === current ? 'bg-[#FF8000]' : 'bg-white/10 hover:bg-white/30'}`}
              aria-label={`Projet ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
