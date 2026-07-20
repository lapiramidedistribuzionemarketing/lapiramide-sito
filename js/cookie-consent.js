(function () {
  "use strict";

  const STORAGE_KEY = "laPiramideCookieConsent";
  const CONSENT_VERSION = 1;
  // Il repository non contiene un Measurement ID: inserirlo qui (formato G-...) per abilitare GA4 dopo il consenso.
  const GA_ID = "";
  let lastFocus = null;
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    if (arguments[0] === "event") {
      const consent = readConsent();
      if (!consent || !consent.analytics) return;
    }
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && value.version === CONSENT_VERSION ? value : null;
    } catch (error) { return null; }
  }

  function loadAnalytics() {
    if (analyticsLoaded || !/^G-[A-Z0-9]+$/i.test(GA_ID)) return;
    analyticsLoaded = true;
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function applyConsent(value) {
    window.gtag("consent", "update", { analytics_storage: value.analytics ? "granted" : "denied" });
    if (value.analytics) loadAnalytics();
  }

  function saveConsent(analytics) {
    const value = { version: CONSENT_VERSION, necessary: true, analytics: Boolean(analytics), savedAt: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (error) { /* Il consenso resta valido per la sessione. */ }
    applyConsent(value);
    closePreferences();
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) banner.hidden = true;
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: value }));
  }

  function closePreferences() {
    const backdrop = document.getElementById("cookie-preferences-backdrop");
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.classList.remove("cc-lock");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function openPreferences() {
    const backdrop = document.getElementById("cookie-preferences-backdrop");
    const checkbox = document.getElementById("cc-analytics");
    if (!backdrop || !checkbox) return;
    const consent = readConsent();
    checkbox.checked = Boolean(consent && consent.analytics);
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add("cc-lock");
    backdrop.querySelector(".cc-close").focus();
  }

  function markup() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = '<aside class="cc-banner" id="cookie-consent-banner" aria-labelledby="cc-title" aria-describedby="cc-description" hidden>' +
      '<div class="cc-copy"><h2 id="cc-title">Rispettiamo la tua privacy</h2><p id="cc-description">Usiamo cookie tecnici necessari e, solo con il tuo consenso, Google Analytics 4 per capire come viene utilizzato il sito. <a href="cookie-policy.html">Leggi la Cookie Policy</a>.</p></div>' +
      '<div class="cc-actions"><button class="cc-button cc-button-primary" type="button" data-cc="accept">Accetta</button><button class="cc-button" type="button" data-cc="reject">Rifiuta</button><button class="cc-button" type="button" data-cc="preferences">Personalizza</button></div></aside>' +
      '<div class="cc-backdrop" id="cookie-preferences-backdrop" hidden><section class="cc-modal" role="dialog" aria-modal="true" aria-labelledby="cc-modal-title"><button class="cc-close" type="button" aria-label="Chiudi preferenze">&times;</button><h2 id="cc-modal-title">Preferenze cookie</h2><p>Scegli quali categorie autorizzare. I cookie necessari non possono essere disattivati perché servono a memorizzare la scelta.</p><div class="cc-category"><div class="cc-category-head"><strong>Necessari</strong><span class="cc-status">Sempre attivi</span></div><p>Memorizzano esclusivamente le preferenze sul consenso e garantiscono funzioni richieste.</p></div><div class="cc-category"><div class="cc-category-head"><label for="cc-analytics"><strong>Analitici</strong></label><input class="cc-toggle" id="cc-analytics" type="checkbox" role="switch"></div><p>Consentono l’attivazione di Google Analytics 4 per statistiche aggregate sull’uso del sito.</p></div><div class="cc-actions"><button class="cc-button cc-button-primary" type="button" data-cc="save">Salva preferenze</button><button class="cc-button" type="button" data-cc="reject">Rifiuta non necessari</button></div><p class="cc-legal-links"><a href="privacy.html">Privacy Policy</a> · <a href="cookie-policy.html">Cookie Policy</a></p></section></div>';
    document.body.appendChild(wrapper);
  }

  function init() {
    markup();
    const consent = readConsent();
    if (consent) applyConsent(consent);
    else document.getElementById("cookie-consent-banner").hidden = false;

    document.addEventListener("click", function (event) {
      const control = event.target.closest("[data-cc], [data-cookie-preferences]");
      if (!control) return;
      const action = control.dataset.cc || "preferences";
      if (action === "accept") saveConsent(true);
      if (action === "reject") saveConsent(false);
      if (action === "preferences") openPreferences();
      if (action === "save") saveConsent(document.getElementById("cc-analytics").checked);
    });
    document.querySelector(".cc-close").addEventListener("click", closePreferences);
    document.getElementById("cookie-preferences-backdrop").addEventListener("click", function (event) { if (event.target === this) closePreferences(); });
    document.addEventListener("keydown", function (event) {
      const backdrop = document.getElementById("cookie-preferences-backdrop");
      if (backdrop.hidden) return;
      if (event.key === "Escape") closePreferences();
      if (event.key === "Tab") {
        const focusable = Array.from(backdrop.querySelectorAll('button, input, a[href]'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  window.LaPiramideConsent = { openPreferences: openPreferences, getConsent: readConsent };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
