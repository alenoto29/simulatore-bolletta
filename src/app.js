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
