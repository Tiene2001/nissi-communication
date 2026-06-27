# FICHE DE DÉCISION D'ARCHITECTURE
**Projet** : NISSI Communication — Site Vitrine + Admin Panel  
**Date**   : 2026-06-25  
**Auteur** : Yoma Paul Cédric TIENE  

---

## 1. RÉSUMÉ DU PROJET

**Description** : Plateforme web permettant aux visiteurs de découvrir les services et projets de NISSI Communication, et aux administrateurs de gérer le contenu du site.

**Utilisateurs** :
- Visiteur anonyme → consulte les pages publiques (accueil, projets)
- Administrateur → gère le contenu (projets, services, clients, textes)
- Super Admin → gère les comptes admin + paramètres globaux du site

**Données clés** :
- Projets (galerie images/vidéos), Services, Logos clients
- Contenu pages (hero, à propos, CTA, footer)
- Médias uploadés (images/vidéos)
- Comptes admin, Messages contact (30j max)

---

## 2. NFR MAPPING

### Non-négociables (CRITICAL)
- **Sécurité** : JWT + HTTPS + RBAC (Admin/SuperAdmin) + session expiry configurable
- **Maintenabilité** : code structuré, documenté, repris facilement par un tiers
- **Observabilité** : logs structurés + monitoring + alerting à distance

### Secondaires (IMPORTANT)
- **Performance** : notification email SMTP immédiate à chaque soumission contact
- **Disponibilité** : 99% standard, VPS Europe Hostinger
- **Portabilité** : Docker multi-environnements (dev local + prod VPS)

### Déprioritisés (LOW)
- **Scalabilité** : 30 visiteurs simultanés, monolithe suffit largement
- **Mobile** : web uniquement pour l'instant
- **Multi-tenant** : non concerné

---

## 3. DÉCISION D'ARCHITECTURE BACKEND

**Pattern choisi** : Architecture en Couches (Layered Architecture)

**Justification** :
1. Logique métier simple et stable — site vitrine CRUD, pas de règles métier complexes
2. MVP en moins d'1 mois — la Layered permet d'aller vite sans sur-ingénierie
3. Développeur solo + futurs devs incertains — pattern universel, compréhensible sans formation
4. Stack fixe VPS Hostinger — pas besoin d'abstraire l'infrastructure
5. Seulement 2 points d'entrée HTTP (visiteur + admin) + 1 cron interne

**Modules NestJS identifiés** :
- `auth` : JWT, login, session expiry, RBAC guards
- `users` : gestion comptes Admin/SuperAdmin (CRUD)
- `projects` : CRUD projets + galerie images/vidéos
- `services` : CRUD services de l'agence
- `clients` : CRUD logos clients/partenaires
- `content` : gestion contenu pages (hero, about, CTA, footer)
- `contact` : formulaire, stockage 30j, email SMTP, SSE notifications
- `media` : upload fichiers, stockage local /uploads
- `scheduler` : cron suppression messages contact après 30 jours

---

## 4. DÉCISION D'ARCHITECTURE FRONTEND

**Framework** : Next.js 14 App Router

**Stratégie de rendu** :
- Pages publiques (accueil, détail projet) : SSR + SSG pour le SEO et la performance
- Pages admin : CSR (Client Components) — pas besoin de SEO
- Carousel, formulaire contact : Client Components

**Routes identifiées** :

Pages publiques :
- `/` : Page d'accueil complète
- `/projets/[slug]` : Détail d'un projet

Pages admin (protégées) :
- `/admin` : Dashboard
- `/admin/projets` : Liste + CRUD projets
- `/admin/services` : Liste + CRUD services
- `/admin/clients` : Liste + CRUD logos clients
- `/admin/contenu` : Gestion textes pages
- `/admin/contact` : Messages reçus (30j)
- `/admin/utilisateurs` : Gestion comptes (SuperAdmin only)
- `/admin/parametres` : Config site (email notif, etc.)

---

## 5. CARTE DES SERVICES EXTERNES

**Points d'entrée (Ports Primaires)** :
- HTTP REST — Navigateur visiteur (pages publiques)
- HTTP REST — Navigateur admin (panel de gestion)
- Cron Job  — Suppression auto messages après 30 jours

**Points de sortie (Ports Secondaires)** :
- PostgreSQL     : stockage données via Prisma ORM
- Redis          : cache pages publiques (fallback DB si down)
- /uploads Nginx : images/vidéos uploadées (stockage local VPS)
- SMTP           : notifications email contact (CRITIQUE)
- SSE            : notification temps réel admin (nouveau message)

---

## 6. STACK TECHNIQUE RETENU

| Couche      | Technologie                                          |
|-------------|------------------------------------------------------|
| Backend     | NestJS 10 + Prisma + PostgreSQL + Redis              |
| Auth        | Passport.js + JWT + class-validator                  |
| Email       | Nodemailer (SMTP)                                    |
| Cron        | @nestjs/schedule                                     |
| Frontend    | Next.js 14 + Tailwind CSS + TanStack Query + Axios   |
| Auth FE     | next-auth                                            |
| Infra       | Docker Compose + Nginx (reverse proxy + /uploads)    |
| Hébergement | VPS Hostinger (Linux, Europe)                        |
| Monitoring  | Winston (logs structurés) + Health check endpoint    |

---

## 7. SCHÉMAS DRAW.IO À PRODUIRE

- [x] C4 Level 1 — Contexte système (acteurs + système + externes)
- [x] C4 Level 2 — Conteneurs (apps + stores + techno + déploiement)
- [x] C4 Level 3 — Composants (modules internes NestJS)
- [ ] Flow EDA  — Non applicable (Architecture en Couches)

---

## 8. RISQUES IDENTIFIÉS

| Risque | Mitigation |
|--------|------------|
| SMTP indisponible → perte notifications contact | Retry automatique + log en DB + alerte monitoring si échec envoi |
| Stockage local /uploads sur VPS — pas de backup auto | Script backup quotidien + snapshot Hostinger |
| MVP < 1 mois → risque de dette technique si on rush | Modules bien séparés dès le départ, CLAUDE.md clair pour futurs devs |

---

## 9. DÉCISION FINALE

- **Architecture** : Monolithe Modulaire — Architecture en Couches
- **Pattern Backend** : Layered Architecture (NestJS)
- **Rendu Frontend** : SSR/SSG public + CSR admin (Next.js 14)
- **Validée le** : 2026-06-25
- **Prochaine révision** : si trafic dépasse 500 visiteurs simultanés ou ajout fonctionnalités complexes
