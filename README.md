# MiPlan.pe

Catálogo web de planes de internet para Perú con chatbot asesor impulsado por IA.
Permite comparar planes de Movistar, Claro, WOW, WIN y Mi Fibra, y solicitar
que un asesor humano se contacte con el cliente.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js 20 + Express + PostgreSQL 15
- **IA**: Anthropic Claude (claude-sonnet-4-6)
- **Notificaciones**: Telegram Bot API
- **Deploy**: Railway (backend + BD) + Vercel (frontend)

## Desarrollo local

### Backend
```bash
cd backend
cp .env.example .env   # completar variables
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm run dev
```

## Estructura
```
miplan/
├── frontend/   React + Vite
└── backend/    Express API REST
```
