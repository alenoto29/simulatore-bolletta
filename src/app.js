// --- AGENT-01 START ---
const state = {
  currentStep: 1,
  selections: {
    energyType: null,
    usageContext: null,
    preferences: [],
    consumptionBand: null
  }
};

const steps = Array.from(document.querySelectorAll(".step"));
const totalSteps = steps.length;

function setInlineMessage(step, message) {
  const node = document.querySelector(`[data-message-for="step${step}"]`);
  if (!node) return;
  node.textContent = message;
}

function isStepValid(step) {
  if (step === 1) return Boolean(state.selections.energyType);
  if (step === 2) return Boolean(state.selections.usageContext);
  if (step === 3) return true;
  if (step === 4) return Boolean(state.selections.consumptionBand);
  return true;
}

function updateNextButton(step) {
  const section = document.querySelector(`.step[data-step="${step}"]`);
  if (!section) return;
  const nextButton = section.querySelector('[data-action="next"]');
  if (!nextButton) return;

  if (step === 1 && state.selections.energyType && state.selections.energyType !== "luce") {
    nextButton.disabled = false;
    return;
  }

  nextButton.disabled = !isStepValid(step);
}

function renderSummary() {
  const summary = document.querySelector("[data-summary]");
  if (!summary) return;

  const rows = [
    ["Energia", state.selections.energyType || "-"],
    ["Contesto", state.selections.usageContext || "-"],
    [
      "Preferenze",
      state.selections.preferences.length ? state.selections.preferences.join(", ") : "-"
    ],
    ["Consumo", state.selections.consumptionBand || "-"]
  ];

  summary.innerHTML = rows
    .map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`)
    .join("");
}

function syncCardsUI() {
  const groups = Array.from(document.querySelectorAll(".choice-group"));

  groups.forEach((group) => {
    const field = group.dataset.field;
    const isMulti = group.dataset.multi === "true";
    const value = state.selections[field];
    const cards = Array.from(group.querySelectorAll(".choice-card"));

    cards.forEach((card) => {
      const selected = isMulti
        ? Array.isArray(value) && value.includes(card.dataset.value)
        : value === card.dataset.value;

      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
  });
}

function showStep(step) {
  if (step < 1 || step > totalSteps) return;

  steps.forEach((section) => {
    const sectionStep = Number(section.dataset.step);
    const isTarget = sectionStep === step;
    section.hidden = !isTarget;
    section.classList.toggle("is-active", isTarget);
  });

  state.currentStep = step;
  syncCardsUI();
  updateNextButton(step);

  if (step === 5) {
    renderSummary();
  }
}

function nextStep() {
  const step = state.currentStep;

  if (!isStepValid(step)) {
    updateNextButton(step);
    return;
  }

  if (step === 1 && state.selections.energyType !== "luce") {
    setInlineMessage(1, "Coming soon");
    return;
  }

  setInlineMessage(1, "");
  showStep(Math.min(step + 1, totalSteps));
}

function prevStep() {
  showStep(Math.max(state.currentStep - 1, 1));
}

function bindChoiceCards() {
  const groups = Array.from(document.querySelectorAll(".choice-group"));

  groups.forEach((group) => {
    group.addEventListener("click", (event) => {
      const card = event.target.closest(".choice-card");
      if (!card) return;

      const field = group.dataset.field;
      const value = card.dataset.value;
      const isMulti = group.dataset.multi === "true";

      if (!field || !value) return;

      if (isMulti) {
        const set = new Set(state.selections[field]);
        if (set.has(value)) {
          set.delete(value);
        } else {
          set.add(value);
        }
        state.selections[field] = Array.from(set);
      } else {
        state.selections[field] = value;
      }

      if (field === "energyType" && value === "luce") {
        setInlineMessage(1, "");
      }

      syncCardsUI();
      updateNextButton(state.currentStep);
    });
  });
}

function bindNavigation() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "next") nextStep();
    if (action === "prev") prevStep();
  });
}

function initWizard() {
  bindChoiceCards();
  bindNavigation();
  showStep(1);
}

initWizard();
// --- AGENT-01 END ---
// --- AGENT-04 START ---
const AGENT04_STATE = {
  step2: {
    region: "",
    people: "",
    homeType: "",
  },
  step4: {
    band: "",
    meter: "",
    monthlyConsumption: "",
  },
};

function firstMatch(root, selectors) {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
}

function firstMatchAll(root, selectors) {
  for (const selector of selectors) {
    const elements = Array.from(root.querySelectorAll(selector));
    if (elements.length > 0) {
      return elements;
    }
  }
  return [];
}

function setAccordionState(trigger, panel, isOpen) {
  if (trigger) {
    trigger.setAttribute("aria-expanded", String(isOpen));
  }
  if (panel) {
    panel.hidden = !isOpen;
  }
}

function getOrCreateError(anchor, key) {
  if (!anchor) {
    return null;
  }

  const root = anchor.closest("[data-step]") || anchor.parentElement || document.body;
  const existing = root.querySelector(`[data-agent04-error="${key}"]`);
  if (existing) {
    return existing;
  }

  const node = document.createElement("p");
  node.dataset.agent04Error = key;
  node.className = "agent04-inline-error";
  node.hidden = true;
  anchor.insertAdjacentElement("afterend", node);
  return node;
}

function setInlineError(node, message) {
  if (!node) {
    return;
  }

  if (message) {
    node.hidden = false;
    node.textContent = message;
    return;
  }

  node.hidden = true;
  node.textContent = "";
}

function parseNumericInput(rawValue) {
  const normalized = String(rawValue || "")
    .trim()
    .replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function initStep2() {
  const step2Root =
    document.querySelector('[data-step="2"]') ||
    document.querySelector("#step-2") ||
    document.querySelector("[data-step2-root]");

  if (!step2Root) {
    return;
  }

  const regionTrigger = firstMatch(step2Root, [
    "[data-region-accordion-trigger]",
    "[data-step2-region-trigger]",
    ".js-region-accordion-trigger",
  ]);
  const regionPanel = firstMatch(step2Root, [
    "[data-region-accordion-panel]",
    "[data-step2-region-panel]",
    ".js-region-accordion-panel",
  ]);
  const regionList = firstMatch(step2Root, [
    "[data-region-options]",
    "[data-step2-region-options]",
    ".js-region-options",
  ]);
  const step2NextButton = firstMatch(step2Root, [
    "[data-step2-next]",
    '[data-next-step="2"]',
    "#step2-next",
  ]);

  if (regionTrigger && !regionTrigger.dataset.defaultLabel) {
    regionTrigger.dataset.defaultLabel = regionTrigger.textContent.trim();
  }

  if (regionTrigger) {
    regionTrigger.addEventListener("click", () => {
      const isOpen = regionTrigger.getAttribute("aria-expanded") === "true";
      setAccordionState(regionTrigger, regionPanel, !isOpen);
    });
  }

  if (regionList) {
    regionList.innerHTML = "";
    regions.forEach((region) => {
      const option = document.createElement("button");
      option.type = "button";
      option.dataset.regionValue = region;
      option.className = "agent04-region-option";
      option.textContent = region;
      option.addEventListener("click", () => {
        AGENT04_STATE.step2.region = region;
        const allRegionButtons = Array.from(
          regionList.querySelectorAll("[data-region-value]")
        );
        allRegionButtons.forEach((button) => {
          const selected = button.dataset.regionValue === region;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });

        if (regionTrigger) {
          regionTrigger.textContent = region;
          setAccordionState(regionTrigger, regionPanel, false);
        }

        validateStep2();
      });
      regionList.appendChild(option);
    });
  }

  let peopleCards = firstMatchAll(step2Root, [
    "[data-step2-people-card]",
    "[data-people-card]",
    ".js-people-card",
  ]);
  const peopleCardsContainer = firstMatch(step2Root, [
    "[data-step2-people-cards]",
    "[data-step2-people-options]",
    ".js-people-cards",
  ]);

  if (peopleCards.length === 0 && peopleCardsContainer) {
    const peopleOptions = [
      { value: "1", label: "1 persona 👤" },
      { value: "2", label: "2 persone 👥" },
      { value: "3", label: "3 persone 👨‍👩‍👧" },
      { value: "4+", label: "4+ persone 👨‍👩‍👧‍👦" },
    ];
    peopleCardsContainer.innerHTML = "";
    peopleOptions.forEach((optionData) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.step2PeopleCard = "true";
      button.dataset.value = optionData.value;
      button.className = "agent04-step2-card";
      button.textContent = optionData.label;
      peopleCardsContainer.appendChild(button);
    });

    peopleCards = firstMatchAll(step2Root, ["[data-step2-people-card]"]);
  }

  let homeCards = firstMatchAll(step2Root, [
    "[data-step2-home-card]",
    "[data-home-card]",
    ".js-home-card",
  ]);
  const homeCardsContainer = firstMatch(step2Root, [
    "[data-step2-home-cards]",
    "[data-step2-home-options]",
    ".js-home-cards",
  ]);

  if (homeCards.length === 0 && homeCardsContainer) {
    const homeOptions = [
      { value: "appartamento", label: "Appartamento 🏢" },
      { value: "villetta", label: "Villetta/Casa autonoma 🏡" },
    ];
    homeCardsContainer.innerHTML = "";
    homeOptions.forEach((optionData) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.step2HomeCard = "true";
      button.dataset.value = optionData.value;
      button.className = "agent04-step2-card";
      button.textContent = optionData.label;
      homeCardsContainer.appendChild(button);
    });

    homeCards = firstMatchAll(step2Root, ["[data-step2-home-card]"]);
  }

  peopleCards.forEach((card) => {
    card.addEventListener("click", () => {
      AGENT04_STATE.step2.people =
        card.dataset.value || card.dataset.people || card.textContent.trim();
      peopleCards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      validateStep2();
    });
  });

  homeCards.forEach((card) => {
    card.addEventListener("click", () => {
      AGENT04_STATE.step2.homeType =
        card.dataset.value || card.dataset.homeType || card.textContent.trim();
      homeCards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      validateStep2();
    });
  });

  const step2ErrorRegion = getOrCreateError(
    regionPanel || regionTrigger,
    "step2-region"
  );
  const step2ErrorPeople = getOrCreateError(peopleCards[0], "step2-people");
  const step2ErrorHome = getOrCreateError(homeCards[0], "step2-home");

  function validateStep2(showErrors = false) {
    const hasRegion = Boolean(AGENT04_STATE.step2.region);
    const hasPeople = Boolean(AGENT04_STATE.step2.people);
    const hasHomeType = Boolean(AGENT04_STATE.step2.homeType);

    if (step2NextButton) {
      step2NextButton.disabled = !(hasRegion && hasPeople && hasHomeType);
    }

    if (showErrors) {
      setInlineError(
        step2ErrorRegion,
        hasRegion ? "" : "Seleziona la tua regione per continuare."
      );
      setInlineError(
        step2ErrorPeople,
        hasPeople ? "" : "Seleziona quante persone siete in famiglia."
      );
      setInlineError(
        step2ErrorHome,
        hasHomeType ? "" : "Seleziona il tipo di abitazione."
      );
    } else {
      setInlineError(step2ErrorRegion, "");
      setInlineError(step2ErrorPeople, "");
      setInlineError(step2ErrorHome, "");
    }

    return hasRegion && hasPeople && hasHomeType;
  }

  if (step2NextButton) {
    step2NextButton.addEventListener("click", (event) => {
      if (!validateStep2(true)) {
        event.preventDefault();
      }
    });
  }

  validateStep2();
}

function initStep4() {
  const step4Root =
    document.querySelector('[data-step="4"]') ||
    document.querySelector("#step-4") ||
    document.querySelector("[data-step4-root]");

  if (!step4Root) {
    return;
  }

  let bandCards = firstMatchAll(step4Root, [
    "[data-step4-band-card]",
    "[data-band-card]",
    ".js-band-card",
  ]);
  const bandCardsContainer = firstMatch(step4Root, [
    "[data-step4-band-cards]",
    "[data-step4-band-options]",
    ".js-band-cards",
  ]);

  if (bandCards.length === 0 && bandCardsContainer) {
    const bandOptions = [
      { value: "F1", label: "Consumo maggiore in F1" },
      { value: "F23", label: "Consumo maggiore in F23" },
    ];
    bandCardsContainer.innerHTML = "";
    bandOptions.forEach((optionData) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.step4BandCard = "true";
      button.dataset.value = optionData.value;
      button.className = "agent04-step4-card";
      button.textContent = optionData.label;
      bandCardsContainer.appendChild(button);
    });

    bandCards = firstMatchAll(step4Root, ["[data-step4-band-card]"]);
  }
  const meterTrigger = firstMatch(step4Root, [
    "[data-meter-accordion-trigger]",
    "[data-step4-meter-trigger]",
    ".js-meter-accordion-trigger",
  ]);
  const meterPanel = firstMatch(step4Root, [
    "[data-meter-accordion-panel]",
    "[data-step4-meter-panel]",
    ".js-meter-accordion-panel",
  ]);
  const meterList = firstMatch(step4Root, [
    "[data-meter-options]",
    "[data-step4-meter-options]",
    ".js-meter-options",
  ]);
  let monthlyInput = firstMatch(step4Root, [
    "[data-step4-monthly-input]",
    "[name='monthlyConsumption']",
    "#monthly-consumption",
  ]);
  const monthlyInputContainer = firstMatch(step4Root, [
    "[data-step4-consumption-field]",
    "[data-step4-consumption-container]",
    ".js-step4-consumption-field",
  ]);

  if (!monthlyInput && monthlyInputContainer) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.step = "1";
    input.placeholder = "Es: 250";
    input.dataset.step4MonthlyInput = "true";
    input.name = "monthlyConsumption";
    input.className = "agent04-consumption-input";
    monthlyInputContainer.appendChild(input);
    monthlyInput = input;
  }
  const step4NextButton = firstMatch(step4Root, [
    "[data-step4-next]",
    '[data-next-step="4"]',
    "#step4-next",
  ]);

  if (meterTrigger && !meterTrigger.dataset.defaultLabel) {
    meterTrigger.dataset.defaultLabel = meterTrigger.textContent.trim();
  }

  bandCards.forEach((card) => {
    card.addEventListener("click", () => {
      AGENT04_STATE.step4.band =
        card.dataset.value || card.dataset.band || card.textContent.trim();
      bandCards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      validateStep4();
    });
  });

  if (meterTrigger) {
    meterTrigger.addEventListener("click", () => {
      const isOpen = meterTrigger.getAttribute("aria-expanded") === "true";
      setAccordionState(meterTrigger, meterPanel, !isOpen);
    });
  }

  if (meterList) {
    meterList.innerHTML = "";
    ["3 kW", "6 kW"].forEach((meter) => {
      const option = document.createElement("button");
      option.type = "button";
      option.dataset.meterValue = meter;
      option.className = "agent04-meter-option";
      option.textContent = meter;
      option.addEventListener("click", () => {
        AGENT04_STATE.step4.meter = meter;
        const options = Array.from(meterList.querySelectorAll("[data-meter-value]"));
        options.forEach((button) => {
          const selected = button.dataset.meterValue === meter;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });

        if (meterTrigger) {
          meterTrigger.textContent = meter;
          setAccordionState(meterTrigger, meterPanel, false);
        }

        validateStep4();
      });
      meterList.appendChild(option);
    });
  }

  if (monthlyInput) {
    monthlyInput.setAttribute("inputmode", "decimal");
    monthlyInput.setAttribute("autocomplete", "off");
    monthlyInput.addEventListener("input", () => {
      AGENT04_STATE.step4.monthlyConsumption = monthlyInput.value;
      validateStep4();
    });

    let helpLink = step4Root.querySelector("[data-step4-help-link]");
    if (!helpLink) {
      helpLink = document.createElement("a");
      helpLink.href = "#";
      helpLink.dataset.step4HelpLink = "true";
      helpLink.className = "agent04-mini-cta";
      helpLink.textContent = "Non te li ricordi? Ci pensiamo noi";
      monthlyInput.insertAdjacentElement("afterend", helpLink);
    }

    helpLink.addEventListener("click", (event) => {
      event.preventDefault();
      monthlyInput.focus();
      monthlyInput.placeholder = "Es: 250";
    });
  }

  const step4ErrorBand = getOrCreateError(bandCards[0], "step4-band");
  const step4ErrorMeter = getOrCreateError(
    meterPanel || meterTrigger,
    "step4-meter"
  );
  const step4ErrorConsumption = getOrCreateError(
    monthlyInput,
    "step4-consumption"
  );

  function validateStep4(showErrors = false) {
    const hasBand = Boolean(AGENT04_STATE.step4.band);
    const hasMeter = Boolean(AGENT04_STATE.step4.meter);
    const numericConsumption = parseNumericInput(
      AGENT04_STATE.step4.monthlyConsumption
    );
    const hasConsumption = numericConsumption !== null;

    if (step4NextButton) {
      step4NextButton.disabled = !(hasBand && hasMeter && hasConsumption);
    }

    if (showErrors) {
      setInlineError(
        step4ErrorBand,
        hasBand ? "" : "Seleziona la fascia di consumo."
      );
      setInlineError(
        step4ErrorMeter,
        hasMeter ? "" : "Seleziona il tipo di contatore."
      );
      setInlineError(
        step4ErrorConsumption,
        hasConsumption ? "" : "Inserisci un consumo mensile valido."
      );
    } else {
      setInlineError(step4ErrorBand, "");
      setInlineError(step4ErrorMeter, "");
      setInlineError(step4ErrorConsumption, "");
    }

    return hasBand && hasMeter && hasConsumption;
  }

  if (step4NextButton) {
    step4NextButton.addEventListener("click", (event) => {
      if (!validateStep4(true)) {
        event.preventDefault();
      }
    });
  }

  validateStep4();
}

function initAgent04() {
  if (document.documentElement.dataset.agent04Initialized === "true") {
    return;
  }

  document.documentElement.dataset.agent04Initialized = "true";
  initStep2();
  initStep4();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAgent04);
} else {
  initAgent04();
}
// --- AGENT-04 END ---
// --- AGENT-05 START ---
(() => {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const landingConfig = {
    fixed: [
      {
        title: 'Offerta luce più stabile',
        cardId: 'fisso-smart',
        bullets: [
          '🔒 Prezzo bloccato per proteggerti dai rialzi stagionali',
          '⚡ Attivazione rapida e gestione 100% digitale',
          '📉 Perfetta se vuoi rate prevedibili in bolletta'
        ]
      },
      {
        title: 'Offerta dual fuel sostenibile',
        cardId: 'fisso-green',
        bullets: [
          '🌿 Energia elettrica certificata da fonti rinnovabili',
          '🏠 Soluzione unica per casa con luce e gas',
          '🧾 Canone fisso chiaro senza sorprese'
        ]
      }
    ],
    variable: [
      {
        title: 'Indicizzata luce per seguire il mercato',
        cardId: 'variabile-easy',
        bullets: [
          '📊 Prezzo collegato all andamento del PUN',
          '🔁 Nessun vincolo, cambi quando vuoi',
          '💡 Ideale se monitori i consumi mese per mese'
        ]
      },
      {
        title: 'Dual variabile per flessibilita',
        cardId: 'variabile-dual',
        bullets: [
          '📉 Spread competitivo su luce e gas',
          '🧠 Consulenza per scegliere fascia e profilo corretti',
          '🚀 Attivazione supportata dal team papernest'
        ]
      }
    ]
  };

  const styles = `
    :root {
      --pn-bg: #f4f7fb;
      --pn-surface: #ffffff;
      --pn-border: #d7dfeb;
      --pn-text: #1f2a44;
      --pn-muted: #5d6b86;
      --pn-primary: #0088ff;
      --pn-primary-dark: #0068c4;
      --pn-hero: linear-gradient(135deg, #0b2f5b 0%, #0088ff 100%);
      --pn-radius: 16px;
      --pn-shadow: 0 14px 34px rgba(15, 45, 90, 0.1);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Avenir Next", "Avenir", "Segoe UI", sans-serif;
      color: var(--pn-text);
      background: radial-gradient(circle at top right, #edf5ff, #f7fbff 60%, #ffffff 100%);
    }

    .landing-page {
      width: min(1120px, 100% - 24px);
      margin: 0 auto;
      padding: 18px 0 28px;
      overflow-x: hidden;
    }

    .pn-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      background: var(--pn-surface);
      border: 1px solid var(--pn-border);
      border-radius: 999px;
      padding: 12px 18px;
      box-shadow: var(--pn-shadow);
      margin-bottom: 18px;
    }

    .pn-logo {
      margin: 0;
      color: #00a8ff;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.3px;
    }

    .pn-header-copy {
      margin: 0;
      color: var(--pn-muted);
      font-size: 0.92rem;
      text-align: right;
    }

    h1 {
      margin: 8px 0 18px;
      font-size: clamp(1.85rem, 4.8vw, 2.5rem);
      line-height: 1.08;
    }

    h2 {
      margin: 26px 0 14px;
      font-size: clamp(1.3rem, 3vw, 1.75rem);
      line-height: 1.2;
    }

    .offer-block {
      background: var(--pn-surface);
      border: 1px solid var(--pn-border);
      border-radius: var(--pn-radius);
      box-shadow: var(--pn-shadow);
      padding: 16px;
      margin-bottom: 14px;
    }

    .offer-block h3 {
      margin: 0 0 12px;
      font-size: 1.06rem;
      line-height: 1.3;
    }

    .offer-card {
      width: 100%;
      max-width: 100%;
      border: 1px solid #d5deea;
      border-radius: 12px;
      background: #f8fbff;
      padding: 14px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      overflow-wrap: anywhere;
    }

    .offer-main {
      flex: 1 1 360px;
      min-width: 0;
    }

    .offer-badge {
      margin: 0 0 6px;
      display: inline-flex;
      border-radius: 999px;
      padding: 4px 10px;
      background: #dff0ff;
      color: #14507a;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .offer-card h4 {
      margin: 0 0 5px;
      font-size: 1.08rem;
      line-height: 1.3;
    }

    .offer-price {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 700;
      color: #0d3b67;
      line-height: 1.3;
    }

    .offer-subtitle {
      margin: 5px 0 0;
      color: var(--pn-muted);
      line-height: 1.35;
      font-size: 0.95rem;
    }

    .offer-actions {
      display: flex;
      flex: 1 1 220px;
      justify-content: flex-end;
      gap: 8px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .offer-actions-mobile {
      margin-top: 10px;
      width: 100%;
      justify-content: stretch;
      flex-direction: column;
    }

    .ppn-fallback-cta,
    ppn-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 999px;
      background: var(--pn-primary);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      min-height: 42px;
      padding: 10px 14px;
      font-size: 0.9rem;
      line-height: 1;
      white-space: normal;
      text-align: center;
      cursor: pointer;
      width: auto;
      max-width: 100%;
    }

    .offer-actions-mobile .ppn-fallback-cta,
    .offer-actions-mobile ppn-cta {
      width: 100%;
    }

    .ppn-fallback-cta:hover {
      background: var(--pn-primary-dark);
    }

    .ppn-fallback-cta[aria-disabled="true"] {
      background: #9aa8bb;
      cursor: not-allowed;
      pointer-events: none;
    }

    .offer-bullets {
      margin: 12px 0 0;
      padding-left: 0;
      list-style: none;
      display: grid;
      gap: 7px;
      color: #2c4367;
      font-size: 0.95rem;
    }

    .offer-bullets li {
      line-height: 1.35;
    }

    .final-hero {
      margin-top: 20px;
      min-height: 30vh;
      border-radius: 22px;
      background: var(--pn-hero);
      color: #fff;
      padding: clamp(22px, 5vw, 36px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
      box-shadow: var(--pn-shadow);
    }

    .final-hero p {
      margin: 0;
      font-size: clamp(1.16rem, 2.8vw, 1.62rem);
      line-height: 1.35;
      max-width: 760px;
    }

    .final-hero .hero-cta {
      max-width: max-content;
      background: #ffffff;
      color: #003b80;
      font-weight: 800;
    }

    .final-hero .hero-cta:hover {
      background: #eaf3ff;
    }

    @media (max-width: 920px) {
      .pn-header {
        border-radius: 16px;
      }

      .offer-actions {
        justify-content: stretch;
      }
    }

    @media (max-width: 768px) { .desktop-card {display:none!important} .mobile-card {display:flex!important} }
    @media (min-width: 769px) { .desktop-card {display:flex!important} .mobile-card {display:none!important} }

    @media (max-width: 768px) {
      .landing-page {
        width: min(1120px, 100% - 16px);
      }

      .pn-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .pn-header-copy {
        text-align: left;
      }

      .offer-block {
        padding: 12px;
      }

      .offer-card {
        padding: 12px;
      }

      .offer-actions {
        width: 100%;
      }

      .offer-actions .ppn-fallback-cta,
      .offer-actions ppn-cta {
        width: 100%;
      }

      .final-hero {
        min-height: 34vh;
      }

      .final-hero .hero-cta {
        max-width: 100%;
      }
    }
  `;

  const layoutTemplate = `
    <main class="landing-page">
      <header class="pn-header">
        <p class="pn-logo">papernest</p>
        <p class="pn-header-copy">Confronto offerte in pochi minuti</p>
      </header>

      <h1>Migliori offerte per te</h1>

      <section aria-labelledby="offers-fixed-title">
        <h2 id="offers-fixed-title">Migliori offerte per te a prezzo fisso</h2>
        <div id="offers-fixed-list"></div>
      </section>

      <section aria-labelledby="offers-variable-title">
        <h2 id="offers-variable-title">Migliori offerte per te a prezzo variabile</h2>
        <div id="offers-variable-list"></div>
      </section>

      <section class="final-hero" aria-label="Consulenza papernest">
        <p>Pensi che sia arrivato il momento per cambiare fornitore? Fatti contattare da papernest per la consulenza gratuita di un esperto.</p>
        <ppn-cta class="hero-cta" href="https://www.papernest.it" label="Richiedi consulenza gratuita">Richiedi consulenza gratuita</ppn-cta>
      </section>
    </main>
  `;

  const createStyles = () => {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  };

  const parseCardsDocument = async () => {
    const response = await fetch('./src/templates/offers-cards.html', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Impossibile caricare offers-cards.html');
    }
    const html = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  };

  const getCardNode = (cardsDoc, cardId) => {
    const template = cardsDoc.querySelector(`template[data-card-id="${cardId}"]`);
    return template ? template.content.cloneNode(true) : document.createTextNode('');
  };

  const createBullets = (bullets) => {
    const list = document.createElement('ul');
    list.className = 'offer-bullets';
    bullets.forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
    });
    return list;
  };

  const createOfferBlock = (cardsDoc, { title, cardId, bullets }) => {
    const block = document.createElement('article');
    block.className = 'offer-block';

    const heading = document.createElement('h3');
    heading.textContent = title;
    block.appendChild(heading);

    block.appendChild(getCardNode(cardsDoc, cardId));
    block.appendChild(createBullets(bullets));

    return block;
  };

  const renderOffers = (cardsDoc) => {
    const fixedContainer = document.getElementById('offers-fixed-list');
    const variableContainer = document.getElementById('offers-variable-list');

    landingConfig.fixed.forEach((item) => fixedContainer.appendChild(createOfferBlock(cardsDoc, item)));
    landingConfig.variable.forEach((item) => variableContainer.appendChild(createOfferBlock(cardsDoc, item)));
  };

  const buildFallbackFromPpnCta = (node) => {
    const href = node.getAttribute('href') || '';
    const callHref = node.getAttribute('call-href') || '';
    const textAttr = node.getAttribute('label') || node.getAttribute('text') || '';
    const text = (textAttr || node.textContent || '').trim() || 'Scopri di piu';
    const className = ['ppn-fallback-cta', node.className].filter(Boolean).join(' ').trim();

    if (callHref && callHref.startsWith('tel:')) {
      const a = document.createElement('a');
      a.className = className;
      a.href = callHref;
      a.textContent = text;
      return a;
    }

    if (href) {
      const a = document.createElement('a');
      a.className = className;
      a.href = href;
      a.textContent = text;
      return a;
    }

    const disabled = document.createElement('button');
    disabled.type = 'button';
    disabled.className = className;
    disabled.textContent = text;
    disabled.disabled = true;
    disabled.setAttribute('aria-disabled', 'true');
    return disabled;
  };

  const applyCtaFallbackIfNeeded = (root = document) => {
    if (window.customElements && window.customElements.get('ppn-cta')) {
      return;
    }

    root.querySelectorAll('ppn-cta').forEach((node) => {
      const fallback = buildFallbackFromPpnCta(node);
      node.replaceWith(fallback);
    });
  };

  const mount = async () => {
    createStyles();
    app.innerHTML = layoutTemplate;

    try {
      const cardsDoc = await parseCardsDocument();
      renderOffers(cardsDoc);
      applyCtaFallbackIfNeeded(app);
    } catch (error) {
      app.innerHTML = '<main class="landing-page"><p>Errore caricamento offerte. Riprova.</p></main>';
      console.error(error);
    }
  };

  mount();
})();
// --- AGENT-05 END ---

