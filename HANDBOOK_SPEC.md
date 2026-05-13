# HANDBOOK — Komplett implementeringsspesifikasjon

Dette dokumentet er den eneste kilden du trenger. Det dekker:
1. Hva som skal bygges og hvorfor
2. Innholdsmodell og funksjonalitet
3. Visuell spesifikasjon fra designskisser
4. Nøyaktig hvordan Sanity integreres i eksisterende monorepo

Dokumentet er skrevet for Claude Code med Opus 4. Følg instruksjonene
i den rekkefølgen de er gitt. Ikke hopp over seksjoner merket ⚠️.

---

# DEL 1 — HVA SOM SKAL BYGGES

Du skal bygge en **utviklerhåndbok** for et utvikler-kompetansemiljø — en dokumentasjonsside tilsvarende sanity.io/docs i funksjonalitet og inntrykk, men uten Sanity-branding og uten å være knyttet til noe spesifikt produkt. Innholdet samler best practices som kan brukes eller inspirere i eksterne kundeprosjekter, interne verktøy og egne produkter, og som onboarding for nye utviklere. Innholdet er teknologi- og mønster-orientert (eksempel-artikler: "Monorepo-oppsett med pnpm workspaces", "Feature flags i Next.js", "Postgres-migrasjoner i prod", "Incident response").

Løsningen skal etter hvert ligge bak autentisering — ikke implementér auth nå, men unngå ting som kun gir mening for offentlige sider (SEO, sitemaps, OG-images).

---

## Kontekst: frittstående proof-of-concept

Dette er et **nytt, isolert prosjekt** — ikke tilknyttet noe eksisterende monorepo. Formålet er å validere konseptet (innholdsmodell, redaktøropplevelse, frontend) før løsningen eventuelt integreres i et større Turborepo-monorepo på et senere tidspunkt.

Sett opp prosjektet slik at det er enkelt å flytte inn i et monorepo når den tid kommer:
- Bruk pnpm workspaces fra start, selv om det bare er to apps
- Hold Studio og web-appen som separate `apps/` — ikke bland dem
- Unngå absolutte stier og maskinspesifikke avhengigheter
- Dokumenter i `ARCHITECTURE.md` hvilke tilpasninger som kreves ved monorepo-integrasjon (f.eks. `hb.`-prefikset på schema-typer, egne miljøvariabler per workspace, `basePath`-konfig)

---

## Rammer

- **`apps/web`**: ny Next.js 15+ app med App Router, TypeScript strict. Ingen `basePath` nå — appen kjører på rot. (`basePath: '/devdocs'` legges til ved monorepo-integrasjon.)
- **`apps/studio`**: ny Sanity Studio — eget prosjekt, eget dataset
- **Sanity v3**, `next-sanity` og `@sanity/client` i web-appen
- **Tailwind CSS v4** med designsystemets preset som base — ikke sett opp Tailwind fra scratch.
- **Designsystem**: bruk den interne workspace-pakken (finn pakkenavn og eksporter i trinn 1) for alle komponenter som finnes der. Lag handbook-spesifikke komponenter i `apps/handbook/src/components/` der designsystemet ikke dekker behovet — men arv alltid tokens og CSS-variabler fra designsystemet, ikke definer egne farger eller spacing.
- Ingen eksterne UI-biblioteker (ikke shadcn/ui, ikke Radix direkte). Bruk designsystemet og headless primitiver kun hvis designsystemet selv bruker dem internt.
- **TypeScript overalt.** Bruk `sanity typegen` for å generere typer. Lag `tsconfig.base.json` i prosjektroten som base for begge apps.
- Nøytralt brand — placeholder-navn "Handbook". Ingen Sanity-referanser i frontend.

---

## Jobb i denne rekkefølgen

Ikke hopp over trinn. Les eksisterende kode før du skriver ny. Etter hvert trinn: commit og verifiser.

**Trinn 1 — Opprett prosjektstruktur.** Initialiser nytt pnpm workspace-repo med `apps/studio` og `apps/web`. Felles `tsconfig.base.json` i rot. Legg til `turbo.json` med `dev`, `build` og `typegen`-pipelines. Verifiser at `pnpm dev` starter begge appene.

**Trinn 2 — Opprett `apps/web`.** Next.js 15+ med App Router, TypeScript strict, Tailwind v4. Ingen `basePath` nå. Integrer i Turborepo-pipeline. Legg til designsystem-pakken som workspace-avhengighet når pakkenavnet er kjent. Verifiser `pnpm dev` starter appen.

**Trinn 3 — Sett opp Studio.** Initialiser `apps/studio` med `sanity init`. Konfigurer `sanity.config.ts` med structure builder og presentation plugin. Opprett `schemaTypes/handbook/`-mappen klar for schema-filene i neste trinn.

**Trinn 4 — Schema.** Implementér dokumenttypene under. Én fil per type i `schemaTypes/handbook/`. Bruk `defineType` og `defineField` konsekvent.

**Trinn 5 — Studio-opplevelse for handbook-workspacet.** Se egen seksjon. Like viktig som schemaet.

**Trinn 6 — Frontend-grunnmur.** Rutestruktur, datahenting, layout med sidebar og innholdsområde.

**Trinn 7 — Portable Text-rendering.** Hver custom type må ha en matchende React-komponent.

**Trinn 8 — Funksjonalitet:** maturity-visning, expertise-filter, "On this page", related articles, copy-as-markdown, kuratert navigasjon.

**Trinn 9 — Seeding.** `pnpm handbook:seed`-script som fyller handbook-datasetet med realistiske eksempel-artikler.

---

## Sanity-oppsett

Dette er et frittstående Sanity-prosjekt — én `sanity.config.ts`, ett dataset, én Studio:

```ts
// apps/studio/sanity.config.ts
export default defineConfig({
  name: 'handbook',
  title: 'Handbook',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  schema: { types: handbookSchemaTypes },
  plugins: [structureTool({ structure }), presentationTool({ previewUrl })],
})
```

Miljøvariabler: `SANITY_STUDIO_PROJECT_ID` og `SANITY_STUDIO_DATASET`. Behold `hb.`-prefikset på alle typenavn — det gjør fremtidig monorepo-integrasjon enklere siden det unngår navnekollisjoner med eksisterende schema.

---

## Innholdsmodell

Alle schema-filer plasseres i `apps/studio/schemaTypes/handbook/`. Eksporter alle fra en `apps/studio/schemaTypes/handbook/index.ts`.

### Dokumenttyper

**`hb.section`** — toppnivå-bolker i sidebaren. Bruk `hb.`-prefiks på alle handbook-typenavn for å unngå kollisjon med eksisterende schema.
- `title` (string, required), `slug` (slug, required), `description` (text), `icon` (string — Lucide icon-navn), `order` (number).

**`hb.expertise`** — tverrgående fagområde for filtrering (f.eks. "Frontend", "Backend", "Infrastructure", "Security", "AI", "Data"). Tenk fagdisiplin, ikke bransje — ikke "Energi" eller "Retail". En artikkel kan tilhøre flere.
- `title` (string, required), `slug`, `color` (string, valgfri — hex-farge for visuell markering).

**`hb.article`** — hovedtypen.
- `title`, `slug`, `summary` (text, maks 200 tegn)
- `section` (reference til `hb.section`, required)
- `expertises` (array of references til `hb.expertise`)
- `maturity` (string, enum: `established` | `recommended` | `exploratory` | `deprecated`, default `recommended`)
  - **established**: velprøvd, bredt brukt i miljøet
  - **recommended**: anbefalt, noe mindre erfaring
  - **exploratory**: under utforskning — bruk med bevissthet
  - **deprecated**: frarådet — bevart for kontekst
- `supersededBy` (reference til `hb.article`, kun relevant ved deprecated)
- `body` (Portable Text — se under)
- `relatedArticles` (array of references til `hb.article`, maks 4)
- `contributors` (array of references til `hb.contributor`)
- `lastVerifiedAt` (datetime)
- `hidden` (boolean, default false)

**`hb.contributor`**
- `name`, `slug`, `role` (string), `avatar` (image), `bio` (text), `links` (array of `{ label, url }`)

**`hb.navigation`** — singleton. Én kuratert navigasjonsstruktur.
- `groups` (array of `navGroup`-objekter, rekursivt opptil 3 nivåer):
  - `navGroup`: `title` (string), `items` (array — hvert element er enten `{ _type: 'articleRef', article: reference }` eller `{ _type: 'navGroup', ... }`)

**`hb.codeSnippet`** — gjenbrukbare kodeeksempler.
- `title`, `description`, `snippets` (array av `{ filename, language, code }`)

**`hb.glossaryTerm`**
- `term`, `slug`, `definition` (begrenset Portable Text)

**`hb.guide`** — metodikk, prosess, fremgangsmåte. Skiller seg fra `hb.article` ved å ha eksplisitt struktur for faser og roller.
- `title`, `slug`, `summary` (maks 200 tegn)
- `section` (reference til `hb.section`, required)
- `expertises` (array of references til `hb.expertise`)
- `maturity` (samme enum som `hb.article`)
- `phases` (array av `{ title, description, duration }`) — navngitte faser, f.eks. Discover → Define → Develop → Deliver
- `roles` (array of references til `hb.role`) — hvem som er involvert
- `applicableWhen` (text) — når passer denne metodikken
- `notApplicableWhen` (text) — like viktig
- `artifacts` (array av `{ label, url, _type: 'templateRef' | 'externalLink' }`) — lenker til maler og verktøy
- `body` (Portable Text — samme konfigurasjon som `hb.article`)
- `relatedArticles` (array of references til `hb.article`, maks 4)
- `relatedGuides` (array of references til `hb.guide`, maks 4)
- `contributors`, `lastVerifiedAt`, `hidden` — samme som `hb.article`
- `isLivingDocument` (boolean, default false) — markerer dokumenter som aktivt vedlikeholdes av miljøet i fellesskap

**`hb.template`** — nedlastbare eller kopierbare artefakter: sjekklister, canvas, RFC-maler, retro-boards.
- `title`, `slug`, `description`
- `format` (enum: `markdown` | `figma` | `miro` | `sheet` | `external`)
- `content` (Portable Text, kun ved format = markdown)
- `externalUrl` (string, ved andre formater)
- `usedIn` (array of references til `hb.guide`)

**`hb.principle`** — overordnet prinsipp eller verdi som begrunner andre anbefalinger. Kortere enn en artikkel, mer enn en glossary-term.
- `title`, `slug`
- `statement` (string, én setning — f.eks. "Vi foretrekker kjedelig teknologi")
- `rationale` (Portable Text, begrenset)
- `relatedArticles` (array of references til `hb.article`)
- `relatedGuides` (array of references til `hb.guide`)

