<p align="center">
  <img src="public/odinsark-logo-white.png#gh-dark-mode-only" alt="Odinsark" width="260" />
  <img src="public/odinsark-logo.png#gh-light-mode-only" alt="Odinsark" width="260" />
</p>

<h1 align="center">Odin's Eye</h1>

<p align="center">
  <em>A natal chart reading that sees beneath the surface.</em>
  <br />
  <sub>Your birth data. Your patterns. Your truth.</sub>
</p>

<p align="center">
  <a href="https://odins-eye-pi.vercel.app"><strong>Live at odins-eye-pi.vercel.app →</strong></a>
</p>

---

## The idea

Odin sacrificed an eye at Mimir's Well for wisdom — sight beyond the surface. That's the premise.

Most natal chart tools take birth data in and give generic text out. Odin's Eye takes birth data *and* the answers to a ten-step form about who you actually are — your family, your shadow, your fears, your patterns, the parts of yourself you don't put on a resume — then synthesizes all of it into a reading that feels like being seen.

It is not a horoscope. It is not a personality quiz. It is a portrait.

## What's in a reading

Every reading includes a full analytical chart and a prose interpretation structured in twelve sections, culminating in the synthesis — **Through Odin's Eye**.

### Placements calculated

Fourteen points, all computed from real ephemeris data and adjusted for the birth location's IANA timezone:

| Personal | Social | Outer | Shadow | Soul |
|---|---|---|---|---|
| Sun | Jupiter | Uranus | **Chiron** | **North Node** |
| Moon | Saturn | Neptune | **Lilith** | **South Node** |
| Mercury |  | Pluto |  | **Ascendant** |
| Venus |  |  |  |  |
| Mars |  |  |  |  |

Plus a full aspect grid (conjunctions, sextiles, squares, trines, oppositions) and elemental and modality balance.

### Reading sections

1. The Core of Who You Are — *Sun*
2. Your Emotional Architecture — *Moon*
3. The Face You Show the World — *Rising*
4. How You Think and Communicate — *Mercury*
5. How You Love — *Venus*
6. How You Fight and Pursue — *Mars*
7. Where You Grow — *Jupiter*
8. Where You're Tested — *Saturn*
9. Your Deepest Wound — *Chiron*
10. The Untamed — *Lilith*
11. The Depths — *Uranus, Neptune, Pluto*
12. The Nodal Axis — *Where you've been and where you're going*
13. **Through Odin's Eye** — The synthesis

## What makes it accurate

- **Timezone-correct chart calculation.** The birth city is geocoded, the IANA timezone is looked up from coordinates, and the local birth time is converted to true UTC with historical DST handling. No matter where the server runs, the chart is right.
- **Real ephemeris math.** Planetary positions come from `astronomy-engine`. Ascendant, North Node, Lilith, and Chiron are computed from Meeus formulas and Keplerian elements.
- **Deep personal context.** Ten form steps gather the psychological material that makes interpretation meaningful — not just birth data, but family, relationships, emotional patterns, and the places you feel stuck.
- **Honest, not flattering.** The interpretive prompt asks for clear-eyed recognition, not motivational poster language.

## The tech

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4, Cinzel + Inter |
| Astronomy | `astronomy-engine` + custom Meeus formulas |
| Timezones | `tz-lookup` + `date-fns-tz` |
| Interpretation | Anthropic Claude Sonnet 4 |
| PDF | `jsPDF` with embedded Cinzel |
| Geocoding | OpenStreetMap Nominatim |
| Host | Vercel (Fluid Compute) |

## Features beyond the reading

- **Streaming generation with heartbeats** — the 60–90 second interpretation call streams over NDJSON with 5-second heartbeats so mobile browsers don't drop the connection when backgrounded.
- **Progress save** — the form persists to `localStorage` and resumes exactly where you left off, even days later.
- **Branded PDF export** — cover page, chart data, aspect grid, element/modality balance, and the full reading, all exported as a designed document with Odinsark branding.
- **Interactive starfield** — parallax stars with constellation lines, frosted-glass cards, and a mystical dark celestial theme. Optimized for mobile GPUs.
- **City autocomplete** — birth city search via Nominatim, scoped to the selected country and state for disambiguation.
- **Form validation** — required natal fields are enforced before advancing.

## Running it locally

```bash
git clone https://github.com/odinsark/odins-eye.git
cd odins-eye
npm install
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

The only required environment variable is `ANTHROPIC_API_KEY`. Deploy to Vercel:

```bash
vercel --prod
```

Or push to the `main` branch — Vercel auto-deploys.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/       # Streaming chart + reading generation
│   │   └── pdf/            # PDF export
│   ├── reading/            # Reading results page
│   ├── layout.tsx          # Root layout with starfield background
│   └── page.tsx            # Home (form)
├── components/
│   ├── steps/              # 10 form steps
│   ├── ui/                 # Form primitives and autocomplete
│   ├── FormStepper.tsx     # Multi-step orchestrator
│   └── StarField.tsx       # Canvas starfield with parallax
└── lib/
    ├── chart.ts            # Astronomical chart calculation
    ├── geocode.ts          # City → lat/lng
    ├── prompt.ts           # Claude interpretation prompt
    ├── countries.ts        # Country autocomplete list
    ├── types.ts            # Form data types
    └── fonts/              # Cinzel + Inter TTFs for PDF embedding
```

---

<p align="center">
  <sub>
    Built by <strong>Odinsark Labs</strong> · Chicago<br />
    <em>Sight beyond the surface.</em>
  </sub>
</p>
