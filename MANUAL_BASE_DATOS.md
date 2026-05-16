# Manual de Base de Datos

## Proyecto: Voluntariado-E195-gris (Volunteer Management System)

---

**Versión del manual:** 1.0
**Fecha de elaboración:** 13 de mayo de 2026
**Repositorio:** `Voluntariado-E195-gris`
**Rama analizada:** `main`
**Commit de referencia:** `2adedb2`
**Autor del manual:** Equipo de Documentación Técnica
**Audiencia:** Desarrolladores, arquitectos de software, administradores de base de datos, docentes evaluadores.

---

## Índice

1. Resumen ejecutivo
2. Tipo de base de datos
3. Inventario del proyecto y stack tecnológico
4. Modelo lógico actual (TypeScript)
5. Modelo relacional propuesto (PostgreSQL)
6. Diagrama Entidad-Relación
7. Relaciones detalladas
8. Índices recomendados
9. Restricciones de integridad
10. Tipos ENUM (DDL)
11. Script DDL completo
12. Datos de ejemplo (INSERT)
13. Diccionario de datos consolidado
14. Estado actual vs. propuesto
15. Recomendaciones de implementación
16. Glosario

---

## 1. Resumen ejecutivo

El proyecto **Voluntariado-E195-gris** es una plataforma de gestión de voluntariado que conecta tres tipos de usuarios (administradores, organizaciones y voluntarios) alrededor de oportunidades de voluntariado, un foro de comunicación, publicaciones de blog y certificados de participación.

### 1.1 Hallazgo importante sobre el estado actual

Tras analizar la totalidad del código fuente del repositorio, se determina que **el proyecto NO posee una base de datos implementada**. La aplicación es un *mockup* (prototipo funcional) puramente frontend, construido con React 19 + Vite + TanStack Router + TypeScript, donde todos los datos se mantienen en memoria como arreglos TypeScript dentro del archivo `mockup_code/src/lib/mock-data.ts`. La información se pierde al refrescar el navegador.

No se encontraron:

- Drivers de base de datos en `package.json` (no hay `pg`, `mysql2`, `mongodb`, `mongoose`, `prisma`, `@supabase/supabase-js`, `firebase`, ni similares).
- Carpetas backend (`api/`, `server/`, `db/`, `prisma/`, `supabase/`, `migrations/`, `functions/`).
- Archivos de configuración de conexión (`.env` con `DATABASE_URL`, `database.yml`, `knexfile.ts`, etc.).
- Scripts de migración o esquemas SQL.
- Llamadas HTTP a un backend (no hay uso de `axios` ni `fetch` para datos).

### 1.2 Alcance del manual

Este documento cumple dos objetivos:

1. **Documentar el modelo lógico actual** definido por las 6 interfaces TypeScript del proyecto, que constituyen la "fuente de verdad" del modelo de dominio.
2. **Proponer un esquema relacional completo en PostgreSQL** listo para implementar cuando se construya el backend, mapeando rigurosamente cada campo, relación y restricción.

### 1.3 Tabla de entidades cubiertas

| # | Entidad TS | Tabla SQL propuesta | Registros mock |
|---|------------|---------------------|----------------|
| 1 | `User` | `users` | 3 |
| 2 | `Organization` | `organizations` | 4 |
| 3 | `Opportunity` | `opportunities` | 3 |
| 4 | `ForumMessage` | `forum_messages` | 3 |
| 5 | `BlogPost` | `blog_posts` | 2 |
| 6 | `Certificate` | `certificates` | 2 |
| 7 | *(derivada de `Opportunity.applicants[]`)* | `opportunity_applicants` (tabla puente) | 1 |

---

## 2. Tipo de base de datos

### 2.1 Declaración

La base de datos propuesta para este sistema es **RELACIONAL**, sobre el motor **PostgreSQL** (versión 14 o superior).

### 2.2 Justificación

El dominio del problema presenta las siguientes características que favorecen un modelo relacional:

| Característica del dominio | Implicación |
|----------------------------|-------------|
| Relaciones bien definidas entre entidades (Organización → Oportunidades → Voluntarios) | Modelo relacional con claves foráneas |
| Necesidad de integridad referencial (no aceptar postulaciones a oportunidades inexistentes, no permitir mensajes huérfanos) | Restricciones `FOREIGN KEY` con políticas `ON DELETE` |
| Flujo de aprobación de organizaciones (`pending → approved/rejected`) | Estados enumerados (`ENUM`) y transacciones ACID |
| Listados con filtros (oportunidades publicadas por ciudad, organizaciones por estado) | Índices B-tree estándar |
| Reportes y certificados que cruzan voluntarios con oportunidades completadas | `JOIN` SQL estándar |
| Escala moderada (cientos de organizaciones, miles de oportunidades, decenas de miles de voluntarios) | PostgreSQL es ideal para este rango |

### 2.3 ¿Por qué PostgreSQL y no NoSQL?

Una base de datos NoSQL documental (MongoDB) podría modelar el dominio anidando aplicantes dentro de cada oportunidad (como ya se observa en el mock con `applicants: string[]`), pero:

- Pierde integridad referencial nativa: nada impide que un `applicant_id` apunte a un usuario inexistente.
- Las consultas para listar "todas las oportunidades a las que se postuló un voluntario X" requieren índices multikey y son menos eficientes.
- El flujo de aprobación es transaccional: un cambio de estado de organización debe afectar también la visibilidad de sus oportunidades. Las transacciones multi-documento de NoSQL son más limitadas.
- Reportes y agregaciones (certificados, dashboards de admin) son la norma en SQL.

PostgreSQL aporta además: tipo `UUID`, tipos `ENUM` nativos, `CITEXT` (texto insensible a mayúsculas para emails), `CHECK` constraints con expresiones regulares, `JSONB` para extensiones futuras, y soporte de extensiones como `pgcrypto`.

### 2.4 ¿Por qué no MySQL?

Es alternativa válida; las únicas diferencias prácticas para este esquema serían:

- Sustituir `UUID` por `CHAR(36)` o `BINARY(16)`.
- Sustituir `TIMESTAMPTZ` por `DATETIME` (sin zona horaria nativa).
- Sustituir `CITEXT` por `VARCHAR` con collation `*_ci`.
- Sintaxis ligeramente distinta para `ENUM`.

Se mantiene **PostgreSQL** como recomendación.

---

## 3. Inventario del proyecto y stack tecnológico

### 3.1 Stack identificado

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Lenguaje | TypeScript | 5.8.3 |
| Framework UI | React | 19.2.0 |
| Build tool | Vite | 7.3.1 |
| Router | TanStack Router | 1.168.0 |
| Meta-framework | TanStack Start | 1.167.14 |
| Data fetching (instalado, sin uso) | TanStack React Query | 5.83.0 |
| Formularios | React Hook Form | 7.71.2 |
| UI components | Radix UI | varias |
| CSS | Tailwind CSS | 4.2.1 |
| Despliegue | Vercel (SPA rewrite) | — |
| **Base de datos** | **Ninguna** | **—** |
| **Backend** | **Ninguno** | **—** |

### 3.2 Estructura de carpetas relevantes

```
Voluntariado-E195-gris/
├── mockup_code/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── mock-data.ts         ← FUENTE DE VERDAD DEL MODELO DE DATOS
│   │   │   ├── auth-context.tsx     ← Auth en memoria sobre mockUsers
│   │   │   └── utils.ts
│   │   ├── routes/
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── admin/organizations.tsx
│   │   │   ├── opportunities.tsx
│   │   │   ├── forum.tsx
│   │   │   ├── blog.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── reports.tsx
│   │   │   └── search.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vercel.json
│   └── wrangler.jsonc
├── mockups/                         ← Diseños Figma/maquetas
└── README.md
```