**`hb.role`** — funksjon i en prosess (ikke person). F.eks. "Tech Lead", "Fasilitator", "Produkteier".
- `title` (string, required), `slug`, `description` (text)
- Brukes som reference i `hb.guide.roles` og i `hb.stepList`-blokker

**`hb.aiSkill`** — AI prompt, workflow eller evalueringsrammeverk som fagfolk kan bruke direkte.
- `title`, `slug`, `summary` (maks 200 tegn)
- `skillType` (enum: `prompt` | `workflow` | `evaluation`)
- `targetModel` (array of strings: `"claude"` | `"gpt-4"` | `"gemini"` | `"model-agnostic"`)
- `expertises` (array of references til `hb.expertise`)
- `maturity` — samme enum som resten
- `useCase` (string) — én setning: hva brukes dette til
- `prerequisites` (text) — hva brukeren trenger å vite/ha klart
- `body` (Portable Text) — forklaring, kontekst, eksempler på output. Samme blokktyper som `hb.article`
- `artifact` — selve kjerneartefaktet, strukturert etter `skillType`:
  - `prompt`: `{ systemPrompt: text, userPromptTemplate: text, variables: array av { name, description, example } }`
  - `workflow`: `{ steps: array av { title, prompt: text, expectedOutput: text, notes: text } }`
  - `evaluation`: `{ criteria: array av { label, description, scoringGuide: text }, rubric: text }`
- `relatedArticles` (array of references til `hb.article`, maks 4)
- `relatedGuides` (array of references til `hb.guide`, maks 4)
- `relatedSkills` (array of references til `hb.aiSkill`, maks 4)
- `testedWith` (array av `{ model: string, date: datetime, outcome: string, notes: text }`) — testlogg per modell
- `contributors`, `lastVerifiedAt`, `hidden` — som resten

**`hb.aiCollection`** — kuratert samling av skills som henger tematisk sammen. F.eks. "AI-assistert kodegjennomgang" (prompt + workflow + evaluering i én pakke).
- `title`, `slug`, `description` (text)
- `skills` (ordered array of references til `hb.aiSkill`)
- `relatedGuides` (array of references til `hb.guide`)

### Portable Text — body

**Styles:** Normal, H2, H3, H4, Blockquote. Ingen H1.
**Lists:** Bullet, Number.
**Marks (decorators):** Strong, Em, Code.
**Marks (annotations):** `internalLink` (reference til `hb.article`), `externalLink` ({ url, newTab }), `glossaryRef` (reference til `hb.glossaryTerm`), `skillRef` (reference til `hb.aiSkill` — rendres som et inline-chip med skill-type-ikon og "Prøv denne →"-lenke).

**Custom block types:**
- `hb.codeBlock` — { `filename`, `language` (enum), `code` (required), `highlightLines` (string, f.eks. "1,3-5"), `showLineNumbers` (boolean) }
- `hb.codeGroup` — { `snippets`: array av `hb.codeBlock`, min 2, max 6 } — rendres som tabs
- `hb.callout` — { `variant` ("info" | "warning" | "tip" | "deprecated"), `title` (optional), `content` (nested Portable Text, begrenset) }
- `hb.image` — utvidet bilde med `alt` (required), `caption`
- `hb.embed` — { `url`, `title` } — YouTube, CodeSandbox, StackBlitz via URL-parsing i frontend
- `hb.snippetRef` — reference til `hb.codeSnippet`
- `hb.skillEmbed` — { `skill`: reference til `hb.aiSkill` (required), `displayMode`: `"card"` | `"full"` }
  - `card`: kompakt — tittel, summary, skill-type-badge, "Copy prompt"-knapp
  - `full`: hele artefaktet inline — systemPrompt, variables, copy-knapp per felt. Brukes når redaktøren vil vise prompten i kontekst uten at leseren navigerer bort
- `hb.decisionRecord` — { `context` (text), `decision` (text), `consequences` (text) } — ADR-inspirert blokk for å begrunne anbefalinger
- `hb.checklist` — { `title` (optional), `items`: array av `{ text, optional: boolean }` } — rendres med avkrysningsbokser i frontend (visuelt, ikke persistent). Eksporteres som GitHub Flavored Markdown task list.
- `hb.stepList` — { `steps`: array av `{ title, description: Portable Text (begrenset), role: string, duration: string }` } — steg med ansvarlig rolle og tidsestimat. Beregnet for metodikk-guides.
- `hb.diagramBlock` — { `diagramType` ("flowchart" | "sequence" | "er" | "architecture" | "mindmap"), `code` (text, Mermaid-markup, required), `caption` (string) } — rendres som SVG via Mermaid.js i frontend
- `hb.hotspotFigure` — { `image` (Sanity image asset, required), `alt` (string, required), `caption` (string), `hotspots`: array av `{ key, x (number 0–100), y (number 0–100), label (string), content (Portable Text, begrenset) }` } — bilde med klikkbare forklaringspunkter
- `hb.conceptModel` — { `variant` ("double-diamond" | "two-by-two" | "phases" | "comparison"), `title` (string), `description` (string), `items`: array av `{ label, sublabel, content (Portable Text, begrenset), color (optional) }` } — strukturert konseptuell modell rendret som dedikert React-komponent per variant

### Validering
- `hb.article.title`: required, max 80 tegn
- `hb.article.summary`: required, max 200 tegn
- `hb.article.slug`: unik innenfor samme section (custom async validator)
- `hb.article.supersededBy`: tillatt og anbefalt kun når maturity = `deprecated`
- `hb.codeBlock.code`: required
- `hb.callout.content`: min 1 blokk
- `hb.image.alt`: required
- `hb.navigation`: singleton via structure builder
- `hb.aiSkill.artifact`: required — minst ett felt må være utfylt
- `hb.aiSkill.testedWith`: custom validator som advarer hvis ingen entries finnes (ikke blokkerer publisering, men viser warning)
- `hb.aiCollection.skills`: min 2 skills
- `hb.diagramBlock.code`: required, min 10 tegn
- `hb.hotspotFigure.image`: required
- `hb.hotspotFigure.alt`: required
- `hb.hotspotFigure.hotspots[].x` og `.y`: number 0–100
- `hb.conceptModel.items`: min 2 elementer

---

## Studio-opplevelse for handbook-workspacet

Handbook-workspacet skal føles som en dedikert app. Redaktører som kun jobber med håndboken skal aldri trenge å forlate dette workspacet.

**Structure builder** — egne grupper for handbook:
- "Documentation"
  - Artikler gruppert per `hb.section`
  - "Drafts"
  - "Needs review" (lastVerifiedAt mangler eller > 6 mnd siden)
  - "Deprecated"
  - "Exploratory"
- "Methods"
  - Guides per `hb.section`
  - Templates
  - Principles
  - Living documents (`isLivingDocument = true`)
- "AI Skills"
  - Gruppert per `skillType` (Prompts, Workflows, Evaluations)
  - Collections
  - "Needs testing" (lastVerifiedAt > 3 måneder — kortere enn artikler siden modeller oppdateres hyppig)
  - "Model-agnostic" (targetModel includes "model-agnostic")
- "Navigation" (singleton)
- "Taxonomy" (Sections, Expertises, Roles, Glossary)
- "People" (Contributors)
- "Reusable" (Code snippets)

**Custom preview for `hb.article`**: section-navn + maturity som fargekodet subtitle. Warning-icon hvis lastVerifiedAt mangler eller er utdatert. Deprecated-artikler visuelt dempet.

**Orderable document lists** via `@sanity/orderable-document-list` for `hb.section`.

**Custom input components:**
- `hb.codeBlock.code`: bruk `@sanity/code-input` med syntax highlighting basert på `language`-feltet
- `highlightLines`: custom input med helpertekst ("1,3-5,8")
- `maturity`: radio-gruppe med fargede badges og én-linje forklaring per verdi
- `hb.aiSkill.artifact`: conditional rendering basert på `skillType` — vis kun relevante felter. Systemprompten bruker `@sanity/code-input` med language='markdown'. Variables-arrayet har inline preview som viser hvordan userPromptTemplate ser ut med eksempelverdier substituert.
- `hb.aiSkill.testedWith`: custom list-input med "Add test result"-knapp og dato-velger. Siste test-dato vises som badge på dokumentet i listevisning.
- `hb.diagramBlock.code`: Monaco-editor med Mermaid syntax highlighting og live SVG-preview i samme panel (bruk `@sanity/code-input` med language='markdown' som fallback hvis Monaco ikke er tilgjengelig). Redaktøren ser resultatet mens de skriver.
- `hb.hotspotFigure`: custom input-komponent — viser bildet i full bredde, klikk plasserer ny hotspot som absolutt-posisjonert sirkel. Koordinater lagres som prosent (0–100) av bildedimensjonene. Eksisterende hotspots er draggable. Klikk på hotspot åpner inline-skjema for label og content.
- `hb.conceptModel.variant`: visuell radio-gruppe som viser en miniatyr av hver variant så redaktøren forstår hva de velger.

**Document actions:**
- "Mark as verified" — setter `lastVerifiedAt` til nå
- "Mark as deprecated" — setter maturity til deprecated, åpner felt for supersededBy
- "Duplicate as new article" — kopierer innhold, nullstiller slug og maturity
- "Test this skill" (kun på `hb.aiSkill`) — åpner en modal der redaktøren kan sende prompten til Anthropic API direkte fra Studio og lagre resultatet i `testedWith`. Implementeres som custom document action med en API-route i handbook-appen (`/api/test-skill`) som proxyer kallet. Krever `HANDBOOK_ANTHROPIC_API_KEY` i Studio-miljøvariabler.

**Desk-preview** (split pane): `@sanity/presentation` med Visual Editing. Preview-URL peker på `localhost:3000/devdocs` i dev og produksjons-URL i prod.

**Field groups på `hb.article`:**
- "Content" (title, slug, section, summary, body)
- "Classification" (expertises, maturity, supersededBy)
- "Metadata" (contributors, lastVerifiedAt, hidden)
- "Relations" (relatedArticles)

---

## Frontend

### URL-struktur

Artikler har URL-mønsteret `/devdocs/[section-slug]/[article-slug]`. `basePath: '/devdocs'` er satt i `next.config.ts`, så Next.js-rutene trenger ikke prefikset:

```
app/
  [section]/
    [slug]/
      page.tsx          — artikkel-siden
      route.ts          — .md-variant (copy as markdown)
    page.tsx            — section-forside (liste over artikler)
  guides/
    [slug]/
      page.tsx          — guide-siden
      route.ts          — .md-variant
    page.tsx            — liste over alle guides
  glossary/
    page.tsx
  principles/
    page.tsx            — alle prinsipper
  ai-skills/
    page.tsx            — bibliotek-oversikt med filtre
    [slug]/
      page.tsx          — enkelt skill
      route.ts          — .md-eksport (prompt + forklaring)
      plain/route.ts    — ren tekst-eksport av prompt (for direkte kopiering inn i AI-verktøy)
  page.tsx              — handbook-forside
  layout.tsx
  api/
    draft/route.ts
    disable-draft/route.ts
```

