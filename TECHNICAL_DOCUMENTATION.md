# Booth Rent vs Commission Calculator - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

---

## Architecture Overview

### Technology Stack

The Booth Rent vs Commission Calculator is a **static, client-side single-page application** built with:

- **React 19.3.0** (production build, `react-jsx-runtime.production.js`, `react.production.js`, `react-dom.production.js`, `react-dom-client.production.js`)
- **React Scheduler** (`scheduler.production.js`) for concurrent rendering
- **Vite** as the build tool (evidenced by the hashed asset filenames and `type="module"` script tag)
- **Plain CSS** delivered as a single compiled stylesheet
- **No backend, no database, no network calls** for calculation logic. All arithmetic runs in the browser.

### File Structure

```
/tools/booth-rent-calculator/
├── index.html                          # Entry point, mounts #root
└── assets/
    ├── index-BZGb7dmM.js               # Bundled React app (minified)
    └── index-BOD1D5WI.css              # Compiled stylesheet
```

### Entry Point (`index.html`)

- Declares `<meta name="robots" content="noindex, nofollow" />` so the tool page is not indexed.
- Sets `lang="en"`, viewport meta for responsive layout.
- Provides Open Graph and Twitter Card metadata (`og:title`, `og:description`, `twitter:card`).
- Contains an **iframe theme bridge**: if the page is embedded (`window.self !== window.top`), it sets `data-theme="dark"` on `<html>` and listens for a `postMessage` event of type `poli-theme` to toggle light/dark based on `e.data.light`.
- Loads the module bundle via `<script type="module" crossorigin src="/tools/booth-rent-calculator/assets/index-BZGb7dmM.js">`.
- Loads the stylesheet via `<link rel="stylesheet" crossorigin href="/tools/booth-rent-calculator/assets/index-BOD1D5WI.css">`.
- Renders into `<div id="root"></div>`.

### Component / Logic Breakdown

The bundled JS is a minified React 19 production build. The React runtime provides the component model (`useState`, `useMemo`, `useEffect`, `useCallback`, `useRef`, `useId`, `useTransition`, `useDeferredValue`, `useOptimistic`, `useActionState`, `useFormState`, `useFormStatus`, etc.). The application-specific logic (deal comparison, break-even, tiered commission, hybrid rent-plus-commission, minimum guarantee, walk-in vs custom split, multi-offer matrix, simulation, annual cash flow, floor plan, consumables, break-even curve, printable sheet, presets, share link, CSV/JSON export, i18n) is compiled into the same bundle and is not individually exposed in the truncated source.

The **documentation.html** file describes the user-facing feature set (sections 1 through 11) that the bundle implements. It is a static documentation page, not part of the calculator runtime.

---

## Data Schemas

The provided source is a **minified production bundle**. The React runtime internals are visible (element symbols, hooks, scheduler state), but the application-level data objects are not present in the truncated excerpt. The following schemas are derived from the documented feature set in `documentation.html` and the visible runtime structures.

### React Element Shape (runtime, from `react-jsx-runtime.production.js`)

```js
{
  $$typeof: Symbol.for("react.transitional.element"),
  type: <Component | string>,
  key: <string | null>,
  ref: <ref | null>,
  props: <object>
}
```

### Deal Parameters (application-level, inferred from documented inputs)

