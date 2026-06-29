// ===============================
// LA PIRAMIDE - SCRIPT.JS
// ===============================

// SFONDO LUXURY DINAMICO

const futureCanvas = document.getElementById("futureBg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (futureCanvas && !reduceMotion.matches) {
  const ctx = futureCanvas.getContext("2d");
  const pointer = { x: 0.5, y: 0.5 };
  let width = 0;
  let height = 0;
  let dust = [];
  let ribbons = [];
  let rafId = null;

  const gold = {
    soft: "rgba(184, 121, 36, 0.34)",
    mid: "rgba(214, 150, 49, 0.66)",
    bright: "rgba(255, 185, 73, 0.88)",
    cool: "rgba(0, 144, 166, 0.58)",
    white: "rgba(255, 255, 255, 0.82)",
    coral: "rgba(235, 93, 67, 0.50)",
  };

  function resizeFutureBg() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    futureCanvas.width = Math.floor(width * dpr);
    futureCanvas.height = Math.floor(height * dpr);
    futureCanvas.style.width = `${width}px`;
    futureCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createLuxuryMotion();
  }

  function createLuxuryMotion() {
    const dustCount = Math.min(120, Math.max(44, Math.floor((width * height) / 15000)));

    dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.35 + Math.random() * 1.2,
      vx: 0.08 + Math.random() * 0.18,
      vy: -0.04 + Math.random() * 0.08,
      pulse: Math.random() * Math.PI * 2,
    }));

    ribbons = Array.from({ length: width < 760 ? 5 : 9 }, (_, index) => ({
      y: height * (0.18 + index * 0.105),
      amplitude: 34 + Math.random() * 58,
      speed: 0.00034 + Math.random() * 0.00034,
      phase: Math.random() * Math.PI * 2,
      thickness: 1.4 + Math.random() * 2.6,
      alpha: 0.18 + Math.random() * 0.18,
      accent: index % 3,
    }));
  }

  function drawAmbientLight(time) {
    const x = width * (0.5 + (pointer.x - 0.5) * 0.08);
    const y = height * (0.32 + (pointer.y - 0.5) * 0.05);
    const radius = Math.max(width, height) * 0.62;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);

    glow.addColorStop(0, "rgba(255, 190, 80, 0.26)");
    glow.addColorStop(0.34, "rgba(0, 144, 166, 0.12)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const sweep = ctx.createLinearGradient(0, 0, width, height);
    const shimmer = 0.085 + Math.sin(time * 0.0012) * 0.026;

    sweep.addColorStop(0, "rgba(255, 190, 80, 0)");
    sweep.addColorStop(0.38, `rgba(0, 144, 166, ${shimmer * 0.92})`);
    sweep.addColorStop(0.52, `rgba(255, 176, 65, ${shimmer * 1.2})`);
    sweep.addColorStop(0.64, `rgba(235, 93, 67, ${shimmer * 0.66})`);
    sweep.addColorStop(1, "rgba(255, 190, 80, 0)");

    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, width, height);
  }

  function drawRibbons(time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    ribbons.forEach((ribbon, index) => {
      const gradient = ctx.createLinearGradient(0, ribbon.y - 80, width, ribbon.y + 80);
      const pointerLift = (pointer.y - 0.5) * 20;
      const accentColor = ribbon.accent === 1 ? "0, 144, 166" : ribbon.accent === 2 ? "235, 93, 67" : "184, 121, 36";

      gradient.addColorStop(0, "rgba(255, 190, 80, 0)");
      gradient.addColorStop(0.18, `rgba(184, 121, 36, ${ribbon.alpha * 0.82})`);
      gradient.addColorStop(0.46, `rgba(${accentColor}, ${ribbon.alpha})`);
      gradient.addColorStop(0.62, `rgba(255, 185, 73, ${ribbon.alpha * 0.9})`);
      gradient.addColorStop(0.82, `rgba(0, 144, 166, ${ribbon.alpha * 0.52})`);
      gradient.addColorStop(1, "rgba(255, 190, 80, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = ribbon.thickness;
      ctx.shadowBlur = 26;
      ctx.shadowColor = ribbon.accent === 1
        ? "rgba(0, 144, 166, 0.28)"
        : ribbon.accent === 2
          ? "rgba(235, 93, 67, 0.22)"
          : "rgba(214, 150, 49, 0.34)";
      ctx.beginPath();

      for (let x = -80; x <= width + 80; x += 22) {
        const waveA = Math.sin(x * 0.006 + time * ribbon.speed + ribbon.phase);
        const waveB = Math.sin(x * 0.014 - time * ribbon.speed * 1.7 + ribbon.phase);
        const y = ribbon.y + pointerLift + waveA * ribbon.amplitude + waveB * ribbon.amplitude * 0.28;

        if (x === -80) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      if (index % 2 === 0) {
        ctx.lineWidth = ribbon.thickness * 5.5;
        ctx.globalAlpha = 0.18;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
  }

  function drawGoldDust(time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    dust.forEach((p, index) => {
      const parallaxX = (pointer.x - 0.5) * p.z * 18;
      const parallaxY = (pointer.y - 0.5) * p.z * 12;
      const x = p.x + parallaxX;
      const y = p.y + parallaxY;
      const radius = 0.45 + p.z * 1.05 + Math.sin(time * 0.002 + p.pulse) * 0.28;

      p.x += p.vx * p.z;
      p.y += p.vy * p.z;

      if (p.x > width + 30) p.x = -30;
      if (p.y < -30) p.y = height + 30;
      if (p.y > height + 30) p.y = -30;

      if (index % 11 === 0) {
        ctx.fillStyle = gold.cool;
      } else if (index % 9 === 0) {
        ctx.fillStyle = gold.coral;
      } else if (index % 7 === 0) {
        ctx.fillStyle = gold.white;
      } else if (index % 5 === 0) {
        ctx.fillStyle = gold.bright;
      } else {
        ctx.fillStyle = gold.mid;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawPremiumOrbits(time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < 4; i += 1) {
      const progress = (time * (0.00007 + i * 0.000012) + i * 0.19) % 1;
      const centerX = width * (0.5 + (pointer.x - 0.5) * 0.035);
      const centerY = height * (0.34 + i * 0.08);
      const radius = width * (0.22 + i * 0.12) + progress * 70;
      const start = progress * Math.PI * 2;
      const end = start + Math.PI * (0.18 + i * 0.04);

      ctx.strokeStyle = i % 2 === 0
        ? `rgba(184, 121, 36, ${0.24 * (1 - progress * 0.45)})`
        : `rgba(0, 144, 166, ${0.20 * (1 - progress * 0.45)})`;
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 24;
      ctx.shadowColor = i % 2 === 0 ? "rgba(214, 150, 49, 0.30)" : "rgba(0, 144, 166, 0.26)";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.22, -0.18, start, end);
      ctx.stroke();
    }

    ctx.restore();
  }

  function animateFutureBg(time) {
    ctx.clearRect(0, 0, width, height);
    drawAmbientLight(time);
    drawRibbons(time);
    drawPremiumOrbits(time);
    drawGoldDust(time);

    rafId = requestAnimationFrame(animateFutureBg);
  }

  window.addEventListener("resize", resizeFutureBg);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / Math.max(1, width);
    pointer.y = event.clientY / Math.max(1, height);
  });

  resizeFutureBg();
  rafId = requestAnimationFrame(animateFutureBg);

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches && rafId) {
      cancelAnimationFrame(rafId);
    }
  });
}

// RIFLESSO PREMIUM SUI PANNELLI

document.querySelectorAll(".section, .hero").forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    panel.style.setProperty("--glow-x", `${x}%`);
    panel.style.setProperty("--glow-y", `${y}%`);
  });
});