`section` i URL matcher `hb.section.slug`. `slug` er unik innenfor den sectionen. Ukjent section eller slug → 404.

### Layout

Tre-kolonners desktop-layout:

1. **Venstre sidebar** (~280px, fixed, uavhengig scroll): kuratert navigasjon fra `hb.navigation`. Kollapsbare grupper. Aktiv lenke highlighted. Øverst: expertise-filter (chips) som filtrerer sidebaren i sanntid — valgte expertises skjuler artikler som ikke har dem.
2. **Midt-kolonne** (max ~720px): øverst en metadata-rad med maturity-badge, expertise-chips, sist verifisert, bidragsytere (avatarer med tooltip).
3. **Høyre sidebar**: "On this page" fra H2/H3. Scroll-spy med IntersectionObserver. Skjul under `lg`.

Header: brand-navn, søk-stub (dialog med "Coming soon"), theme-toggle (light/dark/system).
Mobile: sidebar som drawer, "On this page" som dropdown.

### Maturity-visning

- **established**: grønn badge
- **recommended**: blå badge
- **exploratory**: gul badge + banner: "Dette mønsteret er under utforskning. Del gjerne erfaringer."
- **deprecated**: rød badge + banner: "Denne anbefalingen er utdatert." Lenk til supersededBy hvis satt. Dempet brødtekst.

### Datahenting

- All henting i RSC. Ingen `useEffect`-datahenting.
- `next-sanity` med `defineLive` for draft mode.
- `apps/handbook/src/sanity/queries.ts` med typede GROQ-spørringer: `articleBySlugQuery`, `navigationQuery`, `allExpertisesQuery`, `glossaryQuery`, `sectionBySlugQuery`, `aiSkillBySlugQuery`, `allAiSkillsQuery` (med filter-parametre for `skillType`, `expertise`, `targetModel`, `maturity`), `aiCollectionsQuery`.
- `sanity typegen generate` — commit genererte typer.
- `generateStaticParams` for alle `[section]/[slug]`-kombinasjoner.
- **Ingen aggressiv CDN-caching** — auth kommer senere. Bruk `revalidate = 60` som default, ikke `force-static`.

### Portable Text-rendering

`apps/handbook/src/components/portable-text/index.tsx`:

- **`CodeBlock`**: `shiki` for highlighting. Filnavn som header-rad. Copy-knapp. Highlighted lines.
- **`CodeGroup`**: Tabs-komponent fra designsystemet hvis tilgjengelig, ellers bygg en enkel keyboard-navigerbar tab-primitiv. Filnavn som labels.
- **`Callout`**: Alert/notice-komponent fra designsystemet hvis tilgjengelig, ellers lag en handbook-spesifikk komponent. Lucide-ikoner per variant (Info, AlertTriangle, Lightbulb, AlertOctagon). Nestet PortableText i content.
- **`DecisionRecord`**: strukturert kort — Context / Decision / Consequences i tydelig ramme.
- **`InternalLink`**: Next `<Link>` med section-prefiks: `/[section-slug]/[article-slug]`. Finn section-slug via articleens section-referanse.
- **`GlossaryRef`**: Popover/tooltip fra designsystemet hvis tilgjengelig, ellers lag en enkel hover-card. Viser definisjonen inline med lenke til `/glossary#[slug]`.
- **`Embed`**: gjenkjenn YouTube/CodeSandbox/StackBlitz via URL-parsing. Ukjente URLer → lenke-kort.
- **`SkillEmbed`**: hent skill via reference-ID. `card`-modus: kompakt kortkomponent med skill-type-ikon (Wand for prompt, GitBranch for workflow, CheckSquare for evaluation), tittel, summary, maturity-badge, og "Copy prompt"-knapp som kopierer `artifact.systemPrompt` til clipboard. `full`-modus: ekspandert visning med alle artifact-felter, copy-knapp per felt, variable-liste med eksempelverdier. Begge moduser lenker til `/devdocs/ai-skills/[slug]`.
- **`SkillRef`** (annotation): inline chip — `[⚡ Skill-navn →]`. Klikk navigerer til skill-siden.
- **`DiagramBlock`**: importer og initialiser Mermaid.js client-side (`dynamic` import med `ssr: false`). Render SVG i en scrollbar container. Fallback: vis raw Mermaid-kode i en `<pre>`-blokk hvis Mermaid feiler. `caption` under diagram.
- **`HotspotFigure`**: `position: relative` container med Sanity-bilde. Hotspots rendres som absolutt-posisjonerte prikker på `(x%, y%)` med pulserende CSS-animasjon. Klikk/hover åpner et Popover (fra designsystemet eller en enkel custom implementasjon) med `label` og `content`. På mobil: klikk åpner et bottom sheet. Alle hotspots er keyboard-navigerbare (tab + enter).
- **`ConceptModel`**: én React-komponent per variant. `double-diamond`: fire faser i en horisontal rad, veksler mellom diverge/converge, klikk fase åpner detalj. `two-by-two`: 2×2-grid med aksemerking, klikk kvadrant highlighter den. `phases`: horisontal tidslinje, klikk fase åpner innhold. `comparison`: tabell med header-rad og innholdsrader. Alle varianter skal se konsistente ut og bruke designsystemets tokens.
- **`Checklist`**: rendres som liste med visuell checkbox per item (`optional`-items er merket). State er ikke persistent — kun visuelt for leseopplevelsen. Eksporteres som `- [ ] tekst` i markdown-konverteren.
- **`StepList`**: nummererte steg med tittel, innhold, rolle-badge og varighet. Rolle vises som en chip ved siden av steg-nummeret.

H2 og H3 rendres med `id` basert på slugifisert tekst — grunnlag for "On this page".

### Spesifikke features

**"On this page"**: server-side parser av `body`-array → `{ id, text, level }[]` fra alle `style: 'h2' | 'h3'`-blokker. Client-side scroll-spy for aktiv highlighting.

**Kuratert sidebar**: rendres fra `hb.navigation`. Rekursiv komponent for nestede grupper. Åpen/lukket state i localStorage per gruppe-id. Expertise-filter skjuler/viser items basert på artiklenes `expertises`.

**Related articles**: manuelt kuraterte `relatedArticles` vises først. Fallback: andre artikler i samme section eller med overlappende expertises, maks 4, ekskluder gjeldende og deprecated.

**Related AI Skills**: egen seksjon nederst på artikkel- og guide-siden, visuelt skilt fra related articles. Viser manuelt kuraterte skills fra `relatedSkills`-feltet. Rendres som en horisontal liste av kompakte skill-kort. Tydelig visuelt skille fra øvrig innhold — leser skal umiddelbart forstå at dette er noe de *gjør*, ikke noe de *leser*.

**AI Skills-biblioteket** (`/devdocs/ai-skills`):
- Filterpanel øverst: `skillType` (Prompt / Workflow / Evaluation), `expertise` (chips), `targetModel` (Claude / GPT-4 / Gemini / Model-agnostic), `maturity`
- Skill-kort i et grid: viser tittel, summary, skill-type-ikon, targetModel-badges, maturity-badge, sist testet
- Filtrering skjer client-side (all data lastes én gang, filtreres i React state) siden biblioteket er lite
- Sortering: nylig oppdatert (default), maturity, alfabetisk
- Collections vises øverst som kuraterte pakker med eget kortformat

**Copy as markdown**: knapp øverst på artikkel. To varianter:
- "Copy" — kopierer til clipboard
- "View raw" — åpner `/devdocs/[section]/[slug].md` (egen route handler)

