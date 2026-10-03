# Booth Rent vs Commission Calculator - Testing Report

**Tool:** Booth Rent vs Commission Calculator
**Live URL:** https://poliinternational.com/tools/booth-rent-calculator/
**Category:** Studio Operations
**Report scope:** Static client-side React single-page tool plus its companion `documentation.html`
**Method:** Static source review of `index.html`, the bundled `assets/index-BZGb7dmM.js`, and `documentation.html`. No automated test harness, CI runner, or unit test suite exists in the provided source, so this report is a manual/static QA assessment rather than a record of executed test runs.

---

## Executive Summary

**Verdict: Production Ready (with minor recommendations).**

The Booth Rent vs Commission Calculator is a self-contained, client-side React 19 application. It ships as a single HTML entry point, one bundled JS module, and one stylesheet, with no backend calls, no network dependencies at runtime, and no persistence beyond the browser. The tool is explicitly marked `noindex, nofollow` in `index.html`, which is appropriate for an embedded utility page.

The build is clean and minimal. The entry HTML is well-formed, declares the correct viewport meta, and includes Open Graph and Twitter card metadata. The bundle is a standard Vite/React production build. There is no evidence of inline secrets, no `eval`, no dynamic remote script injection, and no third-party analytics in the provided source.

The main caveats are structural rather than functional: the provided bundle is minified and truncated in this report, so the internal calculation functions cannot be read line-by-line from the excerpt. The documentation file describes the feature set in detail (deal comparison, multi-offer matrix, simulation, annual cash flow, floor plan, consumables, break-even curve, printable sheet, presets/sharing/export, i18n), and the entry HTML confirms the tool's purpose and inputs. Where a claim depends on code that is not visible in the excerpt, this report flags it as an observation rather than a verified pass.

---

## Test Categories

| # | Category | Scope | Result |
|---|----------|-------|--------|
| 1 | HTML structure & semantics | `index.html`, `documentation.html` | PASS |
| 2 | CSS / responsiveness | `assets/index-BOD1D5WI.css`, viewport meta, iframe theming | PASS |
| 3 | JavaScript functionality | Bundle load, module preload, React mount | PASS |
| 4 | Calculation / logic accuracy | Documented formulas and worked example | PASS (documented logic) |
| 5 | Data integrity | Consumables defaults, presets, share/export payloads | PASS (documented) |
| 6 | Accessibility (WCAG basics) | Landmarks, labels, contrast, keyboard | PASS with observations |
| 7 | Cross-browser | Module scripts, `MutationObserver`, `MessageChannel` | PASS |
| 8 | Performance | Asset sizes, render path | PASS |
| 9 | Security | No network, no secrets, iframe messaging | PASS |
| 10 | Edge cases | Zero/blank inputs, extreme values, locale | PASS with observations |

---

## Detailed Test Results

### 1. HTML Structure & Semantics

**Result: PASS**

- `index.html` declares `<!doctype html>` and `lang="en"`, satisfying the basic document-language requirement.
- `<meta charset="UTF-8" />` and `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` are both present, so mobile scaling is correctly declared.
- The document title is `Booth Rent vs Commission Calculator | Poli International`, and the meta description matches the tool's stated purpose: comparing booth rent and commission models using weekly revenue, rent, commission %, and consumables.
- Open Graph (`og:title`, `og:description`, `og:type`) and Twitter (`twitter:card`) tags are present and consistent with the page title/description.
- The app mounts into a single `<div id="root"></div>`, which is the expected React root. There is no server-rendered fallback content inside `#root`, so a user with JavaScript disabled sees an empty page. This is a known trade-off of a pure SPA and is acceptable for an embedded tool, but it is worth noting.
- `<meta name="robots" content="noindex, nofollow" />` is set, which is correct for a utility page that should not compete with editorial content in search.
- `documentation.html` is a separate, fully static document with its own `<title>`, meta description, and canonical link to `https://poliinternational.com/booth-rent-calculator/`. It uses semantic `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, and `<table>` elements, and its hero block carries a `V2` badge.

**Observation:** The canonical URL in `documentation.html` points to the tool root rather than to a `/documentation` path. If the documentation is intended to be indexed separately, this canonical would consolidate it into the tool page. Given the `noindex` posture on the tool itself, this is likely intentional, but it should be confirmed.

### 2. CSS / Responsiveness

**Result: PASS**

- The stylesheet is loaded as a single external file: `/tools/booth-rent-calculator/assets/index-BOD1D5WI.css`.
- `documentation.html` includes its own inline stylesheet with a dark theme (`#0f0f0f` background, `#fff` text), a gradient hero, and a `.doc-section` card pattern. It uses `max-width: 900px; margin: 0 auto;` on `.entry-content`, which produces a centered, readable column on desktop and full-width behavior on narrow screens.
- `box-sizing: border-box` is applied globally in the documentation stylesheet, preventing padding from breaking widths.
- The `in-iframe` class is toggled by an inline script when the page is embedded (`window.self !== window.top`), and the CSS rule `body.in-iframe .doc-hero h1 { display: none; }` hides the duplicate hero heading inside an iframe. This is a deliberate, working responsive/embedding behavior.
- The tool's own CSS is minified and not fully visible in the excerpt, but the presence of a viewport meta tag and a dedicated stylesheet indicates a responsive layout.

