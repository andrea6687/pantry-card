# Contributing

🇮🇹 Italiano più sotto.

Thanks for helping! Bug reports are the most useful contribution: the card runs inside Home Assistant, and every phone browser handles the camera a little differently.

## Reporting a bug

Open an [issue](https://github.com/andrea6687/pantry-card/issues/new/choose) with the bug template and include:

- your Home Assistant version;
- your device and browser (e.g. Pixel 8, Home Assistant app; iPhone 15, Safari);
- how you installed the card (HACS or manual);
- which card you were using (`scanner`, `pantry`, or both) and what you tapped;
- what you expected and what happened;
- a screenshot, if you can.

Before posting, remove anything private: long-lived tokens, passwords, and addresses that contain credentials.

## Suggesting an idea

Open an issue with the idea template and explain the problem you want to solve, not only the solution.

## Sending code

1. Open an issue first for anything bigger than a small fix, so we can agree on the approach.
2. Edit the TypeScript under `src/`, then run `npm run build`. That rewrites `pantry-card.js` in the repository root, which is the file HACS serves (`hacs.json` sets `content_in_root` and `filename`).
3. There is no automated test suite. Try the card in a real Home Assistant dashboard (scanner and pantry list) and say in the pull request what you tested.
4. The card may call Open Food Facts only to look up a barcode someone scanned, and it may write only to the entities named in the card config and to that user's pantry storage.
5. Interface text is in Italian. Keep it short and plain.
6. Update both READMEs (`README.md` and `README.it.md`) if the behavior changes.

## Scope

In scope: scanning products into your own Home Assistant pantry, quantities, categories, expiry dates and allergen warnings.
Out of scope: scraping Open Food Facts, bulk downloading of product data, or reading another user's pantry.

---

## Italiano

Grazie per l'aiuto! Le segnalazioni di problemi sono il contributo più utile: la card gira dentro Home Assistant, e ogni browser del telefono gestisce la fotocamera in modo diverso.

- **Problema:** apri una [issue](https://github.com/andrea6687/pantry-card/issues/new/choose) con il modello "bug" indicando la versione di Home Assistant, dispositivo e browser, se hai installato con HACS o a mano, quale card usavi e cosa è successo. Togli token, password e indirizzi con credenziali.
- **Idea:** apri una issue con il modello "idea" e spiega il problema da risolvere.
- **Codice:** per modifiche non piccole apri prima una issue. Modifica il TypeScript in `src/` e poi esegui `npm run build`, così `pantry-card.js` resta allineato. Non ci sono test automatici: provala in una dashboard vera. Le richieste di rete restano la ricerca di un barcode su Open Food Facts. I testi dell'interfaccia sono in italiano. Aggiorna entrambi i README se cambia il comportamento.
- **Fuori tema:** scraping di Open Food Facts, download di dati in massa, leggere la dispensa di un altro utente.
