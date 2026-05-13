import type { StructureBuilder, StructureResolverContext } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export async function structure(S: StructureBuilder, context: StructureResolverContext) {
  const { getClient } = context
  const client = getClient({ apiVersion: '2024-01-01' })

  // Fetch all sections ordered by order asc
  const sections: Array<{ _id: string; title: string; slug: string }> = await client.fetch(
    `*[_type == "hb.section"] | order(order asc, title asc) { _id, title, "slug": slug.current }`,
  )

  // ── Helpers ──────────────────────────────────────────────────────────────

  const articlesBySectionList = (sectionId: string, sectionTitle: string) =>
    S.listItem()
      .id(`articles-section-${sectionId}`)
      .title(sectionTitle)
      .child(
        S.documentList()
          .title(`${sectionTitle} — Articles`)
          .schemaType('hb.article')
          .filter('_type == "hb.article" && section._ref == $sectionId && !hidden')
          .params({ sectionId }),
      )

  const guidesBySectionList = (sectionId: string, sectionTitle: string) =>
    S.listItem()
      .id(`guides-section-${sectionId}`)
      .title(sectionTitle)
      .child(
        S.documentList()
          .title(`${sectionTitle} — Guides`)
          .schemaType('hb.guide')
          .filter('_type == "hb.guide" && section._ref == $sectionId && !hidden')
          .params({ sectionId }),
      )

  // ── Documentation group ──────────────────────────────────────────────────

  const documentationGroup = S.listItem()
    .id('documentation')
    .title('Documentation')
    .child(
      S.list()
        .title('Documentation')
        .items([
          // Articles per section
          ...sections.map((sec) => articlesBySectionList(sec._id, sec.title)),
          S.divider(),
          S.listItem()
            .id('articles-drafts')
            .title('Drafts')
            .child(
              S.documentList()
                .title('Article drafts')
                .schemaType('hb.article')
                .filter('_type == "hb.article" && _id in path("drafts.**")'),
            ),
          S.listItem()
            .id('articles-needs-review')
            .title('Needs review')
            .child(
              S.documentList()
                .title('Needs review')
                .schemaType('hb.article')
                .filter(
                  '_type == "hb.article" && (lastVerifiedAt == null || dateTime(lastVerifiedAt) < dateTime(now()) - 60*60*24*180)',
                ),
            ),
          S.listItem()
            .id('articles-deprecated')
            .title('Deprecated')
            .child(
              S.documentList()
                .title('Deprecated articles')
                .schemaType('hb.article')
                .filter('_type == "hb.article" && maturity == "deprecated"'),
            ),
          S.listItem()
            .id('articles-exploratory')
            .title('Exploratory')
            .child(
              S.documentList()
                .title('Exploratory articles')
                .schemaType('hb.article')
                .filter('_type == "hb.article" && maturity == "exploratory"'),
            ),
        ]),
    )

  // ── Methods group ────────────────────────────────────────────────────────

  const methodsGroup = S.listItem()
    .id('methods')
    .title('Methods')
    .child(
      S.list()
        .title('Methods')
        .items([
          // Guides per section
          ...sections.map((sec) => guidesBySectionList(sec._id, sec.title)),
          S.divider(),
          S.listItem()
            .id('templates')
            .title('Templates')
            .child(S.documentTypeList('hb.template').title('Templates')),
          S.listItem()
            .id('principles')
            .title('Principles')
            .child(S.documentTypeList('hb.principle').title('Principles')),
          S.listItem()
            .id('living-documents')
            .title('Living documents')
            .child(
              S.documentList()
                .title('Living documents')
                .schemaType('hb.guide')
                .filter('_type == "hb.guide" && isLivingDocument == true'),
            ),
        ]),
    )

  // ── AI Skills group ──────────────────────────────────────────────────────

  const aiSkillsGroup = S.listItem()
    .id('ai-skills')
    .title('AI Skills')
    .child(
      S.list()
        .title('AI Skills')
        .items([
          S.listItem()
            .id('ai-prompts')
            .title('Prompts')
            .child(
              S.documentList()
                .title('Prompts')
                .schemaType('hb.aiSkill')
                .filter('_type == "hb.aiSkill" && skillType == "prompt"'),
            ),
          S.listItem()
            .id('ai-workflows')
            .title('Workflows')
            .child(
              S.documentList()
                .title('Workflows')
                .schemaType('hb.aiSkill')
                .filter('_type == "hb.aiSkill" && skillType == "workflow"'),
            ),
          S.listItem()
            .id('ai-evaluations')
            .title('Evaluations')
            .child(
              S.documentList()
                .title('Evaluations')
                .schemaType('hb.aiSkill')
                .filter('_type == "hb.aiSkill" && skillType == "evaluation"'),
            ),
          S.divider(),
          S.listItem()
            .id('ai-collections')
            .title('Collections')
            .child(S.documentTypeList('hb.aiCollection').title('Collections')),
          S.listItem()
            .id('ai-needs-testing')
            .title('Needs testing')
            .child(
              S.documentList()
                .title('Needs testing')
                .schemaType('hb.aiSkill')
                .filter(
                  '_type == "hb.aiSkill" && (lastVerifiedAt == null || dateTime(lastVerifiedAt) < dateTime(now()) - 60*60*24*90)',
                ),
            ),
          S.listItem()
            .id('ai-model-agnostic')
            .title('Model-agnostic')
            .child(
              S.documentList()
                .title('Model-agnostic skills')
                .schemaType('hb.aiSkill')
                .filter('_type == "hb.aiSkill" && "model-agnostic" in targetModel'),
            ),
        ]),
    )

  // ── Navigation singleton ─────────────────────────────────────────────────

  const navigationItem = S.listItem()
    .id('navigation')
    .title('Navigation')
    .child(
      S.editor()
        .id('navigation-singleton')
        .schemaType('hb.navigation')
        .documentId('navigation-singleton'),
    )

  // ── Taxonomy ─────────────────────────────────────────────────────────────

  const taxonomyGroup = S.listItem()
    .id('taxonomy')
    .title('Taxonomy')
    .child(
      S.list()
        .title('Taxonomy')
        .items([
          orderableDocumentListDeskItem({ type: 'hb.section', title: 'Sections', id: 'sections', S, context }),
          S.listItem()
            .id('expertises')
            .title('Expertises')
            .child(S.documentTypeList('hb.expertise').title('Expertises')),
          S.listItem()
            .id('roles')
            .title('Roles')
            .child(S.documentTypeList('hb.role').title('Roles')),
          S.listItem()
            .id('glossary')
            .title('Glossary')
            .child(S.documentTypeList('hb.glossaryTerm').title('Glossary')),
        ]),
    )

  // ── People ───────────────────────────────────────────────────────────────

  const peopleGroup = S.listItem()
    .id('people')
    .title('People')
    .child(S.documentTypeList('hb.contributor').title('Contributors'))

  // ── Reusable ─────────────────────────────────────────────────────────────

  const reusableGroup = S.listItem()
    .id('reusable')
    .title('Reusable')
    .child(S.documentTypeList('hb.codeSnippet').title('Code snippets'))

  return S.list()
    .title('Handbook')
    .items([
      documentationGroup,
      methodsGroup,
      aiSkillsGroup,
      S.divider(),
      navigationItem,
      S.divider(),
      taxonomyGroup,
      peopleGroup,
      reusableGroup,
    ])
}

