# Booth Rent vs Commission Calculator | Poli International

A free tool for tattoo artists, piercers and studio owners that compares the two
standard studio arrangements — **booth rent** and **commission split** — on the
same revenue stream, and shows where the crossover point sits.

Part of Poli International's open-source tool suite.

**Use it online:** https://poliinternational.com/booth-rent-calculator/  
**User guide:** [docs/USER-GUIDE.md](docs/USER-GUIDE.md)

## What it calculates

- **Side-by-side comparison** of booth rent and commission on identical revenue,
  from both the artist's and the studio owner's point of view.
- **Break-even revenue**, including tiered commission, hybrid rent-plus-commission,
  a minimum floor guarantee, and walk-in versus custom-booking splits.
- **Itemised consumables**, with each line assigned to whoever actually pays it
  under each model. Items can be priced monthly, per procedure, or as a
  percentage of gross (card fees).
- **Realistic month spread** — conservative, expected and peak scenarios derived
  from working days, appointments per day, average ticket and no-show rate.
- **Annual seasonality and cash flow**, including rent owed during weeks off.
- **Multi-chair studio floor planning** — occupancy, overhead cover and the
  number of stations needed to break even.
- **Shareable deal links**, saved presets, and print / CSV / JSON export.

## Requirements

Node.js 20 or newer. No database, no API key and no backend service.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # runs the i18n gate, then builds to dist/
npm run preview   # serve the production build
```

## Verify

```bash
npm run verify    # lint, engine tests, then build
```

Individual steps:

| Command | What it checks |
| --- | --- |
| `npm run lint` | TypeScript, no emit |
| `npm test` | Calculation-engine regression suite (65 assertions) |
| `npm run check:i18n` | Translation parity, placeholders, currency, banned claims, hardcoded strings, external resources |

## Languages

The interface ships in seven languages: English, French, Italian, German,
Spanish, Dutch and Portuguese.

`src/i18n/locales/en.ts` is the single canonical dictionary. Every other locale
must define exactly the same key set, and `npm run check:i18n` fails the build
if one does not — so a language cannot be half-translated without the build
stopping. English prices in GBP; the other six locales price in EUR. No dictionary value contains a literal
currency symbol: values use a `{cur}` token that the translate function
substitutes per locale, so a translated string can never disagree with the
number beside it.

## Data and privacy

The calculator runs entirely in your browser. It makes **no network request** of
any kind, and nothing you enter is transmitted anywhere — there is no server
component and no analytics.

Saved presets are written to your own browser's local storage under the key
`poli_booth_presets`, and never leave your device. Clearing site data removes
them.

## Project layout

```
index.html            entry point
src/
  App.tsx             application shell and state
  components/         one component per panel
  i18n/
    locales/          seven dictionaries, en.ts canonical
    translations.ts   translate function, currency and locale helpers
  utils/calculator.ts calculation engine, exporters, storage
  types.ts            shared type definitions
scripts/
  check-i18n.mjs      translation and content gate
  test-engine.mjs     calculation-engine regression suite
```

## Licence and disclaimer

This tool performs an arithmetic comparison. It is not financial, legal or tax
advice, and it is not an agreement or a contract.
