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

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with ARIA-friendly structure
- **CSS3**, External stylesheet (`/tools/booth-rent-calculator/css/style.css`)
- **Vanilla JavaScript (ES5+)**, No frameworks, no dependencies
- **InputGuards**, Shared utility library (`/js/input-guards.js`) for input validation and sanitization

### File Structure

```
/tools/booth-rent-calculator/
├── index.html          # Main tool page
├── css/
│   └── style.css       # Tool-specific styling
└── js/
    └── app.js          # Core calculator logic
/js/
└── input-guards.js     # Shared input validation library
```

### Component / Logic Breakdown

The tool consists of three logical layers:

1. **Input Layer**, Seven numeric input fields grouped by model (Revenue, Booth Rent, Commission)
2. **Calculation Engine**, `app.js` event handler that computes net income under both models
3. **Presentation Layer**, Results card with verdict banner, detailed breakdown, and break-even analysis

## Data Schemas

### Input Fields (DOM Elements)

All inputs are `<input type="number">` elements accessed via `document.getElementById()`:

| Variable Name | Element ID | Type | Default | Min | Step |
|---|---|---|---|---|---|
| `weeklyRevenue` | `weekly-revenue` | number | 1200 | 0 | 50 |
| `weeksPerYear` | `weeks-per-year` | number | 48 | 1 | 1 |
| `boothRent` | `booth-rent` | number | 250 | 0 | 10 |
| `suppliesBooth` | `supplies-booth` | number | 80 | 0 | 5 |
| `commissionPct` | `commission-pct` | number | 40 | 0 | 1 |
| `suppliesComm` | `supplies-comm` | number | 0 | 0 | 5 |

### Internal Calculation Variables

Defined inside the click handler:

```javascript
var rev    = G.safeFloat(weeklyRevenue.value, NaN);  // Weekly client revenue
var weeks  = G.safeFloat(weeksPerYear.value, 48);    // Working weeks per year
var rent   = G.safeFloat(boothRent.value, 0);        // Weekly booth rent
var supB   = G.safeFloat(suppliesBooth.value, 0);    // Weekly supplies (booth model)
var commPct = G.safeFloat(commissionPct.value, 0);   // Studio commission percentage
var supC   = G.safeFloat(suppliesComm.value, 0);     // Weekly supplies (commission model)
```

### Derived Values

| Variable | Formula | Example (defaults) |
|---|---|---|
| `annualRev` | `rev * weeks` | 1200 × 48 = 57600 |
| `boothWeeklyCost` | `rent + supB` | 250 + 80 = 330 |
| `boothWeeklyNet` | `rev - boothWeeklyCost` | 1200 - 330 = 870 |
| `boothAnnualNet` | `boothWeeklyNet * weeks` | 870 × 48 = 41760 |
| `commWeeklyStudio` | `rev * (commPct / 100)` | 1200 × 0.4 = 480 |
| `commWeeklyNet` | `rev - commWeeklyStudio - supC` | 1200 - 480 - 0 = 720 |
| `commAnnualNet` | `commWeeklyNet * weeks` | 720 × 48 = 34560 |
| `beWeekly` | `(rent + supB - supC) / (commPct / 100)` | (250 + 80 - 0) / 0.4 = 825 |

## Calculation / Logic Algorithms

### Main Function: Click Handler

The calculation runs inside a single `click` event listener on the "Calculate" button (`#calc-btn`).

#### Step 1: Input Collection and Validation

```javascript
calcBtn.addEventListener('click', function () {
  var rev    = G.safeFloat(weeklyRevenue.value, NaN);
  var weeks  = G.safeFloat(weeksPerYear.value, 48);
  var rent   = G.safeFloat(boothRent.value, 0);
  var supB   = G.safeFloat(suppliesBooth.value, 0);
  var commPct = G.safeFloat(commissionPct.value, 0);
  var supC   = G.safeFloat(suppliesComm.value, 0);
```

- Uses `InputGuards.safeFloat()` to parse and sanitize each input
- Falls back to defaults if parsing fails (NaN for revenue, 48 for weeks, 0 for others)