| Field | Type | Example | Notes |
|---|---|---|---|
| `boothRentPerWeek` | number | `250` | Weekly booth rent |
| `commissionPercent` | number | `40` | Studio commission cut |
| `workingWeeksPerYear` | number | `48` | Weeks worked per year |
| `monthlyRevenue` | number | `6000` | Gross monthly revenue |
| `tieredCommission` | array | `[{ upTo: 3000, rate: 30 }, { upTo: 6000, rate: 40 }, { upTo: null, rate: 50 }]` | Up to three monthly brackets |
| `hybridBaseRent` | number | `150` | Lower base rent in hybrid model |
| `hybridCommissionPercent` | number | `20` | Reduced commission in hybrid model |
| `minimumWeeklyFloor` | number | `400` | Minimum guarantee floor |
| `walkInRevenue` | number | `2000` | Shop-provided foot traffic |
| `customClientRevenue` | number | `4000` | Artist-brought appointments |
| `workingDaysPerMonth` | number | `20` | Simulation input |
| `appointmentsPerDay` | number | `3` | Simulation input |
| `averageTicket` | number | `180` | Simulation input |
| `noShowRate` | number | `0.08` | Simulation input (8%) |
| `consumables` | array | see below | Line items |
| `stationRoster` | array | see below | Floor plan |
| `fixedOverhead` | object | `{ lease, rates, insurance, staff }` | Floor plan |

### Consumable Line Item

| Field | Type | Example | Notes |
|---|---|---|---|
| `name` | string | `"Standard piercing kit"` | Includes needles, gloves, barriers, skin prep, sterilisation indicators |
| `cost` | number | `4.50` | Amount |
| `basis` | enum | `"monthly" \| "perProcedure" \| "percentOfGross"` | Pricing basis |
| `paidBy` | enum | `"artist" \| "studio"` | Assignment per model |

### Station Roster Entry (floor plan)

| Field | Type | Example |
|---|---|---|
| `stationId` | string | `"S1"` |
| `occupied` | boolean | `true` |
| `model` | enum | `"boothRent" \| "commission"` |

### Saved Preset

| Field | Type | Example |
|---|---|---|
| `name` | string | `"City Centre Offer"` |
| `deal` | object | full deal parameter set |
| `savedAt` | ISO string | `"2025-01-15T10:30:00Z"` |

### Simulation Scenario

| Scenario | Volume Adjustment | Cancellation Adjustment |
|---|---|---|
| Conservative / Slow | -15% | +10% |
| Realistic / Expected | scheduled days | scheduled no-show rate |
| Peak / Busy | +20% | near-zero |

### Break-Even Curve Series

Four lines, each with a distinct stroke pattern for black-and-white printing:

| Series | Model | Stroke Pattern |
|---|---|---|
| Artist, booth rent | booth rent | solid |
| Artist, commission | commission | dashed |
| Owner, booth rent | booth rent | dotted |
| Owner, commission | commission | dash-dot |

---

## Calculation / Logic Algorithms

The application logic is compiled into the minified bundle and is not individually named in the provided excerpt. The following algorithms are documented from the feature set in `documentation.html`, which the bundle implements.

### 1. Break-Even Monthly Revenue

The single figure the decision turns on. Below it, commission costs the artist less; above it, booth rent does.

Conceptual formula:

```
artistNetBoothRent   = monthlyRevenue - boothRentPerWeek * (workingWeeksPerYear / 12) - artistConsumables
artistNetCommission  = monthlyRevenue * (1 - commissionPercent / 100) - artistConsumables
breakEvenMonthlyRevenue = solve(artistNetBoothRent == artistNetCommission)
```

At break-even, both models yield the same artist net.

### 2. Tiered / Sliding-Scale Commission

Applies a different studio cut to up to three monthly revenue brackets and reports the **blended effective rate**.

```
blendedRate = sum( bracketRevenue_i * rate_i ) / totalRevenue
```

### 3. Hybrid Rent-Plus-Commission

Combines a lower base rent with a reduced commission cut:

```
artistNetHybrid = monthlyRevenue * (1 - hybridCommissionPercent / 100)
                  - hybridBaseRent * (workingWeeksPerYear / 12)
                  - artistConsumables
```

### 4. Minimum Guarantee

The studio receives its commission **or** a minimum weekly floor, whichever is higher:

```
studioTake = max( monthlyRevenue * commissionPercent / 100,
                  minimumWeeklyFloor * (workingWeeksPerYear / 12) )
```

