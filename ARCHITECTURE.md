# Architecture

## Oversikt

Dette er et frittstående proof-of-concept for en developer handbook. Prosjektet består av:

- `apps/web` — Next.js 15+ app (App Router, TypeScript strict)
- `apps/studio` — Sanity Studio v3

## Prosjektstruktur

```
devhandbook/
├── apps/
│   ├── studio/          # Sanity Studio
│   └── web/             # Next.js frontend
├── tsconfig.base.json   # Felles TypeScript-base
├── turbo.json           # Turborepo pipeline-konfigurasjon
├── pnpm-workspace.yaml  # pnpm workspace-definisjon
└── package.json         # Rot-pakke med turbo som devDependency
```

## Pipelines (Turborepo)

| Task | Avhengigheter | Caching |
|---|---|---|
| `dev` | ingen | nei (persistent) |
| `build` | `^build` | ja |
| `typegen` | `^build` | ja |
| `lint` | `^lint` | ja |

## Schema-navnekonvensjon

Alle Sanity-schema-typer bruker `hb.`-prefikset (f.eks. `hb.article`, `hb.section`). Dette gjøres bevisst for å unngå navnekollisjoner ved fremtidig monorepo-integrasjon.

---

## Tilpasninger ved monorepo-integrasjon

Følgende endringer kreves når prosjektet flyttes inn i et større Turborepo-monorepo:

### 1. `basePath` i Next.js

Legg til i `apps/web/next.config.ts`:

```ts
basePath: '/devdocs',
```

Alle interne lenker og bilder i appen må ta høyde for denne prefiksen.

### 2. Miljøvariabler

Hvert workspace må ha sine egne miljøvariabler i monorepoets `.env`-oppsett. Relevante variabler:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `HANDBOOK_ANTHROPIC_API_KEY` (for "Test this skill"-funksjonen)

### 3. Delte pakker

Hvis monorepoet har et internt designsystem (f.eks. `@company/ui`), legg det til som workspace-avhengighet i `apps/web/package.json`:

```json
"@company/ui": "workspace:*"
```

Og oppdater Tailwind-konfigurasjonen til å bruke designsystemets preset.

### 4. Schema-kollisjoner

`hb.`-prefikset på alle schema-typer sørger for at det ikke er navnekollisjoner med eksisterende schema i monorepoet.

### 5. Studio `basePath`

Legg til `basePath` i `sanity.config.ts` hvis Studio skal serveres fra et subpath:

```ts
basePath: '/studio/handbook',
```

### 6. `turbo.json`-pipeline

Slå sammen pipeline-konfigurasjonen fra dette prosjektets `turbo.json` med monorepoets rot-`turbo.json`. Vær oppmerksom på at `outputs`-patterns kan trenge justering.
