import { Groq } from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY",
  dangerouslyAllowBrowser: true // For development, in production use server actions
})

export type NoteSummary = {
  short_summary: string
  bullet_points: string[]
  key_insights: string[]
  action_items: string[]
  important_quotes: string[]
}

export async function generateSummary(content: string): Promise<NoteSummary> {
  const prompt = `
    Analyze the following note content and provide a comprehensive, high-fidelity summary.
    The goal is to extract maximum intelligence while remaining concise and professional.
    
    Format the response as a JSON object with the following keys:
    "short_summary": A brilliant 1-2 sentence high-level overview.
    "bullet_points": An array of 3-5 detailed, structured points covering the main topics.
    "key_insights": An array of deep takeaways or non-obvious observations.
    "action_items": An array of specific, actionable tasks derived from the content.
    "important_quotes": An array of verbatim, powerful lines that capture the essence of the note.

    Note Content:
    ${content}
  `

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an elite AI intelligence analyst for a premium note-taking application. Your summaries are insightful, professional, and clear. Always respond with valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  })

  return JSON.parse(chatCompletion.choices[0].message.content || "{}")
}

export async function askAI(content: string, question: string): Promise<string> {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are Lumina AI, an intelligent note assistant. Use the provided note context to answer user questions accurately. If the answer isn't in the context, use your general knowledge but mention it's not in the note."
      },
      {
        role: "user",
        content: `Context: ${content}\n\nQuestion: ${question}`
      }
    ],
    model: "llama-3.3-70b-versatile"
  })

  return chatCompletion.choices[0].message.content || "I'm sorry, I couldn't process that request."
}

export async function transformNote(content: string, format: 'blog' | 'tweet' | 'flashcards' | 'meeting_minutes'): Promise<string> {
  const prompts = {
    blog: "Transform this note into a professional, engaging blog post with a catchy title, structured headings, and a compelling conclusion.",
    tweet: "Transform this note into a high-engagement Twitter thread (max 5 tweets) with emojis and relevant hashtags. Make it punchy.",
    flashcards: "Transform this note into a set of 5-10 effective study flashcards. Format as 'Q: [Question] | A: [Answer]'.",
    meeting_minutes: "Transform this note into professional meeting minutes including date (placeholder), attendees (placeholder), key discussion points, and clear action items."
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a creative content strategist and transformer. Your goal is to rewrite content into different formats while preserving the core message."
      },
      {
        role: "user",
        content: `${prompts[format]}\n\nContent:\n${content}`
      }
    ],
    model: "llama-3.1-8b-instant"
  })

  return chatCompletion.choices[0].message.content || "Formatting failed."
}

export async function generateWorkspaceSummary(notes: { title: string, content: string }[]): Promise<string> {
  const combinedContent = notes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n---\n\n')
  
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are the Lumina Workspace Intelligence engine. Your goal is to synthesize multiple notes into a cohesive, high-level intelligence report. Look for patterns, contradictions, and synergies between different notes."
      },
      {
        role: "user",
        content: `Workspace Notes:\n${combinedContent}\n\nProvide a high-fidelity workspace report. Include:\n1. Executive Summary: A synthesis of the entire workspace.\n2. Strategic Pillars: The main themes across all notes.\n3. Semantic Connections: Identifying links between different ideas.\n4. Priority Actions: Action items that appear most critical across the notes.`
      }
    ],
    model: "llama-3.3-70b-versatile"
  })

  return chatCompletion.choices[0].message.content || "Workspace synthesis failed."
}