// MENU MOBILE

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
  });

  document.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });
}


// SEZIONI A COMPARSA

const revealSections = document.querySelectorAll(".reveal-section");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealSections.forEach((section) => revealObserver.observe(section));


// SLIDER DISTRIBUZIONI

const distributionGroups = document.querySelectorAll(".distribution-group");
const distributionDots = document.getElementById("distributionDots");
let currentDistribution = 0;

if (distributionGroups.length > 0 && distributionDots) {
  distributionGroups.forEach((_, index) => {
    const dot = document.createElement("button");

    if (index === 0) dot.classList.add("active");

    dot.addEventListener("click", () => {
      showDistributionGroup(index);
    });

    distributionDots.appendChild(dot);
  });

  const dots = distributionDots.querySelectorAll("button");

  function showDistributionGroup(index) {
    distributionGroups[currentDistribution].classList.remove("active");
    dots[currentDistribution].classList.remove("active");

    currentDistribution = index;

    distributionGroups[currentDistribution].classList.add("active");
    dots[currentDistribution].classList.add("active");
  }

  setInterval(() => {
    let next = currentDistribution + 1;

    if (next >= distributionGroups.length) {
      next = 0;
    }

    showDistributionGroup(next);
  }, 5000);
}


// SLIDER LAVORI GRAFICI

