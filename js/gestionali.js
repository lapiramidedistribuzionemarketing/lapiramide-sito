/* =========================================================
   LA PIRAMIDE — GESTIONALI, CRM E SOLUZIONI DIGITALI
   FILE: js/gestionali.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuButton = document.getElementById("menuBtn");
  const navigation = document.getElementById("navLinks");
  const navigationLinks = navigation
    ? Array.from(navigation.querySelectorAll('a[href^="#"]'))
    : [];

  const currentYear = document.getElementById("currentYear");
  const revealElements = document.querySelectorAll(".reveal");
  const pageImages = document.querySelectorAll("img");

  /* =======================================================
     ANNO AUTOMATICO NEL FOOTER
  ======================================================= */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* =======================================================
     NAVBAR DURANTE LO SCORRIMENTO
  ======================================================= */

  const updateNavbar = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateNavbar();

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });

  /* =======================================================
     MENU MOBILE
  ======================================================= */

  const closeMobileMenu = () => {
    if (!menuButton || !navigation) {
      return;
    }

    menuButton.classList.remove("active");
    navigation.classList.remove("open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Apri il menu");

    document.body.classList.remove("menu-open");
  };

  const openMobileMenu = () => {
    if (!menuButton || !navigation) {
      return;
    }

    menuButton.classList.add("active");
    navigation.classList.add("open");

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Chiudi il menu");

    document.body.classList.add("menu-open");
  };

  const toggleMobileMenu = () => {
    if (!navigation) {
      return;
    }

    const isOpen = navigation.classList.contains("open");

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", toggleMobileMenu);
  }

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navigation || !menuButton) {
      return;
    }

    const clickedInsideMenu = navigation.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (
      navigation.classList.contains("open") &&
      !clickedInsideMenu &&
      !clickedMenuButton
    ) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMobileMenu();
    }
  });

  /* =======================================================
     ANIMAZIONI REVEAL
  ======================================================= */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("active");
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
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
  }

  /* =======================================================
     LINK ATTIVO NEL MENU
  ======================================================= */

  const pageSections = navigationLinks
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
        section
      };
    })
    .filter(Boolean);

  const setActiveNavigationLink = () => {
    if (pageSections.length === 0) {
      return;
    }

    const navigationOffset = navbar
      ? navbar.offsetHeight + 70
      : 150;

    let activeItem = pageSections[0];

    pageSections.forEach((item) => {
      const sectionTop =
        item.section.getBoundingClientRect().top +
        window.scrollY;

      if (window.scrollY + navigationOffset >= sectionTop) {
        activeItem = item;
      }
    });

    navigationLinks.forEach((link) => {
      link.classList.remove("active");
    });

    activeItem.link.classList.add("active");
  };

  setActiveNavigationLink();

  window.addEventListener("scroll", setActiveNavigationLink, {
    passive: true
  });

  window.addEventListener("resize", setActiveNavigationLink);

  /* =======================================================
     SCORRIMENTO MORBIDO DEI LINK INTERNI
  ======================================================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector = link.getAttribute("href");

        if (!selector || selector === "#") {
          return;
        }

        const target = document.querySelector(selector);

        if (!target) {
          return;
        }

        event.preventDefault();

        const navbarHeight = navbar
          ? navbar.offsetHeight
          : 80;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight -
          18;

        window.scrollTo({
          top: targetPosition,
          behavior: reducedMotion ? "auto" : "smooth"
        });
      });
    });

  /* =======================================================
     CONTROLLO CARICAMENTO IMMAGINI
  ======================================================= */

  pageImages.forEach((image) => {
    const markImageAsLoaded = () => {
      image.classList.add("image-loaded");
      image.classList.remove("image-error");
    };

    const markImageAsError = () => {
      image.classList.add("image-error");

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

      return;
    }

    image.addEventListener("load", markImageAsLoaded, {
      once: true
    });

    image.addEventListener("error", markImageAsError, {
      once: true
    });
  });

  /* =======================================================
     EFFETTO TASTIERA SU BOTTONI E CARD
  ======================================================= */

  const interactiveElements = document.querySelectorAll(
    ".btn, .contact-card, .tool-card, .digital-service-card"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      element.classList.add("keyboard-activated");
    });

    element.addEventListener("keyup", () => {
      element.classList.remove("keyboard-activated");
    });

    element.addEventListener("blur", () => {
      element.classList.remove("keyboard-activated");
    });
  });

  /* =======================================================
     RIPRISTINO POSIZIONE CORRETTA CON HASH
  ======================================================= */

  if (window.location.hash) {
    const hashTarget = document.querySelector(
      window.location.hash
    );

    if (hashTarget) {
      window.setTimeout(() => {
        const navbarHeight = navbar
          ? navbar.offsetHeight
          : 80;

        const correctedPosition =
          hashTarget.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight -
          18;

        window.scrollTo({
          top: correctedPosition,
          behavior: "auto"
        });
      }, 120);
    }
  }
});