`portableTextToMarkdown`-converter håndterer alle custom typer: `codeBlock` → fenced code, `callout` → blockquote med prefiks, `decisionRecord` → strukturert seksjon med H3-overskrifter, `checklist` → GFM task list (`- [ ] tekst`), `stepList` → nummerert liste med rolle i parentes, `diagramBlock` → Mermaid fenced code block (` ```mermaid `), `hotspotFigure` → bilde med liste over hotspot-labels som footnotes, `conceptModel` → strukturert seksjon tilpasset variant, `skillEmbed` → fenced code block med prompt-innhold + metadata-header. Gjør artikler og guides AI-vennlige.

AI Skill-siden har i tillegg en dedikert `.txt`-eksport (`/devdocs/ai-skills/[slug]/plain`) som kun inneholder selve prompten — ingen markdown-formatering, ingen forklaringstekst. Dette er den raskeste veien fra håndbok til AI-verktøy.

### Design

Inspirert av sanity.io/docs layout, men ikke kopiert. Eget visuelt uttrykk:

- **Typografi og farger**: følg designsystemets tokens og CSS-variabler — ikke introduser egne fargeverdier. Hent faktiske verdier fra designsystemets preset i trinn 1.
- **Monospace-font for kode**: bruk designsystemets kode-font hvis definert, ellers JetBrains Mono via `next/font` som fallback.
- **Dark mode**: ekte dark mode basert på designsystemets dark-mode-tokens. Tilpassede shiki-temaer som matcher designsystemets bakgrunns- og tekstfarger i lys/mørk modus.
- **Prose-styling**: custom Tailwind typography-konfig som bruker designsystemets typografi-tokens for linjelengde, linjehøyde og font-størrelser.

---

## Ikke-krav

- Ikke SEO, sitemap, OG-images, robots.txt
- Ikke søk — stub med "Coming soon"-dialog
- Ikke auth — men gjør ingen antagelser som kolliderer med å legge det til (ingen hard CDN-caching, ikke `export const dynamic = 'force-static'` på artikler)
- Ikke kommentarer, reactions, analytics
- Ikke i18n nå — men ikke gjør URL-strukturen umulig å utvide til `[locale]/[section]/[slug]` senere
- Ikke rør eksisterende workspaces, apper eller schema i monorepoet

---

## Leveranse

1. `README.md` i rot — env-variabler, `pnpm install`, `pnpm dev`, `pnpm seed`, `pnpm typegen`. Inkluder et avsnitt om hva som trengs ved fremtidig monorepo-integrasjon.
2. `ARCHITECTURE.md` i rot — dokumenttyper, URL-struktur, og begrunnelse for: hb.-prefiks på typenavn, navigation som egen dokumenttype, maturity + lastVerifiedAt som eksplisitte felt, expertise separat fra section, basePath-valget, hvorfor article og guide er separate dokumenttyper, valget om å bruke Mermaid fremfor embedded SVG, hotspot-koordinater som prosent fremfor piksler, hvorfor aiSkill har strukturert artifact-felt fremfor fritekst, hvorfor testedWith er et eksplisitt logg-felt, valget om client-side filtrering i AI Skills-biblioteket, hvilke tilpasninger som trengs ved fremtidig monorepo-integrasjon (basePath, hb.-prefiks-begrunnelse, egne env-vars per workspace)
3. Seeding (`pnpm seed`): 5 sections, 6 expertises, 3 contributors, 10 articles (blandet maturity, realistisk body med codeBlocks, codeGroups, callouts, minst én decisionRecord, minst én diagramBlock, minst én hotspotFigure, minst én conceptModel, internalLinks), 3 guides (inkl. én med double-diamond conceptModel og én med checklist + stepList), 2 templates, 3 principles, 4 roles, 6 aiSkills (2 prompts, 2 workflows, 2 evaluations — blandet targetModel og expertise, alle med minst én testedWith-entry), 2 aiCollections, 1 navigation, 5 glossaryTerms
4. `pnpm dev` fra monorepo-roten starter alt inkludert handbook-appen
5. Frontend ser profesjonell og ferdig ut — ikke en boilerplate

---

---

# DEL 2 — VISUELL SPESIFIKASJON

Designsystemet heter **Lasso DS** og ligger i `packages/design-system/`.
Alle token-referanser (farger, spacing, typografi) skal hentes fra Lasso DS.
Ikke hardkod hex-verdier — bruk CSS custom properties fra designsystemet.

Skissene i `docs/design/` viser "acme · handbook" som brand-navn og
"INTERNAL V2.4" som versjon. I koden brukes plassholderverdier som kan
konfigureres via miljøvariabler.

## Globalt

### Layout-shell

Desktop har to soner:
1. **Venstre sidebar** — fast bredde ~220px, hvit bakgrunn, uavhengig scroll
2. **Innholdsområde** — resten av bredden, lys grå bakgrunn (`--color-background-tertiary` eller tilsvarende)

Header ligger øverst i innholdsområdet (ikke over sidebaren) og inneholder:
- Venstre: ikon + "Dev Handbook" — lenker til forsiden
- Høyre: søkefelt (full bredde, placeholder "Søk etter artikler, mønstre..."), deretter ikon-gruppe: lys/mørk/system-toggle (3 ikoner: sol, måne, skjerm), bruker-avatar (lilla sirkel med initialer "KN")

Søkefeltet i header er kompakt med avrundede kanter og `⌘K`-snarvei-hint til høyre.

### Sidebar (venstre)

Øverst i sidebaren:
- Brand: "acme · handbook" i bold, stor tekst
- Undertekst: "INTERNAL V2.4" i liten caps, dempet farge

Deretter en tynn separator og seksjonsnavigasjon:
- Seksjon-header: "HANDBOOK" label i all-caps, veldig liten, dempet
- Seksjoner er kollapsbare grupper med en pil/chevron til venstre
- Aktiv seksjon er ekspandert og viser undersider som innrykket liste
- Underside-lenker har subtil venstre-innrykk (~16px) og ingen ikon
- Aktiv lenke: lilla bakgrunn (`--color-purple-50` eller tilsvarende), lilla tekst
- Hover: veldig subtil bakgrunn
- Seksjonstitlene (Getting started, Frontend, Backend, etc.) er i medium vekt

På artikkel-siden har sidebaren et ekstra panel øverst:
- "FILTER BY EXPERTISE"-label i all-caps, liten
- Chips for expertises: Frontend, Backend, Infrastructure, Security, AI, Data
- Aktiv chip: lilla bakgrunn og tekst (samme som aktiv lenke)
- Inaktiv chip: grå, outline

### Typografi (utled fra skissene, bruk Lasso DS-tokens)

- Herooverskrift (forside): veldig stor, bold, mørk — sannsynligvis ~48–56px
- H1 (artikkel/guide): ~32px, bold, mørk lilla/nesten sort (`--color-purple-900` eller `--color-text-primary`)
- H2: ~20–22px, bold, samme farge
- H3: ~16–18px, bold
- Brødtekst: ~14–15px, normal vekt, god linjehøyde (~1.6)
- Metadata/labels: 12px, dempet
- Kode (inline): monospace, lilla bakgrunn, liten padding
- All norsk tekst i skissene er eksempel-innhold — ikke en språkrestriksjon

### Fargepalett (utled fra Lasso DS)

Primærfarge: lilla — brukes på aktive tilstander, lenker, maturity-badges, knapper
- Mørk lilla (tekst/headings): ca. `#1a1560` eller `--color-purple-900`
- Medium lilla (interaktive elementer): ca. `#4f46e5` eller `--color-purple-600`
- Lys lilla (bakgrunner): ca. `#eeedfe` eller `--color-purple-50`

Nøytrale:
- Sidebarbakgrunn: hvit
- Innholdsområde: veldig lys grå
- Kortbakgrunn: hvit med subtil border og svak skygge

Semantiske farger for maturity-badges og callouts — se komponent-seksjoner under.

---

## Forside (`/`) — ref: 01-forside.png, 02-forside_mobil.png

### Desktop

Innholdsområdet har maks-bredde ~900px, sentrert.

**Hero-seksjon:**
- Label øverst: "HANDBOOK · V2.4" i liten caps, lilla, bold — liten spacing mellom bokstavene
- H1: "Best practices, med kilde i kode." — veldig stor, bold, mørk lilla/nesten sort, to linjer
- Ingress under: to linjer med normal tekst, dempet farge
- Søkebar: full bredde av innholdskolonnen, høy (~48px), hvit bakgrunn, avrundede kanter, søkeikon til venstre, `⌘K`-hint og globus-ikon til høyre

**"Browse by area"-seksjon:**
- Seksjonstittel til venstre, "All sections →"-lenke til høyre
- 3×2 grid av seksjonskort
- Hvert kort: hvit bakgrunn, avrundet, subtil border, padding ~24px
  - Ikon øverst til venstre (Lucide outline, lilla, ~24px)
  - Tittel: bold, mørk lilla, ~16px
  - Beskrivelse: normal, dempet, ~14px
  - Bunn-rad: artikkeltall til venstre (dempet), "Åpne ↗"-lenke til høyre i lilla

**"Recently updated"-seksjon:**
- Seksjonstittel + "Full changelog →"-lenke
- 2-kolonners grid av artikkelkort (se ArticleCard-komponent under)

### Mobil (02-forside_mobil.png)

- Sidebar skjult, erstattet av hamburger-meny øverst til venstre
- Header: sentrert brand-navn, avatar til høyre
- Hero stacker vertikalt, søkebar full bredde
- Seksjonskort: én kolonne, hvert kort full bredde
- "Browse by area"-grid: 1 kolonne

---

## Artikkel-siden — ref: 03-artikkel.png, 04-artikkel-mobil.png, 05-artikkel-body.png

### Desktop — tre-kolonners layout

**Venstre sidebar:** se Globalt — sidebar. Expertise-filter vises øverst.

**Midtkolonne (max ~680px):**

Breadcrumb øverst: "🏠 › Handbook › Backend › Postgres-migrasjoner i prod" — liten, dempet, med ikon

Metadata-rad under breadcrumb (én linje):
- Maturity-badge (se komponent)
- Ekspertise-chips: "Backend", "Infrastructure" — grå outline, liten
- "Last verified 3. jan 2025" — dempet, liten
- Bidragsyter-avatar til høyre: liten sirkel med initialer, tooltip med navn

Knapper på samme linje øverst til høyre i innholdskolonnen:
- "Copy as markdown" — tekst med ikon, outline-stil
- "View raw ↗" — lenke-stil

H1: stor, bold, mørk lilla — kan brekke over to linjer

Ingress/summary: normal tekst, litt større enn brødtekst (~15px), litt mer luft under

Deretter body (Portable Text-komponenter — se under).

**Høyre sidebar ("På denne siden", ~200px):**
- Label: "PÅ DENNE SIDEN" i all-caps, liten, dempet
- Liste med H2/H3-headings som lenker — H2 normal vekt, H3 med litt innrykk
- Aktiv seksjon: lilla farge, litt bolder
- "Se også"-lenke under listen
- "Lesetid: ~7 minutter" helt nederst, dempet

### Mobil (04-artikkel-mobil.png)

- Sidebar skjult (hamburger)
- Høyre sidebar erstattet av "ON THIS PAGE"-dropdown øverst i innholdet, kollapsbar
- Breadcrumb og metadata-rad stacker
- Bidragsytere vises som navn, ikke bare avatar
- Alle Portable Text-blokker full bredde

---

## Portable Text-komponenter — ref: 03-artikkel.png, 05-artikkel-body.png

### Kodeblokk (CodeBlock)

**Med filnavn og highlighted line:**
- Mørk bakgrunn (~`#1a1a2e` eller designsystemets dark code-token)
- Header-rad øverst: filnavn til venstre i monospace liten tekst (dempet hvit), språk-label, "Copy"-knapp til høyre
- Linjenumre til venstre, dempet
- Highlighted linje (linje 3 i eksemplet): subtil lysere bakgrunn på hele linjen
- Syntaks-highlighting: SQL-keywords i gult/amber, strenger i grønn, kommentarer i grå
- Border-radius ~8px

**Uten filnavn:**
- Samme mørke bakgrunn, ingen header-rad, bare kode

### CodeGroup (tabs)

- Tab-bar øverst: "flyway.conf", "deploy.sh", "rollback.sh" — tab-stil med aktiv tab understreket eller med bakgrunn
- "Copy"-knapp øverst til høyre
- Innhold som CodeBlock under

### Callout

Fire varianter, alle med avrundet hjørner, ikon til venstre, tittel i bold, beskrivelse under:

**Info (blå):**
- Bakgrunn: lys blå (`--color-background-info`)
- Ikon: sirkel-i, blå
- Tittel og tekst i blå nyanser

**Warning (amber/oransje):**
- Bakgrunn: lys amber (`--color-background-warning`)
- Ikon: trekant med utropstegn, amber
- Tittel og tekst i amber nyanser

**Tip (grønn):**
- Bakgrunn: lys grønn (`--color-background-success`)
- Ikon: lyspære, grønn
- Tittel og tekst i grønne nyanser

**Deprecated (grå):**
- Bakgrunn: lys grå (`--color-background-secondary`)
- Ikon: klokke/arkiv, grå
- Tekst dempet grå
- Brukes til "Utgår 2025-Q3"-type meldinger

### DecisionRecord

Strukturert kort med lilla venstre-border (~3px) og lys lilla bakgrunn:
- Header-rad: "# ADR 014 — EXPAND/CONTRACT-MØNSTER FOR SKJEMAENDRINGER" — monospace-font, liten, all-caps
- Tre rader: CONTEXT / DECISION / CONSEQUENCES som label i venstre kolonne (bold, all-caps, liten, dempet), innhold til høyre
- Subtil border mellom radene

### DiagramBlock (Mermaid)

Ramme med header-rad:
- Header: "↕ Mermaid · sequenceDiagram" til venstre, "Copy Mermaid"-knapp til høyre
- Hvit/lys bakgrunn inne i rammen
- Diagrammet rendret som SVG — ingen syntaksfarge, rent visuelt
- Caption under diagrammet i liten, dempet tekst
- Loading-state: spinner + "Renderer diagram..." sentrert
- Error-state: info-ikon + "Klarte ikke rendre diagrammet." + rå Mermaid-kode i mørk blokk under

### HotspotFigure

Se 05-artikkel-body.png og 13-komponenter-03.png:
- Bildet i full bredde av innholdskolonnen
- Hotspot-prikker: hvit sirkel med lilla fill, nummerert (1, 2, 3)
- Default: to inaktive prikker (outline, ingen fill) + én pulserende ring rundt aktiv
- Hover: prikken forstørres lett
- Active/focus: prikk fylles, popover åpner seg under eller ved siden av
- Popover: hvit bakgrunn, avrundet, liten skygge, tittel i bold, beskrivelse under
- Caption under bildet

### Related articles

Seksjon nederst på artikkel-siden, tittel "Related articles":
- 3 artikkelkort side om side (se ArticleCard)

---

## Guide-siden — ref: 06-metode.png, 07-metode-mobil.png

### Desktop

Samme tre-kolonners layout som artikkel.

**Metadata-rad:**
- "RECOMMENDED"-badge
- Expertise-chips: Frontend, Backend, Ways of working
- "ca. 2-4 timer" med klokke-ikon
- "roller: Tech Lead, Fasilitator" med person-ikon
- Verified-dato
- Bidragsyter-avatarer

**Living document-banner** (vises når `isLivingDocument = true`):
- Lys lilla bakgrunn, penn-ikon til venstre
- Tekst: "Levende dokument. Denne guiden oppdateres etter hvert som mønsteret modnes. Bidra gjerne."
- Ingen tittel, kun ikon + tekst

**Fase-navigator** (dobbel-diamond):
- Horisontal rad med 4 nummererte faser: 1 Discover · 2 Define · 3 Develop · 4 Deliver
- Aktiv fase: lilla tekst, lilla understrek eller bakgrunn
- Klikk på fase scroller til seksjonen

Fase-oversikt (ConceptModel — se komponent under i full størrelse):
- Aktiv fase (Discover) vises med lilla fill på romben
- Under: detaljpanel med fade-in som viser fasebeskrivelse

**"Slik kjører du en Discover-fase":**
StepList-komponent (se under)

**"Sjekkliste — klar for Define?":**
Checklist-komponent (se under)

**Høyre sidebar:**
Samme "PÅ DENNE SIDEN"-struktur, men med en ekstra seksjon:
- "Fase" label
- "1 - Discover" som aktiv fase

### Mobil (07-metode-mobil.png)

- Fase-navigator scrollbar horisontalt
- ConceptModel viser mini-romber i en rad
- StepList stacker vertikalt
- Checklist full bredde

---

## Glossary — ref: 08-glossary.png, 09-glossary-mobil.png

### Desktop

To-kolonners layout: sidebar til venstre (standard), innhold til høyre.
Ingen høyre sidebar ("På denne siden").

Innhold:
- H1: "Glossary"
- Ingress: "Fagbegreper og definisjoner brukt i håndboken."
- Alfabetisk hurtignavigasjon: én rad med bokstaver A–Z, aktiv bokstav i lilla filled chip, bokstaver uten oppføringer i dempet grå (ikke-klikkbare)
- Gruppert etter bokstav med stor bokstav som separator (H2-stil, lilla, ~24px)
- Hvert begrep: term i bold til venstre (~200px bred kolonne), definisjon til høyre — to-kolonners tabell-layout
- Subtil skillelinje mellom hvert begrep

### Mobil

- Hurtignavigasjon scrollbar horisontalt
- Begrepslayout stacker: term øverst, definisjon under (ikke lenger side-om-side)

---

## Komponenter — ref: 10-states-and-banners.png, 11-komponenter-01.png, 12-komponenter-02.png, 13-komponenter-03.png

### MaturityBadge

Fire varianter, alle med prikk til venstre og all-caps tekst, liten (~12px), avrundet pill-form:

| Variant | Prikk | Bakgrunn | Tekst |
|---------|-------|----------|-------|
| ESTABLISHED | grønn | lys grønn | mørk grønn |
| RECOMMENDED | lilla | lys lilla | mørk lilla |
| EXPLORATORY | amber/oransje | lys amber | mørk amber |
| DEPRECATED | rød | lys rød | mørk rød |

### Theme toggle

Tre ikoner i en gruppe: sol (lys), måne (mørk), skjerm (system)
- Aktiv: lilla bakgrunn på ikonet
- Inaktiv: transparent, grå ikon
- Avrundet gruppe-container med border

### Callout — alle varianter

Se Portable Text / Callout over.
Callout-varianten "deprecated" (fra komponent-skissene): grå bakgrunn, klokke-/arkiv-ikon, tekst som "Utgår 2025-Q3" + beskrivelse. Ikke samme som deprecated maturity-banner.

### ArticleCard

Hvit bakgrunn, avrundet, subtil border, padding ~16–20px:
- Øverst: maturity-badge + ekspertise-label (plain tekst, all-caps, dempet) på én linje
- Tittel: bold, ~15–16px, lilla lenke-farge, hover understreker
- Summary: 2 linjer maks, avkortet, normal vekt, dempet
- Bunn-rad: expertise-chips til venstre (grå outline), "Verified [dato]" til høyre (dempet, liten)

Maturity påvirker visuell behandling:
- Established: normal
- Recommended: normal
- Exploratory: normal
- Deprecated: hele kortet er dempet, tekst i grå, tittel ikke lilla

### Maturity-bannere (article banners)

To varianter som vises øverst i artikkelinnholdet:

**Exploratory-banner:**
- Lys amber bakgrunn
- Ikon: pulserende/roterende "under arbeid"-ikon, amber
- Tekst: "Under utforskning." i bold, amber — "Dette mønsteret er under utforskning. Del gjerne erfaringer." i normal tekst under

**Deprecated-banner:**
- Lys grå bakgrunn
- Ikon: klokke/arkiv, grå
- Tekst: "Denne anbefalingen er utdatert." i bold — "Se [lenke] → istedenfor." under

Deprecated-artikkel i kontekst: hele artikkelen vises med dempet innhold (lavere kontrast på brødtekst), deprecated-banneret øverst.

### Empty states

**Tom seksjon:**
- Sentrert innhold, dokument-ikon (~40px, lilla, lys bakgrunn sirkel rundt)
- Tittel: "Ingen artikler i denne seksjonen ennå." i lilla, bold
- Beskrivelse: dempet tekst under
- CTA-lenke: "Hvordan skrive en artikkel →"

**Tomt expertise-filter:**
- Sentrert innhold, filter-ikon (~40px, lilla, lys bakgrunn sirkel)
- Tittel: "Ingen artikler matcher de valgte filtrene." i lilla, bold
- Beskrivelse: dempet tekst
- Knapp: "Nullstill filter" — outline-stil

### DecisionRecord

Se Portable Text / DecisionRecord over.

### CodeBlock — varianter

Se Portable Text / CodeBlock over.

### ConceptModel — alle fire varianter (12-komponenter-02.png)

**Double-diamond (miniatyr):**
- Fire romber i en rad, like store, grå outline
- Aktiv rombe: lilla fill, lilla outline

**Double-diamond (full størrelse, aktiv fase):**
- Fire store romber i en rad med navn under (Discover, Define, Develop, Deliver)
- Aktiv (Discover): lilla fill med lilla tekst under
- Inaktive: grå outline/fill, grå tekst
- Detaljpanel under: hvit/lys bakgrunn, avrundet, "Discover" i bold, beskrivelse i normal tekst
- Klikkbar — klikk fase bytter aktiv og oppdaterer detaljpanelet

**Two-by-two:**
- 2×2 grid med aksemerking: "High effort ↑" langs Y-aksen, "Impact →" langs X-aksen
- Fire kvadranter: Quick wins (øvre venstre), Strategic (øvre høyre, lilla fill = aktiv), Maintain (nedre høyre), Avoid (nedre venstre)
- Aktiv kvadrant: lilla bakgrunn
- Aksetekst: liten, grå, rotert for Y-aksen

**Phases:**
- Horisontal rekke: nummerte sirkler (lilla fill med hvitt tall) + tekst + piler mellom
- Eksempel: ① Plan → ② Build → ③ Ship → ④ Learn

**Comparison:**
- Tabell med header-rad (Option A, Option B) og rader (Risk, Speed, Cost)
- Header: lys lilla bakgrunn
- Rader: alternerende hvit/veldig lys grå

### StepList (13-komponenter-03.png)

Hvert steg er en horisontal rad med:
- Venstre: lilla venstreborder (~3px), steg-nummer i bold lilla, innrykket
- Tittel i bold (~14px)
- Høyre side: rolle-chips (person-ikon + rollenavn, outline pill) og varighet-chip (klokke-ikon + tid)
- Under tittelen: beskrivelse i normal tekst, dempet
- Subtil separator mellom steg

### Checklist (13-komponenter-03.png)

Liste med avkrysningsbokser:
- Checked item: lilla fyllt checkbox, tekst med normal vekt (ikke strikethrough)
- Unchecked item: grå outline checkbox, tekst normal
- Optional item: unchecked, tekst i kursiv, grå — "VALGFRITT"-label til høyre i all-caps, dempet

### HotspotFigure — interaksjonstilstander (13-komponenter-03.png)

**Default — to inaktive prikker, én pulserende ring:**
- Inaktive: hvit sirkel med lilla border, liten
- Pulserende (aktiv/default): lilla filled sirkel med pulserende ring rundt (CSS animation)

**Hover — prikk i hover-state:**
- (Resten av bildet er kuttet i skissen — implementer som: prikken forstørres ~1.2x, cursor pointer, tooltip med label vises)

---

## AI Skills — ingen skisser

Ingen skisser finnes for AI Skills-biblioteket (`/ai-skills/`).

**Instruksjon til Claude Code:** Foreslå design basert på eksisterende designspråk fra skissene over og Lasso DS-tokens. Spesielt:
- Skill-kort skal ligne ArticleCard men med en skill-type-spesifikk venstrekant (3px solid): prompt = lilla, workflow = teal, evaluation = grønn
- Bibliotek-oversikten bruker samme filter-mønster som expertise-filter i sidebaren
- Quick copy-panelet på enkelt-skill-siden: sticky høyre kolonne, samme mørke bakgrunn som CodeBlock for prompt-visning
- Vis forslag i chat og vent på godkjenning før implementasjon

---

## Responsivt (oppsummering)

| Breakpoint | Sidebar | Høyre sidebar | Kolonner |
|------------|---------|---------------|----------|
| < 768px (mobil) | Skjult, hamburger drawer | Skjult, "On this page" dropdown | 1 kolonne |
| 768–1024px (tablet) | Skjult, hamburger drawer | Skjult | 1 kolonne |
| > 1024px (desktop) | Synlig, fast ~220px | Synlig, ~200px | 3 kolonner |

Seksjonskort-grid: 3 kolonner desktop → 1 kolonne mobil
ArticleCard-grid: 2 kolonner desktop → 1 kolonne mobil
Related articles: 3 kolonner desktop → 1 kolonne mobil

---

## Ikoner

Alle ikoner er Lucide outline. Eksempler fra skissene:
- Getting started: BookOpen
- Frontend: Monitor
- Backend: Server (eller Database)
- Infrastructure: GitBranch (eller Layers)
- Security: Shield
- Ways of working: Users
- Søk: Search
- Sol/Måne/Skjerm: Sun, Moon, Monitor
- Callout info: Info
- Callout warning: AlertTriangle
- Callout tip: Lightbulb
- Callout deprecated: Clock (eller Archive)
- Bidragsyter: User (avatar-fallback)
- Lesetid: Clock
- Rolle i StepList: User
- Varighet i StepList: Clock
- Copy: Copy
- View raw: ExternalLink
- Living document: PenLine (eller Edit)


---

# DEL 3 — SANITY-INTEGRASJON I EKSISTERENDE MONOREPO

## Før du begynner — les eksisterende kode

⚠️ **Obligatorisk første steg.** Les disse filene og lag en intern oppsummering
av hva du finner før du endrer noe:

```
turbo.json                          # eksisterende pipelines og task-avhengigheter
pnpm-workspace.yaml                 # hvilke glob-mønstre som allerede er aktive
apps/studio/sanity.config.ts        # eksisterende workspaces, plugins, schema
apps/studio/schemaTypes/index.ts    # hvilke typer som allerede eksisteres
apps/studio/package.json            # Sanity-versjon og eksisterende plugins
packages/*/package.json             # pakkenavn i designsystemet og andre shared packages
tsconfig.base.json (rot)            # base TypeScript-konfig
```

Spesifikt: finn ut
1. Hvilken Sanity-versjon som er installert (`@sanity/client`, `sanity`)
2. Om det allerede finnes en structure builder — og i så fall hvilken fil
3. Om `@sanity/presentation` allerede er installert
4. Om `@sanity/code-input` eller `@sanity/orderable-document-list` allerede er installert
5. Pakkenavnet på designsystemet (f.eks. `@acme/ui`, `@company/design-system`)
6. Om `turbo.json` allerede har en `typegen`-task

---

## Filstruktur som skal opprettes

Alle handbook-filer ligger under dedikerte undermapper. Ingenting utenfor
disse mappene skal endres — med to unntak dokumentert i seksjonen
"Filer som skal endres" under.

```
apps/studio/
  schemaTypes/
    handbook/                        ← NY mappe — all handbook-schema her
      index.ts                       ← barrel-eksport for alle hb.-typer
      documents/
        hb.section.ts
        hb.expertise.ts
        hb.role.ts
        hb.contributor.ts
        hb.glossaryTerm.ts
        hb.principle.ts
        hb.navigation.ts
        hb.article.ts
        hb.guide.ts
        hb.template.ts
        hb.aiSkill.ts
        hb.aiCollection.ts
        hb.codeSnippet.ts
      blocks/
        hb.codeBlock.ts
        hb.codeGroup.ts
        hb.callout.ts
        hb.decisionRecord.ts
        hb.checklist.ts
        hb.stepList.ts
        hb.diagramBlock.ts
        hb.hotspotFigure.ts
        hb.conceptModel.ts
        hb.embed.ts
        hb.snippetRef.ts
        hb.skillEmbed.ts
      annotations/
        hb.internalLink.ts
        hb.externalLink.ts
        hb.glossaryRef.ts
        hb.skillRef.ts
      portableText/
        hb.body.ts                   ← samlet body-felt-konfigurasjon
        hb.bodyLimited.ts            ← begrenset variant (for callout-innhold etc.)
  structure/
    handbook/                        ← NY mappe
      index.ts                       ← handbook structure builder
      filters.ts                     ← GROQ-filtre for needs-review, deprecated osv.
  actions/
    handbook/                        ← NY mappe
      markAsVerified.ts
      markAsDeprecated.ts
      duplicateArticle.ts
      testAiSkill.ts
  previews/
    handbook/                        ← NY mappe
      ArticlePreview.tsx
      GuidePreview.tsx
      AiSkillPreview.tsx
  inputs/
    handbook/                        ← NY mappe
      HotspotInput.tsx               ← custom hotspot-editor
      MaturityInput.tsx              ← fargekodet radio-gruppe
      HighlightLinesInput.tsx        ← hjelpe-tekst for linje-highlight
      ArtifactInput.tsx              ← conditional fields basert på skillType
      TestedWithInput.tsx            ← "Add test result"-liste
```

---

## Filer som skal endres

### 1. `apps/studio/sanity.config.ts`

⚠️ **Legg til, ikke erstatt.** Eksisterende workspaces skal være upåvirket.

```ts
// Legg til denne importen øverst
import { handbookWorkspace } from './structure/handbook'

// Eksisterende config ser sannsynligvis slik ut:
export default defineConfig([
  {
    // eksisterende workspace — RØR IKKE
    name: 'existing',
    // ...
  },
  // Legg til handbook som et nytt element i arrayet:
  handbookWorkspace,
])
```

`handbookWorkspace` eksporteres fra `apps/studio/structure/handbook/index.ts`
og definerer hele workspace-konfigurasjonen isolert.

Hvis eksisterende config ikke bruker array-formen (dvs. bare ett workspace):
```ts
// Før:
export default defineConfig({ name: 'existing', ... })

// Etter:
export default defineConfig([
  { name: 'existing', ... },   // eksisterende, uendret
  handbookWorkspace,            // nytt
])
```

### 2. `apps/studio/schemaTypes/index.ts`

⚠️ **Legg til, ikke erstatt.**

```ts
// Eksisterende eksporter — RØR IKKE
import { existingTypes } from './existing'

// Legg til:
import { handbookTypes } from './handbook'

export const schemaTypes = [
  ...existingTypes,   // eksisterende — uendret
  ...handbookTypes,   // nytt
]
```

Hvis filen bruker en annen eksport-struktur, tilpass tilsvarende.
Poenget er at handbookTypes legges til som et nytt spread — aldri inline.

### 3. `turbo.json`

Legg til `typegen`-task hvis den ikke finnes. Eksisterende tasks — RØR IKKE.

```json
{
  "tasks": {
    "typegen": {
      "dependsOn": ["^build"],
      "outputs": ["sanity.types.ts"]
    }
  }
}
```

Hvis `typegen` allerede finnes: verifiser at `outputs` inkluderer `sanity.types.ts`.

### 4. `pnpm-workspace.yaml`

Kun nødvendig hvis det finnes et nytt `packages/handbook-seed` eller lignende.
Sjekk eksisterende glob-mønstre — de dekker sannsynligvis allerede alt.

---

## Workspace-konfigurasjon

`apps/studio/structure/handbook/index.ts` eksporterer hele workspace-definisjonen:

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from '@sanity/presentation'
import { codeInput } from '@sanity/code-input'
import { orderableDocumentListDeskPlugin } from '@sanity/orderable-document-list'
import { handbookTypes } from '../../schemaTypes/handbook'
import { handbookStructure } from './structure'

const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL ?? 'http://localhost:3000'

export const handbookWorkspace = {
  name: 'handbook',
  title: 'Handbook',
  basePath: '/handbook',
  projectId: process.env.SANITY_STUDIO_HANDBOOK_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_HANDBOOK_DATASET ?? 'production',
  schema: {
    types: handbookTypes,
  },
  plugins: [
    structureTool({ structure: handbookStructure }),
    presentationTool({
      previewUrl: {
        draftMode: { enable: `${previewUrl}/api/draft` },
        origin: previewUrl,
      },
    }),
    codeInput(),
    orderableDocumentListDeskPlugin(),
  ],
  document: {
    actions: (prev, context) => handbookDocumentActions(prev, context),
  },
}
```

**Miljøvariabler for handbook-workspacet** — bruk egne variabler separert
fra eventuelle eksisterende Sanity-variabler:

```
SANITY_STUDIO_HANDBOOK_PROJECT_ID=   # Sanity prosjekt-ID for handbook
SANITY_STUDIO_HANDBOOK_DATASET=      # dataset-navn, default 'production'
SANITY_STUDIO_PREVIEW_URL=           # URL til Next.js-appen, default localhost:3000
```

Legg disse til i `.env.local` (Studio) og i `.env.example` i rot.

---

## Schema-implementasjon

### Navngivningskonvensjon

Alle typenavn har `hb.`-prefiks. Dette er ikke valgfritt — det forhindrer
navnekollisjon med eksisterende schema-typer i prosjektet.

```ts
// ✅ Riktig
export const hbArticle = defineType({
  name: 'hb.article',
  title: 'Article',
  type: 'document',
})

// ❌ Feil — kan kollidere med eksisterende 'article'-type
export const article = defineType({
  name: 'article',
  // ...
})
```

### Barrel-eksport

`apps/studio/schemaTypes/handbook/index.ts`:

```ts
// Dokumenttyper
import { hbSection } from './documents/hb.section'
import { hbExpertise } from './documents/hb.expertise'
import { hbRole } from './documents/hb.role'
import { hbContributor } from './documents/hb.contributor'
import { hbGlossaryTerm } from './documents/hb.glossaryTerm'
import { hbPrinciple } from './documents/hb.principle'
import { hbNavigation } from './documents/hb.navigation'
import { hbArticle } from './documents/hb.article'
import { hbGuide } from './documents/hb.guide'
import { hbTemplate } from './documents/hb.template'
import { hbAiSkill } from './documents/hb.aiSkill'
import { hbAiCollection } from './documents/hb.aiCollection'
import { hbCodeSnippet } from './documents/hb.codeSnippet'

// Blokk-objekter
import { hbCodeBlock } from './blocks/hb.codeBlock'
import { hbCodeGroup } from './blocks/hb.codeGroup'
import { hbCallout } from './blocks/hb.callout'
import { hbDecisionRecord } from './blocks/hb.decisionRecord'
import { hbChecklist } from './blocks/hb.checklist'
import { hbStepList } from './blocks/hb.stepList'
import { hbDiagramBlock } from './blocks/hb.diagramBlock'
import { hbHotspotFigure } from './blocks/hb.hotspotFigure'
import { hbConceptModel } from './blocks/hb.conceptModel'
import { hbEmbed } from './blocks/hb.embed'
import { hbSnippetRef } from './blocks/hb.snippetRef'
import { hbSkillEmbed } from './blocks/hb.skillEmbed'

// Annotations
import { hbInternalLink } from './annotations/hb.internalLink'
import { hbExternalLink } from './annotations/hb.externalLink'
import { hbGlossaryRef } from './annotations/hb.glossaryRef'
import { hbSkillRef } from './annotations/hb.skillRef'

export const handbookTypes = [
  // Dokumenttyper — rekkefølge påvirker Studio-visning i fallback
  hbSection, hbExpertise, hbRole, hbContributor,
  hbGlossaryTerm, hbPrinciple, hbNavigation,
  hbArticle, hbGuide, hbTemplate,
  hbAiSkill, hbAiCollection, hbCodeSnippet,
  // Objekter (ikke dokumenter — ingen egen Studio-liste)
  hbCodeBlock, hbCodeGroup, hbCallout, hbDecisionRecord,
  hbChecklist, hbStepList, hbDiagramBlock, hbHotspotFigure,
  hbConceptModel, hbEmbed, hbSnippetRef, hbSkillEmbed,
  hbInternalLink, hbExternalLink, hbGlossaryRef, hbSkillRef,
]
```

### Kritiske schema-detaljer

#### hb.body — Portable Text-konfigurasjon

Dette er det viktigste feltet i hele schemaet. Definer det som en gjenbrukbar
konfigurasjon i `portableText/hb.body.ts`:

```ts
import { defineArrayMember, defineField } from 'sanity'

export const hbBodyField = defineField({
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Blockquote', value: 'blockquote' },
        // ⚠️ Ingen H1 — tittelen er alltid H1
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Em', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          { type: 'hb.internalLink' },
          { type: 'hb.externalLink' },
          { type: 'hb.glossaryRef' },
          { type: 'hb.skillRef' },
        ],
      },
    }),
    // Custom blokk-typer
    defineArrayMember({ type: 'hb.codeBlock' }),
    defineArrayMember({ type: 'hb.codeGroup' }),
    defineArrayMember({ type: 'hb.callout' }),
    defineArrayMember({ type: 'hb.decisionRecord' }),
    defineArrayMember({ type: 'hb.checklist' }),
    defineArrayMember({ type: 'hb.stepList' }),
    defineArrayMember({ type: 'hb.diagramBlock' }),
    defineArrayMember({ type: 'hb.hotspotFigure' }),
    defineArrayMember({ type: 'hb.conceptModel' }),
    defineArrayMember({ type: 'hb.embed' }),
    defineArrayMember({ type: 'hb.snippetRef' }),
    defineArrayMember({ type: 'hb.skillEmbed' }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt-tekst',
          validation: r => r.required().error('Alt-tekst er påkrevd') }),
        defineField({ name: 'caption', type: 'string', title: 'Bildetekst' }),
      ],
    }),
  ],
})

