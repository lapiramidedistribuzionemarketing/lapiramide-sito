/* =========================================================
   LA PIRAMIDE — TRACK
   FILE: js/track.js

   Funzioni:
   - menu mobile
   - navbar dinamica
   - animazioni reveal
   - navigazione fluida
   - link attivo durante lo scorrimento
   - gestione immagini
   - effetto parallasse leggero
   - animazioni progressive delle card
   - anno automatico nel footer
   - accessibilità e ottimizzazione prestazioni
========================================================= */

"use strict";


/* =========================================================
   AVVIO DELLA PAGINA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCurrentYear();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initActiveNavigation();
  initImageHandling();
  initProgressiveCards();
  initHeroParallax();
  initExternalLinks();
  initKeyboardAccessibility();
});


/* =========================================================
   ANNO AUTOMATICO NEL FOOTER
========================================================= */

function initCurrentYear() {
  const currentYearElement = document.getElementById("currentYear");

  if (!currentYearElement) {
    return;
  }

  currentYearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   NAVBAR DURANTE LO SCORRIMENTO
========================================================= */

function initNavbar() {
  const navbar = document.getElementById("navbar");

  if (!navbar) {
    return;
  }

  let ticking = false;

  const updateNavbar = () => {
    const scrollPosition =
      window.scrollY ||
      document.documentElement.scrollTop ||
      0;

    navbar.classList.toggle("scrolled", scrollPosition > 35);

    ticking = false;
  };

  const requestNavbarUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateNavbar);
  };

  updateNavbar();

  window.addEventListener(
    "scroll",
    requestNavbarUpdate,
    { passive: true }
  );
}


/* =========================================================
   MENU MOBILE
========================================================= */

function initMobileMenu() {
  const menuButton = document.getElementById("menuBtn");
  const navigation = document.getElementById("navLinks");

  if (!menuButton || !navigation) {
    return;
  }

  const navigationLinks =
    navigation.querySelectorAll('a[href^="#"]');

  const openMenu = () => {
    navigation.classList.add("open");
    menuButton.classList.add("active");
    document.body.classList.add("menu-open");

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Chiudi il menu");
  };

  const closeMenu = () => {
    navigation.classList.remove("open");
    menuButton.classList.remove("active");
    document.body.classList.remove("menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Apri il menu");
  };

  const toggleMenu = () => {
    const isOpen = navigation.classList.contains("open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  menuButton.addEventListener("click", toggleMenu);

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNavigation =
      navigation.contains(event.target);

    const clickedMenuButton =
      menuButton.contains(event.target);

    if (
      navigation.classList.contains("open") &&
      !clickedInsideNavigation &&
      !clickedMenuButton
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      navigation.classList.contains("open")
    ) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMenu();
    }
  });
}


/* =========================================================
   SCORRIMENTO FLUIDO
========================================================= */

function initSmoothScroll() {
  const internalLinks =
    document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");

      if (
        !targetSelector ||
        targetSelector === "#"
      ) {
        return;
      }

      const targetElement =
        document.querySelector(targetSelector);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      const navbar = document.getElementById("navbar");

      const navbarHeight = navbar
        ? navbar.offsetHeight
        : 0;

      const additionalOffset = 18;

      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight -
        additionalOffset;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: prefersReducedMotion()
          ? "auto"
          : "smooth"
      });

      if (
        history.pushState &&
        targetSelector !== "#home"
      ) {
        history.pushState(
          null,
          "",
          targetSelector
        );
      }
    });
  });
}


/* =========================================================
   ANIMAZIONI REVEAL
========================================================= */

