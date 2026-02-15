# QA Checklist - Demo E2E (Mobile-First)

Data verifica: 2026-02-15  
Workspace: `/Users/alenoto29/.codex/worktrees/5069/simulatore-bolletta`

## Stato sorgenti prima del QA

- `index.html`: vuoto (0 byte)
- `src/app.js`: vuoto (0 byte)
- `src/styles.css`: vuoto (0 byte)

## 15 Check Rapidi

| ID | Check mobile-first | Esito |
|---|---|---|
| 1 | Viewport impostato correttamente (`width=device-width, initial-scale=1`) | BLOCCATO |
| 2 | Nessun overflow orizzontale a 320px | BLOCCATO |
| 3 | Tap target principali >= 44px | BLOCCATO |
| 4 | Navigazione step-by-step utilizzabile solo da touch | BLOCCATO |
| 5 | Step 1 -> Step 2: passaggio fluido senza salti UI | BLOCCATO |
| 6 | Step 2: validazioni input obbligatori corrette | BLOCCATO |
| 7 | Step 2: messaggi errore visibili e non sovrapposti | BLOCCATO |
| 8 | Step 3: selezione offerte/stato intermedio coerente | BLOCCATO |
| 9 | Step 4: validazioni finali corrette prima CTA | BLOCCATO |
| 10 | Step 4: submit impedito con campi invalidi | BLOCCATO |
| 11 | Flusso Gas / Dual non rompe la wizard (coming soon) | BLOCCATO |
| 12 | Landing5 integra card offerte correttamente | BLOCCATO |
| 13 | Landing5 CTA fallback cliccabile in locale se web component assente | BLOCCATO |
| 14 | Copy/spaziature coerenti tra sezioni (nessun glitch visivo) | BLOCCATO |
| 15 | Nessun errore console in flusso completo E2E | BLOCCATO |

## Verifiche richieste (focus)

- Gas/Dual non rompono il flusso (coming soon): **NON VERIFICABILE** (assenza implementazione UI/JS).
- Step2 e Step4 validazioni: **NON VERIFICABILE** (assenza logica validazione in `src/app.js`).
- Landing5 card + CTA fallback: **NON VERIFICABILE** (assenza markup/template/logic).
- Nessun errore console: **NON VERIFICABILE IN BROWSER** (nessuna app renderizzabile nel workspace corrente).

## Note QA

- Nessun fix applicato a `index.html`, `src/app.js`, `src/styles.css` per rispettare il vincolo "no nuove feature".
- Per una demo E2E reale servono contenuti minimi nei file applicativi attualmente vuoti.