#### Step 2: Validation Checks

```javascript
if (!G.isValid(rev) || rev < 0) {
  // Show error: "Enter a valid weekly revenue figure."
}
if (rev === 0) {
  // Show error: "Weekly revenue is zero..."
}
```

- Revenue must be a valid non-negative number
- Zero revenue triggers a specific warning message

#### Step 3: Cross-field Warnings

```javascript
if (rent > rev) {
  warnings.push('Booth rent exceeds weekly revenue...');
}
if (commPct === 100 && supC > 0) {
  warnings.push('At 100% commission, supplies cost comes out of your pocket...');
}
if (rev > 50000) {
  warnings.push('Weekly revenue of ... is very high...');
}
```

Three conditional warnings:
1. Booth rent exceeds revenue (loss scenario)
2. 100% commission with supplies cost
3. Revenue > £50,000/week (unusually high)

#### Step 4: Annual Revenue Calculation

```javascript
var annualRev = rev * weeks;
```

Simple multiplication of weekly revenue by working weeks.

#### Step 5: Booth Rent Model Calculations

```javascript
var boothWeeklyCost = rent + supB;
var boothWeeklyNet  = rev - boothWeeklyCost;
var boothAnnualNet  = boothWeeklyNet * weeks;
```

- **Weekly cost**: Fixed rent + supplies
- **Weekly net**: Revenue minus weekly cost
- **Annual net**: Weekly net × working weeks

#### Step 6: Commission Model Calculations

```javascript
var commWeeklyStudio = rev * (commPct / 100);
var commWeeklyNet    = rev - commWeeklyStudio - supC;
var commAnnualNet    = commWeeklyNet * weeks;
```

- **Studio commission**: Revenue × commission percentage
- **Weekly net**: Revenue minus studio commission minus artist supplies
- **Annual net**: Weekly net × working weeks

#### Step 7: Break-even Calculation

```javascript
var beWeekly = commPct > 0 ? (rent + supB - supC) / (commPct / 100) : null;
```

- Only calculated when commission percentage > 0
- Formula: (Booth rent + Booth supplies - Commission supplies) / Commission rate
- Represents the weekly revenue where both models yield equal net income

#### Step 8: Winner Determination

```javascript
var diff   = boothAnnualNet - commAnnualNet;
var winner = Math.abs(diff) < 50 ? 'equal' : (diff > 0 ? 'booth' : 'comm');
```

- Compares annual net income under both models
- Threshold of £50 for "equal" determination (avoids floating-point noise)

#### Step 9: Results Display

The verdict banner shows which model is better and by how much:

```javascript
if (winner === 'booth') {
  verdictBanner.textContent = 'Booth rent earns you ' + fmt(Math.abs(diff)) + ' more per year...';
} else if (winner === 'comm') {
  verdictBanner.textContent = 'Commission model earns you ' + fmt(Math.abs(diff)) + ' more per year...';
} else {
  verdictBanner.textContent = 'Both models produce similar annual income...';
}
```

### Helper Function: `fmt()`

```javascript
function fmt(n) {
  return '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

- Formats numbers as currency with £ prefix
- Two decimal places
- Thousands separator (comma)
- Example: `fmt(12345.6)` → `"£12,345.60"`

### Helper Function: `row()`

```javascript
function row(label, value, cls) {
  return '<div class="result-row"><div class="result-label">' + G.esc(label) + '</div><div class="result-value' + (cls ? ' ' + cls : '') + '">' + G.esc(String(value)) + '</div></div>';
}
```

- Generates HTML for a single result row
- Uses `InputGuards.esc()` for XSS prevention
- Optional CSS class for highlighting winning values

## API Reference

### Public Functions

#### `fmt(n)`

| Parameter | Type | Description |
|---|---|---|
| `n` | number | Numeric value to format |

**Returns**: string, Formatted currency string (e.g., `"£1,200.00"`)

#### `row(label, value, cls)`

| Parameter | Type | Description |
|---|---|---|
| `label` | string | Row label text |
| `value` | string | Row value text |
| `cls` | string (optional) | CSS class for highlighting |

**Returns**: string, HTML markup for a result row

### Event Handlers

#### `calcBtn.addEventListener('click', function() { ... })`

- **Trigger**: Click on "Calculate" button (`#calc-btn`)
- **Behavior**: Reads all input fields, validates, computes both models, displays results
- **Side effects**: Shows/hides results card, updates verdict banner, populates results body, sets break-even value