// Begrenset variant — for callout-innhold, glossary-definisjoner etc.
// Ingen custom blokker, ingen H2/H3, kun normal + code + lister + lenker
export const hbBodyLimitedField = defineField({
  name: 'content',
  title: 'Innhold',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Em', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          { type: 'hb.internalLink' },
          { type: 'hb.externalLink' },
        ],
      },
    }),
    defineArrayMember({ type: 'hb.codeBlock' }),
  ],
})
```

#### hb.article — field groups

```ts
export const hbArticle = defineType({
  name: 'hb.article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'classification', title: 'Classification' },
    { name: 'metadata', title: 'Metadata' },
    { name: 'relations', title: 'Relations' },
  ],
  fields: [
    // Content-gruppe
    defineField({ name: 'title', type: 'string', group: 'content',
      validation: r => r.required().max(80) }),
    defineField({ name: 'slug', type: 'slug', group: 'content',
      options: { source: 'title' },
      validation: r => r.required().custom(async (slug, context) => {
        // Valider unikhet innenfor samme section
        // Se valideringseksempel under
      }),
    }),
    defineField({ name: 'section', type: 'reference', to: [{ type: 'hb.section' }],
      group: 'content', validation: r => r.required() }),
    defineField({ name: 'summary', type: 'text', rows: 3, group: 'content',
      validation: r => r.required().max(200) }),
    hbBodyField,  // importert fra portableText/hb.body.ts

    // Classification-gruppe
    defineField({ name: 'expertises', type: 'array', group: 'classification',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'hb.expertise' }] })] }),
    defineField({ name: 'maturity', type: 'string', group: 'classification',
      options: { list: [
        { value: 'established', title: 'Established — velprøvd, bredt brukt' },
        { value: 'recommended', title: 'Recommended — anbefalt, noe mindre erfaring' },
        { value: 'exploratory', title: 'Exploratory — under utforskning' },
        { value: 'deprecated', title: 'Deprecated — frarådet, bevart for kontekst' },
      ]},
      initialValue: 'recommended',
      components: { input: MaturityInput },  // custom input
    }),
    defineField({ name: 'supersededBy', type: 'reference', to: [{ type: 'hb.article' }],
      group: 'classification',
      hidden: ({ document }) => document?.maturity !== 'deprecated',
    }),
    defineField({ name: 'contentType', type: 'string', group: 'classification',
      options: { list: [
        { value: 'reference', title: 'Reference — oppslagsverk' },
        { value: 'tutorial', title: 'Tutorial — lær ved å gjøre' },
        { value: 'explanation', title: 'Explanation — bakgrunn og konsept' },
        { value: 'how-to', title: 'How-to — løs et konkret problem' },
      ]},
    }),

    // Metadata-gruppe
    defineField({ name: 'contributors', type: 'array', group: 'metadata',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'hb.contributor' }] })] }),
    defineField({ name: 'lastVerifiedAt', type: 'datetime', group: 'metadata' }),
    defineField({ name: 'isLivingDocument', type: 'boolean', group: 'metadata',
      initialValue: false }),
    defineField({ name: 'hidden', type: 'boolean', group: 'metadata',
      initialValue: false }),

    // Relations-gruppe
    defineField({ name: 'relatedArticles', type: 'array', group: 'relations',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'hb.article' }] })],
      validation: r => r.max(4),
    }),
    defineField({ name: 'relatedGuides', type: 'array', group: 'relations',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'hb.guide' }] })],
      validation: r => r.max(4),
    }),
    defineField({ name: 'relatedSkills', type: 'array', group: 'relations',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'hb.aiSkill' }] })],
      validation: r => r.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionTitle: 'section.title',
      maturity: 'maturity',
      lastVerifiedAt: 'lastVerifiedAt',
    },
    prepare({ title, sectionTitle, maturity, lastVerifiedAt }) {
      const isStale = !lastVerifiedAt ||
        new Date(lastVerifiedAt) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      return {
        title: title,
        subtitle: `${sectionTitle ?? ''} · ${maturity ?? ''}${isStale ? ' ⚠️' : ''}`,
      }
    },
  },
})
```

#### Slug-validering (unik innenfor section)

```ts
validation: r => r.required().custom(async (slug, context) => {
  if (!slug?.current) return true
  const { document, getClient } = context
  const client = getClient({ apiVersion: '2024-01-01' })
  const sectionId = (document as any)?.section?._ref
  if (!sectionId) return true

  const count = await client.fetch(
    `count(*[_type == "hb.article" && slug.current == $slug && section._ref == $sectionId && _id != $id])`,
    { slug: slug.current, sectionId, id: document._id.replace('drafts.', '') }
  )
  return count === 0 ? true : 'Slug er allerede i bruk i denne seksjonen'
}),
```

#### hb.navigation — singleton-håndtering

Navigation skal finnes i én instans. Håndteres i structure builder — ikke via
schema-validering (da validation kjøres per dokument, ikke globalt):

```ts
// I structure builder: vis eksisterende navigation direkte, ikke som liste
S.listItem()
  .title('Navigation')
  .child(
    S.document()
      .schemaType('hb.navigation')
      .documentId('handbook-navigation-singleton')
  )
