import { geminiService } from './geminiService.js'

const PHONE_REGEX = /\b9\d{8}\b/

// Devuelve true si el mensaje contiene alguno de los patrones (substring, case-insensitive)
function matches(message, patterns) {
  const lower = message.toLowerCase()
  return patterns.some((p) => lower.includes(p.toLowerCase()))
}

// response: null → pasar a Gemini directamente (para saludos personalizados)
const PREDEFINED = [
  {
    patterns: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey'],
    response: null,
    action: null,
    actionData: null,
  },
  {
    patterns: ['precio', 'cuanto cuesta', 'cuánto cuesta', 'costo', 'tarifa', 'cuanto sale', 'cuánto sale'],
    response: 'Tenemos planes desde S/1.00 hasta S/210 al mes según el operador y velocidad. ¿Cuánto quieres pagar aproximadamente?',
    action: 'SHOW_PLANS',
    actionData: null,
  },
  {
    patterns: ['claro'],
    response: 'Claro tiene planes desde S/1 en promoción hasta 1000 Mbps. Te muestro sus planes:',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'claro' },
  },
  {
    patterns: ['movistar'],
    response: 'Movistar tiene fibra óptica simétrica desde 400 Mbps. Te muestro sus planes:',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'movistar' },
  },
  {
    patterns: ['wow'],
    response: 'WOW tiene planes con WiFi 6 y Liga 1 MAX incluido. Te muestro sus planes:',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'wow' },
  },
  {
    patterns: ['win'],
    response: 'WIN tiene 100% fibra óptica sin permanencia. Te muestro sus planes:',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'win' },
  },
  {
    patterns: ['mifibra', 'mi fibra', 'fibra'],
    response: 'Mi Fibra tiene los precios más bajos desde S/59.90. Te muestro sus planes:',
    action: 'SHOW_OPERATOR',
    actionData: { slug: 'mifibra' },
  },
  {
    patterns: ['velocidad', 'mbps', 'megas', 'rapido', 'rápido'],
    response: '¿Cuántas personas usan internet en tu casa? Así te recomiendo la velocidad ideal:\n1-2 personas: 100-200 Mbps\n3-5 personas: 300-600 Mbps\nMás de 5: 1000 Mbps o más.',
    action: null,
    actionData: null,
  },
  {
    patterns: ['television', 'televisión', 'cable', ' tv ', 'canales', 'netflix'],
    response: 'Sí, varios operadores tienen planes de Internet + TV con canales digitales. ¿Qué operador te interesa?',
    action: 'SHOW_PLANS',
    actionData: null,
  },
  {
    patterns: ['contrato', 'permanencia', 'penalidad', 'compromiso'],
    response: 'La mayoría de planes no tienen permanencia forzada, pero esto varía según el operador. Un asesor te confirma los detalles exactos de tu plan.',
    action: null,
    actionData: null,
  },
  {
    patterns: ['instalacion', 'instalación', 'instalar', 'cuando llega', 'cuándo llega'],
    response: 'La instalación generalmente es gratis y toma entre 24 a 72 horas según el operador y tu zona. Te confirmamos el tiempo exacto al contactarte.',
    action: null,
    actionData: null,
  },
  {
    patterns: ['arequipa', 'cobertura', 'zona', 'distrito', 'llega a mi casa', 'hay servicio'],
    response: 'Atendemos en toda la ciudad de Arequipa y provincias cercanas. Cuéntanos tu distrito y verificamos cobertura exacta.',
    action: null,
    actionData: null,
  },
  {
    patterns: ['horario', 'hora', 'atienden', 'disponible', 'estan abiertos', 'están abiertos'],
    response: 'Atendemos de lunes a sábado de 9am a 7pm. También puedes escribirnos por WhatsApp al 920 170 692 fuera de ese horario.',
    action: null,
    actionData: null,
  },
  {
    patterns: ['asesor', 'hablar', 'llamar', 'contacto', 'humano', 'persona', 'whatsapp'],
    response: '¡Claro! Te conecto con un asesor. Solo necesito tu celular para llamarte:',
    action: 'OPEN_FORM',
    actionData: null,
  },
  {
    patterns: ['gracias', 'listo', 'okay', 'perfecto', 'genial', 'excelente'],
    response: '¡Con mucho gusto! ¿Hay algo más en que pueda ayudarte? 😊',
    action: null,
    actionData: null,
  },
  {
    patterns: ['chau', 'adios', 'adiós', 'hasta luego', 'bye'],
    response: '¡Hasta pronto! Si necesitas algo más, aquí estaré. También puedes escribirnos por WhatsApp al 920 170 692 👋',
    action: null,
    actionData: null,
  },
]

export const chatService = {
  async processChat(message, history, plans) {
    // 1. Detección de celular — máxima prioridad
    const phoneMatch = message.match(PHONE_REGEX)
    if (phoneMatch) {
      const phone = phoneMatch[0]
      return {
        response: `✅ ¡Listo! Un asesor te llamará al ${phone} en menos de 2 horas. ¿Tienes alguna duda más?`,
        action: 'SAVE_LEAD',
        actionData: { phone },
        source: 'phone_detected',
      }
    }

    // 2. Patrones predeterminados
    for (const entry of PREDEFINED) {
      if (matches(message, entry.patterns)) {
        // response: null → el patrón matcheó (ej: saludo) pero delegamos a Gemini
        if (entry.response === null) break

        return {
          response:   entry.response,
          action:     entry.action,
          actionData: entry.actionData,
          source:     'predefined',
        }
      }
    }

    // 3. Gemini (fallback y saludos)
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
        response:   '¿Te gustaría hablar con uno de nuestros asesores para ayudarte mejor?',
        action:     'OPEN_FORM',
        actionData: null,
        source:     'fallback',
      }
    }
  },
}
