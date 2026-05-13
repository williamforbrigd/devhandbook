import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  systemPrompt?: string
  userPrompt?: string
}

interface AnthropicResponse {
  id: string
  model: string
  content: { type: string; text: string }[]
  error?: { message: string }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.HANDBOOK_ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'HANDBOOK_ANTHROPIC_API_KEY is not set' }, { status: 500 })
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { systemPrompt, userPrompt } = body
  if (!userPrompt?.trim()) {
    return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 })
  }

  const messages: { role: string; content: string }[] = [
    { role: 'user', content: userPrompt.trim() },
  ]

  const anthropicBody: Record<string, unknown> = {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages,
  }

  if (systemPrompt?.trim()) {
    anthropicBody.system = systemPrompt.trim()
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  })

  const data = (await upstream.json()) as AnthropicResponse

  if (!upstream.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? `Anthropic error ${upstream.status}` },
      { status: upstream.status },
    )
  }

  const responseText = data.content.find((b) => b.type === 'text')?.text ?? ''

  return NextResponse.json({
    model: data.model,
    response: responseText,
  })
}