const slides = document.querySelectorAll(".slide");
const sliderDots = document.getElementById("sliderDots");
let currentSlide = 0;

if (slides.length > 0 && sliderDots) {
  slides.forEach((_, index) => {
    const dot = document.createElement("button");

    if (index === 0) dot.classList.add("active");

    dot.addEventListener("click", () => {
      showSlide(index);
    });

    sliderDots.appendChild(dot);
  });

  const dots = sliderDots.querySelectorAll("button");

  function showSlide(index) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = index;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  setInterval(() => {
    let next = currentSlide + 1;

    if (next >= slides.length) {
      next = 0;
    }

    showSlide(next);
  }, 4000);
}


// EXTRA E NOVITÀ

function toggleExtraDetails() {
  const extraDetails = document.getElementById("extraDetails");

  if (!extraDetails) return;

  extraDetails.classList.toggle("active");
}


// FORM DINAMICI

let selectedService = "";

function openServiceForm(service) {
  selectedService = service;

  const modal = document.getElementById("quoteModal");
  const formTitle = document.getElementById("formTitle");
  const dynamicArea = document.getElementById("formDynamicArea");

  if (!modal || !formTitle || !dynamicArea) return;

  modal.classList.add("active");
  dynamicArea.innerHTML = "";

  if (service === "volantinaggio") {
    formTitle.textContent = "Preventivo volantinaggio mirato";

    dynamicArea.innerHTML = `
      <div class="form-block">
        <h3>Dettagli volantinaggio</h3>

        <textarea id="zone" placeholder="In quali zone vuoi distribuire?"></textarea>
        <input id="quantitaVolantini" type="text" placeholder="Quanti volantini vuoi distribuire?">

        <p class="form-question">Hai già il volantino pronto?</p>
        <div class="radio-row">
          <label><input type="radio" name="haVolantino" value="Sì" onchange="handleVolantinoChoice()"> Sì</label>
          <label><input type="radio" name="haVolantino" value="No" onchange="handleVolantinoChoice()"> No</label>
        </div>

        <div id="graficaExtra"></div>

        <p class="form-question">Sei già presente sui social media?</p>
        <div class="radio-row">
          <label><input type="radio" name="haSocial" value="Sì" onchange="handleSocialPresence()"> Sì</label>
          <label><input type="radio" name="haSocial" value="No" onchange="handleSocialPresence()"> No</label>
        </div>

        <div id="socialManagerQuestion"></div>
        <div id="socialExtra"></div>

        <p class="form-question">Hai già un sito web?</p>
        <div class="radio-row">
          <label><input type="radio" name="haSito" value="Sì" onchange="handleWebsiteChoice()"> Sì</label>
          <label><input type="radio" name="haSito" value="No" onchange="handleWebsiteChoice()"> No</label>
        </div>

        <div id="sitoExtra"></div>
      </div>
    `;
  }

  if (service === "grafica") {
    formTitle.textContent = "Preventivo grafica pubblicitaria";

    dynamicArea.innerHTML = `
      <div class="form-block">
        <h3>Dettagli grafica</h3>

        <input id="tipoAttivita" type="text" placeholder="Che tipo di attività hai?">
        <textarea id="puntiForti" placeholder="Quali sono i punti forti della tua attività?"></textarea>
        <textarea id="cosaVolantino" placeholder="Cosa vorresti mettere nel volantino o nella grafica?"></textarea>

        <p class="form-question">Sei interessato anche alla gestione social?</p>
        <div class="radio-row">
          <label><input type="radio" name="interesseSocialGrafica" value="Sì" onchange="handleSocialFromGraphic()"> Sì</label>
          <label><input type="radio" name="interesseSocialGrafica" value="No" onchange="handleSocialFromGraphic()"> No</label>
        </div>

        <div id="socialExtra"></div>

        <p class="form-question">Hai già un sito web?</p>
        <div class="radio-row">
          <label><input type="radio" name="haSito" value="Sì" onchange="handleWebsiteChoice()"> Sì</label>
          <label><input type="radio" name="haSito" value="No" onchange="handleWebsiteChoice()"> No</label>
        </div>

        <div id="sitoExtra"></div>
      </div>
    `;
  }

  if (service === "social") {
    formTitle.textContent = "Preventivo social media marketing";

    dynamicArea.innerHTML = `
      <div class="form-block">
        <h3>Dettagli social media</h3>

        <p class="form-question">Quali pagine hai per la tua attività?</p>
        <div class="checkbox-row">
          <label><input type="checkbox" name="pagineSocial" value="Facebook"> Facebook</label>
          <label><input type="checkbox" name="pagineSocial" value="Instagram"> Instagram</label>
          <label><input type="checkbox" name="pagineSocial" value="TikTok"> TikTok</label>
          <label><input type="checkbox" name="pagineSocial" value="Nessuna"> Nessuna</label>
        </div>

        <textarea id="obiettivoSocial" placeholder="Che obiettivo vuoi raggiungere con i social?"></textarea>

        <p class="form-question">Sei interessato alla gestione delle pagine?</p>
        <div class="radio-row">
          <label><input type="radio" name="gestioneSocial" value="Sì"> Sì</label>
          <label><input type="radio" name="gestioneSocial" value="No"> No</label>
        </div>

        <p class="form-question">Hai già un sito web?</p>
        <div class="radio-row">
          <label><input type="radio" name="haSito" value="Sì" onchange="handleWebsiteChoice()"> Sì</label>
          <label><input type="radio" name="haSito" value="No" onchange="handleWebsiteChoice()"> No</label>
        </div>

        <div id="sitoExtra"></div>
      </div>
    `;
  }

  if (service === "sito") {
    formTitle.textContent = "Preventivo sito web";

    dynamicArea.innerHTML = `
      <div class="form-block">
        <h3>Dettagli sito web</h3>

        <textarea id="cosaSito" placeholder="Cosa vorresti mettere nel sito?"></textarea>
        <textarea id="obiettivoSito" placeholder="Qual è l'obiettivo del sito? Esempio: contatti, prenotazioni, presentazione aziendale, vendita prodotti..."></textarea>

        <p class="form-question">Hai già logo, foto e testi?</p>
        <div class="radio-row">
          <label><input type="radio" name="materialeSito" value="Sì"> Sì</label>
          <label><input type="radio" name="materialeSito" value="No"> No</label>
          <label><input type="radio" name="materialeSito" value="In parte"> In parte</label>
        </div>
      </div>
    `;
  }
}