```

Bruk alltid `_id: 'handbook-navigation-singleton'` i seed-scriptet så det
alltid er samme dokument.

#### hb.hotspotFigure — custom input-komponent

`inputs/handbook/HotspotInput.tsx` — viktige implementasjonsdetaljer:

```ts
// Koordinater lagres som prosent (0–100) av bildedimensjonene
// IKKE piksler — hotspots skalerer da korrekt på alle skjermstørrelser
type Hotspot = {
  _key: string
  x: number       // 0–100
  y: number       // 0–100
  label: string
  content: PortableTextBlock[]
}

// Klikk-handler: konverter klikk-koordinat til prosent
const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  // legg til ny hotspot på (x, y)
}
```

⚠️ Pass på at Sanity's image-pipeline (`@sanity/image-url`) ikke
cropper bildet på en måte som forskyvner hotspot-koordinatene.
Bruk `fit: 'clip'` (ikke `crop`) i frontend-bildekallet, eller pass
`rect`-parametere eksplisitt basert på `image.hotspot` og `image.crop`.

#### hb.diagramBlock — Mermaid live preview i Studio

`blocks/hb.diagramBlock.ts`:

```ts
defineField({
  name: 'code',
  type: 'text',
  title: 'Mermaid-kode',
  components: {
    input: (props) => (
      // Monaco-editor via @sanity/code-input med language='markdown'
      // + live SVG-preview under editoren
      // Bruk dynamisk import av mermaid.js i preview-komponenten
    )
  },
  validation: r => r.required().min(10),
})
```

#### hb.aiSkill — conditional artifact-felt

`documents/hb.aiSkill.ts` — `artifact`-feltet viser ulike underfelt basert på `skillType`:

```ts
defineField({
  name: 'artifact',
  type: 'object',
  fields: [
    // Prompt-felter
    defineField({ name: 'systemPrompt', type: 'text',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'prompt' }),
    defineField({ name: 'userPromptTemplate', type: 'text',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'prompt' }),
    defineField({ name: 'variables', type: 'array',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'prompt',
      of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
        defineField({ name: 'example', type: 'string' }),
      ]})] }),
    // Workflow-felter
    defineField({ name: 'steps', type: 'array',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'workflow',
      of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'prompt', type: 'text' }),
        defineField({ name: 'expectedOutput', type: 'text' }),
        defineField({ name: 'notes', type: 'text' }),
      ]})] }),
    // Evaluation-felter
    defineField({ name: 'criteria', type: 'array',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'evaluation',
      of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'label', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
        defineField({ name: 'scoringGuide', type: 'text' }),
      ]})] }),
    defineField({ name: 'rubric', type: 'text',
      hidden: ({ parent, document }) => (document as any)?.skillType !== 'evaluation' }),
  ],
  components: { input: ArtifactInput },
})
```

---

## Structure builder

`apps/studio/structure/handbook/index.ts`:

```ts
import { StructureBuilder } from 'sanity/structure'