### 3.3 Archivo único con todo el modelo de datos

Todas las definiciones de tipos viven en un único archivo:

**Ruta:** `mockup_code/src/lib/mock-data.ts`
**Líneas totales:** 100
**Contiene:** 1 type alias, 6 interfaces, 6 arreglos `const` con datos de muestra.

---

## 4. Modelo lógico actual (TypeScript)

Esta sección documenta exactamente cómo está definido el modelo en el código actual.

### 4.1 Tipo enumerado `UserRole`

**Ubicación:** `mock-data.ts:1`

```typescript
export type UserRole = 'admin' | 'organization' | 'volunteer';
```

| Valor | Descripción |
|-------|-------------|
| `admin` | Usuario administrador del sistema. Acceso completo. |
| `organization` | Cuenta de organización no lucrativa que publica oportunidades. |
| `volunteer` | Persona individual que se postula a oportunidades. |

### 4.2 Entidad `User`

**Ubicación:** `mock-data.ts:3-12`

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único del usuario. En mock: `'1'`, `'2'`, `'demo'`, `'new-<timestamp>'`. |
| `name` | `string` | No | Nombre completo del usuario o nombre de la organización. |
| `email` | `string` | No | Correo electrónico, usado para autenticación. |
| `role` | `UserRole` | No | Rol del usuario en el sistema. |
| `avatar` | `string` | Sí | URL del avatar. |
| `organization` | `string` | Sí | Nombre denormalizado de la organización a la que pertenece (cuando `role` es `'organization'` o un voluntario afiliado). |
| `securityQuestion` | `string` | Sí | Pregunta de seguridad para recuperación de contraseña. |
| `securityAnswer` | `string` | Sí | Respuesta a la pregunta de seguridad **almacenada en texto plano** (insegura — debe hashearse). |

**Dato de ejemplo:**

```typescript
{
  id: '3',
  name: 'Jane Volunteer',
  email: 'jane@email.com',
  role: 'volunteer',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'green'
}
```

### 4.3 Entidad `Organization`

**Ubicación:** `mock-data.ts:14-22`

```typescript
export interface Organization {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
  rejectionMessage?: string;
  createdAt: string;
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único. Formato mock: `'org1'`, `'org2'`. |
| `name` | `string` | No | Nombre legal/comercial de la organización. |
| `email` | `string` | No | Correo de contacto institucional. |
| `status` | `'pending' \| 'approved' \| 'rejected'` | No | Estado del proceso de aprobación. |
| `documentUrl` | `string` | Sí | URL al documento de verificación (PDF, imagen). |
| `rejectionMessage` | `string` | Sí | Motivo del rechazo. Solo poblado cuando `status === 'rejected'`. |
| `createdAt` | `string` | No | Fecha de creación en formato `'YYYY-MM-DD'`. |

**Dato de ejemplo:**

```typescript
{
  id: 'org2',
  name: 'River Cleanup Initiative',
  email: 'contact@rivercleanup.org',
  status: 'pending',
  documentUrl: 'verification.pdf',
  createdAt: '2024-03-20'
}
```

### 4.4 Entidad `Opportunity`

**Ubicación:** `mock-data.ts:24-36`

```typescript
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  location: string;
  organizationId: string;
  organizationName: string;
  published: boolean;
  applicants: string[];
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único. Formato mock: `'opp1'`, `'opp-<timestamp>'`. |
| `title` | `string` | No | Título de la oportunidad. |
| `description` | `string` | No | Descripción detallada. |
| `date` | `string` | No | Fecha del evento en formato `'YYYY-MM-DD'`. |
| `time` | `string` | No | Hora del evento en formato `'HH:MM AM/PM'`. |
| `city` | `string` | No | Ciudad donde se realiza. |
| `location` | `string` | No | Lugar específico (parque, centro, dirección). |
| `organizationId` | `string` | No | FK lógica a `Organization.id`. |
| `organizationName` | `string` | No | Nombre denormalizado de la organización. |
| `published` | `boolean` | No | Visibilidad pública. |
| `applicants` | `string[]` | No | Arreglo de IDs de usuarios voluntarios postulados. |

**Dato de ejemplo:**

```typescript
{
  id: 'opp1',
  title: 'Beach Cleanup Drive',
  description: 'Help us clean the coastline and protect marine life. Gloves and bags provided.',
  date: '2024-05-15',
  time: '08:00 AM',
  city: 'Santa Monica',
  location: 'Santa Monica Pier',
  organizationId: 'org1',
  organizationName: 'Green Earth Foundation',
  published: true,
  applicants: ['3']
}
```

### 4.5 Entidad `ForumMessage`

**Ubicación:** `mock-data.ts:38-46`

```typescript
export interface ForumMessage {
  id: string;
  title: string;
  message: string;
  authorName: string;
  authorRole: UserRole;
  organizationId: string;
  createdAt: string;
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único. Formato mock: `'fm1'`. |
| `title` | `string` | No | Asunto del mensaje. |
| `message` | `string` | No | Cuerpo del mensaje. |
| `authorName` | `string` | No | Nombre denormalizado del autor. |
| `authorRole` | `UserRole` | No | Rol del autor al momento de publicar. |
| `organizationId` | `string` | No | FK lógica a `Organization.id`. El foro está segmentado por organización. |
| `createdAt` | `string` | No | Timestamp ISO 8601 (`'2024-04-01T10:00:00'`). |

**Dato de ejemplo:**

```typescript
{
  id: 'fm2',
  title: 'Great experience at the beach cleanup!',
  message: 'Had an amazing time volunteering last weekend. The team was very organized and friendly.',
  authorName: 'Jane Volunteer',
  authorRole: 'volunteer',
  organizationId: 'org1',
  createdAt: '2024-04-05T14:30:00'
}
```

### 4.6 Entidad `BlogPost`

**Ubicación:** `mock-data.ts:48-57`

```typescript
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único. Formato mock: `'bp1'`. |
| `title` | `string` | No | Título del artículo. |
| `content` | `string` | No | Contenido. Soporta saltos de párrafo con `'\n\n'`. |
| `imageUrl` | `string` | Sí | URL de imagen destacada. |
| `authorName` | `string` | No | Nombre denormalizado del autor. |
| `organizationId` | `string` | No | FK lógica a `Organization.id`. |
| `organizationName` | `string` | No | Nombre denormalizado de la organización. |
| `createdAt` | `string` | No | Fecha de publicación en formato `'YYYY-MM-DD'`. |

**Dato de ejemplo:**

```typescript
{
  id: 'bp1',
  title: 'The Impact of Volunteering on Communities',
  content: 'Volunteering has a profound impact...',
  authorName: 'Green Earth Foundation',
  organizationId: 'org1',
  organizationName: 'Green Earth Foundation',
  createdAt: '2024-03-15'
}
```

### 4.7 Entidad `Certificate`

**Ubicación:** `mock-data.ts:59-65`

```typescript
export interface Certificate {
  id: string;
  volunteerName: string;
  activityTitle: string;
  completedDate: string;
  status: 'completed' | 'pending';
}
```

| Campo | Tipo TS | Opcional | Descripción semántica |
|-------|---------|----------|------------------------|
| `id` | `string` | No | Identificador único. Formato mock: `'cert1'`. |
| `volunteerName` | `string` | No | Nombre del voluntario (denormalizado, sin FK). |
| `activityTitle` | `string` | No | Título de la oportunidad asociada (denormalizado, sin FK). |
| `completedDate` | `string` | No | Fecha de finalización en formato `'YYYY-MM-DD'`. |
| `status` | `'completed' \| 'pending'` | No | Estado del certificado. |

**Dato de ejemplo:**

