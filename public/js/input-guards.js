/**
 * Poli International: Shared Input Validation Guards
 * 
 * Cross-tool validation utilities for all calculator UIs.
 * Drop-in: no dependencies, no globals polluting (all namespaced).
 */
'use strict';

var InputGuards = (function () {
  'use strict';

  /* ── HTML escaping (XSS protection) ── */
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Number parsing ───────────────────────────────────────── */
  function safeFloat(raw, fallback) {
    if (raw === null || raw === undefined || raw === '') return arguments.length > 1 ? fallback : NaN;
    var s = String(raw).trim();
    s = s.replace(/[£€$%\s]|mm$|cm$|in$|ml$|oz$|years?$/gi, '');
    s = s.replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? (arguments.length > 1 ? fallback : NaN) : n;
  }

  function isValid(v) {
    return typeof v === 'number' && isFinite(v);
  }

  /* ── Range guards ─────────────────────────────────────────── */
  function inRange(value, min, max, label) {
    if (!isValid(value)) {
      return { ok: false, message: (label || 'Value') + ' must be a valid number.' };
    }
    if (value < min) {
      return { ok: false, message: (label || 'Value') + ' must be at least ' + min + '.' };
    }
    if (value > max) {
      return { ok: false, message: (label || 'Value') + ' must not exceed ' + max + '.' };
    }
    return { ok: true, message: null };
  }

  function positive(value, label) {
    if (!isValid(value) || value <= 0) {
      return { ok: false, message: 'Enter a ' + (label || 'value') + ' greater than zero.' };
    }
    return { ok: true, message: null };
  }

  function unusualRange(value, typicalMin, typicalMax, label) {
    if (!isValid(value)) return null;
    if (value < typicalMin || value > typicalMax) {
      return 'Unusual ' + (label || 'measurement') + ' (typical range is ' + typicalMin + '–' + typicalMax + '). Verify before proceeding.';
    }
    return null;
  }

  /* ── Safe arithmetic ──────────────────────────────────────── */
  function safeDiv(numerator, denominator, fallback) {
    var fb = arguments.length > 2 ? fallback : NaN;
    if (!isValid(numerator) || !isValid(denominator) || denominator === 0) return fb;
    return numerator / denominator;
  }

  /* ── Error/warning rendering ──────────────────────────────── */
  function formatError(message) {
    return '<div class="poli-err-card" role="alert">' + esc(message) + '</div>';
  }

  function formatWarning(message) {
    return '<div class="poli-warn-card" role="alert">' + esc(message) + '</div>';
  }

  /* ── Default CSS injection ────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('poli-input-guards-css')) return;
    var style = document.createElement('style');
    style.id = 'poli-input-guards-css';
    style.textContent =
      '.poli-err-card{background:rgba(239,68,68,0.15);border-left:4px solid #ef4444;color:#fca5a5;padding:0.75rem 1rem;border-radius:6px;margin-bottom:1rem;font-size:0.95rem;font-weight:600;}' +
      '.poli-warn-card{background:rgba(245,158,11,0.15);border-left:4px solid #f59e0b;color:#fcd34d;padding:0.75rem 1rem;border-radius:6px;margin-bottom:1rem;font-size:0.95rem;}';
    document.head.appendChild(style);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  return {
    esc: esc,
    safeFloat: safeFloat,
    isValid: isValid,
    inRange: inRange,
    positive: positive,
    unusualRange: unusualRange,
    safeDiv: safeDiv,
    formatError: formatError,
    formatWarning: formatWarning,
  };
})();

if (typeof window !== 'undefined') {
  window.InputGuards = InputGuards;
}