// BLOCCO GRAFICA SE NON HA IL VOLANTINO

function handleVolantinoChoice() {
  const choice = getRadioValue("haVolantino");
  const graficaExtra = document.getElementById("graficaExtra");

  if (!graficaExtra) return;

  if (choice === "No") {
    graficaExtra.innerHTML = `
      <div class="form-block">
        <h3>Grafica pubblicitaria</h3>

        <input id="tipoAttivita" type="text" placeholder="Che tipo di attività hai?">
        <textarea id="puntiForti" placeholder="Quali sono i punti forti della tua attività?"></textarea>
        <textarea id="cosaVolantino" placeholder="Cosa vorresti mettere nel volantino?"></textarea>
      </div>
    `;
  } else {
    graficaExtra.innerHTML = "";
  }
}


// BLOCCO SOCIAL

function handleSocialPresence() {
  const choice = getRadioValue("haSocial");
  const socialManagerQuestion = document.getElementById("socialManagerQuestion");
  const socialExtra = document.getElementById("socialExtra");

  if (!socialManagerQuestion || !socialExtra) return;

  socialManagerQuestion.innerHTML = "";
  socialExtra.innerHTML = "";

  if (choice === "Sì") {
    socialManagerQuestion.innerHTML = `
      <p class="form-question">Hai già chi si occupa del social media marketing?</p>
      <div class="radio-row">
        <label><input type="radio" name="haSocialManager" value="Sì" onchange="handleSocialManager()"> Sì</label>
        <label><input type="radio" name="haSocialManager" value="No" onchange="handleSocialManager()"> No</label>
      </div>
    `;
  }
}