export const handbookStructure = (S: StructureBuilder) =>
  S.list()
    .title('Handbook')
    .items([

      // ── DOCUMENTATION ──────────────────────────────
      S.listItem().title('Documentation').child(
        S.list().title('Documentation').items([

          // Artikler gruppert per section
          S.listItem().title('By section').child(
            S.documentTypeList('hb.section')
              .title('Sections')
              .child(sectionId =>
                S.documentList()
                  .title('Articles')
                  .filter('_type == "hb.article" && section._ref == $sectionId')
                  .params({ sectionId })
              )
          ),

          S.divider(),

          // Spesialvisninger
          S.listItem().title('📝 Drafts').child(
            S.documentList()
              .title('Drafts')
              .filter('_type in ["hb.article", "hb.guide"] && _id in path("drafts.**")')
          ),
          S.listItem().title('⚠️ Needs review').child(
            S.documentList()
              .title('Needs review')
              .filter(`_type in ["hb.article", "hb.guide"] && (
                !defined(lastVerifiedAt) ||
                lastVerifiedAt < now() - 60*60*24*180
              )`)
          ),
          S.listItem().title('🕰️ Deprecated').child(
            S.documentList()
              .title('Deprecated')
              .filter('_type in ["hb.article", "hb.guide"] && maturity == "deprecated"')
          ),
          S.listItem().title('🔬 Exploratory').child(
            S.documentList()
              .title('Exploratory')
              .filter('_type in ["hb.article", "hb.guide"] && maturity == "exploratory"')
          ),
        ])
      ),

      // ── METHODS ────────────────────────────────────
      S.listItem().title('Methods').child(
        S.list().title('Methods').items([
          S.documentTypeListItem('hb.guide').title('Guides'),
          S.documentTypeListItem('hb.template').title('Templates'),
          S.documentTypeListItem('hb.principle').title('Principles'),
          S.divider(),
          S.listItem().title('🌱 Living documents').child(
            S.documentList()
              .title('Living documents')
              .filter('_type in ["hb.article", "hb.guide"] && isLivingDocument == true')
          ),
        ])
      ),

      // ── AI SKILLS ──────────────────────────────────
      S.listItem().title('AI Skills').child(
        S.list().title('AI Skills').items([
          S.listItem().title('Prompts').child(
            S.documentList().title('Prompts')
              .filter('_type == "hb.aiSkill" && skillType == "prompt"')
          ),
          S.listItem().title('Workflows').child(
            S.documentList().title('Workflows')
              .filter('_type == "hb.aiSkill" && skillType == "workflow"')
          ),
          S.listItem().title('Evaluations').child(
            S.documentList().title('Evaluations')
              .filter('_type == "hb.aiSkill" && skillType == "evaluation"')
          ),
          S.divider(),
          S.documentTypeListItem('hb.aiCollection').title('Collections'),
          S.listItem().title('🧪 Needs testing').child(
            S.documentList().title('Needs testing')
              .filter(`_type == "hb.aiSkill" && (
                !defined(lastVerifiedAt) ||
                lastVerifiedAt < now() - 60*60*24*90
              )`)
          ),
        ])
      ),

      // ── NAVIGATION ─────────────────────────────────
      S.listItem().title('Navigation').child(
        S.document()
          .schemaType('hb.navigation')
          .documentId('handbook-navigation-singleton')
          .title('Navigation')
      ),

      // ── TAXONOMY ───────────────────────────────────
      S.listItem().title('Taxonomy').child(
        S.list().title('Taxonomy').items([
          S.documentTypeListItem('hb.section').title('Sections'),
          S.documentTypeListItem('hb.expertise').title('Expertises'),
          S.documentTypeListItem('hb.role').title('Roles'),
          S.documentTypeListItem('hb.glossaryTerm').title('Glossary'),
        ])
      ),

      // ── PEOPLE ─────────────────────────────────────
      S.documentTypeListItem('hb.contributor').title('People'),

      // ── REUSABLE ───────────────────────────────────
      S.documentTypeListItem('hb.codeSnippet').title('Code snippets'),
    ])
