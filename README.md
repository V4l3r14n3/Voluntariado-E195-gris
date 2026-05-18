# 🤝 Voluntariado E195 — Grupo Gris

> Plataforma web para conectar **organizaciones** con **voluntarios**, facilitando la gestión de oportunidades, postulaciones, foros y certificados.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.x-FF4154)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/uso-académico-lightgrey)

---

## 📚 Tabla de contenido

- [✨ Descripción](#-descripción)
- [👥 Integrantes](#-integrantes)
- [🧱 Stack tecnológico](#-stack-tecnológico)
- [📂 Estructura del repositorio](#-estructura-del-repositorio)
- [🚀 Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [🧑‍💻 Roles de usuario](#-roles-de-usuario)
- [🗺️ Rutas principales](#️-rutas-principales)
- [🧪 Datos de prueba](#-datos-de-prueba)
- [🌿 Ramas del proyecto](#-ramas-del-proyecto)

---

## ✨ Descripción

**Voluntariado E195** es una aplicación web pensada para que organizaciones sin ánimo de lucro publiquen oportunidades de voluntariado y los voluntarios puedan encontrarlas, postularse, participar en foros y recibir certificados de participación.

Esta rama (`main`) contiene la versión **frontend con datos simulados** (mock data en memoria). Para la versión con backend real ver la rama [`feat/supabase-backend`](../../tree/feat/supabase-backend).

## 👥 Integrantes

| Nombre              | Rol                |
| ------------------- | ------------------ |
| Valentina Mantilla  | Desarrollo         |
| Dayana Sánchez      | Desarrollo         |
| Daniel Rincón       | Desarrollo         |
| Martha Díaz         | Desarrollo         |

**Grupo:** Gris

## 🧱 Stack tecnológico

- ⚛️ **React 19** + **TypeScript 5.8** (strict mode)
- ⚡ **Vite 7** — bundler y dev server
- 🧭 **TanStack Router** — ruteo basado en archivos (`src/routes/`)
- 🎨 **Tailwind CSS v4** + **shadcn/ui** (estilo *new-york*, base *slate*)
- 🧩 **Radix UI** — primitivos accesibles
- 🎬 **Framer Motion** — animaciones
- 📋 **React Hook Form** + **Zod** — formularios y validación
- 🔔 **Sonner** — notificaciones (toasts)
- 🗃️ **Datos mock en memoria** — sin backend (ver `src/lib/mock-data.ts`)

## 📂 Estructura del repositorio

```
Voluntariado-E195-gris/
├── mockup_code/              # 🟢 SPA real (acá se trabaja)
│   ├── src/
│   │   ├── routes/           # Rutas TanStack (file-based)
│   │   ├── components/       # Componentes propios + ui/ (shadcn)
│   │   ├── lib/              # auth-context, mock-data, utils
│   │   └── styles.css        # Tailwind v4
│   ├── package.json
│   └── vite.config.ts
├── mockups/                  # 📄 Mockups HTML estáticos (placeholders)
├── MANUAL_BASE_DATOS.md      # 📘 Propuesta de esquema PostgreSQL
├── CLAUDE.md                 # 🤖 Guía para Claude Code
└── README.md
```

## 🚀 Cómo correr el proyecto

> ⚠️ Todos los comandos se ejecutan desde `mockup_code/`.

**Requisitos previos:** Node.js ≥ 20 y npm.

```bash
cd mockup_code
npm install
npm run dev
```

Abrir el navegador en la URL que muestra Vite (por defecto http://localhost:5173).

### Otros comandos disponibles

```bash
npm run build        # Build de producción
npm run build:dev    # Build en modo desarrollo
npm run preview      # Servir el bundle construido
npm run lint         # ESLint sobre todo el proyecto
```

> ℹ️ El proyecto **no tiene tests configurados** todavía.

## 🧑‍💻 Roles de usuario

La app maneja tres roles, cada uno con su propia navegación e interfaz:

| Rol              | Descripción                              | Accesos principales                                   |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| 👑 **admin**         | Administra organizaciones y plataforma | Dashboard, Organizaciones, Foro, Perfil               |
| 🏢 **organization**  | Publica oportunidades de voluntariado  | Dashboard, Oportunidades, Foro, Blog, Reportes, Perfil |
| 🙋 **volunteer**     | Busca y se postula a oportunidades     | Dashboard, Buscar, Foro, Blog, Mis reportes, Perfil   |

> 💡 El rol se infiere del email al iniciar sesión: contiene `admin` → admin, contiene `org` → organización, en otro caso → voluntario.

## 🗺️ Rutas principales

- `/` — landing pública
- `/login` — inicio de sesión
- `/register` — registro
- `/dashboard` — panel según rol
- `/search` — buscar oportunidades (voluntarios)
- `/opportunities` — gestionar oportunidades (organizaciones)
- `/admin/organizations` — gestión de orgs (admin)
- `/forum`, `/blog`, `/reports`, `/profile`

## 🧪 Datos de prueba

Los datos están hardcodeados en [`mockup_code/src/lib/mock-data.ts`](mockup_code/src/lib/mock-data.ts) — al refrescar el navegador se pierden los cambios. Hay usuarios sembrados (`mockUsers`) que se pueden usar para login rápido.

> 🔑 La contraseña es ignorada en login mock. Cualquier valor sirve.

## 🌿 Ramas del proyecto

| Rama                      | Estado | Descripción                                    |
| ------------------------- | ------ | ---------------------------------------------- |
| `main`                    | ✅     | Frontend con datos mock en memoria             |
| `feat/supabase-backend`   | 🚧     | Integración con Supabase (auth + Postgres)     |

---

📄 **Documentación adicional:** ver [`MANUAL_BASE_DATOS.md`](MANUAL_BASE_DATOS.md) para la propuesta de esquema PostgreSQL.

🎓 Proyecto académico — **Grupo Gris** · E195
