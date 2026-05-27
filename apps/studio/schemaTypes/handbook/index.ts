import type { SchemaTypeDefinition } from 'sanity'
import { section } from './section'
import { expertise } from './expertise'
import { domain } from './domain'
import { role } from './role'
import { contributor } from './contributor'
import { article } from './article'
import { glossaryTerm } from './glossaryTerm'
import { aiSkill } from './aiSkill'
import { aiCollection } from './aiCollection'
import { codeSnippet } from './codeSnippet'
import { navigation } from './navigation'
import { principle } from './principle'
import { template } from './template'
import { guide } from './guide'
import { method } from './method'

export const handbookSchemaTypes: SchemaTypeDefinition[] = [
  // Taxonomy
  section,
  expertise,
  domain,
  role,
  // People
  contributor,
  // Content
  article,
  guide,
  method,
  principle,
  // AI
  aiSkill,
  aiCollection,
  // Reference / reusable
  glossaryTerm,
  codeSnippet,
  template,
  // Navigation
  navigation,
]
