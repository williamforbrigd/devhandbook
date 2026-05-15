import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client } from '../../../../lib/sanity'
import { aiSkillPlainQuery } from '../../../../lib/queries'
import type { AiSkillPlain } from '../../../../lib/queries'

// Plain text export — raw prompt only, no markdown, for pasting directly into AI tools
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params

  const skill: AiSkillPlain | null = await client.fetch(aiSkillPlainQuery, { slug })
  if (!skill) {
    return new NextResponse('Not found', { status: 404 })
  }

  const plain = buildPlainText(skill)

  return new NextResponse(plain, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.txt"`,
      'Cache-Control': 'no-store',
    },
  })
}

function buildPlainText(skill: AiSkillPlain): string {
  const parts: string[] = []

  if (skill.skillType === 'prompt' && skill.prompt) {
    const { systemPrompt, userPromptTemplate, variables } = skill.prompt

    if (systemPrompt) {
      parts.push(systemPrompt.trim())
    }

    if (userPromptTemplate) {
      if (parts.length > 0) parts.push('\n---\n')
      parts.push(userPromptTemplate.trim())
    }

    if (variables && variables.length > 0) {
      const varBlock = variables
        .map((v) => {
          const ex = v.example ? ` (example: ${v.example})` : ''
          return `{{${v.name}}}${v.description ? ` — ${v.description}` : ''}${ex}`
        })
        .join('\n')
      parts.push(`\n---\nVariables:\n${varBlock}`)
    }
  } else if (skill.skillType === 'workflow' && skill.workflow) {
    parts.push(
      skill.workflow.steps
        .map((step, i) => {
          const lines = [`${i + 1}. ${step.title}`]
          if (step.prompt) lines.push(step.prompt.trim())
          if (step.expectedOutput) lines.push(`Expected output: ${step.expectedOutput.trim()}`)
          if (step.notes) lines.push(`Notes: ${step.notes.trim()}`)
          return lines.join('\n')
        })
        .join('\n\n'),
    )
  } else if (skill.skillType === 'evaluation' && skill.evaluation) {
    const criteriaBlock = skill.evaluation.criteria
      .map((c) => {
        const lines = [`- ${c.label}`]
        if (c.description) lines.push(`  ${c.description.trim()}`)
        if (c.scoringGuide) lines.push(`  Scoring: ${c.scoringGuide.trim()}`)
        return lines.join('\n')
      })
      .join('\n')

    if (criteriaBlock) parts.push(criteriaBlock)
    if (skill.evaluation.rubric) {
      parts.push(`\n---\n${skill.evaluation.rubric.trim()}`)
    }
  }

  return parts.join('\n').trim() + '\n'
}

