# 🤝 Voluntariado E195 — Grupo Gris

> Plataforma web para conectar **organizaciones** con **voluntarios**.
> 🆕 Esta rama integra **Supabase** como backend real: autenticación, base de datos PostgreSQL y almacenamiento de archivos.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)

> 🌿 **Rama:** `feat/supabase-backend` — para la versión frontend con datos mock ver [`main`](../../tree/main).

---

## 📚 Tabla de contenido

- [✨ Qué cambió en esta rama](#-qué-cambió-en-esta-rama)
- [👥 Integrantes](#-integrantes)
- [🧱 Stack tecnológico](#-stack-tecnológico)
- [📂 Estructura del repositorio](#-estructura-del-repositorio)
- [⚙️ Configuración de Supabase](#️-configuración-de-supabase)
- [🚀 Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [🗄️ Migraciones y esquema](#️-migraciones-y-esquema)
- [🧑‍💻 Roles de usuario](#-roles-de-usuario)
- [🔐 Seguridad (RLS)](#-seguridad-rls)
- [🐛 Solución de problemas](#-solución-de-problemas)

---

## ✨ Qué cambió en esta rama

Frente a `main`, esta rama agrega:

- 🔐 **Autenticación real** vía Supabase Auth (email + contraseña).
- 🗄️ **Base de datos PostgreSQL** con tablas para usuarios, organizaciones, oportunidades, postulaciones, foros, blog y certificados.
- 🛡️ **Row Level Security (RLS)** — políticas por tabla según rol.
- 📦 **Storage** — buckets para fotos de perfil, logos de organizaciones y certificados.
- 🧭 **Triggers** para sincronizar `auth.users` con la tabla `profiles`.
- 🌱 **Seeds** de datos iniciales para desarrollo.
- 🔄 Reemplazo del mock `auth-context` por sesión persistente real.

## 👥 Integrantes

| Nombre              | Rol                |
| ------------------- | ------------------ |
| Valentina Mantilla  | Desarrollo         |
| Dayana Sánchez      | Desarrollo         |
| Daniel Rincón       | Desarrollo         |
| Martha Díaz         | Desarrollo         |

**Grupo:** Gris

## 🧱 Stack tecnológico

**Frontend:**
- ⚛️ React 19 + TypeScript 5.8
- ⚡ Vite 7
- 🧭 TanStack Router + TanStack Query
- 🎨 Tailwind v4 + shadcn/ui + Radix UI
- 🎬 Framer Motion · React Hook Form · Zod · Sonner

**Backend (Supabase):**
- 🟢 **Supabase Auth** — email/password
- 🐘 **PostgreSQL 15**
- 🛡️ **RLS** — políticas por tabla
- 📦 **Supabase Storage** — buckets de archivos
- 📚 **@supabase/supabase-js** v2

## 📂 Estructura del repositorio

```
Voluntariado-E195-gris/
├── mockup_code/
│   ├── src/
│   │   ├── routes/                 # Rutas TanStack
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── supabase.ts         # 🆕 cliente Supabase
│   │   │   ├── db-types.ts         # 🆕 tipos generados de la DB
│   │   │   └── auth-context.tsx    # 🔄 ahora usa Supabase Auth
│   │   └── styles.css
│   ├── supabase/                   # 🆕
│   │   ├── config.toml             # config CLI
│   │   └── migrations/
│   │       ├── 20260516000001_init_schema.sql
│   │       ├── 20260516000002_rls_policies.sql
│   │       ├── 20260516000003_triggers.sql
│   │       ├── 20260516000004_seeds.sql
│   │       ├── 20260516000005_storage.sql
│   │       └── 20260516000006_anon_org_register.sql
│   ├── .env.local                  # 🔒 (no se sube)
│   └── package.json
├── MANUAL_BASE_DATOS.md
└── README.md
```

## ⚙️ Configuración de Supabase

### 1. Crear proyecto

Crear un proyecto en [supabase.com](https://supabase.com) y copiar:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Variables de entorno

Crear `mockup_code/.env.local`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

> ⚠️ **Nunca** subir `.env.local` al repo. Está en `.gitignore`.

### 3. Aplicar migraciones

Con la **Supabase CLI** ([instalación aquí](https://supabase.com/docs/guides/cli)):

```bash
cd mockup_code
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

Las 6 migraciones de `supabase/migrations/` se aplican en orden y dejan la base lista (schema + RLS + triggers + seeds + storage).

## 🚀 Cómo correr el proyecto

**Requisitos:** Node.js ≥ 20, npm, Supabase CLI (opcional para migraciones).

```bash
cd mockup_code
npm install
npm run dev
```

Si las variables de entorno faltan, la app lanza:

```
Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars
```

### Comandos disponibles

```bash
npm run dev          # Vite dev server
npm run build        # Build de producción
npm run preview      # Servir bundle construido
npm run lint         # ESLint
```

## 🗄️ Migraciones y esquema

| # | Archivo                                       | Qué hace                                              |
|---|-----------------------------------------------|-------------------------------------------------------|
| 1 | `20260516000001_init_schema.sql`              | Crea tablas, ENUMs, FKs, índices                       |
| 2 | `20260516000002_rls_policies.sql`             | Políticas Row Level Security por rol                   |
| 3 | `20260516000003_triggers.sql`                 | Triggers (sync auth.users → profiles, etc.)            |
| 4 | `20260516000004_seeds.sql`                    | Datos iniciales de prueba                              |
| 5 | `20260516000005_storage.sql`                  | Buckets de Storage y políticas                         |
| 6 | `20260516000006_anon_org_register.sql`        | Permite registro anónimo de organizaciones             |

> 📘 El detalle completo del modelo está en [`MANUAL_BASE_DATOS.md`](MANUAL_BASE_DATOS.md).

## 🧑‍💻 Roles de usuario

| Rol              | Descripción                              | Origen                                |
| ---------------- | ---------------------------------------- | ------------------------------------- |
| 👑 **admin**         | Administra plataforma                  | Asignado manualmente en `profiles`    |
| 🏢 **organization**  | Publica oportunidades                  | Registro vía flujo de organización    |
| 🙋 **volunteer**     | Busca y se postula a oportunidades     | Registro estándar                     |

## 🔐 Seguridad (RLS)

Todas las tablas tienen **Row Level Security activado**. Reglas clave:

- 👀 Voluntarios solo ven y editan **sus propios** datos.
- 🏢 Organizaciones gestionan **sus propias** oportunidades y postulaciones.
- 👑 Admins tienen acceso amplio según política.
- 🔓 Registro de organización usa función `SECURITY DEFINER` controlada (migración 6).

## 🐛 Solución de problemas

<details>
<summary><strong>❌ "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"</strong></summary>

Crear `mockup_code/.env.local` con las dos variables. Reiniciar `npm run dev`.
</details>

<details>
<summary><strong>🔁 Loop de redirect login ↔ dashboard</strong></summary>

Ya corregido en commit `c98eb94`. Si vuelve a aparecer, verificar que `authReady` esté siendo respetado en los guards de ruta.
</details>

<details>
<summary><strong>🆔 Error al registrar una organización nueva</strong></summary>

El UUID se genera en cliente (commit `45b9416`). Verificar que el navegador soporte `crypto.randomUUID()`.
</details>

---

📄 **Documentación adicional:** [`MANUAL_BASE_DATOS.md`](MANUAL_BASE_DATOS.md) · [`CLAUDE.md`](CLAUDE.md)

🎓 Proyecto académico — **Grupo Gris** · E195
