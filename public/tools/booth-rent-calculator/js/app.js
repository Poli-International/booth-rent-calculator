'use strict';

var G = typeof InputGuards !== 'undefined' ? InputGuards : {
  safeFloat: function(raw, fallback) {
    if (raw === null || raw === undefined || raw === '') return arguments.length > 1 ? fallback : NaN;
    var s = String(raw).trim().replace(/[£€$%\s]|mm$|cm$|in$|ml$|oz$|years?$/gi, '').replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? (arguments.length > 1 ? fallback : NaN) : n;
  },
  isValid: function(v) {
    return typeof v === 'number' && !isNaN(v) && isFinite(v);
  },
  esc: function(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
  formatError: function(msg) {
    return '<div class="poli-err-card" role="alert">' + String(msg) + '</div>';
  },
  formatWarning: function(msg) {
    return '<div class="poli-warn-card" role="alert">⚠️ ' + String(msg) + '</div>';
  }
};

var weeklyRevenue = document.getElementById('weekly-revenue');
var weeksPerYear  = document.getElementById('weeks-per-year');
var boothRent     = document.getElementById('booth-rent');
var suppliesBooth = document.getElementById('supplies-booth');
var commissionPct = document.getElementById('commission-pct');
var suppliesComm  = document.getElementById('supplies-comm');
var calcBtn       = document.getElementById('calc-btn');
var resultsCard   = document.getElementById('results-card');
var verdictBanner = document.getElementById('verdict-banner');
var resultsBody   = document.getElementById('results-body');
var breakevenValue = document.getElementById('breakeven-value');

function fmt(n) { return '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function row(label, value, cls) {
  return '<div class="result-row"><div class="result-label">' + G.esc(label) + '</div><div class="result-value' + (cls ? ' ' + cls : '') + '">' + G.esc(String(value)) + '</div></div>';
}

function calculate() {
  if (!weeklyRevenue || !calcBtn || !resultsCard || !resultsBody || !verdictBanner || !breakevenValue) return;

  var rev    = G.safeFloat(weeklyRevenue.value, NaN);
  var weeks  = G.safeFloat(weeksPerYear.value, 48);
  var rent   = G.safeFloat(boothRent.value, 0);
  var supB   = G.safeFloat(suppliesBooth.value, 0);
  var commPct = G.safeFloat(commissionPct.value, 0);
  var supC   = G.safeFloat(suppliesComm.value, 0);

  // ── Validation ──
  if (!G.isValid(rev) || rev < 0) {
    resultsCard.style.display = '';
    resultsBody.innerHTML = G.formatError('Enter a valid weekly revenue figure.');
    verdictBanner.textContent = '';
    verdictBanner.className = 'verdict-banner';
    breakevenValue.textContent = '—';
    return;
  }
  if (rev === 0) {
    resultsCard.style.display = '';
    resultsBody.innerHTML = G.formatError('Weekly revenue is zero: enter your revenue to compare models.');
    verdictBanner.textContent = '';
    verdictBanner.className = 'verdict-banner';
    breakevenValue.textContent = '—';
    return;
  }

  var warnings = [];

  // Cross-field: booth rent > weekly revenue
  if (rent > rev) {
    warnings.push('Booth rent exceeds weekly revenue: you would be running at a loss on the booth model.');
  }

  // Cross-field: 100% commission + supplies
  if (commPct === 100 && supC > 0) {
    warnings.push('At 100% commission, supplies cost comes out of your pocket directly; review your figures.');
  }

  // Revenue warning
  if (rev > 50000) {
    warnings.push('Weekly revenue of ' + G.esc(String(rev)) + ' is very high (~' + fmt(rev * weeks) + '/yr). Please verify.');
  }

  var annualRev = rev * weeks;

  // Booth rent model
  var boothWeeklyCost = rent + supB;
  var boothWeeklyNet  = rev - boothWeeklyCost;
  var boothAnnualNet  = boothWeeklyNet * weeks;

  // Commission model
  var commWeeklyStudio = rev * (commPct / 100);
  var commWeeklyNet    = rev - commWeeklyStudio - supC;
  var commAnnualNet    = commWeeklyNet * weeks;

  // Break-even
  var beWeekly = commPct > 0 ? (rent + supB - supC) / (commPct / 100) : null;

  var diff   = boothAnnualNet - commAnnualNet;
  var winner = Math.abs(diff) < 50 ? 'equal' : (diff > 0 ? 'booth' : 'comm');

  verdictBanner.className = 'verdict-banner ' + winner;
  if (winner === 'booth') {
    verdictBanner.textContent = 'Booth rent earns you ' + fmt(Math.abs(diff)) + ' more per year at your current revenue.';
  } else if (winner === 'comm') {
    verdictBanner.textContent = 'Commission model earns you ' + fmt(Math.abs(diff)) + ' more per year at your current revenue.';
  } else {
    verdictBanner.textContent = 'Both models produce similar annual income at your current revenue.';
  }

  resultsBody.innerHTML =
    (warnings.length ? '<div style="margin-bottom:1rem">' + warnings.map(function(w) { return G.formatWarning(w); }).join('') + '</div>' : '') +
    row('Annual revenue', fmt(annualRev)) +
    '<div class="result-divider"></div>' +
    row('Booth rent: weekly net', fmt(boothWeeklyNet), boothWeeklyNet >= commWeeklyNet ? 'booth' : '') +
    row('Booth rent: annual net', fmt(boothAnnualNet), boothAnnualNet >= commAnnualNet ? 'booth' : '') +
    '<div class="result-divider"></div>' +
    row('Commission: weekly net', fmt(commWeeklyNet), commWeeklyNet > boothWeeklyNet ? 'comm' : '') +
    row('Commission: annual net', fmt(commAnnualNet), commAnnualNet > boothAnnualNet ? 'comm' : '');

  breakevenValue.textContent = beWeekly !== null && beWeekly > 0 ? fmt(beWeekly) + ' / week' : 'N/A';
  resultsCard.style.display = '';
}

if (calcBtn) {
  calcBtn.addEventListener('click', calculate);
}