function initRevealAnimations() {
  const revealElements =
    document.querySelectorAll(".reveal");

  if (!revealElements.length) {
    return;
  }

  if (
    prefersReducedMotion() ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach((element) => {
      element.classList.add("active");
    });

    return;
  }

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
      root: null,
      threshold: 0.12,
      rootMargin: "0px 0px -55px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}


/* =========================================================
   ELEMENTO ATTIVO NELLA NAVBAR
========================================================= */

function initActiveNavigation() {
  const navigationLinks = Array.from(
    document.querySelectorAll(
      '.nav-links a[href^="#"]'
    )
  );

  if (!navigationLinks.length) {
    return;
  }

  const navigationSections = navigationLinks
    .map((link) => {
      const selector = link.getAttribute("href");

      if (!selector || selector === "#") {
        return null;
      }

      const section = document.querySelector(selector);

      if (!section) {
        return null;
      }

      return {
        link,
        section,
        selector
      };
    })
    .filter(Boolean);

  if (!navigationSections.length) {
    return;
  }

  const removeActiveLinks = () => {
    navigationLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
  };

  const activateLink = (selectedLink) => {
    removeActiveLinks();

    selectedLink.classList.add("active");
    selectedLink.setAttribute(
      "aria-current",
      "location"
    );
  };

  let activeSelector = "";

  const updateActiveNavigation = () => {
    const navbar = document.getElementById("navbar");

    const navbarHeight = navbar
      ? navbar.offsetHeight
      : 80;

    const referencePoint =
      window.scrollY +
      navbarHeight +
      window.innerHeight * 0.2;

    let currentItem = navigationSections[0];

    navigationSections.forEach((item) => {
      if (item.section.offsetTop <= referencePoint) {
        currentItem = item;
      }
    });

    const nearPageBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 12;

    if (nearPageBottom) {
      currentItem =
        navigationSections[
          navigationSections.length - 1
        ];
    }

    if (
      currentItem &&
      currentItem.selector !== activeSelector
    ) {
      activeSelector = currentItem.selector;
      activateLink(currentItem.link);
    }
  };

  let ticking = false;

  const requestNavigationUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateActiveNavigation();
      ticking = false;
    });
  };

  updateActiveNavigation();

  window.addEventListener(
    "scroll",
    requestNavigationUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestNavigationUpdate
  );
}


/* =========================================================
   GESTIONE DELLE IMMAGINI
========================================================= */

function initImageHandling() {
  const images = document.querySelectorAll("img");

  if (!images.length) {
    return;
  }

  images.forEach((image) => {
    if (
      !image.hasAttribute("loading") &&
      !image.closest(".hero")
    ) {
      image.setAttribute("loading", "lazy");
    }

    image.setAttribute("decoding", "async");

    const markImageAsLoaded = () => {
      image.classList.add("image-loaded");
      image.classList.remove("image-error");
    };

    const markImageAsError = () => {
      image.classList.add("image-error");

      const figure = image.closest("figure");

      if (figure) {
        figure.classList.add("has-image-error");
      }

      console.warn(
        `Immagine non caricata: ${image.getAttribute("src")}`
      );
    };

    if (image.complete) {
      if (image.naturalWidth > 0) {
        markImageAsLoaded();
      } else {
        markImageAsError();
      }
    } else {
      image.addEventListener(
        "load",
        markImageAsLoaded,
        { once: true }
      );

      image.addEventListener(
        "error",
        markImageAsError,
        { once: true }
      );
    }
  });
}


/* =========================================================
   COMPARSA PROGRESSIVA DELLE CARD
========================================================= */

function initProgressiveCards() {
  const cardGroups = [
    ".definition-cards",
    ".track-flow",
    ".operation-list",
    ".tools-grid",
    ".access-comparison",
    ".strategy-grid",
    ".applications-grid",
    ".difference-grid",
    ".contact-grid"
  ];

  cardGroups.forEach((groupSelector) => {
    const group = document.querySelector(groupSelector);

    if (!group) {
      return;
    }

    const cards = Array.from(group.children);

    cards.forEach((card, index) => {
      const delay = Math.min(index * 65, 390);

      card.style.transitionDelay = `${delay}ms`;
    });
  });

  const documentChapters =
    document.querySelectorAll(".document-chapter");

  documentChapters.forEach((chapter, index) => {
    const delay = Math.min(index * 35, 280);

    chapter.style.transitionDelay = `${delay}ms`;
  });
}