```typescript
{
  id: 'cert1',
  volunteerName: 'Jane Volunteer',
  activityTitle: 'Beach Cleanup Drive',
  completedDate: '2024-05-15',
  status: 'completed'
}
```

> **Observación crítica:** la entidad `Certificate` en el mock **NO tiene claves foráneas** — solo guarda nombres como strings. En la propuesta SQL se normaliza con `volunteer_id` y `opportunity_id` reales.

---

## 5. Modelo relacional propuesto (PostgreSQL)

### 5.1 Convenciones generales

- **Motor:** PostgreSQL 14+
- **Esquema:** `public` (o `vms` si se prefiere namespace dedicado)
- **Nombres de tabla:** `snake_case`, plural (`users`, `organizations`).
- **Nombres de columna:** `snake_case` (`organization_id`, `created_at`).
- **Claves primarias:** `id UUID DEFAULT gen_random_uuid()` para todas las tablas principales. Requiere extensión `pgcrypto`.
- **Timestamps:** todas las tablas mutables incluyen `created_at TIMESTAMPTZ DEFAULT NOW()` y `updated_at TIMESTAMPTZ DEFAULT NOW()`.
- **Caracter set:** UTF-8 (default en PostgreSQL).
- **Eliminaciones:** soft-delete opcional con `deleted_at TIMESTAMPTZ` (no incluido en el script base — añadir si requiere auditoría).

### 5.2 Mapeo general TS → PostgreSQL

| Tipo TypeScript / contenido | Tipo PostgreSQL | Notas |
|-----------------------------|-----------------|-------|
| `string` (id) | `UUID` | Reemplaza IDs arbitrarios del mock. |
| `string` (texto corto, nombres) | `VARCHAR(120)` o `VARCHAR(255)` | Longitud según campo. |
| `string` (título) | `VARCHAR(200)` | |
| `string` (email) | `CITEXT` | Insensible a mayúsculas. Requiere extensión `citext`. |
| `string` (texto largo: description, content, message) | `TEXT` | Sin límite práctico. |
| `string` (URL) | `TEXT` | Con `CHECK` opcional para validar prefijo. |
| `string` con formato `'YYYY-MM-DD'` | `DATE` | |
| `string` con timestamp ISO | `TIMESTAMPTZ` | Con zona horaria. |
| `string` con hora `'HH:MM AM/PM'` | `TIME` | Convertir formato a 24h. |
| `boolean` | `BOOLEAN` | |
| `UserRole` (union string) | `ENUM user_role` | |
| `'pending' \| 'approved' \| 'rejected'` | `ENUM organization_status` | |
| `'completed' \| 'pending'` | `ENUM certificate_status` | |
| `string[]` (`applicants`) | Tabla puente N:M | Normalización obligatoria. |
| Campos denormalizados (`organizationName`, `authorName`) | Eliminados | Se obtienen con `JOIN`. |

### 5.3 Tabla `users`

**Propósito:** almacena todas las cuentas del sistema (admins, organizaciones, voluntarios).

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `name` | `VARCHAR(120)` | No | — | — | Nombre completo. |
| `email` | `CITEXT` | No | — | `UNIQUE`, `CHECK email regex` | Correo de login. |
| `password_hash` | `VARCHAR(255)` | No | — | — | Hash bcrypt/argon2 de la contraseña. |
| `role` | `user_role` | No | `'volunteer'` | — | Rol del usuario. |
| `avatar_url` | `TEXT` | Sí | NULL | — | URL del avatar. |
| `organization_id` | `UUID` | Sí | NULL | FK → `organizations.id` ON DELETE SET NULL | Organización a la que pertenece. |
| `security_question` | `VARCHAR(255)` | Sí | NULL | — | Pregunta de recuperación. |
| `security_answer_hash` | `VARCHAR(255)` | Sí | NULL | — | Hash de la respuesta (no texto plano). |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización (trigger). |

### 5.4 Tabla `organizations`

**Propósito:** entidades que publican oportunidades. Pasan por un flujo de aprobación.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `name` | `VARCHAR(150)` | No | — | `UNIQUE` | Nombre legal de la organización. |
| `email` | `CITEXT` | No | — | `UNIQUE`, `CHECK email regex` | Correo institucional. |
| `status` | `organization_status` | No | `'pending'` | — | Estado de aprobación. |
| `document_url` | `TEXT` | Sí | NULL | — | URL del documento verificador. |
| `rejection_message` | `TEXT` | Sí | NULL | `CHECK (status='rejected' OR rejection_message IS NULL)` | Motivo si rechazada. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de registro. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización. |

### 5.5 Tabla `opportunities`

**Propósito:** oportunidades de voluntariado publicadas por organizaciones aprobadas.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `title` | `VARCHAR(200)` | No | — | — | Título visible. |
| `description` | `TEXT` | No | — | — | Descripción completa. |
| `event_date` | `DATE` | No | — | `CHECK (event_date >= '2000-01-01')` | Fecha del evento. |
| `event_time` | `TIME` | No | — | — | Hora del evento. |
| `city` | `VARCHAR(100)` | No | — | — | Ciudad. |
| `location` | `VARCHAR(255)` | No | — | — | Lugar específico. |
| `organization_id` | `UUID` | No | — | FK → `organizations.id` ON DELETE CASCADE | Organización dueña. |
| `published` | `BOOLEAN` | No | `false` | — | Visibilidad pública. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización. |

### 5.6 Tabla `opportunity_applicants` (puente N:M)