function handleSocialManager() {
  const choice = getRadioValue("haSocialManager");
  const socialExtra = document.getElementById("socialExtra");

  if (!socialExtra) return;

  if (choice === "No") {
    socialExtra.innerHTML = getSocialBlock();
  } else {
    socialExtra.innerHTML = "";
  }
}

function handleSocialFromGraphic() {
  const choice = getRadioValue("interesseSocialGrafica");
  const socialExtra = document.getElementById("socialExtra");

  if (!socialExtra) return;

  if (choice === "Sì") {
    socialExtra.innerHTML = getSocialBlock();
  } else {
    socialExtra.innerHTML = "";
  }
}

function getSocialBlock() {
  return `
    <div class="form-block">
      <h3>Social media marketing</h3>

      <p class="form-question">Quali pagine hai per la tua attività?</p>
      <div class="checkbox-row">
        <label><input type="checkbox" name="pagineSocial" value="Facebook"> Facebook</label>
        <label><input type="checkbox" name="pagineSocial" value="Instagram"> Instagram</label>
        <label><input type="checkbox" name="pagineSocial" value="TikTok"> TikTok</label>
        <label><input type="checkbox" name="pagineSocial" value="Nessuna"> Nessuna</label>
      </div>

      <p class="form-question">Sei interessato alla gestione delle pagine?</p>
      <div class="radio-row">
        <label><input type="radio" name="gestioneSocial" value="Sì"> Sì</label>
        <label><input type="radio" name="gestioneSocial" value="No"> No</label>
      </div>

      <textarea id="obiettivoSocial" placeholder="Che obiettivo vuoi raggiungere con i social?"></textarea>
    </div>
  `;
}


// BLOCCO SITO WEB

function handleWebsiteChoice() {
  const choice = getRadioValue("haSito");
  const sitoExtra = document.getElementById("sitoExtra");

  if (!sitoExtra) return;

  if (choice === "No") {
    sitoExtra.innerHTML = `
      <div class="form-block">
        <h3>Sito web</h3>

        <textarea id="cosaSito" placeholder="Cosa vorresti mettere nel sito?"></textarea>
        <textarea id="obiettivoSito" placeholder="Qual è l'obiettivo del sito?"></textarea>
      </div>
    `;
  } else {
    sitoExtra.innerHTML = "";
  }
}


// INVIO WHATSAPP

