'use server'

import { Groq } from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export type NoteSummary = {
  short_summary: string
  bullet_points: string[]
  key_insights: string[]
  action_items: string[]
  important_quotes: string[]
}

// ─── Summarize ────────────────────────────────────────────────────────────────
export async function summarizeNote(content: string): Promise<NoteSummary> {
  if (!content?.trim()) throw new Error('Note content is empty')

  const prompt = `Analyze the following note and return a JSON object with these exact keys:
- "short_summary": 1-2 sentence high-level overview
- "bullet_points": array of 3-5 key points
- "key_insights": array of 2-3 non-obvious takeaways
- "action_items": array of specific actionable tasks (empty array if none)
- "important_quotes": array of verbatim key phrases (empty array if none)

Note content:
${content}`

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are an elite intelligence analyst. Extract maximum insight. Always respond with valid JSON matching the requested schema exactly.'
      },
      { role: 'user', content: prompt }
    ]
  })

  const parsed = JSON.parse(res.choices[0].message.content || '{}')

  // Defensive defaults
  return {
    short_summary: parsed.short_summary || '',
    bullet_points: Array.isArray(parsed.bullet_points) ? parsed.bullet_points : [],
    key_insights: Array.isArray(parsed.key_insights) ? parsed.key_insights : [],
    action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    important_quotes: Array.isArray(parsed.important_quotes) ? parsed.important_quotes : [],
  }
}

// ─── Q&A ─────────────────────────────────────────────────────────────────────
export async function askNoteQuestion(content: string, question: string): Promise<string> {
  if (!content?.trim()) throw new Error('Note content is empty')

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are Lumina AI, an intelligent note assistant. Answer questions based on the provided note context. Be concise and precise. If the answer isn\'t in the note, say so and provide general knowledge.'
      },
      {
        role: 'user',
        content: `Note context:\n${content}\n\nQuestion: ${question}`
      }
    ]
  })

  return res.choices[0].message.content || 'Sorry, I could not process that question.'
}

// ─── Transform ────────────────────────────────────────────────────────────────
export type TransformFormat = 'blog' | 'tweet' | 'flashcards' | 'meeting_minutes'

export async function transformNoteAction(content: string, format: TransformFormat): Promise<string> {
  if (!content?.trim()) throw new Error('Note content is empty')

  const prompts: Record<TransformFormat, string> = {
    blog: 'Transform this note into a professional, engaging blog post. Include a catchy title (prefix with #), structured headings (##), and a compelling conclusion.',
    tweet: 'Transform this note into a high-engagement Twitter/X thread (max 5 tweets). Start each tweet with its number like "1/5". Add emojis and relevant hashtags.',
    flashcards: 'Transform this note into 5–10 effective study flashcards. Format each as: "Q: [question]\nA: [answer]" with a blank line between each card.',
    meeting_minutes: 'Transform this note into professional meeting minutes. Include: Date (use today\'s date), Attendees (placeholder), Key Discussion Points (##), Decisions Made (##), and Action Items (## with checkboxes).'
  }

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are a creative content strategist. Transform content into different formats while preserving the core message. Be detailed and high quality.'
      },
      {
        role: 'user',
        content: `${prompts[format]}\n\nContent:\n${content}`
      }
    ]
  })

  return res.choices[0].message.content || 'Transformation failed.'
}

// ─── Search Expansion ─────────────────────────────────────────────────────────

export async function smartSearchExpansion(query: string): Promise<string[]> {
  const prompt = `
    Give me 5-8 related keywords or synonymous concepts for the search query: "${query}".
    Include both technical terms and general concepts.
    Format the response as a simple comma-separated list.
  `

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a search optimization assistant. Return only keywords."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant"
    })

    const response = chatCompletion.choices[0].message.content || ""
    return response.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  } catch (error) {
    console.error("Smart Search Expansion failed:", error)
    return [] // Return empty array on failure instead of crashing
  }
}
