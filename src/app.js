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
