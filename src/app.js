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