**Propósito:** normaliza el arreglo `applicants: string[]` del mock. Relaciona voluntarios postulados con oportunidades.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `opportunity_id` | `UUID` | No | — | FK → `opportunities.id` ON DELETE CASCADE, PK compuesta | Oportunidad a la que se postula. |
| `user_id` | `UUID` | No | — | FK → `users.id` ON DELETE CASCADE, PK compuesta | Voluntario postulado. |
| `applied_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de postulación. |
| `status` | `VARCHAR(20)` | No | `'applied'` | `CHECK (status IN ('applied','accepted','rejected','completed'))` | Estado de la postulación. |

**Clave primaria compuesta:** `(opportunity_id, user_id)` — un voluntario no puede postularse dos veces a la misma oportunidad.

### 5.7 Tabla `forum_messages`

**Propósito:** mensajes del foro por organización.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `title` | `VARCHAR(200)` | No | — | — | Asunto. |
| `message` | `TEXT` | No | — | — | Cuerpo del mensaje. |
| `author_id` | `UUID` | Sí | NULL | FK → `users.id` ON DELETE SET NULL | Autor (nullable si el autor se elimina). |
| `author_role` | `user_role` | No | — | — | Rol congelado al momento de publicar. |
| `organization_id` | `UUID` | No | — | FK → `organizations.id` ON DELETE CASCADE | Foro al que pertenece el mensaje. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de publicación. |

### 5.8 Tabla `blog_posts`

**Propósito:** publicaciones de blog por organización.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `title` | `VARCHAR(200)` | No | — | — | Título. |
| `content` | `TEXT` | No | — | — | Contenido (puede contener saltos de línea). |
| `image_url` | `TEXT` | Sí | NULL | — | Imagen destacada. |
| `author_id` | `UUID` | Sí | NULL | FK → `users.id` ON DELETE SET NULL | Autor. |
| `organization_id` | `UUID` | No | — | FK → `organizations.id` ON DELETE CASCADE | Organización publicadora. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de publicación. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última edición. |

### 5.9 Tabla `certificates`

**Propósito:** certificados emitidos a voluntarios por completar oportunidades.

| Columna | Tipo | Nulo | Default | Restricción | Descripción |
|---------|------|------|---------|-------------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| `volunteer_id` | `UUID` | No | — | FK → `users.id` ON DELETE CASCADE | Voluntario certificado. |
| `opportunity_id` | `UUID` | No | — | FK → `opportunities.id` ON DELETE CASCADE | Actividad completada. |
| `status` | `certificate_status` | No | `'pending'` | — | Estado del certificado. |
| `completed_date` | `DATE` | No | — | — | Fecha de finalización. |
| `issued_at` | `TIMESTAMPTZ` | Sí | NULL | — | Fecha de emisión (NULL mientras pending). |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación del registro. |

**Restricción adicional sugerida:** `UNIQUE (volunteer_id, opportunity_id)` — un voluntario solo puede tener un certificado por oportunidad.

---

## 6. Diagrama Entidad-Relación

### 6.1 Diagrama ASCII

```
                  ┌───────────────────────┐
                  │     organizations     │
                  ├───────────────────────┤
                  │ PK id                 │
                  │    name (UQ)          │
                  │    email (UQ)         │
                  │    status (ENUM)      │
                  │    document_url       │
                  │    rejection_message  │
                  │    created_at         │
                  │    updated_at         │
                  └───────────┬───────────┘
                              │ 1
                              │
            ┌─────────────────┼─────────────────┬────────────────┐
            │ N               │ N               │ N              │ N
            │                 │                 │                │
            ▼                 ▼                 ▼                ▼
    ┌──────────────┐  ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
    │    users     │  │ opportunities │ │forum_messages│ │  blog_posts  │
    ├──────────────┤  ├───────────────┤ ├──────────────┤ ├──────────────┤
    │ PK id        │  │ PK id         │ │ PK id        │ │ PK id        │
    │   name       │  │   title       │ │   title      │ │   title      │
    │   email (UQ) │  │   description │ │   message    │ │   content    │
    │   pwd_hash   │  │   event_date  │ │   author_role│ │   image_url  │
    │   role (E)   │  │   event_time  │ │FK author_id  │ │FK author_id  │
    │   avatar_url │  │   city        │ │FK org_id     │ │FK org_id     │
    │FK org_id (?) │  │   location    │ │   created_at │ │   created_at │
    │   sec_q      │  │FK org_id      │ └──────┬───────┘ │   updated_at │
    │   sec_a_hash │  │   published   │        │         └──────┬───────┘
    │   created_at │  │   created_at  │        │ N              │ N
    │   updated_at │  │   updated_at  │        │                │
    └───┬──────────┘  └───┬───────────┘        │                │
        │ 1               │ 1                   └────────┬───────┘
        │                 │                              │
        │      ┌──────────┴──────────┐                   │ 1
        │ N    │ N                   │ N                 │
        │      ▼                     ▼                   │
        │  ┌────────────────────────────┐                │
        │  │  opportunity_applicants    │                │
        │  ├────────────────────────────┤                │
        │  │ PK,FK opportunity_id       │                │
        │  │ PK,FK user_id              │                │
        │  │       applied_at           │                │
        │  │       status               │                │
        │  └────────────────────────────┘                │
        │                                                │
        │ 1                                              │
        ├────────────────────────────────────────────────┘
        │
        │ N
        ▼
    ┌──────────────────────┐
    │    certificates      │
    ├──────────────────────┤
    │ PK id                │
    │ FK volunteer_id      │
    │ FK opportunity_id    │◄── 1 ── opportunities
    │    status (ENUM)     │
    │    completed_date    │
    │    issued_at         │
    │    created_at        │
    │    UQ(volunteer,opp) │
    └──────────────────────┘

Leyenda:
  PK = Primary Key       FK = Foreign Key       UQ = Unique
  E  = Enum              (?) = Nullable
  1, N = Cardinalidad del extremo
```

### 6.2 Código DBML (para regenerar en dbdiagram.io)

```dbml
Enum user_role {
  admin
  organization
  volunteer
}

Enum organization_status {
  pending
  approved
  rejected
}