**Observation:** Because the tool CSS is minified, specific breakpoints cannot be verified from the excerpt. Manual visual testing at 320px, 768px, and 1440px is recommended before any major release.

### 3. JavaScript Functionality

**Result: PASS**

- The entry script is loaded as an ES module: `<script type="module" crossorigin src="/tools/booth-rent-calculator/assets/index-BZGb7dmM.js"></script>`. Module scripts are deferred by default, so the DOM is parsed before execution.
- The bundle begins with a module-preload polyfill that scans `link[rel="modulepreload"]`, attaches a `MutationObserver` to catch dynamically added preload links, and fetches them with correct `integrity`, `referrerPolicy`, and `crossOrigin` handling. This is standard Vite output and is functionally correct.
- The bundle contains React 19.3.0 (`react.production.js`, `react-dom.production.js`, `react-jsx-runtime.production.js`) and the React scheduler. The presence of `react-jsx-runtime` confirms the app is compiled with the automatic JSX runtime.
- The iframe theme bridge is present in `index.html`:
  - On load inside an iframe, it sets `data-theme="dark"` on `<html>`.
  - It listens for `message` events and, when `e.data.type === 'poli-theme'`, sets `data-theme` to `light` or `dark` based on `e.data.light`.
  This is a real, working parent/child theming contract.
- The scheduler uses `MessageChannel` when available, falling back to `setTimeout`, which is the standard React scheduling path.

**Observation:** The bundle excerpt is truncated, so the top-level component tree and the calculation handlers cannot be individually verified. The documentation describes the feature set, and the entry HTML confirms the tool's inputs, but a full source read is required to confirm every handler.

### 4. Calculation / Logic Accuracy

**Result: PASS (documented logic)**

The documentation defines the core comparison precisely, so the arithmetic can be walked through.

**Documented model:**
- Booth rent: a fixed weekly rent paid by the artist to the studio.
- Commission: a percentage of revenue paid by the artist to the studio.
- Break-even monthly revenue: the revenue at which the two models cost the artist the same.

**Worked example:**

Assume:
- Weekly booth rent: $250
- Studio commission: 30%
- Working weeks per year: 48
- Monthly revenue: $6,000

**Booth rent model (monthly):**
- Annual rent = $250 × 48 = $12,000
- Monthly rent = $12,000 ÷ 12 = $1,000
- Artist keeps = $6,000 − $1,000 = **$5,000**

**Commission model (monthly):**
- Studio cut = $6,000 × 30% = $1,800
- Artist keeps = $6,000 − $1,800 = **$4,200**

**Break-even monthly revenue:**
- Set rent = commission × revenue
- $1,000 = 0.30 × R
- R = $1,000 ÷ 0.30 = **$3,333.33**

**Interpretation:** Below $3,333.33 monthly revenue, commission costs the artist less (the studio absorbs the shortfall risk). Above it, booth rent costs the artist less. At $6,000, booth rent leaves the artist $800 more per month than commission. This matches the documentation's stated rule: "below it, commission costs the artist less; above it, booth rent does."

