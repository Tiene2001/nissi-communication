import ProjectGallery from '@/components/public/ProjectGallery'
import ProjectsCarousel from '@/components/public/ProjectsCarousel'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getProject(slug: string) {
  try {
    const res = await fetch(`${API}/api/projects/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getRelatedProjects(currentSlug: string) {
  try {
    const res = await fetch(`${API}/api/projects?limit=6`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data.data ?? [])
    return list.filter((p: { slug: string }) => p.slug !== currentSlug).slice(0, 4)
  } catch { return [] }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const [project, related] = await Promise.all([
    getProject(params.slug),
    getRelatedProjects(params.slug),
  ])
  if (!project) notFound()

  const heroImage = project.media?.find((m: { type: string }) => m.type === 'IMAGE')?.url

  return (
    <>
      {/* ── SPLIT SCREEN ── */}
      <section className="flex flex-col lg:flex-row min-h-screen">

        {/* GAUCHE — Image sticky */}
        <div data-nav-theme="light" className="lg:w-1/2 lg:sticky lg:top-0 lg:h-screen relative overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={project.title}
              className="w-full h-56 lg:h-full object-cover"
            />
          ) : (
            <div className="w-full h-56 lg:h-full bg-[#121414]" />
          )}
          {/* Voile latéral vers le contenu */}
          <div
            className="absolute inset-0 hidden lg:block pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent 70%, rgba(10,10,10,0.6) 100%)' }}
          />
          {/* Catégorie en bas de l'image */}
          {project.category && (
            <div className="absolute bottom-8 left-8 hidden lg:block">
              <span className="text-[#FF8000] text-xs font-bold uppercase tracking-[0.4em]">
                {project.category}
              </span>
            </div>
          )}
        </div>

        {/* DROITE — Contenu scrollable */}
        <div className="lg:w-1/2 bg-[#0a0a0a] flex flex-col justify-center px-8 md:px-14 py-20 lg:py-36 min-h-screen">

          {/* Retour */}
          <Link
            href="/accueil#projets"
            className="inline-flex items-center gap-2 text-white/30 hover:text-[#FF8000] transition-colors text-xs uppercase tracking-widest font-bold mb-14 w-fit"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
            Retour aux créations
          </Link>

          {/* Catégorie (mobile uniquement) */}
          <span className="lg:hidden text-[#FF8000] text-xs font-bold uppercase tracking-[0.4em] mb-3">
            {project.category}
          </span>

          {/* Titre */}
          <h1 className="text-5xl md:text-6xl xl:text-[5.5rem] font-extrabold uppercase tracking-tighter leading-none text-white mb-8">
            {project.title}
          </h1>

          {/* Ligne orange */}
          <div className="w-16 h-1 bg-[#FF8000] mb-10" />

          {/* Description */}
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-12">
            {project.description}
          </p>

          {/* Métadonnées */}
          <div className="grid grid-cols-3 gap-x-8 border-t border-white/10 pt-10 mb-12">
            {project.clientName && (
              <div>
                <p className="text-[#FF8000] text-[10px] font-bold uppercase tracking-widest mb-1">Client</p>
                <p className="text-white/70 text-sm">{project.clientName}</p>
              </div>
            )}
            {project.date && (
              <div>
                <p className="text-[#FF8000] text-[10px] font-bold uppercase tracking-widest mb-1">Année</p>
                <p className="text-white/70 text-sm">{new Date(project.date).getFullYear()}</p>
              </div>
            )}
            <div>
              <p className="text-[#FF8000] text-[10px] font-bold uppercase tracking-widest mb-1">Domaine</p>
              <p className="text-white/70 text-sm">{project.category}</p>
            </div>
          </div>

          {/* Métriques (si disponibles) */}
          {project.results && project.results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-12">
              {project.results.map((result: { label: string; value: string }, i: number) => (
                <div
                  key={i}
                  className="p-6 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="block text-3xl font-bold text-[#FF8000] mb-1">{result.value}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{result.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Indicateur scroll galerie */}
          <div className="flex items-center gap-3 text-white/20 mt-4">
            <div className="w-8 h-px bg-white/20" />
            <span className="text-[10px] uppercase tracking-widest">Galerie</span>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>south</span>
          </div>
        </div>
      </section>

      {/* ── GALERIE IMMERSIVE ── */}
      <ProjectGallery media={project.media ?? []} title={project.title} />

      {/* ── AUTRES CRÉATIONS — Carousel ── */}
      {related.length > 0 && (
        <div className="border-t border-white/5 bg-[#0a0a0a]">
          <ProjectsCarousel
            projects={related}
            title="Autres créations"
            sectionId="autres-creations"
          />
        </div>
      )}
    </>
  )
}
