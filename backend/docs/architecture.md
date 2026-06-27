# Architecture Backend — NISSI Communication

## Pattern : Architecture en Couches (Layered)

### Flux d'une requête type

```
Client HTTP
    │
    ▼
Controller         → valide DTO, appelle Service
    │
    ▼
Service            → logique métier, appelle Prisma/Redis
    │
    ├──→ Prisma     → accès PostgreSQL
    ├──→ Redis      → cache (lecture/écriture, fallback DB)
    └──→ Nodemailer → envoi email SMTP
```

### Règles de couche absolues
- Controller → valide DTO, délègue au Service, retourne la réponse HTTP
- Service → orchestre la logique métier, appelle Prisma et services externes
- Prisma → unique point d'accès à la base de données
- Jamais de logique métier dans un Controller
- Jamais d'appel HTTP ou DB direct dans un Controller
- Jamais de saut de couche

---

## Structure des dossiers

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       └── roles.decorator.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── projects/
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── projects.module.ts
│   └── dto/
├── services/
│   ├── services.controller.ts
│   ├── services.service.ts
│   ├── services.module.ts
│   └── dto/
├── clients/
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   ├── clients.module.ts
│   └── dto/
├── content/
│   ├── content.controller.ts
│   ├── content.service.ts
│   ├── content.module.ts
│   └── dto/
├── contact/
│   ├── contact.controller.ts   ← inclut le endpoint SSE
│   ├── contact.service.ts      ← inclut SMTP + SSE emitter
│   ├── contact.module.ts
│   └── dto/
│       └── create-contact.dto.ts
├── media/
│   ├── media.controller.ts     ← endpoint upload
│   ├── media.service.ts        ← gestion fichiers /uploads
│   └── media.module.ts
├── scheduler/
│   └── cleanup.service.ts      ← cron suppression messages 30j
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
├── prisma/
│   ├── prisma.service.ts
│   └── schema.prisma
├── app.module.ts
└── main.ts
```

---

## Schéma BDD — Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

enum MediaType {
  IMAGE
  VIDEO
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  category    String
  clientName  String?
  date        DateTime
  published   Boolean  @default(false)
  media       Media[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Media {
  id        String    @id @default(cuid())
  url       String
  type      MediaType
  order     Int       @default(0)
  projectId String?
  project   Project?  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Service {
  id          String  @id @default(cuid())
  title       String
  description String
  icon        String?
  order       Int     @default(0)
}

model Client {
  id    String @id @default(cuid())
  name  String
  logo  String
  order Int    @default(0)
}

model PageContent {
  id      String @id @default(cuid())
  section String @unique
  data    Json
  updatedAt DateTime @updatedAt
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```

---

## Auth & RBAC

- **2 rôles** : `ADMIN` | `SUPER_ADMIN`
- **JWT** : access token avec expiration configurable via `JWT_EXPIRES_IN`
- **Guards** : `JwtAuthGuard` sur toutes les routes `/api/admin/*`
- **RolesGuard** : `SUPER_ADMIN` uniquement sur `/api/admin/users/*`
- **Login** : POST `/api/auth/login` → retourne JWT
- **Refresh** : non prévu (MVP) — l'utilisateur se reconnecte à expiration

---

## Cron Jobs

```typescript
// scheduler/cleanup.service.ts
@Cron('0 0 * * *') // Tous les jours à minuit
async deleteExpiredMessages() {
  await this.prisma.contactMessage.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
}
```

---

## SSE — Notifications temps réel admin

- **Endpoint** : `GET /api/contact/stream` (protégé JWT)
- **Déclenchement** : à chaque nouveau message de contact soumis
- **L'admin** s'abonne au stream au chargement du panel contact
- **Événement émis** : `{ type: 'new_message', data: { id, name, createdAt } }`

---

## Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/nissi_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=votre_secret_jwt_fort
JWT_EXPIRES_IN=8h

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre_mot_de_passe
NOTIFY_EMAIL=contact@nissi-communication.com

# Uploads
UPLOAD_DIR=/uploads

# App
PORT=3001
NODE_ENV=development
```

---

## Docker — Configuration prod

```yaml
# docker-compose.prod.yml
services:
  api:
    build: ./backend
    environment:
      - NODE_ENV=production
    volumes:
      - uploads:/uploads
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    volumes:
      - uploads:/uploads:ro
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"

volumes:
  pgdata:
  uploads:
```