function sendServiceWhatsapp() {
  const nome = getValue("nome");
  const attivita = getValue("attivita");
  const telefono = getValue("telefono");

  let testo = `Salve, vorrei un preventivo con La Piramide.%0A%0A`;

  testo += `Servizio richiesto: ${encodeURIComponent(selectedService)}%0A`;
  testo += `Nome: ${nome}%0A`;
  testo += `Attività: ${attivita}%0A`;
  testo += `WhatsApp: ${telefono}%0A%0A`;

  testo += collectFormDetails();

  const numero = "393457340981";
  const url = `https://wa.me/${numero}?text=${testo}`;

  window.open(url, "_blank");
}

function collectFormDetails() {
  let text = "";

  const fields = [
    ["Zone distribuzione", "zone"],
    ["Quantità volantini", "quantitaVolantini"],
    ["Tipo attività", "tipoAttivita"],
    ["Punti forti attività", "puntiForti"],
    ["Cosa inserire nella grafica/volantino", "cosaVolantino"],
    ["Obiettivo social", "obiettivoSocial"],
    ["Cosa mettere nel sito", "cosaSito"],
    ["Obiettivo sito", "obiettivoSito"],
  ];

  fields.forEach(([label, id]) => {
    const value = getValue(id);

    if (value) {
      text += `${label}: ${value}%0A`;
    }
  });

  const radios = [
    ["Ha già il volantino", "haVolantino"],
    ["È già presente sui social", "haSocial"],
    ["Ha già chi gestisce i social", "haSocialManager"],
    ["Interesse social da grafica", "interesseSocialGrafica"],
    ["Gestione social", "gestioneSocial"],
    ["Ha già un sito web", "haSito"],
    ["Materiale sito disponibile", "materialeSito"],
  ];

  radios.forEach(([label, name]) => {
    const value = getRadioValue(name);

    if (value) {
      text += `${label}: ${encodeURIComponent(value)}%0A`;
    }
  });

  const socialPages = getCheckboxValues("pagineSocial");

  if (socialPages.length > 0) {
    text += `Pagine social: ${encodeURIComponent(socialPages.join(", "))}%0A`;
  }

  return text;
}


// UTILITY

function getValue(id) {
  const el = document.getElementById(id);
  return el ? encodeURIComponent(el.value.trim()) : "";
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function getCheckboxValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (checkbox) => checkbox.value
  );
}


// CHIUSURA MODALE

function closeQuoteForm() {
  const modal = document.getElementById("quoteModal");

  if (modal) {
    modal.classList.remove("active");
  }
}

const quoteModal = document.getElementById("quoteModal");

if (quoteModal) {
  quoteModal.addEventListener("click", (e) => {
    if (e.target.id === "quoteModal") {
      closeQuoteForm();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeQuoteForm();
  }
});

/* =====================================================
   GA4 - TRACCIAMENTO CLICK LA PIRAMIDE
===================================================== */

function tracciaEvento(nomeEvento, dettagli = {}) {
  if (typeof gtag === "function") {
    gtag("event", nomeEvento, dettagli);
  }
}

document.addEventListener("click", function (e) {
  const elemento = e.target.closest("a, button");

  if (!elemento) return;

  const testo = elemento.innerText.trim();
  const href = elemento.getAttribute("href") || "";
  const onclick = elemento.getAttribute("onclick") || "";

  if (href.includes("wa.me")) {
    tracciaEvento("click_whatsapp", {
      testo_pulsante: testo,
      link: href
    });
  }

  if (href.includes("lapiramidetrack.com")) {
    tracciaEvento("click_lapiramide_track", {
      testo_pulsante: testo,
      link: href
    });
  }

  if (onclick.includes("openServiceForm")) {
    tracciaEvento("click_richiesta_servizio", {
      servizio: onclick
    });
  }

  if (href.startsWith("#")) {
    tracciaEvento("click_sezione_menu", {
      sezione: href,
      testo_link: testo
    });
  }
});