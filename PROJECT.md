# HomeHugger

**Stack:** React 18, TypeScript, Vite, Gemini API  
**Live:** https://projects.slash301.com/HomeHugger/  
**Local:** `npm run dev` → http://localhost:5173  
**Env:** `GEMINI_API_KEY` in `.env.local`

## What it is
Home inventory app — build a room-by-room inventory of what you own, where it is, and what it's worth. Useful for insurance purposes and general home management. Gemini likely assists with item categorisation or valuation.

## Structure
- `App.tsx` — main shell
- `components/` — 9 tsx files (likely: room view, item forms, inventory list, summary)
- `services/` — 1 ts file (Gemini integration)
- `types.ts` — item/room data types

## State
Functional personal utility. Good concept with real practical use (home insurance, moving). Moderate component count suggests feature-complete MVP or close to it.

## What needs work / next directions
- Data persistence — localStorage or cloud sync (currently likely session-only)
- Export to PDF/CSV for insurance claims
- Photo attachments per item
- Total value calculation and room breakdown
