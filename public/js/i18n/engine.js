/**
 * Poli International i18n Translation Engine
 * Registers and exposes language dictionaries and translation methods for the calculation suite.
 */
'use strict';

(function () {
  window.locales = window.locales || {};
  window.currentLocale = window.currentLocale || 'en';

  function registerLocale(lang, dict) {
    if (!lang || !dict) return;
    window.locales[lang] = dict;
  }

  function setLocale(lang) {
    if (window.locales[lang]) {
      window.currentLocale = lang;
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
      }
      return true;
    }
    return false;
  }

  function getLocale() {
    return window.currentLocale || 'en';
  }

  function t(key, params, localeOverride) {
    var lang = localeOverride || window.currentLocale || 'en';
    var dict = window.locales[lang] || window.locales['en'] || {};
    var str = dict[key];

    if (str === undefined && lang !== 'en' && window.locales['en']) {
      str = window.locales['en'][key];
    }
    if (str === undefined) {
      str = key;
    }

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), String(params[k]));
      });
    }

    return str;
  }

  window.registerLocale = registerLocale;
  window.registerTranslation = registerLocale;
  window.setLocale = setLocale;
  window.getLocale = getLocale;
  window.t = t;
})();