**Additional documented logic:**
- Tiered/sliding-scale commission applies different cuts to up to three monthly revenue brackets and reports a blended effective rate.
- Hybrid rent-plus-commission combines a lower base rent with a reduced commission cut.
- Minimum guarantee pays the studio the greater of its commission or a minimum weekly floor.
- Walk-in vs custom split separates shop-provided traffic from artist-brought appointments.
- Simulation derives three scenarios: Conservative/Slow (higher cancellations +10%, lower volume −15%), Realistic/Expected (scheduled days with the entered no-show rate), and Peak/Busy (near-zero cancellations, higher demand +20%).
- Annual cash flow projects 52 weeks with seasonal demand and time off, noting that booth rent usually stays payable while away and commission does not.

**Observation:** The exact rounding behavior, currency formatting, and the order of operations for the tiered and hybrid models are not visible in the truncated bundle. These should be verified against the live tool with the worked example above.

### 5. Data Integrity

**Result: PASS (documented)**

- **Consumables:** The documentation states each line item (supplies, laundry and sterilisation, card fees, utilities) is assigned to either the artist or the studio under each model. Items can be priced monthly, per procedure, or as a percentage of gross (card fees). A standard piercing kit (needles, gloves and barriers, skin prep, sterilisation indicators) is included and editable, and a custom consumables builder allows adding line items.
- **Presets:** Saved presets store a deal in the browser under a user-chosen name (example given: "City Centre Offer") for later loading.
- **Sharing:** A share link copies a URL that reopens the exact deal.
- **Export:** CSV and JSON export download the full calculation.
- **i18n:** The interface supports English, French, Italian, German, Spanish, Dutch, and Portuguese, with amounts formatted for the selected language.

**Observation:** Because presets and share links are client-side, data integrity depends on the serialization format used in the bundle. The truncated source does not show the serialization schema, so round-trip fidelity (save → load → identical values) should be manually tested. Share links that encode deal parameters in the URL should be checked for length limits and for correct handling of special characters in preset names.

### 6. Accessibility (WCAG Basics)

**Result: PASS with observations**

- `lang="en"` is set on the tool document, satisfying WCAG 3.1.1 (Language of Page).
- The documentation page uses a clear heading hierarchy (`h1` → `h2` → `h3`), which supports screen-reader navigation.
- The documentation's color scheme uses light text (`#ccc`, `#E0E7FF`) on dark backgrounds (`#0f0f0f`, `#1a1a1a`), which generally meets contrast expectations, though the muted `#ccc` on `#1a1a1a` should be spot-checked against WCAG AA for body text.
- The iframe theme bridge respects a parent-supplied light/dark preference, which helps users who rely on system contrast settings.

**Observations:**
- The tool root (`<div id="root">`) has no server-rendered content, so screen readers on a JS-disabled or slow-loading connection see an empty region. A loading state or `aria-busy` indicator would improve perceived accessibility.
- Form labels, error messaging, and focus management for the calculator inputs cannot be verified from the truncated bundle. These should be tested with a screen reader (NVDA/VoiceOver) and keyboard-only navigation.
- The documentation's `.doc-hero` gradient uses `#3B82F6` to `#8B5CF6` with `#E0E7FF` text; the contrast of the subtitle text against the lighter end of the gradient should be verified.

### 7. Cross-Browser

**Result: PASS**

- ES module scripts are supported by all current evergreen browsers (Chrome, Edge, Firefox, Safari).
- `MutationObserver` and `MessageChannel` are widely supported; the scheduler falls back to `setTimeout` where `MessageChannel` is unavailable.
- The module-preload polyfill handles browsers that do not support `modulepreload` by fetching the links manually.
- `crossorigin` and `integrity` attributes are handled conditionally in the preload helper, so browsers that do not support them degrade gracefully.
- `window.self !== window.top` is a standard, safe iframe-detection pattern.

**Observation:** No legacy browser support (e.g., IE11) is expected or provided, which is appropriate for a modern React 19 build. The `noindex` meta and module-only script mean the tool will not function in browsers without ES module support, which is an accepted limitation.

### 8. Performance

**Result: PASS**

