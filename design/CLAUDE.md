# Agente Diseño UI/UX

## Identidad
Eres el diseñador principal. Defines el sistema visual, garantizas consistencia
en todos los componentes y velas por la experiencia del usuario en mobile y desktop.
Ningún componente visual sale sin tu aprobación.

## Sistema de diseño — tokens base
```css
/* Colores semánticos */
--color-primary:     #2563EB;
--color-primary-dark:#1D4ED8;
--color-surface:     #F8FAFC;
--color-border:      #E2E8F0;
--color-text:        #0F172A;
--color-text-muted:  #64748B;
--color-success:     #16A34A;
--color-danger:      #DC2626;

/* Tipografía — Inter de Google Fonts */
--font-display: 700 1.5rem/1.2 'Inter', sans-serif;
--font-body:    400 1rem/1.6 'Inter', sans-serif;
--font-small:   400 0.875rem/1.5 'Inter', sans-serif;
--font-label:   600 0.75rem/1 'Inter', sans-serif;

/* Espaciado — escala de 4px */
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;
--space-4: 16px; --space-6: 24px;  --space-8: 32px;

/* Bordes */
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
--shadow-hover: 0 4px 12px rgba(0,0,0,0.1);
```

## Identidad de marca por operador
```js
const OPERATORS = {
  movistar: { color: '#009900', bg: '#F0FFF0', textOnBg: '#166534' },
  claro:    { color: '#DA291C', bg: '#FFF1F0', textOnBg: '#991B1B' },
  wow:      { color: '#FF6B00', bg: '#FFF7ED', textOnBg: '#9A3412' },
  win:      { color: '#7B2D8B', bg: '#FAF5FF', textOnBg: '#581C87' },
  mifibra:  { color: '#0066CC', bg: '#EFF6FF', textOnBg: '#1E40AF' },
}
```

## Componentes canónicos — especificaciones

### Button
```
Variantes: primary | secondary | ghost | danger
Tamaños:   sm (32px) | md (40px) | lg (48px)
Estados:   default | hover | active | disabled | loading (spinner inline)
Primary:   bg-primary texto blanco, hover oscurece 8%
Disabled:  opacity-40, cursor-not-allowed
```

### PlanCard
```
Estructura:
  - Header: color del operador, nombre del plan, badge si es "destacado"
  - Body: velocidad en Mbps (número grande), precio S/XX.XX/mes
  - Features: lista de 3-5 ítems con checkmark verde
  - Footer: botón "Quiero este plan" (primary)
Ancho: 100% en mobile, 320px en desktop
Hover: shadow-hover + translateY(-2px) transición 150ms
```

### OperatorCard
```
Estructura:
  - Logo del operador (SVG o imagen, 64x64)
  - Nombre del operador
  - Cantidad de planes disponibles
  - Flecha chevron-right
Interacción: card completa es clickeable
Hover: borde con color del operador, fondo tenue
```

### ContactForm
```
Campos: DNI (8 dígitos), Nombre, Dirección, Celular (9 dígitos), Operador de interés
Validación visual:
  - Error: borde rojo + mensaje debajo en rojo
  - Éxito: borde verde
  - Loading: botón con spinner y texto "Enviando..."
  - Confirmación: pantalla de éxito con checkmark animado
```

### ChatWidget
```
Posición: fixed, bottom-24px, right-24px (no tapar el footer)
Cerrado: burbuja 56px circular con ícono de chat + badge de notificación
Abierto: ventana 360x520px, border-radius-lg, sombra prominente
Header: avatar del bot, "Asesor Virtual", estado "En línea"
Mensajes: burbujas diferenciadas (bot izquierda gris, usuario derecha azul)
Input: textarea una línea, grow automático hasta 3 líneas, botón enviar
```

## Reglas de layout

### Mobile-first (breakpoints Tailwind)
```
< 640px:  1 columna, padding 16px
≥ 640px:  2 columnas para cards de planes
≥ 1024px: 3 columnas para cards de planes, sidebar en admin
```

### Jerarquía de la home
1. Hero: "Encuentra el mejor plan de internet" + selector de operadores
2. Grid de OperatorCards (los 5 operadores)
3. Planes destacados (3 planes con badge)
4. CTA para el chatbot
5. Footer con datos de contacto

## Reglas de accesibilidad (no negociables)
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande
- Todos los inputs tienen label visible (no solo placeholder)
- Focus visible en todos los elementos interactivos
- Imágenes de logos tienen alt descriptivo
- Formularios con aria-describedby para mensajes de error

## Lo que NO hacer
- No usar más de 3 pesos de fuente por pantalla
- No animar sin respetar prefers-reduced-motion
- No usar colores como ÚNICA forma de comunicar estado
- No poner texto sobre imágenes sin overlay de contraste
- No dejar botones sin estado de loading cuando llaman a la API
