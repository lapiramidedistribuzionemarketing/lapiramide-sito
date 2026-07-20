/* =========================================================
   LA PIRAMIDE — HOME PAGE
   FILE: js/index.js

   Funzioni:
   - menu mobile
   - navbar durante lo scorrimento
   - comparsa animata degli elementi
   - link attivo nella navigazione
   - scorrimento morbido
   - gestione corretta dell'hash
   - anno automatico nel footer
   - controllo delle immagini
   - effetto leggero sul logo
   - effetto elegante sulle immagini dei settori
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

  const images = Array.from(
    document.querySelectorAll("img")
  );

  const sectorImages = Array.from(
    document.querySelectorAll(".sector-image")
  );

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
     ALTEZZA DELLA NAVBAR
  ======================================================= */

  function getNavbarHeight() {
    if (!navbar) {
      return 0;
    }

    return navbar.offsetHeight;
  }


  /* =======================================================
     MENU MOBILE
  ======================================================= */

  function menuIsOpen() {
    if (!menuButton || !navigation) {
      return false;
    }

    return (
      menuButton.classList.contains("active") &&
      navigation.classList.contains("open")
    );
  }

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
    if (menuIsOpen()) {
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
      !menuIsOpen() ||
      !menuButton ||
      !navigation
    ) {
      return;
    }

    const clickedMenuButton = menuButton.contains(event.target);
    const clickedInsideNavigation = navigation.contains(event.target);

    if (
      !clickedMenuButton &&
      !clickedInsideNavigation
    ) {
      closeMenu();
    }
  });


  /* =======================================================
     CHIUSURA MENU CON IL TASTO ESC
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      !menuIsOpen()
    ) {
      return;
    }

    closeMenu();

    if (menuButton) {
      menuButton.focus();
    }
  });


  /* =======================================================
     RESET DEL MENU SU SCHERMI GRANDI
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
     COMPARSA ANIMATA DEGLI ELEMENTI
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
        threshold: 0.1,
        rootMargin: "0px 0px -7% 0px"
      }
    );

    revealElements.forEach((element, index) => {
      const delayGroup = index % 4;
      const delay = Math.min(delayGroup * 85, 255);

      element.style.transitionDelay = `${delay}ms`;

      revealObserver.observe(element);
    });
  }


  /* =======================================================
     SCORRIMENTO VERSO UNA SEZIONE
  ======================================================= */

  function scrollToSection(
    targetElement,
    behavior = "smooth"
  ) {
    if (!targetElement) {
      return;
    }

    const navbarHeight = getNavbarHeight();

    const targetPosition =
      targetElement.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight -
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

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      scrollToSection(targetElement);

      if (window.history.pushState) {
        window.history.pushState(
          null,
          "",
          targetId
        );
      } else {
        window.location.hash = targetId;
      }

      closeMenu();
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

      return document.querySelector(href);
    })
    .filter(Boolean);


  /* =======================================================
     LINK ATTIVO NELLA NAVBAR
  ======================================================= */

  function setActiveNavigation(sectionId) {
    navigationLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === `#${sectionId}`;

      link.classList.toggle(
        "active",
        isActive
      );

      if (isActive) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }


  /* =======================================================
     CALCOLO DELLA SEZIONE ATTIVA
  ======================================================= */

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

    if (currentSection && currentSection.id) {
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
     OBSERVER DELLE SEZIONI
  ======================================================= */

  if (
    "IntersectionObserver" in window &&
    observedSections.length > 0
  ) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (firstEntry, secondEntry) =>
              secondEntry.intersectionRatio -
              firstEntry.intersectionRatio
          );

        if (visibleSections.length === 0) {
          return;
        }

        const mostVisibleSection =
          visibleSections[0].target;

        if (mostVisibleSection.id) {
          setActiveNavigation(
            mostVisibleSection.id
          );
        }
      },
      {
        threshold: [
          0.1,
          0.22,
          0.38,
          0.55
        ],
        rootMargin: "-20% 0px -60% 0px"
      }
    );

    observedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }


  /* =======================================================
     HASH PRESENTE NELL'INDIRIZZO
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
      scrollToSection(
        targetElement,
        "auto"
      );
    }, 120);
  }

  manageInitialHash();


  /* =======================================================
     PULSANTI AVANTI E INDIETRO DEL BROWSER
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
     CONTROLLO DELLE IMMAGINI
  ======================================================= */

  images.forEach((image) => {
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

    image.addEventListener(
      "load",
      markImageAsLoaded
    );

    image.addEventListener(
      "error",
      markImageAsUnavailable
    );
  });


  /* =======================================================
     EFFETTO LEGGERO SUL LOGO DELLA HERO
  ======================================================= */

  const logoShowcase = document.querySelector(
    ".logo-showcase"
  );

  const logoFrame = document.querySelector(
    ".logo-frame"
  );

  if (
    logoShowcase &&
    logoFrame &&
    hasFinePointer &&
    !prefersReducedMotion
  ) {
    logoShowcase.addEventListener(
      "mousemove",
      (event) => {
        const bounds =
          logoShowcase.getBoundingClientRect();

        const horizontalPosition =
          event.clientX - bounds.left;

        const verticalPosition =
          event.clientY - bounds.top;

        const rotateY =
          (
            horizontalPosition /
            bounds.width -
            0.5
          ) * 5;

        const rotateX =
          (
            verticalPosition /
            bounds.height -
            0.5
          ) * -5;

        logoFrame.style.animation = "none";

        logoFrame.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-3px)`;
      }
    );

    logoShowcase.addEventListener(
      "mouseleave",
      () => {
        logoFrame.style.transform =
          "perspective(900px) rotateX(0deg) rotateY(0deg)";

        window.setTimeout(() => {
          logoFrame.style.animation = "";
          logoFrame.style.transform = "";
        }, 350);
      }
    );
  }


  /* =======================================================
     EFFETTO SULLE IMMAGINI DEI SETTORI
  ======================================================= */

  if (
    hasFinePointer &&
    !prefersReducedMotion
  ) {
    sectorImages.forEach((imageContainer) => {
      imageContainer.addEventListener(
        "mousemove",
        (event) => {
          const bounds =
            imageContainer.getBoundingClientRect();

          const horizontalPosition =
            event.clientX - bounds.left;

          const verticalPosition =
            event.clientY - bounds.top;

          const rotateY =
            (
              horizontalPosition /
              bounds.width -
              0.5
            ) * 2.4;

          const rotateX =
            (
              verticalPosition /
              bounds.height -
              0.5
            ) * -2.4;

          imageContainer.style.transform =
            `perspective(1100px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-3px)`;
        }
      );

      imageContainer.addEventListener(
        "mouseleave",
        () => {
          imageContainer.style.transform =
            "perspective(1100px) rotateX(0deg) rotateY(0deg)";
        }
      );
    });
  }


  /* =======================================================
     ACCESSIBILITÀ MENU: MANTENIMENTO DEL FOCUS
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Tab" ||
      !menuIsOpen() ||
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