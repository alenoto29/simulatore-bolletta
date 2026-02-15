// --- AGENT-05 START ---
(() => {
  const SLOT_TO_CARD = [
    { slotId: 'offers-fixed-1', cardId: 'fisso-smart' },
    { slotId: 'offers-fixed-2', cardId: 'fisso-green' },
    { slotId: 'offers-var-1', cardId: 'variabile-easy' },
    { slotId: 'offers-var-2', cardId: 'variabile-dual' }
  ];

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

  const createCtaFallbackNode = (ppnCtaEl) => {
    const text =
      ppnCtaEl.getAttribute('call-text') ||
      ppnCtaEl.getAttribute('app-text') ||
      ppnCtaEl.getAttribute('label') ||
      (ppnCtaEl.textContent || '').trim() ||
      'Scopri offerta';

    const href = ppnCtaEl.getAttribute('call-href') || ppnCtaEl.getAttribute('href') || '#';

    const anchor = document.createElement('a');
    anchor.className = ['ppn-cta-fallback', ppnCtaEl.className].filter(Boolean).join(' ');
    anchor.href = href;
    anchor.textContent = text;

    if (href === '#') {
      anchor.setAttribute('aria-disabled', 'true');
      anchor.setAttribute('role', 'button');
      anchor.addEventListener('click', (event) => event.preventDefault());
    }

    return anchor;
  };

  const applyPpnCtaFallback = (rootNode) => {
    if (window.customElements && window.customElements.get('ppn-cta')) {
      return 0;
    }

    let replaced = 0;
    rootNode.querySelectorAll('ppn-cta').forEach((node) => {
      node.replaceWith(createCtaFallbackNode(node));
      replaced += 1;
    });

    return replaced;
  };

  const findTemplateInDoc = (cardsDoc, cardId) => cardsDoc.querySelector(`template[data-card-id="${cardId}"]`);

  const injectOffersIntoSlots = async () => {
    const cardsDoc = await loadCardsDocOnce();
    let injected = 0;

    SLOT_TO_CARD.forEach(({ slotId, cardId }) => {
      const slot = document.getElementById(slotId);
      if (!slot) {
        console.warn(`[offers] slot non trovato: #${slotId}`);
        return;
      }

      const template = findTemplateInDoc(cardsDoc, cardId);
      if (!template) {
        console.warn(`[offers] template non trovato: ${cardId}`);
        return;
      }

      slot.replaceChildren(template.content.cloneNode(true));
      injected += 1;
      applyPpnCtaFallback(slot);
    });

    console.info(`[offers] injection completata: ${injected}/${SLOT_TO_CARD.length} slot`);
  };

  const attachInjectionToShowStep = () => {
    const existingShowStep = typeof window.showStep === 'function' ? window.showStep : null;

    if (existingShowStep && existingShowStep.__offersInjectionWrapped) {
      return;
    }

    const wrappedShowStep = function wrappedShowStep(step, ...args) {
      const result = existingShowStep ? existingShowStep.call(this, step, ...args) : undefined;

      if (Number(step) === 5) {
        injectOffersIntoSlots().catch(console.error);
      }

      return result;
    };

    wrappedShowStep.__offersInjectionWrapped = true;
    window.showStep = wrappedShowStep;
  };

  attachInjectionToShowStep();
  window.injectOffersIntoSlots = injectOffersIntoSlots;
})();
// --- AGENT-05 END ---
