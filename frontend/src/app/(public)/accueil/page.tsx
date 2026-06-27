import HeroSection,    { HeroContent }  from '@/components/public/HeroSection'
import ServicesSection  from '@/components/public/ServicesSection'
import ProjectsCarousel from '@/components/public/ProjectsCarousel'
import ClientsSection   from '@/components/public/ClientsSection'
import ContactForm      from '@/components/public/ContactForm'
import ArrivalOverlay   from '@/components/public/ArrivalOverlay'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const HERO_DEFAULT: HeroContent = {
  title:        'Les esprits de la com',
  description:  "Cabinet de conseil en stratégie de marque et en influence, NISSI Communication accompagne les organisations dans la structuration, le pilotage et le déploiement de leur visibilité. Nous transformons les enjeux de communication en leviers de croissance, de positionnement et d'autorité.",
  tagline:      'Invoquez les Esprits et prenez le pouvoir !',
  stat1_number: '50+',  stat1_label: 'Projets réalisés',
  stat2_number: '30+',  stat2_label: 'Clients satisfaits',
  stat3_number: '5+',   stat3_label: "Années d'expérience",
  stat4_number: '100%', stat4_label: 'Engagement client',
}

async function fetchSection<T>(section: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API}/api/content/${section}`, { cache: 'no-store' })
    if (!r.ok) return fallback
    const json = await r.json()
    return { ...fallback, ...(json.data ?? json) }
  } catch {
    return fallback
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
    fetchSection<HeroContent>('hero', HERO_DEFAULT),
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
