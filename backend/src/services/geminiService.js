const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

const SYSTEM_PROMPT = `Eres un asesor de internet amigable y experto en Arequipa, Perú.
Tu rol es ayudar a familias peruanas a encontrar el mejor plan de internet para su hogar.
Siempre en español, tono amigable y cercano. Máximo 2-3 oraciones por respuesta.
No uses tecnicismos. No inventes precios: usa solo los planes que se te dan en el contexto.
Operadores disponibles en Arequipa: Claro, Movistar, WOW, WIN, Mi Fibra.

Flujo de conversación ideal:
1. Saluda y pregunta qué busca (precio, velocidad, TV, etc.)
2. Recomienda el plan más adecuado según sus necesidades
3. Cuando muestre interés, pregunta su celular así:
   "¡Perfecto! ¿A qué número te llamamos para confirmar tu plan? (solo necesitamos tu celular)"
4. Cuando el cliente dé su número, confirma así:
   "✅ ¡Listo! Un asesor te llamará al [número] en menos de 2 horas. ¿Tienes alguna duda más?"

Si el usuario quiere hablar con una persona, pregunta su celular en lugar de redirigirlo a un formulario.`

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
