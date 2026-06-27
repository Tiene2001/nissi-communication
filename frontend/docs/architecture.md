# Architecture Frontend — NISSI Communication

## Framework : Next.js 14 App Router

---

## Structure des dossiers

```
src/
├── app/
│   ├── (public)/                    ← Groupe de routes publiques
│   │   ├── layout.tsx               ← Layout public (nav + footer)
│   │   ├── page.tsx                 ← Page d'accueil (SSR)
│   │   └── projets/
│   │       └── [slug]/
│   │           └── page.tsx         ← Détail projet (SSR)
│   ├── (admin)/                     ← Groupe de routes admin
│   │   └── admin/
│   │       ├── layout.tsx           ← Layout admin (sidebar + header)
│   │       ├── page.tsx             ← Dashboard
│   │       ├── projets/
│   │       │   ├── page.tsx         ← Liste projets
│   │       │   ├── nouveau/
│   │       │   │   └── page.tsx     ← Créer projet
│   │       │   └── [id]/
│   │       │       └── page.tsx     ← Éditer projet
│   │       ├── services/
│   │       │   └── page.tsx
│   │       ├── clients/
│   │       │   └── page.tsx
│   │       ├── contenu/
│   │       │   └── page.tsx
│   │       ├── contact/
│   │       │   └── page.tsx         ← Inclut SSE listener
│   │       ├── utilisateurs/
│   │       │   └── page.tsx         ← SuperAdmin only
│   │       └── parametres/
│   │           └── page.tsx
│   ├── login/
│   │   └── page.tsx                 ← Page connexion admin
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts         ← Handler next-auth
│   ├── layout.tsx                   ← Layout racine
│   └── globals.css                  ← Styles globaux Tailwind
├── components/
│   ├── public/                      ← Composants pages publiques
│   │   ├── Navigation.tsx           ← Header navigation
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ProjectsCarousel.tsx     ← Client Component
│   │   ├── ClientsSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CtaSection.tsx
│   │   ├── ContactForm.tsx          ← Client Component
│   │   └── ProjectGallery.tsx       ← Client Component (carousel images/vidéos)
│   ├── admin/                       ← Composants admin panel
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DataTable.tsx            ← Table générique réutilisable
│   │   ├── ProjectForm.tsx
│   │   ├── ServiceForm.tsx
│   │   ├── ClientForm.tsx
│   │   ├── ContentEditor.tsx
│   │   ├── MediaUpload.tsx          ← Upload images/vidéos
│   │   ├── ContactList.tsx          ← Inclut SSE listener
│   │   └── NotificationBadge.tsx    ← Badge nouveaux messages SSE
│   └── ui/                          ← Composants UI réutilisables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── Loader.tsx
├── lib/
│   ├── api.ts                       ← Instance Axios configurée
│   ├── auth.ts                      ← Config next-auth
│   └── utils.ts                     ← Helpers (slugify, formatDate...)
├── hooks/
│   ├── useProjects.ts               ← TanStack Query hooks
│   ├── useServices.ts
│   ├── useClients.ts
│   ├── useContent.ts
│   ├── useContact.ts
│   └── useSSE.ts                    ← Hook SSE notifications
├── types/
│   └── index.ts                     ← Types TypeScript partagés
└── middleware.ts                    ← Protection routes admin
```

---

## Stratégie de rendu par page

| Page | Rendu | Raison |
|------|-------|--------|
| `/` Accueil | SSR | SEO + contenu dynamique |
| `/projets/[slug]` | SSR | SEO par projet |
| `/admin/*` | CSR | Pas de SEO, données fraîches |
| `/login` | CSR | Formulaire interactif |

---

## Design System "High-Impact Visionary"

### Couleurs (Tailwind config)

```typescript
// tailwind.config.ts
colors: {
  brand: {
    DEFAULT: '#FF8000',
    dark: '#cc6600',
  },
  surface: {
    DEFAULT: '#121414',
    dim: '#0c0f0f',
    bright: '#37393a',
    container: '#1e2020',
  },
  text: {
    DEFAULT: '#e2e2e2',
    muted: '#dfc1af',
  }
}
```

### Typographie

```typescript
fontFamily: {
  headline: ['Epilogue', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

### Règles design ABSOLUES
- ❌ Jamais de `rounded` ou `border-radius` (style brutalist — angles droits)
- ✅ Cards : `border border-white/10 hover:border-brand`
- ✅ Bouton primaire : `bg-brand text-black font-bold`
- ✅ Bouton secondaire : `border border-white text-white`
- ✅ Headlines : font-headline, font-bold, tracking-tight
- ✅ Labels : font-body, font-bold, tracking-widest, uppercase

---

## Auth Admin — next-auth

```typescript
// lib/auth.ts
providers: [
  CredentialsProvider({
    credentials: { email, password },
    authorize: async (credentials) => {
      // Appel POST /api/auth/login vers le backend NestJS
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      const user = await res.json()
      if (res.ok && user) return user
      return null
    }
  })
]
```

### Protection des routes admin — middleware.ts

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/admin/:path*']
}
```

---

## Appels API — TanStack Query

```typescript
// hooks/useProjects.ts — exemple
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

---

## Hook SSE — Notifications admin

```typescript
// hooks/useSSE.ts
export function useSSE(url: string) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const source = new EventSource(url, {
      withCredentials: true
    })

    source.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages(prev => [...prev, data])
    }

    return () => source.close()
  }, [url])

  return messages
}
```

---

## Variables d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_nextauth
```

---

## Pages publiques — Sections de la page d'accueil

La page d'accueil `/` est composée des sections suivantes dans l'ordre :

1. `<Navigation />` — fixe en haut (logo + menu + CTA "INVOQUEZ-NOUS")
2. `<HeroSection />` — trône mystique + titre "Les esprits de la com"
3. `<AboutSection />` — section à propos (juste après le hero)
4. `<ServicesSection />` — grille des services
5. `<ProjectsCarousel />` — carousel des projets réalisés (Client Component)
6. `<ClientsSection />` — logos clients défilants
7. `<CtaSection />` — appel à l'action général
8. `<Footer />` — infos contact + liens sociaux

## Page détail projet `/projets/[slug]`

1. `<Navigation />`
2. Hero projet (titre + catégorie + date + client)
3. `<ProjectGallery />` — carousel images + vidéos (Client Component)
4. Description complète du projet
5. Résultats / Chiffres clés (si disponibles)
6. `<CtaSection />` — "Démarrer votre projet"
7. `<Footer />`
