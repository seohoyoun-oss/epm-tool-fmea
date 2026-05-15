// Vercel serverless function. Runs in a Node.js runtime on Vercel's edge.
// Receives the system description from the browser, calls the Anthropic
// Application Programming Interface server-side using a key stored in
// environment variables, and returns the parsed Failure Mode and Effects
// Analysis rows back to the browser.
//
// The Anthropic key NEVER reaches the browser bundle. This is the entire
// reason the serverless proxy exists.

import Anthropic from '@anthropic-ai/sdk'
import { buildFmeaPrompt } from '../src/lib/promptTemplates.js'

// Per-instance request budget so a misuse spike cannot drain the API budget.
// Vercel will spin up multiple cold-start instances under load, so this is a
// soft guardrail rather than a hard cap. Pair it with an Anthropic console
// budget alert at 50 dollars for a real backstop.
const MAX_DESCRIPTION_LENGTH = 4000
const MAX_FUNCTIONS_LENGTH = 2000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error:
        'Server is not configured. ANTHROPIC_API_KEY is missing in environment variables.',
    })
  }

  const { description, functions } = req.body || {}

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'description is required.' })
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return res
      .status(400)
      .json({ error: `description exceeds ${MAX_DESCRIPTION_LENGTH} characters.` })
  }
  if (functions && typeof functions === 'string' && functions.length > MAX_FUNCTIONS_LENGTH) {
    return res
      .status(400)
      .json({ error: `functions exceed ${MAX_FUNCTIONS_LENGTH} characters.` })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: buildFmeaPrompt({ description, functions }),
        },
      ],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock) {
      return res
        .status(502)
        .json({ error: 'Model returned no text content.' })
    }

    let parsed
    try {
      parsed = JSON.parse(stripCodeFences(textBlock.text))
    } catch (parseError) {
      return res.status(502).json({
        error: 'Model returned non-JSON output.',
        raw: textBlock.text.slice(0, 500),
      })
    }

    if (!parsed || !Array.isArray(parsed.rows)) {
      return res
        .status(502)
        .json({ error: 'Parsed JSON is missing the rows array.' })
    }

    const sanitized = parsed.rows
      .filter((row) => row && typeof row === 'object')
      .map((row) => {
        const severity = clampInt(row.severity, 1, 10, 5)
        const occurrence = clampInt(row.occurrence, 1, 10, 5)
        const detection = clampInt(row.detection, 1, 10, 5)
        return {
          customerImpact: String(row.customerImpact || '').slice(0, 120),
          function: String(row.function || '').slice(0, 100),
          failureMode: String(row.failureMode || '').slice(0, 100),
          effect: String(row.effect || '').slice(0, 200),
          cause: String(row.cause || '').slice(0, 200),
          severity,
          occurrence,
          detection,
          rpn: severity * occurrence * detection,
          recommendedAction: String(row.recommendedAction || '').slice(0, 200),
          actionCost: clampInt(row.actionCost, 1, 10, 5),
          teams: String(row.teams || '').slice(0, 60),
        }
      })

    return res.status(200).json({ rows: sanitized })
  } catch (error) {
    console.error('Anthropic call failed:', error)
    return res.status(502).json({
      error: error?.message || 'Upstream call failed.',
    })
  }
}

function clampInt(value, min, max, fallback) {
  const n = Math.round(Number(value))
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function stripCodeFences(text) {
  // Defensive: if the model wraps the JSON in ```json ... ```, strip the fences.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return fenced ? fenced[1].trim() : text.trim()
}