/* =========================================================
   PARALLASSE LEGGERO NELLA HERO
========================================================= */

function initHeroParallax() {
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(
    ".hero-track-image"
  );

  const glowOne = document.querySelector(
    ".hero-glow-one"
  );

  const glowTwo = document.querySelector(
    ".hero-glow-two"
  );

  if (
    !hero ||
    !heroImage ||
    prefersReducedMotion()
  ) {
    return;
  }

  const supportsFinePointer =
    window.matchMedia(
      "(pointer: fine) and (hover: hover)"
    ).matches;

  if (!supportsFinePointer) {
    return;
  }

  let animationFrame = null;

  const updateParallax = (event) => {
    const heroBounds =
      hero.getBoundingClientRect();

    const relativeX =
      (event.clientX - heroBounds.left) /
      heroBounds.width -
      0.5;

    const relativeY =
      (event.clientY - heroBounds.top) /
      heroBounds.height -
      0.5;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    animationFrame =
      window.requestAnimationFrame(() => {
        heroImage.style.transform =
          `perspective(1000px)
           rotateY(${relativeX * 2.3}deg)
           rotateX(${relativeY * -2.1}deg)
           translate3d(
             ${relativeX * 5}px,
             ${relativeY * 5}px,
             0
           )`;

        if (glowOne) {
          glowOne.style.transform =
            `translate3d(
              ${relativeX * 24}px,
              ${relativeY * 20}px,
              0
            )`;
        }

        if (glowTwo) {
          glowTwo.style.transform =
            `translate3d(
              ${relativeX * -18}px,
              ${relativeY * -15}px,
              0
            )`;
        }
      });
  };

  const resetParallax = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    animationFrame =
      window.requestAnimationFrame(() => {
        heroImage.style.transform = "";
        heroImage.style.removeProperty("transform");

        if (glowOne) {
          glowOne.style.transform = "";
        }

        if (glowTwo) {
          glowTwo.style.transform = "";
        }
      });
  };

  hero.addEventListener(
    "mousemove",
    updateParallax,
    { passive: true }
  );

  hero.addEventListener(
    "mouseleave",
    resetParallax
  );
}


/* =========================================================
   LINK ESTERNI SICURI
========================================================= */

function initExternalLinks() {
  const externalLinks =
    document.querySelectorAll(
      'a[target="_blank"]'
    );

  externalLinks.forEach((link) => {
    const relValues = new Set(
      (link.getAttribute("rel") || "")
        .split(/\s+/)
        .filter(Boolean)
    );

    relValues.add("noopener");
    relValues.add("noreferrer");

    link.setAttribute(
      "rel",
      Array.from(relValues).join(" ")
    );
  });
}


/* =========================================================
   ACCESSIBILITÀ DA TASTIERA
========================================================= */

function initKeyboardAccessibility() {
  const interactiveElements =
    document.querySelectorAll(
      "a, button, input, textarea, select"
    );

  interactiveElements.forEach((element) => {
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      if (
        element.tagName === "BUTTON" ||
        element.tagName === "A"
      ) {
        element.classList.add(
          "keyboard-activated"
        );

        window.setTimeout(() => {
          element.classList.remove(
            "keyboard-activated"
          );
        }, 220);
      }
    });
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.add("using-mouse");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      document.body.classList.remove("using-mouse");
    }
  });
}


/* =========================================================
   CONTROLLO RIDUZIONE ANIMAZIONI
========================================================= */

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}


/* =========================================================
   CORREZIONE DEL LINK CON HASH ALL'APERTURA
========================================================= */

window.addEventListener("load", () => {
  const hash = window.location.hash;

  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  window.setTimeout(() => {
    const navbar = document.getElementById("navbar");

    const navbarHeight = navbar
      ? navbar.offsetHeight
      : 0;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight -
      18;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: "auto"
    });
  }, 80);
});