### 5. Walk-In vs Custom Client Split

Separates shop-provided foot traffic from appointments the artist brings in, allowing different commission treatment per revenue stream.

### 6. Realistic Simulation

Derives three months from `workingDaysPerMonth`, `appointmentsPerDay`, `averageTicket`, and `noShowRate`:

```
baseMonthlyRevenue = workingDaysPerMonth * appointmentsPerDay * averageTicket * (1 - noShowRate)
conservative       = baseMonthlyRevenue * 0.85 * (1 - (noShowRate + 0.10))
realistic          = baseMonthlyRevenue
peak               = baseMonthlyRevenue * 1.20 * (1 - nearZeroNoShow)
```

### 7. Annual Cash Flow

Projects 52 weeks with seasonal demand and time off. Booth rent remains payable during absence; commission does not. The annual total for each model is the sum of weekly net across the 52-week horizon.

### 8. Studio Floor Plan

Models the station roster, fixed commercial overhead (lease, rates, insurance, staff), and occupancy. Solves for the number of stations that must be filled for the studio to cover overhead under each model:

```
requiredOccupiedStations = ceil( fixedOverhead / contributionPerStation )
```

### 9. Consumables and Supplies

Each line item is priced **monthly**, **per procedure**, or as a **percentage of gross** (card fees), and assigned to the artist or the studio under each model. A standard piercing kit (needles, gloves and barriers, skin prep, sterilisation indicators) is included and editable.

### 10. Break-Even Curve

Plots net earnings against monthly revenue with four lines (artist/owner × booth rent/commission). The intersection of the artist lines equals the break-even revenue from section 1.

### 11. Printable Sheet

Produces a one-page A4 / US Letter summary of the deal and its results, clearly marked as a calculation, not an agreement, contract, or tenancy.

---

## API Reference

The provided source is a **minified production bundle**. No application-level public functions are individually named in the excerpt. The following are the **React runtime APIs** that are present and used by the bundle.

### React Hooks (from `react.production.js`)

| Hook | Signature | Behavior |
|---|---|---|
| `useState` | `useState(initial)` | Returns `[state, setState]` |
| `useReducer` | `useReducer(reducer, initial, init?)` | Returns `[state, dispatch]` |
| `useEffect` | `useEffect(fn, deps?)` | Runs side effects after render |
| `useLayoutEffect` | `useLayoutEffect(fn, deps?)` | Runs synchronously after DOM mutations |
| `useInsertionEffect` | `useInsertionEffect(fn, deps?)` | Runs before layout effects |
| `useMemo` | `useMemo(fn, deps)` | Memoizes a computed value |
| `useCallback` | `useCallback(fn, deps)` | Memoizes a callback |
| `useRef` | `useRef(initial)` | Returns a mutable ref object |
| `useContext` | `useContext(ctx)` | Reads context value |
| `useId` | `useId()` | Returns a stable unique ID |
| `useTransition` | `useTransition()` | Returns `[isPending, startTransition]` |
| `useDeferredValue` | `useDeferredValue(value)` | Defers a value |
| `useSyncExternalStore` | `useSyncExternalStore(sub, getSnap, getServer?)` | Subscribes to external store |
| `useOptimistic` | `useOptimistic(state, updateFn)` | Optimistic UI state |
| `useActionState` | `useActionState(action, initial, permalink?)` | Form action state |
| `useFormState` | `useFormState(action, initial, permalink?)` | Form state (react-dom) |
| `useFormStatus` | `useFormStatus()` | Form status (react-dom) |
| `useCacheRefresh` | `unstable_useCacheRefresh()` | Cache refresh |
| `useEffectEvent` | `useEffectEvent(fn)` | Stable effect event |
| `useDebugValue` | `useDebugValue(value)` | DevTools label |

### React DOM APIs (from `react-dom.production.js`)

