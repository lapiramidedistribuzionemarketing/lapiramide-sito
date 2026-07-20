(function () {
  "use strict";

  const pageNames = {
    "/": "Home",
    "/index.html": "Home",
    "/distribuzioni.html": "Distribuzioni",
    "/grafica.html": "Grafica",
    "/track.html": "Track",
    "/gestionali.html": "Gestionali",
    "/hospitality.html": "Hospitality"
  };
  const socialHosts = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "tiktok.com",
    "twitter.com",
    "x.com"
  ];
  const scrollMilestones = [25, 50, 75, 100];
  const scrollEvents = {
    25: "scroll_25",
    50: "scroll_50",
    75: "scroll_75",
    100: "scroll_100"
  };
  const reachedScrollMilestones = new Set();
  const pageName = pageNames[window.location.pathname] || document.title;

  function sendEvent(eventName, parameters) {
    if (typeof window.gtag !== "function") return;

    try {
      window.gtag("event", eventName, parameters || {});
    } catch (error) {
      // Il monitoraggio non deve mai interferire con il funzionamento del sito.
    }
  }

  function elementLabel(element) {
    return (
      element.getAttribute("aria-label") ||
      element.textContent ||
      element.getAttribute("title") ||
      ""
    ).trim().replace(/\s+/g, " ").slice(0, 100);
  }

  function elementArea(element) {
    const section = element.closest("section, header, footer, nav");
    return section ? section.id || section.tagName.toLowerCase() : "page";
  }

  function safeUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (error) {
      return null;
    }
  }

  // Visualizzazione pagina e apertura delle pagine/aree di servizio richieste.
  sendEvent("page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  if (Object.prototype.hasOwnProperty.call(pageNames, window.location.pathname)) {
    sendEvent("service_open", {
      service_name: pageName,
      page_path: window.location.pathname
    });
  }

  // Scroll: ogni soglia viene inviata una sola volta per visualizzazione pagina.
  function trackScroll() {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    const scrollableHeight = documentHeight - window.innerHeight;
    const percentage = scrollableHeight <= 0
      ? 100
      : Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));

    scrollMilestones.forEach(function (milestone) {
      if (percentage >= milestone && !reachedScrollMilestones.has(milestone)) {
        reachedScrollMilestones.add(milestone);
        sendEvent(scrollEvents[milestone], {
          percent_scrolled: milestone,
          page_name: pageName
        });
      }
    });
  }

  window.addEventListener("scroll", trackScroll, { passive: true });
  window.addEventListener("load", trackScroll);

  // Click delegati: funzionano anche per elementi aggiunti dinamicamente.
  document.addEventListener("click", function (event) {
    const element = event.target.closest("a, button, [role='button']");
    if (!element) return;

    const href = element.getAttribute("href") || "";
    const url = safeUrl(href);
    const label = elementLabel(element);
    const common = {
      link_text: label,
      link_area: elementArea(element),
      page_name: pageName
    };

    if (url && (url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com"))) {
      sendEvent("whatsapp_click", common);
    }

    if (href.toLowerCase().startsWith("mailto:")) {
      sendEvent("email_click", common);
    }

    if (url && socialHosts.some(function (host) {
      return url.hostname === host || url.hostname.endsWith("." + host);
    })) {
      sendEvent("social_click", Object.assign({ social_network: url.hostname }, common));
    }

    if (url && url.pathname.toLowerCase().endsWith(".pdf")) {
      sendEvent("pdf_download", Object.assign({ file_name: url.pathname.split("/").pop() }, common));
    }

    if (element.matches(".btn, .sector-button, .nav-cta, .whatsapp-float, a.contact-card, button:not(.menu-btn), [role='button']")) {
      sendEvent("cta_click", common);
    }
  });

  // Tempo visibile effettivo, espresso sia in secondi sia nel formato GA4 in ms.
  let visibleSince = document.visibilityState === "visible" ? Date.now() : null;
  let visibleTime = 0;
  let lastReportedTime = 0;

  function updateVisibleTime() {
    if (visibleSince !== null) {
      visibleTime += Date.now() - visibleSince;
      visibleSince = null;
    }
  }

  function reportTimeOnPage() {
    updateVisibleTime();
    const roundedTime = Math.round(visibleTime / 1000);
    if (visibleTime <= lastReportedTime) return;

    lastReportedTime = visibleTime;
    sendEvent("time_on_page", {
      engagement_time_msec: Math.round(visibleTime),
      time_seconds: roundedTime,
      page_name: pageName,
      transport_type: "beacon"
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      reportTimeOnPage();
    } else if (visibleSince === null) {
      visibleSince = Date.now();
    }
  });
  window.addEventListener("pagehide", reportTimeOnPage);

  // Errori runtime e Promise rifiutate non gestite, senza stack trace o dati sensibili.
  window.addEventListener("error", function (event) {
    sendEvent("javascript_error", {
      error_message: String(event.message || "JavaScript error").slice(0, 150),
      script_name: event.filename ? event.filename.split("/").pop() : "inline",
      line_number: event.lineno || 0,
      page_name: pageName,
      non_interaction: true
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    const reason = event.reason && event.reason.message
      ? event.reason.message
      : String(event.reason || "Unhandled promise rejection");
    sendEvent("javascript_error", {
      error_message: reason.slice(0, 150),
      error_type: "unhandled_rejection",
      page_name: pageName,
      non_interaction: true
    });
  });
})();
