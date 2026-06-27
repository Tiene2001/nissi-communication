# CLAUDE.md — Agent Frontend NISSI Communication

## Contexte du projet
Site vitrine + Admin panel pour **NISSI Communication** (agence de communication, Abidjan, Côte d'Ivoire).
Ce dépôt contient **UNIQUEMENT le frontend Next.js**.

Lire obligatoirement avant de commencer :
- `docs/ADR.md` → décisions d'architecture et justifications
- `docs/architecture.md` → structure détaillée, composants, design system

---

## Stack technique

| Outil | Version | Usage |
|-------|---------|-------|
| Next.js | 14.x (App Router) | Framework frontend |
| TypeScript | 5.x | Langage |
| Tailwind CSS | 3.x | Styles |
| TanStack Query | 5.x | Gestion état serveur + cache |
| Axios | latest | Requêtes HTTP vers API backend |
| next-auth | 4.x | Authentification session admin |
| Epilogue | Google Font | Police headlines |
| Inter | Google Font | Police body/labels |

---

## Design System "High-Impact Visionary" — RÈGLES STRICTES

### Identité visuelle NISSI Communication
- Style : Radical Minimalisme + Brutalisme Géométrique
- Ambiance : sombre, autoritaire, énergie créative explosive

### Couleurs
- **Orange** `#FF8000` → CTA, éléments actifs, accents brand
- **Noir profond** `#121414` → fond principal
- **Blanc** `#E2E2E2` → texte principal
- **Surfaces sombres** : `#1E2020`, `#282A2B`, `#333535`

### Typographie
- **Headlines** : Epilogue Bold 700, tracking serré (-2% à -4%)
- **Body** : Inter Medium 500, line-height généreuse
- **Labels** : Inter Bold 700, MAJUSCULES, tracking large (+5%)

### Règles absolues
- ❌ **JAMAIS** de border-radius / rounded (0px partout — style brutalist)
- ❌ **JAMAIS** d'ombres (box-shadow) — utiliser les bordures à la place
- ✅ Bordure cards : `border border-white/10`
- ✅ Hover cards : `hover:border-brand` (orange)
- ✅ Bouton primaire : fond orange, texte noir, Epilogue Bold
- ✅ Bouton secondaire : bordure blanche, texte blanc
- ✅ Sections séparées par grands espaces verticaux (160px desktop)

---

## Architecture et règles de code

### Stratégie de rendu
- **Pages publiques** (`/`, `/projets/[slug]`) → **Server Components** (SSR)
  - Raison : SEO, performance, contenu indexable
- **Pages admin** (`/admin/*`) → **Client Components** (`'use client'`)
  - Raison : interactivité, pas de SEO nécessaire
- **Composants interactifs** (carousel, formulaire, upload) → **Client Components**

### Règles ABSOLUES
- ❌ Jamais d'appel direct à la base de données depuis le frontend
- ❌ Jamais de `lib/database/` ou connexion Prisma dans ce dépôt
- ❌ Jamais de secret exposé côté client (pas de `NEXT_PUBLIC_SECRET`)
- ✅ Toutes les données viennent de l'API backend via Axios/TanStack Query
- ✅ Routes admin TOUJOURS protégées par `middleware.ts`
- ✅ Variables env publiques UNIQUEMENT préfixées `NEXT_PUBLIC_`

---

## Structure des routes

### Pages publiques
- `/` → Page d'accueil complète (SSR)
- `/projets/[slug]` → Détail projet (SSR)

### Pages admin (protégées — JWT requis)
- `/login` → Page de connexion
- `/admin` → Dashboard
- `/admin/projets` → Liste + CRUD projets
- `/admin/projets/nouveau` → Créer projet
- `/admin/projets/[id]` → Éditer projet
- `/admin/services` → Liste + CRUD services
- `/admin/clients` → Liste + CRUD logos clients
- `/admin/contenu` → Gestion textes pages publiques
- `/admin/contact` → Messages reçus (30j) + SSE listener
- `/admin/utilisateurs` → Gestion comptes (SuperAdmin uniquement)
- `/admin/parametres` → Config (email notif, etc.)

---

## Page d'accueil — Sections dans l'ordre

1. `<Navigation />` — fixe en haut, logo gauche + menu droite + CTA orange "INVOQUEZ-NOUS"
2. `<HeroSection />` — fond sombre, trône mystique centré, titre "Les esprits de la com" orange, tagline italique
3. `<AboutSection />` — juste après le hero (description agence + valeurs)
4. `<ServicesSection />` — grille des services (depuis API)
5. `<ProjectsCarousel />` — carousel projets réalisés (Client Component, depuis API)
6. `<ClientsSection />` — logos clients défilants (depuis API)
7. `<CtaSection />` — appel à l'action
8. `<Footer />` — contact + réseaux sociaux

---

## Page détail projet — Sections dans l'ordre

1. `<Navigation />`
2. Hero projet (titre + métadonnées : catégorie, date, client)
3. `<ProjectGallery />` — carousel images + vidéos (Client Component)
4. Description complète du projet
5. Résultats / chiffres clés (si disponibles)
6. `<CtaSection />` — "Démarrer votre projet"
7. `<Footer />`

---

## Notifications temps réel (SSE)

Sur la page `/admin/contact` :
- Utiliser le hook `useSSE('/api/contact/stream')`
- Afficher un badge de notification quand un nouveau message arrive
- Ajouter le message en tête de liste sans recharger la page

```typescript
// Exemple d'usage dans ContactPage
const newMessages = useSSE(`${API_URL}/api/contact/stream`)
```

---

## Upload fichiers (Admin)

- Composant `<MediaUpload />` → POST vers `/api/admin/media/upload`
- Afficher une preview avant soumission
- Types acceptés : images (jpg, png, webp) + vidéos (mp4, webm)
- Afficher une barre de progression pendant l'upload

---

## Variables d'environnement

```env
# URL de l'API backend (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3001

# next-auth (ne pas préfixer NEXT_PUBLIC_ — secret côté serveur)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_fort_ici
```

---

## Appels API — Convention

Toujours utiliser l'instance Axios centralisée depuis `lib/api.ts` :

```typescript
import api from '@/lib/api'

// Exemple dans un hook TanStack Query
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.get('/api/projects').then(r => r.data)
})
```

Ne jamais utiliser `fetch` directement dans les composants — passer par `api.ts`.