| Function | Signature | Behavior |
|---|---|---|
| `createPortal` | `createPortal(children, container, key?)` | Renders into a different DOM node |
| `flushSync` | `flushSync(fn)` | Forces synchronous flush |
| `preconnect` | `preconnect(url, opts?)` | Preconnect hint |
| `prefetchDNS` | `prefetchDNS(url)` | DNS prefetch hint |
| `preinit` | `preinit(url, opts)` | Preload and initialize a resource |
| `preinitModule` | `preinitModule(url, opts?)` | Preload a module |
| `preload` | `preload(url, opts)` | Preload a resource |
| `preloadModule` | `preloadModule(url, opts?)` | Preload a module |
| `requestFormReset` | `requestFormReset(form)` | Resets a form |
| `unstable_batchedUpdates` | `unstable_batchedUpdates(fn, arg)` | Batches updates |

### Scheduler APIs (from `scheduler.production.js`)

| Function | Signature | Behavior |
|---|---|---|
| `unstable_scheduleCallback` | `(priority, callback, options?)` | Schedules a task |
| `unstable_cancelCallback` | `(task)` | Cancels a task |
| `unstable_shouldYield` | `()` | Returns whether to yield |
| `unstable_requestPaint` | `()` | Requests a paint |
| `unstable_now` | `()` | Current time |
| `unstable_getCurrentPriorityLevel` | `()` | Current priority |
| `unstable_ImmediatePriority` | `1` | Priority constant |
| `unstable_UserBlockingPriority` | `2` | Priority constant |
| `unstable_NormalPriority` | `3` | Priority constant |
| `unstable_LowPriority` | `4` | Priority constant |
| `unstable_IdlePriority` | `5` | Priority constant |
| `unstable_runWithPriority` | `(priority, fn)` | Runs at priority |
| `unstable_next` | `(fn)` | Runs at next priority |
| `unstable_wrapCallback` | `(fn)` | Wraps a callback |
| `unstable_forceFrameRate` | `(fps)` | Forces frame rate |
| `unstable_profiling` | `null` | Profiling hook |

### iframe Theme Bridge (from `index.html`)

| Mechanism | Detail |
|---|---|
| Detection | `window.self !== window.top` |
| Initial theme | `document.documentElement.setAttribute('data-theme', 'dark')` |
| Message listener | `window.addEventListener('message', ...)` |
| Message shape | `{ type: 'poli-theme', light: <boolean> }` |
| Effect | Sets `data-theme` to `'light'` or `'dark'` |

---

## Integration Guide

### Standalone Embedding

The tool is a **dependency-free static HTML/CSS/JS bundle**. It can be served from any static host. The live URL is:

```
https://poliinternational.com/tools/booth-rent-calculator/
```

### iframe Embedding

Embed the tool in an iframe. The page detects the iframe context and applies a dark theme by default. To sync the theme with the parent, post a message:

```js
iframe.contentWindow.postMessage({ type: 'poli-theme', light: false }, '*');
```

Set `light: true` for light mode, `light: false` for dark mode.

### Asset Paths

The bundle references assets with absolute paths:

```
/tools/booth-rent-calculator/assets/index-BZGb7dmM.js
/tools/booth-rent-calculator/assets/index-BOD1D5WI.css
```

If you host the tool under a different path, either preserve this directory structure or rebuild the bundle with the correct base path.

### No Backend Required

All calculations run in the browser. Nothing entered is sent anywhere. There is no API to call, no database to provision, and no server-side rendering.

### Robots

The entry page sets `<meta name="robots" content="noindex, nofollow" />`. If you want the tool indexed under your own domain, remove or override this tag.

---

## Customization

### Theming

The iframe bridge toggles `data-theme` between `'light'` and `'dark'` on the `<html>` element. Style overrides can target `[data-theme="light"]` and `[data-theme="dark"]` selectors.

### Language and Currency

