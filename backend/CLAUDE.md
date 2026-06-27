# CLAUDE.md — Agent Backend NISSI Communication

## Contexte du projet
Site vitrine + Admin panel pour **NISSI Communication** (agence de communication, Abidjan, Côte d'Ivoire).
Ce dépôt contient **UNIQUEMENT le backend API**.

Lire obligatoirement avant de commencer :
- `docs/ADR.md` → décisions d'architecture et justifications
- `docs/architecture.md` → structure détaillée, schéma BDD, exemples de code

---

## Stack technique

| Outil | Version | Usage |
|-------|---------|-------|
| NestJS | 10.x | Framework backend |
| TypeScript | 5.x | Langage |
| Prisma | 5.x | ORM PostgreSQL |
| PostgreSQL | 15 | Base de données |
| Redis | 7 | Cache (fallback DB si down) |
| Nodemailer | latest | Envoi emails SMTP |
| @nestjs/schedule | latest | Cron jobs |
| Passport.js + JWT | latest | Authentification |
| class-validator | latest | Validation DTOs |
| Winston | latest | Logs structurés |
| Docker | latest | Conteneurisation |
| Nginx | alpine | Reverse proxy + /uploads |

---

## Architecture : Layered (Architecture en Couches)

4 couches strictes — les dépendances vont **du haut vers le bas uniquement** :

```
Controller → Service → Prisma/Redis/Nodemailer → DB/Cache/SMTP
```

### Règles ABSOLUES
- ❌ Jamais de logique métier dans les Controllers
- ❌ Jamais d'accès DB direct dans les Controllers
- ❌ Jamais de saut de couche (Controller → Prisma directement)
- ❌ Jamais de secret hardcodé — utiliser `.env` + `ConfigService`
- ✅ Toujours valider les entrées avec `class-validator` (DTOs)
- ✅ Toujours utiliser des guards JWT sur les routes `/api/admin/*`
- ✅ Toujours gérer les erreurs avec des filtres NestJS globaux
- ✅ Toujours logger les erreurs avec Winston

---

## Modules à implémenter (ordre de priorité)

1. **auth** — JWT login, session expiry configurable, RBAC guards (ADMIN / SUPER_ADMIN)
2. **users** — CRUD comptes Admin/SuperAdmin (SuperAdmin only)
3. **projects** — CRUD projets + galerie images/vidéos (slug auto-généré)
4. **services** — CRUD services de l'agence (avec ordre d'affichage)
5. **clients** — CRUD logos clients/partenaires (avec ordre d'affichage)
6. **content** — gestion textes pages publiques par section (hero, about, cta, footer)
7. **contact** — formulaire visiteur, stockage 30j, SMTP, SSE notification admin
8. **media** — upload fichiers vers /uploads local (images + vidéos)
9. **scheduler** — cron suppression messages contact expirés (minuit chaque jour)

---

## Auth & RBAC

- 2 rôles : `ADMIN` | `SUPER_ADMIN`
- JWT access token — expiry via `JWT_EXPIRES_IN` (ex: `8h`)
- `JwtAuthGuard` sur TOUTES les routes `/api/admin/*`
- `RolesGuard` + `@Roles(Role.SUPER_ADMIN)` sur `/api/admin/users/*`
- Login : `POST /api/auth/login` → retourne `{ access_token, user }`
- Pas de refresh token pour le MVP

---

## Module Contact — Détails importants

### Stockage
- Messages stockés en DB avec `expiresAt = createdAt + 30 jours`
- Cron job minuit → supprime les messages dont `expiresAt < now()`

### Email SMTP
- À chaque soumission : envoi email vers `NOTIFY_EMAIL` (configurable)
- Si SMTP fail : logger l'erreur + continuer (ne pas bloquer la réponse)
- Retry : 3 tentatives avec délai exponentiel

### SSE (Server-Sent Events)
- Endpoint : `GET /api/contact/stream` (protégé JWT)
- À chaque nouveau message : émettre `{ type: 'new_message', data: { id, name, createdAt } }`
- L'admin frontend s'abonne à ce stream au chargement de la page contact

---

## Module Media — Détails importants

- Upload vers dossier local `/uploads` (monté comme volume Docker)
- Servi par Nginx directement (pas par NestJS)
- Types acceptés : images (jpg, png, webp, gif) + vidéos (mp4, webm)
- Taille max : 50MB par fichier (configurable)
- Nommage : `{uuid}.{extension}` pour éviter les conflits
- Endpoint : `POST /api/media/upload` → retourne `{ url: '/uploads/filename.ext' }`

---

## Cache Redis

- Clés cachées : pages publiques (liste projets, liste services, contenu pages)
- TTL : 5 minutes (configurable)
- Stratégie : cache-aside (lire Redis → si miss → lire DB → écrire Redis)
- Si Redis down : fallback transparent vers DB (ne pas planter)
- Invalider le cache à chaque mutation (create/update/delete)

---

## Observabilité

- **Winston** : logs structurés JSON en production
- **Niveaux** : error, warn, info, debug
- **Health check** : `GET /api/health` → retourne status DB, Redis, SMTP
- **Format log** : `{ timestamp, level, context, message, ...meta }`

---

## Variables d'environnement obligatoires

```env
DATABASE_URL=postgresql://user:pass@postgres:5432/nissi_db
REDIS_URL=redis://redis:6379
JWT_SECRET=
JWT_EXPIRES_IN=8h
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
NOTIFY_EMAIL=
UPLOAD_DIR=/uploads
PORT=3001
NODE_ENV=production
```

---

## Endpoints API — Vue d'ensemble

### Auth
- `POST /api/auth/login`
- `GET  /api/auth/me` (JWT requis)

### Projects (public)
- `GET  /api/projects` → liste publiée avec pagination
- `GET  /api/projects/:slug` → détail projet

### Projects (admin — JWT requis)
- `GET    /api/admin/projects`
- `POST   /api/admin/projects`
- `PATCH  /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

### Services (public)
- `GET /api/services`

### Services (admin — JWT requis)
- `GET    /api/admin/services`
- `POST   /api/admin/services`
- `PATCH  /api/admin/services/:id`
- `DELETE /api/admin/services/:id`

### Clients (public)
- `GET /api/clients`

### Clients (admin — JWT requis)
- `GET    /api/admin/clients`
- `POST   /api/admin/clients`
- `PATCH  /api/admin/clients/:id`
- `DELETE /api/admin/clients/:id`

### Content (public)
- `GET /api/content/:section`

### Content (admin — JWT requis)
- `GET   /api/admin/content`
- `PATCH /api/admin/content/:section`

### Contact
- `POST /api/contact` → soumission formulaire visiteur (public)
- `GET  /api/contact/stream` → SSE stream (JWT requis)
- `GET  /api/admin/contact` → liste messages (JWT requis)
- `PATCH /api/admin/contact/:id/read` → marquer lu (JWT requis)

### Media (admin — JWT requis)
- `POST   /api/admin/media/upload`
- `DELETE /api/admin/media/:id`

### Users (SuperAdmin uniquement)
- `GET    /api/admin/users`
- `POST   /api/admin/users`
- `PATCH  /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Health
- `GET /api/health`
