const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

const SYSTEM_PROMPT = `Eres un asesor de internet amigable y experto en Arequipa, Perú.
Tu rol es ayudar a familias peruanas a encontrar el mejor plan de internet para su hogar.
Responde siempre en español, de forma concisa y amigable (máximo 3 oraciones por respuesta).
Operadores disponibles en Arequipa: Claro, Movistar, WOW, WIN, Mi Fibra.
Si el usuario quiere hablar con una persona, sugiere que use el formulario de contacto.
No inventes precios: usa solo los planes que se te dan en el contexto.`

export const geminiService = {
  async chat(messages, availablePlans) {
    const plansContext = availablePlans.length
      ? `\nPlanes disponibles:\n${availablePlans
          .map((p) => `- ${p.operator_name}: ${p.name}, ${p.speed_mbps} Mbps, S/.${p.price}`)
          .join('\n')}`
      : ''

    const contents = [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT + plansContext }] },
      { role: 'model', parts: [{ text: 'Entendido, listo para asesorar sobre internet en Arequipa.' }] },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ]

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    })
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const json = await res.json()
    return json.candidates[0].content.parts[0].text.trim()
  },
}
