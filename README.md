# Odin's Eye

A natal chart reading app that combines real ephemeris-based chart calculation with deep personal context to generate interpretive readings that actually mean something.

**[Live demo](https://odins-eye-pi.vercel.app)**

## What it does

Most natal chart tools take birth data in and give generic text out. Odin's Eye takes birth data *and* answers to a ten-step personal questionnaire -- family, shadow, fears, emotional patterns, the parts of yourself you don't put on a resume -- then synthesizes all of it into a reading structured across twelve sections plus a final synthesis.

It is not a horoscope. It is not a personality quiz. It is a portrait.

## What makes it accurate

- **Timezone-correct chart calculation.** Birth city is geocoded, the IANA timezone is resolved from coordinates, and local birth time is converted to true UTC with historical DST handling. The chart is correct regardless of where the server runs.
- **Real ephemeris math.** Planetary positions from `astronomy-engine`. Ascendant, North Node, Lilith, and Chiron computed from Meeus formulas and Keplerian elements.
- **Deep personal context.** Ten form steps gather psychological material that makes interpretation meaningful -- not just birth data, but family dynamics, relationships, emotional patterns, and the places you feel stuck.

### Placements calculated

Fourteen points, all computed from real ephemeris data:

| Personal | Social | Outer | Shadow | Soul |
|---|---|---|---|---|
| Sun | Jupiter | Uranus | Chiron | North Node |
| Moon | Saturn | Neptune | Lilith | South Node |
| Mercury | | Pluto | | Ascendant |
| Venus | | | | |
| Mars | | | | |

Plus a full aspect grid (conjunctions, sextiles, squares, trines, oppositions) and elemental/modality balance.

### Reading sections

1. The Core of Who You Are -- Sun
2. Your Emotional Architecture -- Moon
3. The Face You Show the World -- Rising
4. How You Think and Communicate -- Mercury
5. How You Love -- Venus
6. How You Fight and Pursue -- Mars
7. Where You Grow -- Jupiter
8. Where You're Tested -- Saturn
9. Your Deepest Wound -- Chiron
10. The Untamed -- Lilith
11. The Depths -- Uranus, Neptune, Pluto
12. The Nodal Axis -- Where you've been and where you're going
13. **Through Odin's Eye** -- The synthesis

## Tech stack

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4, Cinzel + Inter |
| Astronomy | `astronomy-engine` + custom Meeus formulas |
| Timezones | `tz-lookup` + `date-fns-tz` |
| Interpretation | Anthropic Claude (Sonnet) |
| PDF export | `jsPDF` with embedded Cinzel |
| Geocoding | OpenStreetMap Nominatim |
| Host | Vercel (Fluid Compute) |

## Features

- **Streaming generation** -- The 60-90 second interpretation streams over NDJSON with heartbeats so mobile browsers don't drop the connection.
- **Progress save** -- The form persists to localStorage and resumes where you left off.
- **PDF export** -- Cover page, chart data, aspect grid, element/modality balance, and the full reading exported as a designed document.
- **Interactive starfield** -- Parallax stars with constellation lines, frosted-glass cards, and a dark celestial theme. Optimized for mobile GPUs.
- **City autocomplete** -- Birth city search via Nominatim, scoped by country and state.

## Install

```bash
git clone https://github.com/odinsark/odins-eye.git
cd odins-eye
npm install
```

## Configuration

Create `.env.local` with your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

This is the only required environment variable. You can get a key at [console.anthropic.com](https://console.anthropic.com).

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Deploy

Push to `main` and Vercel auto-deploys. Or manually:

```bash
npx vercel --prod
```

Set `ANTHROPIC_API_KEY` in your Vercel project environment variables.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/       # Streaming chart + reading generation
│   │   ├── pdf/            # PDF export
│   │   └── places/         # Country/state/city geocoding
│   ├── reading/            # Reading results page
│   ├── layout.tsx          # Root layout with starfield
│   └── page.tsx            # Home (form)
├── components/
│   ├── steps/              # 10 form steps
│   ├── ui/                 # Form primitives and autocomplete
│   ├── FormStepper.tsx     # Multi-step orchestrator
│   └── StarField.tsx       # Canvas starfield with parallax
└── lib/
    ├── chart.ts            # Astronomical chart calculation
    ├── prompt.ts           # Claude interpretation prompt
    ├── types.ts            # Form data types
    └── fonts/              # Cinzel + Inter TTFs for PDF
```

## License

MIT -- see [LICENSE](LICENSE).