### External Dependencies

#### `InputGuards` (from `/js/input-guards.js`)

| Method | Usage |
|---|---|
| `G.safeFloat(value, fallback)` | Parses and sanitizes numeric input |
| `G.isValid(value)` | Checks if parsed value is valid |
| `G.esc(string)` | HTML-escapes strings for XSS prevention |
| `G.formatError(message)` | Formats error messages |
| `G.formatWarning(message)` | Formats warning messages |

## Integration Guide

### Standalone Embedding

The tool is fully self-contained and can be embedded via iframe:

```html
<iframe 
  src="https://poliinternational.com/tools/booth-rent-calculator/"
  width="100%"
  height="800"
  frameborder="0"
  title="Booth Rent vs Commission Calculator">
</iframe>
```

### Theme Support

The tool supports dark/light theme synchronization when embedded in an iframe:

```javascript
// Parent window sends theme preference
document.querySelector('iframe').contentWindow.postMessage({
  type: 'poli-theme',
  light: true  // or false for dark
}, '*');
```

### Dependencies

- **Zero external dependencies**, No jQuery, React, or third-party libraries
- **Static files only**, HTML, CSS, and vanilla JavaScript
- **Shared utility**, Requires `/js/input-guards.js` (served from Poli International's CDN)

## Customization

### Styling

The tool uses a dedicated stylesheet at `/tools/booth-rent-calculator/css/style.css`. Key CSS classes for customization:

- `.tool-wrapper`, Main container
- `.input-card`, Input section styling
- `.results-card`, Results section styling
- `.verdict-banner`, Winner announcement banner
- `.booth` / `.comm`, Highlight classes for winning values

### Default Values

Default values are set in the HTML `value` attributes:

```html
<input type="number" id="weekly-revenue" value="1200">
<input type="number" id="weeks-per-year" value="48">
<input type="number" id="booth-rent" value="250">
<input type="number" id="supplies-booth" value="80">
<input type="number" id="commission-pct" value="40">
<input type="number" id="supplies-comm" value="0">
```

## Performance

- **Lightweight**, Single HTML page with minimal CSS and JS
- **No network requests**, All logic runs client-side; no API calls
- **Instant calculation**, Computation completes in <1ms
- **No memory leaks**, No timers, observers, or persistent state

## Browser Compatibility

- **Chrome**, Full support
- **Firefox**, Full support
- **Safari**, Full support
- **Edge**, Full support
- **IE11**, Not supported (uses ES5+ features, but no polyfills)

The tool uses standard DOM APIs (`document.getElementById`, `addEventListener`) and ES5-compatible JavaScript.

## Security

### Input Handling

All user inputs are sanitized through `InputGuards`:

1. **`G.safeFloat()`**, Parses input as float, returns fallback on NaN
2. **`G.esc()`**, HTML-escapes all output strings to prevent XSS
3. **`G.formatError()` / `G.formatWarning()`**, Sanitized error/warning display

### XSS Prevention

- All user-facing text passes through `G.esc()` before DOM insertion
- No `innerHTML` usage with unsanitized data
- Input values are never directly concatenated into HTML strings

### Data Privacy

- **No data storage**, All calculations are performed client-side
- **No network transmission**, Input values never leave the browser
- **No cookies or localStorage**, Zero persistent state

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | Initial release | Core calculator with booth rent vs commission comparison, break-even analysis, and cross-field validation |

## Support / Contact

For technical support, feature requests, or bug reports:

- **Email**: support@poliinternational.com
- **Website**: https://poliinternational.com
- **Tool URL**: https://poliinternational.com/tools/booth-rent-calculator/
