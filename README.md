# Insurance Analytics (Standalone App)

This folder is a standalone Vite + React + Tailwind dashboard for insurance filing analytics, separate from the main data-platform.

## Features
- Excel upload (.xlsx/.xls) for state filing data
- Interactive SVG-based US map with state-level metrics
- KPI cards (Totals, Auto, Home, Avg per State)
- Side panel with detailed state info
- Top 10 states bar chart (conditional)
- Complexity distribution bars
- Filing type counts
- Automated insight bullet points for quick narrative

## Getting Started

```powershell
cd "c:\Users\JahnaviChintakindi\source\repos\Dashboard\insurance-analytics"
npm install
npm run dev
```

Open http://localhost:5173

## Build

```powershell
npm run build
```
Output goes to `dist/`.

## Excel Columns Expected
State, Total Forms, Auto Forms, Home/Dwelling, Complexity, Overall Filing Type, Rate Regulation, PIP Required, UM/UIM, No-Fault, Key State Requirements.

## Tailwind Notes
Tailwind directives are in `src/index.css`. Ensure PostCSS config and tailwind.config.js remain present. If an editor complains about `@tailwind` rules, it's a tooling linting gap, not a runtime issue.

## Future Enhancements
- Code-splitting and dynamic import for map
- Add real map projection instead of rectangles
- LLM API integration for richer narrative
- State comparison mode

## License
Inherits repository license.
