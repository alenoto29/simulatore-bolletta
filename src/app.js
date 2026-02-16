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
  const SLOT_TO_CARD = [
    { slotId: 'offers-fixed-1', cardId: 'fisso-smart' },
    { slotId: 'offers-fixed-2', cardId: 'fisso-green' },
    { slotId: 'offers-var-1', cardId: 'variabile-easy' },
    { slotId: 'offers-var-2', cardId: 'variabile-dual' }
  ];

  const state = {
    currentStep: null,
    offersInjected: false,
    offersInjectionPromise: null,
    goStepListenerBound: false
  };

  let cardsDocPromise;

  const loadCardsDocOnce = async () => {
    if (!cardsDocPromise) {
      cardsDocPromise = fetch('./src/templates/offers-cards.html', { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`offers-cards.html non disponibile (${response.status})`);
          }
          return response.text();
        })
        .then((html) => new DOMParser().parseFromString(html, 'text/html'));
    }
    return cardsDocPromise;
  };

  const getFallbackText = (node) =>
    node.getAttribute('call-text') ||
    node.getAttribute('app-text') ||
    node.getAttribute('label') ||
    (node.textContent || '').trim() ||
    'Scopri offerta';

  const getFallbackHref = (node) => node.getAttribute('call-href') || node.getAttribute('href') || '#';

  const createCtaFallbackNode = (ppnCtaEl) => {
    const href = getFallbackHref(ppnCtaEl);
    const text = getFallbackText(ppnCtaEl);
    const className = ['ppn-cta-fallback', ppnCtaEl.className].filter(Boolean).join(' ');

    if (href === '#') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = text;
      button.addEventListener('click', () => {
        window.alert('CTA demo (ppn-cta non definito in locale).');
      });
      return button;
    }

    const anchor = document.createElement('a');
    anchor.className = className;
    anchor.href = href;
    anchor.textContent = text;
    return anchor;
  };

  const applyPpnCtaFallback = (rootNode) => {
    if (window.customElements && window.customElements.get('ppn-cta')) {
      return;
    }

    rootNode.querySelectorAll('ppn-cta').forEach((node) => {
      node.replaceWith(createCtaFallbackNode(node));
    });
  };

  const findTemplateInDoc = (cardsDoc, cardId) => cardsDoc.querySelector(`template[data-card-id="${cardId}"]`);

  const createPlaceholder = (cardId) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'offer-card offer-card-placeholder';
    placeholder.textContent = `Offerta non disponibile (${cardId})`;
    return placeholder;
  };

  const injectFetchFailurePlaceholders = () => {
    SLOT_TO_CARD.forEach(({ slotId, cardId }) => {
      const slot = document.getElementById(slotId);
      if (!slot) {
        console.warn(`[offers] slot non trovato: #${slotId}`);
        return;
      }
      slot.replaceChildren(createPlaceholder(cardId));
      slot.dataset.offersInjected = 'true';
      slot.dataset.cardId = cardId;
    });
  };

  const injectOffersIntoSlots = async () => {
    if (state.offersInjected) {
      return;
    }
    if (state.offersInjectionPromise) {
      return state.offersInjectionPromise;
    }

    state.offersInjectionPromise = (async () => {
      let cardsDoc;
      try {
        cardsDoc = await loadCardsDocOnce();
      } catch (error) {
        console.warn('[offers] impossibile caricare offers-cards.html, uso placeholder', error);
        injectFetchFailurePlaceholders();
        state.offersInjected = true;
        return;
      }

      let injected = 0;
      let missingSlots = 0;
      let placeholders = 0;

      SLOT_TO_CARD.forEach(({ slotId, cardId }) => {
        const slot = document.getElementById(slotId);
        if (!slot) {
          missingSlots += 1;
          console.warn(`[offers] slot non trovato: #${slotId}`);
          return;
        }

        const template = findTemplateInDoc(cardsDoc, cardId);
        const fragment = document.createDocumentFragment();

        if (!template) {
          console.warn(`[offers] template non trovato: ${cardId}`);
          fragment.appendChild(createPlaceholder(cardId));
          placeholders += 1;
        } else {
          const cloned = template.content.cloneNode(true);
          applyPpnCtaFallback(cloned);
          fragment.appendChild(cloned);
        }

        slot.replaceChildren(fragment);
        slot.dataset.offersInjected = 'true';
        slot.dataset.cardId = cardId;
        injected += 1;
      });

      if (missingSlots === 0) {
        state.offersInjected = true;
      }

      console.info(
        `[offers] injection completata: injected=${injected}, placeholders=${placeholders}, missingSlots=${missingSlots}`
      );
    })();

    try {
      await state.offersInjectionPromise;
    } finally {
      state.offersInjectionPromise = null;
    }
  };

  const getStepNumber = (element) => {
    const fromData = Number(element.dataset.step);
    if (Number.isFinite(fromData) && fromData > 0) {
      return fromData;
    }

    const idMatch = element.id && element.id.match(/^step-(\d+)$/);
    if (idMatch) {
      return Number(idMatch[1]);
    }

    for (const cls of element.classList) {
      const clsMatch = cls.match(/^step-(\d+)$/);
      if (clsMatch) {
        return Number(clsMatch[1]);
      }
    }

    return null;
  };

  function showStep(step) {
    const stepNumber = Number(step);
    state.currentStep = stepNumber;

    const stepNodes = Array.from(new Set(document.querySelectorAll('[data-step], .step, [id^="step-"]')));
    stepNodes.forEach((node) => {
      const nodeStep = getStepNumber(node);
      if (!nodeStep) {
        return;
      }

      const isActive = nodeStep === stepNumber;
      node.hidden = !isActive;
      node.classList.toggle('is-active', isActive);
    });

    const progressLabel = document.querySelector('[data-progress-label]');
    if (progressLabel) {
      progressLabel.textContent = `Step ${stepNumber} di 5`;
    }

    const progressFill = document.querySelector('[data-progress-fill]');
    if (progressFill) {
      const width = Math.max(0, Math.min(100, (stepNumber / 5) * 100));
      progressFill.style.width = `${width}%`;
    }

    const progressBar = document.querySelector('[role="progressbar"]');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(stepNumber));
    }

    document.querySelectorAll(`.step[data-step="${stepNumber}"] .step-kicker`).forEach((kicker) => {
      kicker.textContent = `Step ${stepNumber} di 5`;
    });

    if (stepNumber === 5) {
      injectOffersIntoSlots().catch(console.error);
    }
  }

  const bindGoStepClickNavigation = () => {
    if (state.goStepListenerBound) {
      return;
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-go-step]');
      if (!trigger) {
        return;
      }

      const targetStep = Number(trigger.getAttribute('data-go-step'));
      if (!Number.isFinite(targetStep) || targetStep < 1) {
        return;
      }

      showStep(targetStep);
    });

    state.goStepListenerBound = true;
  };

  bindGoStepClickNavigation();
  window.showStep = showStep;
})();
// --- AGENT-05 END ---

