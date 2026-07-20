/* =========================================================
   LA PIRAMIDE — GRAFICA
   FILE: js/grafica.js

   Funzioni:
   - menu mobile
   - navbar durante lo scorrimento
   - navigazione interna con offset corretto
   - sezione attiva nella navbar
   - animazioni reveal
   - controllo caricamento immagini
   - effetto 3D leggero sulle immagini
   - parallasse sui grandi capitoli visivi
   - animazione dei biglietti da visita
   - anno automatico nel footer
   - gestione accessibile del menu
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =======================================================
     ELEMENTI PRINCIPALI
  ======================================================= */

  const body = document.body;
  const navbar = document.getElementById("navbar");
  const menuButton = document.getElementById("menuBtn");
  const navigation = document.getElementById("navLinks");
  const currentYear = document.getElementById("currentYear");

  const navigationLinks = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );

  const internalLinks = Array.from(
    document.querySelectorAll('a[href^="#"]:not([href="#"])')
  );

  const revealElements = Array.from(
    document.querySelectorAll(".reveal")
  );

  const pageImages = Array.from(
    document.querySelectorAll("img")
  );

  const visualChapters = Array.from(
    document.querySelectorAll(".visual-chapter")
  );

  const visualChapterImages = Array.from(
    document.querySelectorAll(".visual-chapter-image img")
  );

  const portfolioItems = Array.from(
    document.querySelectorAll(".portfolio-item")
  );

  const businessCards = Array.from(
    document.querySelectorAll(".business-card")
  );

  const heroArtwork = document.querySelector(".hero-artwork");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasFinePointer = window.matchMedia(
    "(pointer: fine)"
  ).matches;


  /* =======================================================
     ANNO AUTOMATICO
  ======================================================= */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =======================================================
     UTILITÀ GENERALI
  ======================================================= */

  function getNavbarHeight() {
    return navbar ? navbar.offsetHeight : 0;
  }

  function isMobileMenuOpen() {
    if (!menuButton || !navigation) {
      return false;
    }

    return (
      menuButton.classList.contains("active") &&
      navigation.classList.contains("open")
    );
  }


  /* =======================================================
     MENU MOBILE
  ======================================================= */

  function openMenu() {
    if (!menuButton || !navigation) {
      return;
    }

    menuButton.classList.add("active");
    navigation.classList.add("open");
    body.classList.add("menu-open");

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Chiudi il menu");
  }

  function closeMenu() {
    if (!menuButton || !navigation) {
      return;
    }

    menuButton.classList.remove("active");
    navigation.classList.remove("open");
    body.classList.remove("menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Apri il menu");
  }

  function toggleMenu() {
    if (isMobileMenuOpen()) {
      closeMenu();
      return;
    }

    openMenu();
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", toggleMenu);
  }


  /* =======================================================
     CHIUSURA MENU CLICCANDO FUORI
  ======================================================= */

  document.addEventListener("click", (event) => {
    if (
      !isMobileMenuOpen() ||
      !menuButton ||
      !navigation
    ) {
      return;
    }

    const clickedButton = menuButton.contains(event.target);
    const clickedNavigation = navigation.contains(event.target);

    if (!clickedButton && !clickedNavigation) {
      closeMenu();
    }
  });


  /* =======================================================
     CHIUSURA MENU CON ESC
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      !isMobileMenuOpen()
    ) {
      return;
    }

    closeMenu();
    menuButton?.focus();
  });


  /* =======================================================
     RESET MENU SU SCHERMI GRANDI
  ======================================================= */

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 1050) {
        closeMenu();
      }
    },
    {
      passive: true
    }
  );


  /* =======================================================
     NAVBAR DURANTE LO SCROLL
  ======================================================= */

  function updateNavbarAppearance() {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 25
    );
  }

  updateNavbarAppearance();

  window.addEventListener(
    "scroll",
    updateNavbarAppearance,
    {
      passive: true
    }
  );


  /* =======================================================
     ANIMAZIONI REVEAL
  ======================================================= */

  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach((element) => {
      element.classList.add("active");
      element.style.transitionDelay = "0ms";
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.09,
        rootMargin: "0px 0px -7% 0px"
      }
    );

    revealElements.forEach((element, index) => {
      const delayGroup = index % 4;
      const delay = Math.min(delayGroup * 80, 240);

      element.style.transitionDelay = `${delay}ms`;
      revealObserver.observe(element);
    });
  }


  /* =======================================================
     SCORRIMENTO VERSO LE SEZIONI
  ======================================================= */

  function scrollToSection(
    targetElement,
    behavior = "smooth"
  ) {
    if (!targetElement) {
      return;
    }

    const targetPosition =
      targetElement.getBoundingClientRect().top +
      window.scrollY -
      getNavbarHeight() -
      18;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: prefersReducedMotion ? "auto" : behavior
    });
  }


  /* =======================================================
     LINK INTERNI
  ======================================================= */

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (
        !targetId ||
        !targetId.startsWith("#")
      ) {
        return;
      }

      let targetElement = null;

      try {
        targetElement = document.querySelector(targetId);
      } catch (error) {
        return;
      }

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      scrollToSection(targetElement);
      closeMenu();

      if (window.history.pushState) {
        window.history.pushState(
          null,
          "",
          targetId
        );
      } else {
        window.location.hash = targetId;
      }
    });
  });


  /* =======================================================
     SEZIONI COLLEGATE ALLA NAVBAR
  ======================================================= */

  const observedSections = navigationLinks
    .map((link) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        !href.startsWith("#")
      ) {
        return null;
      }

      try {
        return document.querySelector(href);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);


  /* =======================================================
     LINK ATTIVO NELLA NAVBAR
  ======================================================= */

  function setActiveNavigation(sectionId) {
    navigationLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveSectionFromScroll() {
    if (observedSections.length === 0) {
      return;
    }

    const referencePosition =
      window.scrollY +
      getNavbarHeight() +
      window.innerHeight * 0.28;

    let currentSection = observedSections[0];

    observedSections.forEach((section) => {
      if (section.offsetTop <= referencePosition) {
        currentSection = section;
      }
    });

    if (currentSection?.id) {
      setActiveNavigation(currentSection.id);
    }
  }

  updateActiveSectionFromScroll();

  window.addEventListener(
    "scroll",
    updateActiveSectionFromScroll,
    {
      passive: true
    }
  );


  /* =======================================================
     HASH INIZIALE
  ======================================================= */

  function manageInitialHash() {
    const currentHash = window.location.hash;

    if (!currentHash) {
      return;
    }

    let targetElement = null;

    try {
      targetElement = document.querySelector(currentHash);
    } catch (error) {
      return;
    }

    if (!targetElement) {
      return;
    }

    window.setTimeout(() => {
      scrollToSection(targetElement, "auto");
    }, 140);
  }

  manageInitialHash();


  /* =======================================================
     AVANTI E INDIETRO DEL BROWSER
  ======================================================= */

  window.addEventListener("popstate", () => {
    const currentHash = window.location.hash;

    if (!currentHash) {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion
          ? "auto"
          : "smooth"
      });

      return;
    }

    let targetElement = null;

    try {
      targetElement = document.querySelector(currentHash);
    } catch (error) {
      return;
    }

    if (targetElement) {
      scrollToSection(targetElement);
    }
  });


  /* =======================================================
     CONTROLLO CARICAMENTO IMMAGINI
  ======================================================= */

  pageImages.forEach((image) => {
    function markImageAsLoaded() {
      image.classList.add("image-loaded");
      image.classList.remove("image-error");
    }

    function markImageAsUnavailable() {
      image.classList.add("image-error");
      image.classList.remove("image-loaded");

      image.setAttribute(
        "aria-label",
        "Immagine non disponibile"
      );
    }

    if (
      image.complete &&
      image.naturalWidth > 0
    ) {
      markImageAsLoaded();
    }

    image.addEventListener("load", markImageAsLoaded);
    image.addEventListener("error", markImageAsUnavailable);
  });


  /* =======================================================
     EFFETTO 3D LEGGERO SULLE FOTO
  ======================================================= */

  function addPhotoTiltEffect(container, intensity = 2) {
    if (
      !container ||
      !hasFinePointer ||
      prefersReducedMotion
    ) {
      return;
    }

    container.addEventListener("mousemove", (event) => {
      const bounds = container.getBoundingClientRect();

      const horizontalPosition =
        event.clientX - bounds.left;

      const verticalPosition =
        event.clientY - bounds.top;

      const rotateY =
        (
          horizontalPosition / bounds.width -
          0.5
        ) * intensity;

      const rotateX =
        (
          verticalPosition / bounds.height -
          0.5
        ) * -intensity;

      container.style.transform =
        `perspective(1100px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         translateY(-4px)`;
    });

    container.addEventListener("mouseleave", () => {
      container.style.transform =
        "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    });
  }

  addPhotoTiltEffect(heroArtwork, 2.4);

  portfolioItems.forEach((item) => {
    addPhotoTiltEffect(item, 1.7);
  });


  /* =======================================================
     PARALLASSE SUI GRANDI CAPITOLI VISIVI
  ======================================================= */

  function updateVisualChapterParallax() {
    if (
      prefersReducedMotion ||
      window.innerWidth <= 1050
    ) {
      visualChapterImages.forEach((image) => {
        image.style.transform = "";
      });

      return;
    }

    visualChapters.forEach((chapter) => {
      const image = chapter.querySelector(
        ".visual-chapter-image img"
      );

      if (!image) {
        return;
      }

      const bounds = chapter.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (
        bounds.bottom < 0 ||
        bounds.top > viewportHeight
      ) {
        return;
      }

      const progress =
        (
          viewportHeight - bounds.top
        ) /
        (
          viewportHeight + bounds.height
        );

      const movement =
        (progress - 0.5) * 24;

      image.style.transform =
        `scale(1.045) translateY(${movement}px)`;
    });
  }

  if (!prefersReducedMotion) {
    updateVisualChapterParallax();

    window.addEventListener(
      "scroll",
      updateVisualChapterParallax,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      updateVisualChapterParallax,
      {
        passive: true
      }
    );
  }


  /* =======================================================
     EFFETTO SUI BIGLIETTI DA VISITA
  ======================================================= */

  if (
    hasFinePointer &&
    !prefersReducedMotion
  ) {
    businessCards.forEach((card, index) => {
      const originalTransform =
        window.getComputedStyle(card).transform;

      card.addEventListener("mousemove", (event) => {
        const bounds = card.getBoundingClientRect();

        const horizontalProgress =
          (
            event.clientX - bounds.left
          ) /
          bounds.width -
          0.5;

        const verticalProgress =
          (
            event.clientY - bounds.top
          ) /
          bounds.height -
          0.5;

        card.style.transform =
          `perspective(950px)
           rotateX(${verticalProgress * -5}deg)
           rotateY(${horizontalProgress * 5}deg)
           translateY(-8px)
           scale(1.035)`;

        card.style.zIndex = String(20 + index);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.zIndex = "";
      });
    });
  }


  /* =======================================================
     EFFETTO DI PROFONDITÀ SULLA HERO
  ======================================================= */

  const heroVisual = document.querySelector(".hero-visual");

  if (
    heroVisual &&
    heroArtwork &&
    hasFinePointer &&
    !prefersReducedMotion
  ) {
    heroVisual.addEventListener("mousemove", (event) => {
      const bounds = heroVisual.getBoundingClientRect();

      const horizontalProgress =
        (
          event.clientX - bounds.left
        ) /
        bounds.width -
        0.5;

      const verticalProgress =
        (
          event.clientY - bounds.top
        ) /
        bounds.height -
        0.5;

      heroArtwork.style.transform =
        `perspective(1200px)
         rotateX(${verticalProgress * -3}deg)
         rotateY(${horizontalProgress * 3}deg)
         translateY(-4px)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
      heroArtwork.style.transform = "";
    });
  }


  /* =======================================================
     ACCESSIBILITÀ MENU — BLOCCO DEL FOCUS
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Tab" ||
      !isMobileMenuOpen() ||
      !navigation ||
      !menuButton
    ) {
      return;
    }

    const focusableElements = Array.from(
      navigation.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    focusableElements.unshift(menuButton);

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  });
});