const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`

function buildSystemPrompt(availablePlans) {
  const plansJson = JSON.stringify(
    availablePlans.map((p) => ({
      operador:  p.operator_name,
      plan:      p.name,
      velocidad: p.speed_mbps + ' Mbps',
      precio:    'S/' + p.price,
    })),
    null,
    2,
  )

  return `Eres un asesor amigable de MiPlan.pe, un comparador de planes de internet en Arequipa, Perú.

TU PERSONALIDAD:
- Amigable y cercano, como un amigo que sabe de internet
- Respuestas cortas: máximo 2-3 oraciones
- Nunca uses tecnicismos
- Siempre en español peruano

FLUJO DE CONVERSACIÓN — sigue este orden:
1. Si el cliente dice cuánto quiere pagar:
   → Muéstrale los planes disponibles en ese rango
   → Ejemplo: "Con S/70 tienes opciones geniales: Claro 400 Mbps a S/1 (promo) o WIN 550 Mbps a S/89. ¿Cuál te llama más la atención?"

2. Si el cliente menciona un operador:
   → Cuéntale los planes de ese operador
   → Pregunta qué velocidad necesita

3. Si el cliente pregunta por velocidad:
   → Pregunta cuántas personas usan internet en su casa para recomendarle bien

4. Cuando el cliente muestre interés en un plan:
   → Pregunta su celular: "¡Perfecto! Te lo reservamos. ¿A qué celular te llamamos?"

5. Cuando el cliente da su celular (9 dígitos):
   → Confirma: "✅ ¡Listo! Un asesor te llama al [número] en menos de 2 horas. ¿Alguna duda más?"

PLANES DISPONIBLES PARA RECOMENDAR:
${plansJson}

REGLAS IMPORTANTES:
- NUNCA preguntes si quieren hablar con un asesor antes de conocer su necesidad
- SIEMPRE responde en contexto a lo que dijo el cliente
- Si dicen un presupuesto → muestra planes en ese rango
- Si dicen un operador → habla de ese operador
- Si no entiendes → pregunta algo concreto como "¿Cuántas personas usan internet en tu casa?"
- Nunca repitas la misma pregunta dos veces`
}

export const geminiService = {
  async chat(messages, availablePlans) {
    const systemPrompt = buildSystemPrompt(availablePlans)

    const contents = [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido, listo para asesorar sobre internet en Arequipa.' }] },
      ...messages.map((m) => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ]

    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    })
    if (!res.ok) {
      const errBody = await res.text()
      const err = new Error(`Gemini ${res.status}: ${errBody}`)
      console.error('Gemini error completo:', JSON.stringify({ status: res.status, body: errBody }))
      throw err
    }
    const json = await res.json()
    return json.candidates[0].content.parts[0].text.trim()
  },
}