```

---

## Document actions

`apps/studio/actions/handbook/` — alle actions er scopet til handbook-dokumenttyper.

Registreres i workspace-config via:
```ts
document: {
  actions: (prev, context) => {
    const handbookTypes = ['hb.article', 'hb.guide', 'hb.aiSkill']
    if (!handbookTypes.includes(context.schemaType)) return prev

    const filtered = prev.filter(action =>
      action.action !== 'unpublish'  // fjern unpublish fra handbook — bruk 'hidden'-feltet istedenfor
    )

    return [
      ...filtered,
      MarkAsVerifiedAction,
      ...(context.schemaType === 'hb.article' || context.schemaType === 'hb.guide'
        ? [MarkAsDeprecatedAction, DuplicateArticleAction]
        : []),
      ...(context.schemaType === 'hb.aiSkill'
        ? [TestAiSkillAction]
        : []),
    ]
  },
},
```

`TestAiSkillAction` kaller `/api/test-skill` i Next.js-appen og krever
`HANDBOOK_ANTHROPIC_API_KEY` i Studio-miljøvariabler.

---

## TypeScript-integrasjon

### typegen-oppsett

`apps/studio/sanity.cli.ts`:
```ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_HANDBOOK_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_HANDBOOK_DATASET ?? 'production',
  },
  graphql: [{ workspace: 'handbook', tag: 'default' }],
})
```

Kjør typegen:
```bash
cd apps/studio && pnpm sanity typegen generate
```

Genererte typer skrives til `apps/studio/sanity.types.ts`.
Commit denne filen — frontend-builds skal ikke kreve dataset-tilgang.

### Delte typer

`packages/types/handbook.ts` (eller tilsvarende shared packages-mappe):

```ts
// Re-eksporter kun typene frontend trenger — ikke hele Sanity-schemaet
export type { HbArticle, HbGuide, HbAiSkill, HbSection, HbExpertise }
  from '../../apps/studio/sanity.types'
```

Hvis prosjektet ikke har en `packages/types`-pakke fra før:
importer direkte fra `apps/studio/sanity.types.ts` i web-appen via
TypeScript path alias:

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@handbook/types": ["../studio/sanity.types.ts"]
    }
  }
}
```

---

## Seed-script

`scripts/handbook-seed.ts` — kjøres med `pnpm seed`:

```ts
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_HANDBOOK_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_HANDBOOK_DATASET ?? 'production',
  token: process.env.SANITY_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})
```

Seed-rekkefølge er viktig — referanser må opprettes før dokumenter som bruker dem:

```
1. hb.section        (ingen avhengigheter)
2. hb.expertise      (ingen avhengigheter)
3. hb.role           (ingen avhengigheter)
4. hb.contributor    (ingen avhengigheter)
5. hb.glossaryTerm   (ingen avhengigheter)
6. hb.principle      (ingen avhengigheter)
7. hb.codeSnippet    (ingen avhengigheter)
8. hb.article        (avhenger av section, expertise, contributor)
9. hb.guide          (avhenger av section, expertise, role, contributor)
10. hb.template      (avhenger av guide for usedIn)
11. hb.aiSkill       (avhenger av expertise, contributor)
12. hb.aiCollection  (avhenger av aiSkill)
13. hb.navigation    (avhenger av article og guide)
```

Bruk `client.transaction()` for å batch-opprette dokumenter av samme type.
Bruk `nanoid()` for å generere `_key`-verdier på array-items.

Seed-script skal være idempotent:
```ts
// Sjekk om dokument allerede finnes før oppretting
const existing = await client.fetch(`*[_id == $id][0]._id`, { id: doc._id })
if (!existing) {
  await client.create(doc)
}
```

Legg `SANITY_WRITE_TOKEN` i `.env.local` — aldri commit.

---

## Kjente fallgruver

### 1. `__experimental_actions` er ikke støttet i v3
Bruk `document.actions` i workspace-config istedenfor.

### 2. Sanity image-cropping forskyver hotspots
I frontend: bruk alltid `fit: 'clip'` i `@sanity/image-url`-builder.
Alternativt: sett `options: { hotspot: false }` på hotspot-image-feltet
og håndter `crop` manuelt.

### 3. `presentationTool` krever CORS på Sanity-prosjektet
Legg til `http://localhost:3000` og produksjons-URL i Sanity-prosjektets
CORS-innstillinger på manage.sanity.io.

### 4. Workspace-switcher i Studio
Sanity viser automatisk en workspace-switcher i navigasjonsbar når
`defineConfig` mottar et array. Redaktører ser andre workspaces.
Hvis det er uønsket: la være å eksponere Studio-URL til alle
(auth er planlagt uansett).

### 5. `sanity typegen` bruker CLI-config, ikke workspace-config
`sanity.cli.ts` kan kun peke på ett prosjekt/dataset.
For handbook: pek `sanity.cli.ts` på handbook-prosjektet
og kjør typegen fra `apps/studio`-mappen.

### 6. Orderable document list krever schema-endring
`@sanity/orderable-document-list` legger til et `orderRank`-felt på typen.
Legg til `orderRank`-felt på `hb.section` og `hb.navigation`:

```ts
defineField({
  name: 'orderRank',
  type: 'string',
  hidden: true,
})
```

---

## Sjekkliste — ferdig når

- [ ] `pnpm dev` fra rot starter Studio og web-app uten feil
- [ ] Handbook-workspace er tilgjengelig på `localhost:3333/handbook`
- [ ] Eksisterende workspaces i Studio er upåvirket
- [ ] Alle 13 dokumenttyper er synlige i handbook structure builder
- [ ] Custom inputs fungerer: hotspot-editor, maturity radio, code-input
- [ ] Document actions vises på riktige typer
- [ ] Visual Editing fungerer: endringer i Studio reflekteres i preview
- [ ] `pnpm seed` kjører uten feil og produserer forventet innhold
- [ ] `pnpm typegen` genererer `sanity.types.ts` uten feil
- [ ] TypeScript-kompilering er feilfri i begge apps (`pnpm typecheck`)
- [ ] Singleton navigation fungerer: kun ett dokument kan eksistere