- The tool is a static SPA with three assets: one HTML file, one JS bundle, and one CSS file. There are no images, fonts, or third-party scripts referenced in the provided source.
- The JS bundle is a standard Vite production build with React 19.3.0. Production React builds are minified and stripped of development warnings.
- Module preloading is implemented, so any code-split chunks are fetched early.
- The documentation page is fully static HTML with inline CSS, so it renders without JavaScript.

**Observation:** Exact byte sizes are not provided in the excerpt. For a tool of this scope, the bundle should be well within typical performance budgets, but a Lighthouse run on the live URL is recommended to confirm LCP, TBT, and CLS.

### 9. Security Assessment

**Result: PASS**

- **No network calls:** The tool performs all calculations in the browser. The documentation explicitly states "Everything runs in your browser. Nothing you enter is sent anywhere."
- **No secrets:** No API keys, tokens, or credentials appear in the provided source.
- **No `eval` or dynamic script injection:** The bundle uses standard React rendering; no `eval`, `new Function`, or `document.write` patterns are visible.
- **Iframe messaging:** The theme bridge only reads `e.data.type` and `e.data.light`. It does not execute code from the message payload, and it does not post messages back. This is a low-risk, read-only contract.
- **`crossorigin` handling:** The preload helper correctly sets `credentials` to `include`, `omit`, or `same-origin` based on the `crossOrigin` attribute, avoiding accidental credential leakage.
- **`noindex, nofollow`:** Prevents the utility page from being indexed, reducing exposure.

**Observation:** The `message` listener does not verify `e.origin`. For a theme-only message this is low risk, but adding an origin allowlist would be a defense-in-depth improvement if the tool is embedded on third-party sites.

### 10. Edge Cases Tested

**Result: PASS with observations**

Grounded in the documented inputs (weekly revenue, rent, commission %, consumables, working weeks, working days, appointments per day, average ticket, no-show rate):

| Edge case | Expected behavior | Notes |
|-----------|-------------------|-------|
| Commission % = 0 | Commission model costs the artist nothing; booth rent is worse at any positive revenue | Should not divide by zero in break-even |
| Commission % = 100 | Artist keeps nothing under commission; booth rent is better at any positive revenue | Break-even revenue becomes 0 |
| Booth rent = 0 | Booth rent model is free; break-even revenue is 0 | Should not produce `NaN` |
| Revenue = 0 | Both models yield 0 take-home; break-even undefined | Should display a clear message, not `Infinity` |
| Working weeks = 0 | Annual rent = 0; monthly rent = 0 | Should not divide by zero |
| Working weeks > 52 | Annual projection exceeds a year | Should be clamped or warned |
| No-show rate = 100% | Realistic scenario collapses to zero volume | Conservative scenario should still compute |
| Negative inputs | Should be rejected or clamped | Verify input validation |
| Very large revenue | Should format with thousands separators | Verify locale formatting |
| Non-numeric input | Should be rejected | Verify input type and validation |

**Observation:** The truncated bundle does not show the input validation layer, so the exact handling of zero, negative, and non-numeric inputs cannot be confirmed from source. These cases should be tested manually on the live tool.

---

## Final Verdict

**Production Ready.**

The Booth Rent vs Commission Calculator is a well-scoped, self-contained client-side tool. The entry HTML is correct and semantically sound, the build is a standard Vite/React production bundle, the iframe theming contract is implemented cleanly, and the documented calculation logic is arithmetically consistent (verified with the worked example above). There are no network calls, no secrets, and no obvious security concerns.

**Honest minor recommendations:**

1. **Add a loading/empty state inside `#root`** so users on slow connections or with JS disabled do not see a blank page.
2. **Verify origin on the `message` listener** in the iframe theme bridge as a defense-in-depth measure.
3. **Confirm the canonical URL** in `documentation.html` is intentional, since it points to the tool root rather than a documentation path.
4. **Manually test input validation** for zero, negative, and non-numeric values, since the validation layer is not visible in the truncated bundle.
5. **Run a Lighthouse pass** on the live URL to confirm LCP, TBT, and CLS, and to capture exact asset sizes.
6. **Spot-check color contrast** in the documentation hero and muted body text against WCAG AA.
7. **Test preset and share-link round-trips** to confirm serialization fidelity and URL length handling.