Enum certificate_status {
  completed
  pending
}

Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(120) [not null]
  email citext [not null, unique]
  password_hash varchar(255) [not null]
  role user_role [not null, default: 'volunteer']
  avatar_url text
  organization_id uuid [ref: > organizations.id]
  security_question varchar(255)
  security_answer_hash varchar(255)
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table organizations {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(150) [not null, unique]
  email citext [not null, unique]
  status organization_status [not null, default: 'pending']
  document_url text
  rejection_message text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table opportunities {
  id uuid [pk, default: `gen_random_uuid()`]
  title varchar(200) [not null]
  description text [not null]
  event_date date [not null]
  event_time time [not null]
  city varchar(100) [not null]
  location varchar(255) [not null]
  organization_id uuid [not null, ref: > organizations.id]
  published boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table opportunity_applicants {
  opportunity_id uuid [ref: > opportunities.id]
  user_id uuid [ref: > users.id]
  applied_at timestamptz [not null, default: `now()`]
  status varchar(20) [not null, default: 'applied']

  Indexes {
    (opportunity_id, user_id) [pk]
  }
}

Table forum_messages {
  id uuid [pk, default: `gen_random_uuid()`]
  title varchar(200) [not null]
  message text [not null]
  author_id uuid [ref: > users.id]
  author_role user_role [not null]
  organization_id uuid [not null, ref: > organizations.id]
  created_at timestamptz [not null, default: `now()`]
}

Table blog_posts {
  id uuid [pk, default: `gen_random_uuid()`]
  title varchar(200) [not null]
  content text [not null]
  image_url text
  author_id uuid [ref: > users.id]
  organization_id uuid [not null, ref: > organizations.id]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table certificates {
  id uuid [pk, default: `gen_random_uuid()`]
  volunteer_id uuid [not null, ref: > users.id]
  opportunity_id uuid [not null, ref: > opportunities.id]
  status certificate_status [not null, default: 'pending']
  completed_date date [not null]
  issued_at timestamptz
  created_at timestamptz [not null, default: `now()`]

  Indexes {
    (volunteer_id, opportunity_id) [unique]
  }
}
```

> Para visualizar este diagrama, copie el bloque DBML anterior y péguelo en https://dbdiagram.io.

---

## 7. Relaciones detalladas

| # | Origen | Columna FK | Destino | Cardinalidad | Obligatoria | ON DELETE | ON UPDATE | Descripción |
|---|--------|------------|---------|--------------|-------------|-----------|-----------|-------------|
| 1 | `users` | `organization_id` | `organizations.id` | N:1 | No (nullable) | `SET NULL` | `CASCADE` | Voluntarios pueden afiliarse a una organización; usuarios admin no. |
| 2 | `opportunities` | `organization_id` | `organizations.id` | N:1 | Sí | `CASCADE` | `CASCADE` | Cada oportunidad pertenece a exactamente una organización. |
| 3 | `opportunity_applicants` | `opportunity_id` | `opportunities.id` | N:M (parte) | Sí | `CASCADE` | `CASCADE` | Eliminar la oportunidad borra postulaciones. |
| 4 | `opportunity_applicants` | `user_id` | `users.id` | N:M (parte) | Sí | `CASCADE` | `CASCADE` | Eliminar el usuario borra sus postulaciones. |
| 5 | `forum_messages` | `author_id` | `users.id` | N:1 | No (nullable) | `SET NULL` | `CASCADE` | El mensaje sobrevive aunque el autor sea eliminado. |
| 6 | `forum_messages` | `organization_id` | `organizations.id` | N:1 | Sí | `CASCADE` | `CASCADE` | Eliminar la organización borra su foro. |
| 7 | `blog_posts` | `author_id` | `users.id` | N:1 | No (nullable) | `SET NULL` | `CASCADE` | El post sobrevive aunque el autor sea eliminado. |
| 8 | `blog_posts` | `organization_id` | `organizations.id` | N:1 | Sí | `CASCADE` | `CASCADE` | Eliminar la organización borra sus posts. |
| 9 | `certificates` | `volunteer_id` | `users.id` | N:1 | Sí | `CASCADE` | `CASCADE` | Eliminar el voluntario borra sus certificados. |
| 10 | `certificates` | `opportunity_id` | `opportunities.id` | N:1 | Sí | `CASCADE` | `CASCADE` | Eliminar la oportunidad borra los certificados asociados. |

### 7.1 Cardinalidades en notación textual

- `organizations` 1 — N `users` (un usuario afiliado a 0..1 organización; una organización tiene 0..N usuarios).
- `organizations` 1 — N `opportunities` (1..N oportunidades por organización).
- `users` (voluntarios) N — M `opportunities` a través de `opportunity_applicants`.
- `organizations` 1 — N `forum_messages`.
- `users` 1 — N `forum_messages` (como autor).
- `organizations` 1 — N `blog_posts`.
- `users` 1 — N `blog_posts` (como autor).
- `users` (voluntarios) 1 — N `certificates`.
- `opportunities` 1 — N `certificates`.

---

## 8. Índices recomendados

| # | Índice | Tabla | Columnas | Tipo | Justificación |
|---|--------|-------|----------|------|---------------|
| 1 | `idx_users_email` | `users` | `email` | UNIQUE B-tree | Login por email; impide duplicados. |
| 2 | `idx_users_role` | `users` | `role` | B-tree | Filtrar listas por rol en dashboards de admin. |
| 3 | `idx_users_organization_id` | `users` | `organization_id` | B-tree | JOIN frecuente con `organizations`. |
| 4 | `idx_organizations_email` | `organizations` | `email` | UNIQUE B-tree | Búsqueda y unicidad. |
| 5 | `idx_organizations_status` | `organizations` | `status` | B-tree | Listado de pendientes en panel admin. |
| 6 | `idx_opportunities_organization_id` | `opportunities` | `organization_id` | B-tree | Listar oportunidades por organización. |
| 7 | `idx_opportunities_published_date` | `opportunities` | `published, event_date DESC` | Compuesto | Listado público ordenado por fecha. |
| 8 | `idx_opportunities_city` | `opportunities` | `city` | B-tree | Búsqueda por ciudad. |
| 9 | `idx_oa_user_id` | `opportunity_applicants` | `user_id` | B-tree | Ver postulaciones de un voluntario. |
| 10 | `idx_forum_org_created` | `forum_messages` | `organization_id, created_at DESC` | Compuesto | Listar foro por organización ordenado por fecha. |
| 11 | `idx_forum_author_id` | `forum_messages` | `author_id` | B-tree | Mensajes de un usuario. |
| 12 | `idx_blog_org_created` | `blog_posts` | `organization_id, created_at DESC` | Compuesto | Listar blog por organización. |
| 13 | `idx_certificates_volunteer_id` | `certificates` | `volunteer_id` | B-tree | Certificados de un voluntario. |
| 14 | `idx_certificates_opportunity_id` | `certificates` | `opportunity_id` | B-tree | Certificados por oportunidad. |
| 15 | `uq_certificate_per_user_opp` | `certificates` | `volunteer_id, opportunity_id` | UNIQUE compuesto | Un certificado por par voluntario-oportunidad. |

---

## 9. Restricciones de integridad

### 9.1 Restricciones declarativas en el DDL

| # | Tipo | Tabla | Definición | Razón |
|---|------|-------|------------|-------|
| 1 | `NOT NULL` | múltiples | Ver columna a columna en sección 5 | Garantiza valores obligatorios. |
| 2 | `PRIMARY KEY` | todas | `id` (o compuesta en `opportunity_applicants`) | Identidad de registros. |
| 3 | `UNIQUE` | `users.email` | — | Una cuenta por correo. |
| 4 | `UNIQUE` | `organizations.email` | — | Una organización por correo. |
| 5 | `UNIQUE` | `organizations.name` | — | Evita nombres duplicados. |
| 6 | `UNIQUE` compuesto | `certificates(volunteer_id, opportunity_id)` | — | Un certificado por par. |
| 7 | `FOREIGN KEY` | varias | Ver tabla en sección 7 | Integridad referencial. |
| 8 | `CHECK` email | `users.email`, `organizations.email` | `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'` | Formato válido de correo. |
| 9 | `CHECK` rechazo | `organizations` | `(status = 'rejected') OR (rejection_message IS NULL)` | Solo organizaciones rechazadas tienen motivo. |
| 10 | `CHECK` fecha futura | `opportunities.event_date` | `event_date >= '2000-01-01'` | Sanidad de datos. |
| 11 | `CHECK` estado postulación | `opportunity_applicants.status` | `status IN ('applied','accepted','rejected','completed')` | Limita valores. |
| 12 | `CHECK` emisión vs estado | `certificates` | `(status='pending' AND issued_at IS NULL) OR (status='completed' AND issued_at IS NOT NULL)` | Coherencia. |

### 9.2 Restricciones procedurales (triggers)

Triggers recomendados que **no son** parte del DDL declarativo pero sí del runtime:

1. `set_updated_at()` — trigger `BEFORE UPDATE` en `users`, `organizations`, `opportunities`, `blog_posts` para autorrellenar `updated_at = NOW()`.
2. `prevent_publish_unapproved_org()` — antes de insertar/actualizar `opportunities`, validar que `organizations.status = 'approved'` cuando `published = true`.
3. `auto_complete_certificate()` — al actualizar `opportunity_applicants.status = 'completed'`, generar registro en `certificates` si no existe.

---

## 10. Tipos ENUM (DDL)

```sql
CREATE TYPE user_role AS ENUM ('admin', 'organization', 'volunteer');

CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE certificate_status AS ENUM ('pending', 'completed');
```

---

## 11. Script DDL completo

A continuación se entrega el script SQL ejecutable de extremo a extremo. Probado conceptualmente para PostgreSQL 14+. Para ejecutar: conectarse a la base de datos destino y ejecutar como un único bloque transaccional.

```sql
-- ============================================================================
-- VOLUNTARIADO E195 — ESQUEMA RELACIONAL
-- Motor: PostgreSQL 14+
-- ============================================================================

BEGIN;

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- texto insensible a mayúsculas

-- 2. Tipos ENUM
CREATE TYPE user_role AS ENUM ('admin', 'organization', 'volunteer');
CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE certificate_status AS ENUM ('pending', 'completed');

-- 3. Tabla organizations (creada antes que users por la FK)
CREATE TABLE organizations (
    id                  UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150)          NOT NULL UNIQUE,
    email               CITEXT                NOT NULL UNIQUE,
    status              organization_status   NOT NULL DEFAULT 'pending',
    document_url        TEXT                  NULL,
    rejection_message   TEXT                  NULL,
    created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_org_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_org_rejection
        CHECK (status = 'rejected' OR rejection_message IS NULL)
);

-- 4. Tabla users
CREATE TABLE users (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(120)  NOT NULL,
    email                  CITEXT        NOT NULL UNIQUE,
    password_hash          VARCHAR(255)  NOT NULL,
    role                   user_role     NOT NULL DEFAULT 'volunteer',
    avatar_url             TEXT          NULL,
    organization_id        UUID          NULL REFERENCES organizations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    security_question      VARCHAR(255)  NULL,
    security_answer_hash   VARCHAR(255)  NULL,
    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 5. Tabla opportunities
CREATE TABLE opportunities (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title              VARCHAR(200)  NOT NULL,
    description        TEXT          NOT NULL,
    event_date         DATE          NOT NULL,
    event_time         TIME          NOT NULL,
    city               VARCHAR(100)  NOT NULL,
    location           VARCHAR(255)  NOT NULL,
    organization_id    UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    published          BOOLEAN       NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_opp_date_sanity CHECK (event_date >= DATE '2000-01-01')
);

-- 6. Tabla puente opportunity_applicants
CREATE TABLE opportunity_applicants (
    opportunity_id   UUID         NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    applied_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status           VARCHAR(20)  NOT NULL DEFAULT 'applied',
    PRIMARY KEY (opportunity_id, user_id),
    CONSTRAINT chk_oa_status CHECK (status IN ('applied','accepted','rejected','completed'))
);

-- 7. Tabla forum_messages
CREATE TABLE forum_messages (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(200)  NOT NULL,
    message           TEXT          NOT NULL,
    author_id         UUID          NULL REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    author_role       user_role     NOT NULL,
    organization_id   UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 8. Tabla blog_posts
CREATE TABLE blog_posts (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(200)  NOT NULL,
    content           TEXT          NOT NULL,
    image_url         TEXT          NULL,
    author_id         UUID          NULL REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    organization_id   UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 9. Tabla certificates
CREATE TABLE certificates (
    id                UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id      UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    opportunity_id    UUID                 NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    status            certificate_status   NOT NULL DEFAULT 'pending',
    completed_date    DATE                 NOT NULL,
    issued_at         TIMESTAMPTZ          NULL,
    created_at        TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_volunteer_opp UNIQUE (volunteer_id, opportunity_id),
    CONSTRAINT chk_cert_status_issued
        CHECK ((status = 'pending'   AND issued_at IS NULL)
            OR (status = 'completed' AND issued_at IS NOT NULL))
);

-- 10. Índices secundarios
CREATE INDEX idx_users_role                  ON users (role);
CREATE INDEX idx_users_organization_id       ON users (organization_id);
CREATE INDEX idx_organizations_status        ON organizations (status);
CREATE INDEX idx_opportunities_org           ON opportunities (organization_id);
CREATE INDEX idx_opportunities_pub_date      ON opportunities (published, event_date DESC);
CREATE INDEX idx_opportunities_city          ON opportunities (city);
CREATE INDEX idx_oa_user_id                  ON opportunity_applicants (user_id);
CREATE INDEX idx_forum_org_created           ON forum_messages (organization_id, created_at DESC);
CREATE INDEX idx_forum_author_id             ON forum_messages (author_id);
CREATE INDEX idx_blog_org_created            ON blog_posts (organization_id, created_at DESC);
CREATE INDEX idx_certificates_volunteer_id   ON certificates (volunteer_id);
CREATE INDEX idx_certificates_opportunity_id ON certificates (opportunity_id);

-- 11. Función y trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at         BEFORE UPDATE ON users         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_blog_posts_updated_at    BEFORE UPDATE ON blog_posts    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
```

---

## 12. Datos de ejemplo (INSERT)

Estos `INSERT` reproducen exactamente los datos del archivo `mock-data.ts` adaptados al modelo relacional. Para mantener trazabilidad se conservan los IDs originales en CTEs.

```sql
BEGIN;

-- Organizaciones
WITH ins_orgs AS (
    INSERT INTO organizations (name, email, status, document_url, rejection_message, created_at)
    VALUES
      ('Green Earth Foundation',    'org@greenearth.org',         'approved', NULL,                 NULL,                                      '2024-01-15'),
      ('River Cleanup Initiative',  'contact@rivercleanup.org',   'pending',  'verification.pdf',   NULL,                                      '2024-03-20'),
      ('Urban Garden Project',      'info@urbangarden.org',       'pending',  NULL,                 NULL,                                      '2024-04-01'),
      ('Wildlife Preserve Society', 'hello@wildlife.org',         'rejected', NULL,                 'Incomplete documentation provided.',      '2024-02-10')
    RETURNING id, name
)
INSERT INTO users (name, email, password_hash, role, organization_id, security_question, security_answer_hash)
SELECT
    u.name, u.email, u.password_hash, u.role::user_role,
    (SELECT id FROM ins_orgs WHERE name = u.org_name),
    u.security_question, u.security_answer_hash
FROM (VALUES
    ('Admin User',              'admin@vms.org',         '<bcrypt-hash>', 'admin',        NULL,                       'What is your pet name?',       '<hash-buddy>'),
    ('Green Earth Foundation',  'org@greenearth.org',    '<bcrypt-hash>', 'organization', 'Green Earth Foundation',   'What city were you born in?',  '<hash-portland>'),
    ('Jane Volunteer',          'jane@email.com',        '<bcrypt-hash>', 'volunteer',    NULL,                       'What is your favorite color?', '<hash-green>')
) AS u(name, email, password_hash, role, org_name, security_question, security_answer_hash);

-- Oportunidades (referencia a org Green Earth Foundation)
INSERT INTO opportunities (title, description, event_date, event_time, city, location, organization_id, published)
SELECT
    o.title, o.description, o.event_date::date, o.event_time::time, o.city, o.location,
    (SELECT id FROM organizations WHERE name = 'Green Earth Foundation'),
    o.published
FROM (VALUES
    ('Beach Cleanup Drive',      'Help us clean the coastline and protect marine life. Gloves and bags provided.', '2024-05-15', '08:00', 'Santa Monica', 'Santa Monica Pier',          true),
    ('Tree Planting Weekend',    'Join our tree planting initiative. We aim to plant 500 trees in the local park.', '2024-06-01', '09:00', 'Portland',     'Forest Park',                true),
    ('Community Garden Setup',   'Help set up raised beds and irrigation for the new community garden.',            '2024-05-20', '10:00', 'Austin',       'East Austin Community Center', false)
) AS o(title, description, event_date, event_time, city, location, published);

-- Postulación: Jane Volunteer → Beach Cleanup Drive
INSERT INTO opportunity_applicants (opportunity_id, user_id, status)
SELECT
    (SELECT id FROM opportunities WHERE title = 'Beach Cleanup Drive'),
    (SELECT id FROM users WHERE email = 'jane@email.com'),
    'applied';

-- Mensajes del foro
INSERT INTO forum_messages (title, message, author_id, author_role, organization_id, created_at)
SELECT
    f.title, f.message,
    (SELECT id FROM users WHERE name = f.author_name),
    f.author_role::user_role,
    (SELECT id FROM organizations WHERE name = 'Green Earth Foundation'),
    f.created_at::timestamptz
FROM (VALUES
    ('Welcome to the Forum!',                'This is the official forum for Green Earth Foundation. Share your thoughts and ideas here.', 'Green Earth Foundation', 'organization', '2024-04-01T10:00:00'),
    ('Great experience at the beach cleanup!', 'Had an amazing time volunteering last weekend. The team was very organized and friendly.',  'Jane Volunteer',         'volunteer',    '2024-04-05T14:30:00'),
    ('Upcoming events announcement',         'We have exciting new opportunities coming up in May. Stay tuned for more details!',           'Green Earth Foundation', 'organization', '2024-04-08T09:15:00')
) AS f(title, message, author_name, author_role, created_at);

-- Blog posts
INSERT INTO blog_posts (title, content, author_id, organization_id, created_at)
SELECT
    b.title, b.content,
    (SELECT id FROM users WHERE name = 'Green Earth Foundation'),
    (SELECT id FROM organizations WHERE name = 'Green Earth Foundation'),
    b.created_at::timestamptz
FROM (VALUES
    ('The Impact of Volunteering on Communities',
     E'Volunteering has a profound impact on local communities. From environmental conservation to social welfare, volunteers drive meaningful change every day. Studies show that communities with active volunteer programs experience better outcomes in health, education, and environmental sustainability.\n\nOur organization has seen firsthand how dedicated volunteers transform neighborhoods. Last year alone, our volunteers planted over 2,000 trees, cleaned 15 miles of coastline, and mentored 200 youth in environmental science programs.',
     '2024-03-15'),
    ('5 Ways to Start Volunteering Today',
     E'Getting started with volunteering is easier than you think. Here are five simple ways to begin making a difference in your community:\n\n1. Sign up on our platform and browse available opportunities\n2. Start small — even a few hours a month can make a big impact\n3. Find causes that align with your passions and skills\n4. Invite friends and family to join you\n5. Track your progress and celebrate milestones',
     '2024-04-02')
) AS b(title, content, created_at);

-- Certificados
INSERT INTO certificates (volunteer_id, opportunity_id, status, completed_date, issued_at)
SELECT
    (SELECT id FROM users WHERE email = 'jane@email.com'),
    (SELECT id FROM opportunities WHERE title = c.activity_title),
    c.status::certificate_status,
    c.completed_date::date,
    CASE WHEN c.status = 'completed' THEN NOW() ELSE NULL END
FROM (VALUES
    ('Beach Cleanup Drive',   'completed', '2024-05-15'),
    ('Tree Planting Weekend', 'pending',   '2024-06-01')
) AS c(activity_title, status, completed_date);

COMMIT;
```

---

## 13. Diccionario de datos consolidado

Listado completo de TODAS las columnas de TODAS las tablas del esquema propuesto.

### 13.1 Tabla `organizations`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `name` | `VARCHAR(150)` | No | — | UQ | Nombre legal de la organización. |
| 3 | `email` | `CITEXT` | No | — | UQ | Correo institucional. |
| 4 | `status` | `organization_status` | No | `'pending'` | — | Estado en flujo de aprobación. |
| 5 | `document_url` | `TEXT` | Sí | NULL | — | URL de documento verificador. |
| 6 | `rejection_message` | `TEXT` | Sí | NULL | — | Motivo de rechazo. |
| 7 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación. |
| 8 | `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización. |

### 13.2 Tabla `users`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `name` | `VARCHAR(120)` | No | — | — | Nombre del usuario. |
| 3 | `email` | `CITEXT` | No | — | UQ | Correo electrónico. |
| 4 | `password_hash` | `VARCHAR(255)` | No | — | — | Hash de contraseña. |
| 5 | `role` | `user_role` | No | `'volunteer'` | — | Rol del usuario. |
| 6 | `avatar_url` | `TEXT` | Sí | NULL | — | URL del avatar. |
| 7 | `organization_id` | `UUID` | Sí | NULL | FK → organizations.id | Organización a la que pertenece. |
| 8 | `security_question` | `VARCHAR(255)` | Sí | NULL | — | Pregunta de recuperación. |
| 9 | `security_answer_hash` | `VARCHAR(255)` | Sí | NULL | — | Hash de respuesta. |
| 10 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación. |
| 11 | `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización. |

### 13.3 Tabla `opportunities`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `title` | `VARCHAR(200)` | No | — | — | Título. |
| 3 | `description` | `TEXT` | No | — | — | Descripción completa. |
| 4 | `event_date` | `DATE` | No | — | — | Fecha del evento. |
| 5 | `event_time` | `TIME` | No | — | — | Hora del evento. |
| 6 | `city` | `VARCHAR(100)` | No | — | — | Ciudad. |
| 7 | `location` | `VARCHAR(255)` | No | — | — | Lugar específico. |
| 8 | `organization_id` | `UUID` | No | — | FK → organizations.id | Organización dueña. |
| 9 | `published` | `BOOLEAN` | No | `false` | — | Visibilidad pública. |
| 10 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación. |
| 11 | `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última actualización. |

### 13.4 Tabla `opportunity_applicants`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `opportunity_id` | `UUID` | No | — | PK compuesta, FK → opportunities.id | Oportunidad. |
| 2 | `user_id` | `UUID` | No | — | PK compuesta, FK → users.id | Voluntario. |
| 3 | `applied_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de postulación. |
| 4 | `status` | `VARCHAR(20)` | No | `'applied'` | — | Estado de la postulación. |

### 13.5 Tabla `forum_messages`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `title` | `VARCHAR(200)` | No | — | — | Asunto. |
| 3 | `message` | `TEXT` | No | — | — | Cuerpo. |
| 4 | `author_id` | `UUID` | Sí | NULL | FK → users.id | Autor. |
| 5 | `author_role` | `user_role` | No | — | — | Rol congelado del autor. |
| 6 | `organization_id` | `UUID` | No | — | FK → organizations.id | Foro de qué organización. |
| 7 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de publicación. |

### 13.6 Tabla `blog_posts`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `title` | `VARCHAR(200)` | No | — | — | Título. |
| 3 | `content` | `TEXT` | No | — | — | Contenido. |
| 4 | `image_url` | `TEXT` | Sí | NULL | — | Imagen destacada. |
| 5 | `author_id` | `UUID` | Sí | NULL | FK → users.id | Autor. |
| 6 | `organization_id` | `UUID` | No | — | FK → organizations.id | Organización publicadora. |
| 7 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de publicación. |
| 8 | `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Última edición. |

### 13.7 Tabla `certificates`

| # | Columna | Tipo | Nulo | Default | PK/FK/UQ | Descripción |
|---|---------|------|------|---------|----------|-------------|
| 1 | `id` | `UUID` | No | `gen_random_uuid()` | PK | Identificador único. |
| 2 | `volunteer_id` | `UUID` | No | — | FK → users.id, parte de UQ | Voluntario certificado. |
| 3 | `opportunity_id` | `UUID` | No | — | FK → opportunities.id, parte de UQ | Actividad. |
| 4 | `status` | `certificate_status` | No | `'pending'` | — | Estado. |
| 5 | `completed_date` | `DATE` | No | — | — | Fecha de finalización. |
| 6 | `issued_at` | `TIMESTAMPTZ` | Sí | NULL | — | Fecha de emisión efectiva. |
| 7 | `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Fecha de creación del registro. |

### 13.8 Resumen estadístico del esquema

| Métrica | Valor |
|---------|-------|
| Tablas | 7 |
| Tipos ENUM | 3 |
| Columnas totales | 57 |
| Claves primarias simples | 6 |
| Claves primarias compuestas | 1 |
| Claves foráneas | 10 |
| Índices únicos | 4 |
| Índices secundarios | 11 |
| CHECK constraints | 6 |
| Triggers | 4 (todos `set_updated_at`) |

---

## 14. Estado actual vs. propuesto

| Aspecto | Mockup actual | Propuesta (PostgreSQL) |
|---------|---------------|------------------------|
| Persistencia | En memoria (React state) | Disco — durable |
| Pérdida al refrescar | Sí | No |
| Motor | Ninguno | PostgreSQL 14+ |
| Esquema | 6 interfaces TypeScript | 7 tablas + 3 ENUMs |
| Identificadores | Strings arbitrarios (`'opp1'`, `'fm-123'`) | `UUID` generados |
| Integridad referencial | Nula | FK con `ON DELETE` declarado |
| Unicidad de email | No validada | `UNIQUE` + `CHECK` regex |
| Contraseñas | No existen (login mock) | `password_hash` (bcrypt/argon2) |
| Respuestas de seguridad | Texto plano | Hash |
| Relación N:M (aplicantes) | Arreglo de strings | Tabla puente normalizada |
| Denormalización (`organizationName`, `authorName`) | Sí | Eliminada — se usa `JOIN` |
| Validación de email | Ninguna | `CHECK` regex |
| Flujo aprobación con motivo de rechazo | Sin restricción | `CHECK` semántico |
| Timestamps | Strings sin tipo | `TIMESTAMPTZ` con triggers |
| Búsqueda por ciudad/estado | Filtrado en JS | Índices B-tree |
| Reportes | Iteración en arrays | `JOIN`/`GROUP BY` SQL |
| Transacciones | No | ACID |

---

## 15. Recomendaciones de implementación

1. **Backend stack sugerido:** Node.js + Express o Nest.js, con **Prisma** como ORM (mapeo directo del DDL propuesto a `schema.prisma`). Alternativa: TypeORM o Drizzle.
2. **Auth:** sustituir el mock de `auth-context.tsx` por JWT firmados o sesiones server-side. Hashear contraseñas con `bcrypt` (factor ≥ 12) o `argon2id`. Hashear también `security_answer`.
3. **Migraciones:** usar `prisma migrate dev` o `node-pg-migrate` desde el primer día. No editar el esquema productivo a mano.
4. **Seed:** convertir los `INSERT` de la sección 12 en un script de seed reutilizable.
5. **Servicios y validación:** validar entrada con Zod o Yup antes de tocar la BD. Aplicar reglas semánticas que el DDL no cubre (p. ej. solo organizaciones aprobadas pueden publicar).
6. **API:** REST o tRPC. Endpoints sugeridos: `/users`, `/organizations`, `/opportunities`, `/opportunities/:id/apply`, `/forum/:orgId`, `/blog/:orgId`, `/certificates`.
7. **Adopción incremental en el frontend:** reemplazar imports de `mock-data` por hooks de `@tanstack/react-query` (ya instalado) que llamen a la API.
8. **Backups:** habilitar WAL archiving + base backups diarios cuando se llegue a producción.
9. **Seguridad:**
   - No exponer `password_hash` ni `security_answer_hash` por la API.
   - Usar `SECURITY DEFINER` con cuidado si se introducen funciones PL/pgSQL.
   - Considerar Row-Level Security (RLS) para que cada organización solo vea sus propios datos en el foro/blog.
10. **Auditoría:** añadir tabla `audit_log` si el dominio lo exige (cambios de aprobación, ediciones de certificados).

---

## 16. Glosario

| Término | Definición |
|---------|------------|
| **Base de datos relacional** | Sistema que organiza los datos en tablas con filas y columnas, donde las relaciones se establecen mediante claves foráneas. |
| **DDL** | Data Definition Language. Subconjunto de SQL para crear/alterar estructura (`CREATE`, `ALTER`, `DROP`). |
| **DML** | Data Manipulation Language. `INSERT`, `UPDATE`, `DELETE`, `SELECT`. |
| **PK (Primary Key)** | Clave primaria. Identificador único e inmutable de cada fila. No admite NULL. |
| **FK (Foreign Key)** | Clave foránea. Columna que referencia la PK de otra tabla; mantiene integridad referencial. |
| **UNIQUE** | Restricción que impide valores duplicados en una columna (o combinación de columnas). |
| **CHECK** | Restricción que valida un predicado booleano por fila. |
| **ENUM** | Tipo enumerado: conjunto cerrado y ordenado de valores permitidos. |
| **NULL** | Marca de "ausencia de valor". No equivale a vacío ni a cero. |
| **UUID** | Identificador universal único de 128 bits, representado como 36 caracteres (incluyendo guiones). |
| **TIMESTAMPTZ** | Tipo PostgreSQL para fecha y hora con zona horaria explícita. |
| **CITEXT** | Tipo de texto insensible a mayúsculas/minúsculas (extensión PostgreSQL). |
| **Índice B-tree** | Estructura de árbol balanceado utilizada por PostgreSQL para acelerar búsquedas, ordenamientos y joins. |
| **Cardinalidad** | Naturaleza numérica de una relación entre dos entidades: 1:1, 1:N, N:M. |
| **Relación N:M** | Cardinalidad muchos-a-muchos. Implementada con tabla puente. |
| **Normalización** | Proceso de organizar datos para evitar redundancia y dependencias problemáticas. Formas normales: 1FN, 2FN, 3FN, BCNF. |
| **Denormalización** | Duplicación intencional de datos para optimizar lectura, a costa de complicar la escritura. |
| **CASCADE** | Acción `ON DELETE/UPDATE` que propaga la operación a las filas dependientes. |
| **SET NULL** | Acción `ON DELETE/UPDATE` que pone NULL en la FK cuando la fila referenciada cambia/desaparece. |
| **Trigger** | Procedimiento que se ejecuta automáticamente ante un evento (INSERT, UPDATE, DELETE). |
| **Transacción** | Unidad lógica de trabajo que debe completarse en su totalidad (ACID). |
| **ACID** | Atomicidad, Consistencia, Aislamiento, Durabilidad. Garantías de las transacciones SQL. |
| **ORM** | Object-Relational Mapper. Capa que traduce objetos del lenguaje a filas SQL (Prisma, TypeORM, Sequelize). |
| **Migración** | Script versionado que evoluciona el esquema de la BD de manera reproducible. |
| **Seed** | Datos iniciales cargados al crear la BD. |
| **DBML** | Database Markup Language. Sintaxis textual para describir esquemas (usada por dbdiagram.io). |
| **RLS (Row-Level Security)** | Mecanismo de PostgreSQL para restringir qué filas ve cada usuario. |
| **WAL** | Write-Ahead Log de PostgreSQL: bitácora usada para durabilidad y replicación. |

---

## Apéndice A. Cómo convertir este Markdown a Word

1. Abrir este archivo en un editor que renderice Markdown (Visual Studio Code con el preview, Typora, Obsidian, etc.).
2. En la vista renderizada, presionar `Ctrl+A` para seleccionar todo y `Ctrl+C`.
3. Abrir Microsoft Word con un documento en blanco.
4. Pegar con `Ctrl+V` (Word respeta encabezados, tablas y bloques de código).
5. Ajustar estilos al template institucional si aplica (fuente, márgenes, numeración).
6. Insertar página de portada, índice automático (`Referencias → Tabla de contenido`) y pies de página.
7. Para mantener el diagrama ASCII legible: seleccionarlo y aplicarle una fuente monoespaciada (Consolas, Courier New).
8. Guardar como `.docx`.

**Alternativa con Pandoc** (si está instalado):

```powershell
pandoc MANUAL_BASE_DATOS.md -o MANUAL_BASE_DATOS.docx --reference-doc=plantilla.docx
```

---

## Apéndice B. Cómo validar el script DDL

1. Instalar PostgreSQL 14 o superior local, o usar https://www.db-fiddle.com/ (motor PostgreSQL 15).
2. Conectarse con `psql -U postgres`.
3. Crear una BD temporal: `CREATE DATABASE voluntariado_test;`
4. Conectarse: `\c voluntariado_test`
5. Copiar y ejecutar el script de la **sección 11**. No debe arrojar errores.
6. Ejecutar el script de la **sección 12** para cargar datos de muestra.
7. Validar con consultas:

```sql
SELECT COUNT(*) FROM organizations;   -- 4
SELECT COUNT(*) FROM users;           -- 3
SELECT COUNT(*) FROM opportunities;   -- 3
SELECT COUNT(*) FROM opportunity_applicants;   -- 1
SELECT COUNT(*) FROM forum_messages;  -- 3
SELECT COUNT(*) FROM blog_posts;      -- 2
SELECT COUNT(*) FROM certificates;    -- 2
```

8. Probar integridad referencial:

```sql
DELETE FROM organizations WHERE name = 'Green Earth Foundation';
-- Debe eliminar en cascada oportunidades, foro, blog y certificados asociados.
SELECT COUNT(*) FROM opportunities;   -- Debe ser 0
```

9. Si todas las verificaciones pasan, el esquema está listo para uso productivo (previa configuración de backups y seguridad).

---

**Fin del manual.**