The interface is available in **English, French, Italian, German, Spanish, Dutch, and Portuguese**. Amounts are formatted for the selected language. Language selection is part of the application bundle; changing the default language requires a rebuild or a runtime override exposed by the app.

### Consumables

The standard piercing kit (needles, gloves and barriers, skin prep, sterilisation indicators) is included and editable. Custom line items can be added with the custom consumables builder. Each item can be priced monthly, per procedure, or as a percentage of gross.

### Presets

Saved presets are stored in the user's own browser under a name such as "City Centre Offer". They are not synced across devices.

### Share Links

The share link feature copies a URL that opens the exact deal for anyone the link is sent to. The deal state is encoded in the URL.

### Export

CSV and JSON export download the full calculation for a spreadsheet or records.

---

## Performance

- **Static bundle**: no server round-trips for calculation.
- **React 19 concurrent rendering**: uses the scheduler for time-slicing and priority-based updates.
- **Module preload**: the bundle uses `modulepreload` link handling for its own module graph.
- **Memoization**: `useMemo` and `useCallback` are available for expensive derived values (break-even curve, simulation scenarios, annual cash flow).
- **No external network calls**: all inputs stay in the browser.

---

## Browser Compatibility

- Requires a browser that supports **ES modules** (`<script type="module">`).
- Requires **`postMessage`** and **`window.self` / `window.top`** for the iframe theme bridge.
- Requires **`MutationObserver`** for the module preload polyfill.
- Requires **`performance.now`** (falls back to `Date.now` in the scheduler).
- Requires **`MessageChannel`** or **`setTimeout`** for scheduler task dispatch.
- React 19 targets modern evergreen browsers (Chrome, Firefox, Safari, Edge).

---

## Security

### Input Handling

All inputs are processed client-side. Nothing entered is sent anywhere. There is no server to inject into.

### XSS Surface

- The bundle is a **React production build**. React escapes string children by default when rendering to the DOM.
- The only `postMessage` handler in `index.html` reads `e.data.type` and `e.data.light` and sets a `data-theme` attribute. It does not inject HTML.
- The iframe bridge does not validate `event.origin`. If you embed the tool and post messages to it, ensure the parent origin is trusted, or add an origin check in a customized build.

### No `dangerouslySetInnerHTML` in the excerpt

The truncated bundle does not show any `dangerouslySetInnerHTML` usage. If the application uses it for the printable sheet or documentation rendering, review those call sites in the full source.

### No Credentials

The tool does not request, store, or transmit credentials. Presets are stored in the user's own browser.

---

## Version History

### 1.0.0

- Initial release.
- Deal comparison: booth rent vs commission.
- Break-even monthly revenue.
- Tiered / sliding-scale commission (up to three brackets, blended effective rate).
- Hybrid rent-plus-commission.
- Minimum guarantee.
- Walk-in vs custom client split.
- Multi-offer matrix (up to three competing studio offers).
- Realistic simulation (Conservative / Realistic / Peak).
- Annual cash flow (52 weeks, seasonal demand, time off).
- Studio floor plan (station roster, fixed overhead, occupancy).
- Consumables and supplies (monthly, per procedure, percentage of gross; standard piercing kit; custom builder).
- Break-even curve (four lines with distinct stroke patterns).
- Printable sheet (A4 / US Letter).
- Saved presets, share link, CSV and JSON export.
- Seven languages: English, French, Italian, German, Spanish, Dutch, Portuguese.
- iframe theme bridge (`poli-theme` postMessage).

---

## Support / Contact

For questions, bug reports, or customization requests:

**Email:** support@poliinternational.com

**Live tool:** https://poliinternational.com/tools/booth-rent-calculator/

**Important notice:** This tool performs an arithmetic comparison only. It is not financial, legal, or tax advice, and it is not an agreement or a contract. Rules on booth leasing, employment classification, and tax differ by country: take qualified professional advice before signing anything.
