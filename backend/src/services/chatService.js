import { geminiService } from './geminiService.js'

const PREDEFINED = [
  {
    pattern: /precio|cu[aá]nto|costo/i,
    response: '¿Sobre qué operador quieres ver precios? Tenemos Claro, Movistar, WOW, WIN y Mi Fibra.',
    action: 'SHOW_PLANS',
    actionData: null,
  },
  {
    pattern: /\bclaro\b/i,
    response: 'Claro ofrece fibra óptica con velocidades desde 50 hasta 600 Mbps. ¡Te muestro sus planes!',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'claro' },
  },
  {
    pattern: /\bmovistar\b/i,
    response: 'Movistar tiene cobertura en toda Arequipa. ¡Aquí están sus planes disponibles!',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'movistar' },
  },
  {
    pattern: /\bwow\b/i,
    response: 'WOW es una gran opción con precios competitivos. Te muestro sus planes.',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'wow' },
  },
  {
    pattern: /\bwin\b/i,
    response: 'WIN Internet tiene excelentes opciones para el hogar. ¡Veamos sus planes!',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'win' },
  },
  {
    pattern: /mifibra|mi fibra|\bfibra\b/i,
    response: 'Mi Fibra es una opción local con buena cobertura en Arequipa. ¡Te muestro sus planes!',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'mifibra' },
  },
  {
    pattern: /asesor|hablar|llamar|contacto|humano/i,
    response: 'Con gusto te conecto con uno de nuestros asesores. Llena el formulario y te llamamos hoy.',
    action: 'OPEN_FORM',
    actionData: null,
  },
  {
    pattern: /arequipa|cobertura|zona|distrito/i,
    response: 'Atendemos en toda la ciudad de Arequipa y provincias cercanas. ¿En qué distrito estás?',
    action: null,
    actionData: null,
  },
  {
    pattern: /horario|hora|atienden|disponible/i,
    response: 'Atendemos de lunes a sábado de 9am a 7pm. También puedes escribirnos por WhatsApp al 920 170 692.',
    action: null,
    actionData: null,
  },
  {
    pattern: /gracias|listo|\bok\b|perfecto/i,
    response: '¡Con gusto! ¿Hay algo más en que pueda ayudarte?',
    action: null,
    actionData: null,
  },
]

export const chatService = {
  async processChat(message, history, plans) {
    for (const entry of PREDEFINED) {
      if (entry.pattern.test(message)) {
        return {
          response: entry.response,
          action: entry.action,
          actionData: entry.actionData,
          source: 'predefined',
        }
      }
    }

    try {
      const allMessages = [
        ...history,
        { role: 'user', content: message },
      ]
      const response = await geminiService.chat(allMessages, plans)
      return { response, action: null, actionData: null, source: 'gemini' }
    } catch (err) {
      console.error('Gemini fallback:', err.message)
      return {
        response: '¿Te gustaría hablar con uno de nuestros asesores para ayudarte mejor?',
        action: 'OPEN_FORM',
        actionData: null,
        source: 'fallback',
      }
    }
  },
}
