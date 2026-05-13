import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineDocuments } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { handbookSchemaTypes } from './schemaTypes/handbook'
import { structure } from './structure'
import { MarkAsVerifiedAction } from './actions/Handbook/markAsVerified'
import { MarkAsDeprecatedAction } from './actions/Handbook/markAsDeprecated'
import { DuplicateAsNewAction } from './actions/Handbook/duplicateAsNew'
import { TestSkillAction } from './actions/Handbook/testSkill'

const CONTENT_TYPES = ['hb.article', 'hb.guide', 'hb.principle', 'hb.template', 'hb.aiSkill']
const SKILL_TYPES = ['hb.aiSkill']

const previewOrigin =
  typeof process.env.SANITY_STUDIO_PREVIEW_URL === 'string'
    ? process.env.SANITY_STUDIO_PREVIEW_URL
    : 'http://localhost:3000'

// In dev the app runs at root; the handbook lives at /devdocs when deployed into the monorepo.
// SANITY_STUDIO_PREVIEW_URL should be set to the full base URL including any basePath in prod.
const previewUrl = {
  origin: previewOrigin,
  basePath: '/devdocs',
  previewMode: {
    enable: `${previewOrigin}/api/draft-mode/enable`,
  },
}

const mainDocuments = defineDocuments([
  { route: '/article/:slug', type: 'hb.article' },
  { route: '/guide/:slug',   type: 'hb.guide' },
  { route: '/skill/:slug',   type: 'hb.aiSkill' },
  { route: '/principle/:slug', type: 'hb.principle' },
  { route: '/template/:slug',  type: 'hb.template' },
  { route: '/section/:slug',   type: 'hb.section' },
])

export default defineConfig({
  name: 'handbook',
  title: 'Handbook',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  schema: {
    types: handbookSchemaTypes,
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({ previewUrl, resolve: { mainDocuments } }),
    visionTool(),
    codeInput(),
  ],
  document: {
    actions(prev, { schemaType }) {
      if (!CONTENT_TYPES.includes(schemaType)) return prev

      const base = [
        ...prev,
        MarkAsVerifiedAction,
        MarkAsDeprecatedAction,
        DuplicateAsNewAction,
      ]

      if (SKILL_TYPES.includes(schemaType)) {
        base.push(TestSkillAction)
      }

      return base
    },
  },
})