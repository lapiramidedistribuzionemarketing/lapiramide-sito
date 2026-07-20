/* =========================================================
   LA PIRAMIDE — HOSPITALITY
   FILE: js/hospitality.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuButton = document.getElementById("menuBtn");
  const navigation = document.getElementById("navLinks");
  const currentYear = document.getElementById("currentYear");

  const revealElements = document.querySelectorAll(".reveal");
  const pageImages = document.querySelectorAll("img");

  const navigationLinks = navigation
    ? Array.from(navigation.querySelectorAll('a[href^="#"]'))
    : [];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


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

    if (navigation.classList.contains("open")) {
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

    const menuIsOpen = navigation.classList.contains("open");
    const clickedInsideNavigation = navigation.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (
      menuIsOpen &&
      !clickedInsideNavigation &&
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

  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {
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
      const delay = Math.min(index % 4, 3) * 70;

      element.style.transitionDelay = `${delay}ms`;
      revealObserver.observe(element);
    });
  }


  /* =======================================================
     LINK ATTIVO NELLA NAVBAR
  ======================================================= */

  const sectionLinks = navigationLinks
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

  const updateActiveNavigationLink = () => {
    if (sectionLinks.length === 0) {
      return;
    }

    const navbarOffset = navbar
      ? navbar.offsetHeight + 70
      : 150;

    let activeItem = sectionLinks[0];

    sectionLinks.forEach((item) => {
      const sectionPosition =
        item.section.getBoundingClientRect().top +
        window.scrollY;

      if (window.scrollY + navbarOffset >= sectionPosition) {
        activeItem = item;
      }
    });

    navigationLinks.forEach((link) => {
      link.classList.remove("active");
    });

    activeItem.link.classList.add("active");
  };

  updateActiveNavigationLink();

  window.addEventListener(
    "scroll",
    updateActiveNavigationLink,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    updateActiveNavigationLink
  );


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
     CONTROLLO DEL CARICAMENTO DELLE IMMAGINI
  ======================================================= */

  pageImages.forEach((image) => {
    const markAsLoaded = () => {
      image.classList.add("image-loaded");
      image.classList.remove("image-error");
    };

    const markAsError = () => {
      image.classList.add("image-error");

      console.warn(
        `Immagine non caricata: ${image.getAttribute("src")}`
      );
    };

    if (image.complete) {
      if (image.naturalWidth > 0) {
        markAsLoaded();
      } else {
        markAsError();
      }

      return;
    }

    image.addEventListener("load", markAsLoaded, {
      once: true
    });

    image.addEventListener("error", markAsError, {
      once: true
    });
  });


  /* =======================================================
     EFFETTO LEGGERO SULLE IMMAGINI DELLA GALLERIA
  ======================================================= */

  const galleryImages = document.querySelectorAll(
    ".property-image, .experience-image"
  );

  galleryImages.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (
        reducedMotion ||
        window.innerWidth <= 1050
      ) {
        return;
      }

      const bounds = card.getBoundingClientRect();

      const horizontalPosition =
        (event.clientX - bounds.left) / bounds.width;

      const verticalPosition =
        (event.clientY - bounds.top) / bounds.height;

      const rotateY =
        (horizontalPosition - 0.5) * 2.2;

      const rotateX =
        (0.5 - verticalPosition) * 2.2;

      card.style.transform =
        `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });


  /* =======================================================
     EFFETTO TASTIERA SU LINK E CARD
  ======================================================= */

  const interactiveElements = document.querySelectorAll(
    ".btn, .contact-card, .text-link"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("keydown", (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
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
     RIPOSIZIONAMENTO CORRETTO QUANDO ESISTE UN HASH
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