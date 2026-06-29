import HeroSection,    { HeroContent }  from '@/components/public/HeroSection'
import ServicesSection  from '@/components/public/ServicesSection'
import ProjectsCarousel from '@/components/public/ProjectsCarousel'
import ClientsSection   from '@/components/public/ClientsSection'
import ContactForm      from '@/components/public/ContactForm'
import ArrivalOverlay   from '@/components/public/ArrivalOverlay'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const HERO_DEFAULT: HeroContent = {
  title:       'Les esprits de la com',
  description: "Cabinet de conseil en stratégie de marque et en influence, NISSI Communication accompagne les organisations dans la structuration, le pilotage et le déploiement de leur visibilité. Nous transformons les enjeux de communication en leviers de croissance, de positionnement et d'autorité.",
  tagline:     'Invoquez les Esprits et prenez le pouvoir !',
  stats: [
    { number: '50+',  label: 'Projets réalisés' },
    { number: '30+',  label: 'Clients satisfaits' },
    { number: '5+',   label: "Années d'expérience" },
    { number: '100%', label: 'Engagement client' },
  ],
}

async function fetchHero(): Promise<HeroContent> {
  try {
    const r = await fetch(`${API}/api/content/hero`, { cache: 'no-store' })
    if (!r.ok) return HERO_DEFAULT
    const json = await r.json()
    const raw  = json.data ?? json

    // Nouveau format : stats est un tableau
    if (Array.isArray(raw.stats)) {
      return {
        title:       raw.title       || HERO_DEFAULT.title,
        description: raw.description || HERO_DEFAULT.description,
        tagline:     raw.tagline     || HERO_DEFAULT.tagline,
        stats:       raw.stats.filter((s: any) => s.number || s.label),
      }
    }

    // Ancien format : stat1_number / stat1_label / ...
    const stats: { number: string; label: string }[] = []
    for (let i = 1; i <= 8; i++) {
      if (raw[`stat${i}_number`] || raw[`stat${i}_label`]) {
        stats.push({ number: raw[`stat${i}_number`] ?? '', label: raw[`stat${i}_label`] ?? '' })
      }
    }
    return {
      title:       raw.title       || HERO_DEFAULT.title,
      description: raw.description || HERO_DEFAULT.description,
      tagline:     raw.tagline     || HERO_DEFAULT.tagline,
      stats:       stats.length > 0 ? stats : HERO_DEFAULT.stats,
    }
  } catch {
    return HERO_DEFAULT
  }
}

async function getData() {
  try {
    const [projects, clients, services] = await Promise.all([
      fetch(`${API}/api/projects`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/clients`,  { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/services`, { cache: 'no-store' }).then(r => r.json()),
    ])
    return { projects, clients, services }
  } catch {
    return { projects: [], clients: [], services: [] }
  }
}

export default async function AccueilPage() {
  const [{ projects, clients, services }, hero] = await Promise.all([
    getData(),
    fetchHero(),
  ])

  return (
    <>
      <ArrivalOverlay />
      <HeroSection    content={hero} />
      <ServicesSection services={services} />
      <ProjectsCarousel projects={projects} title="Création" />
      <ClientsSection clients={clients} />
      <ContactForm />
    </>
  )
}
