# Security Policy

🇮🇹 Italiano più sotto.

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Use GitHub's private reporting instead: go to the [Security tab](https://github.com/andrea6687/pantry-card/security) and choose **Report a vulnerability**. You'll get an answer as soon as possible, usually within a week.

Examples of what to report:

- a way for product data from Open Food Facts (name, image address, ingredients) to run code in the Home Assistant dashboard;
- a way for one Home Assistant user to read or change another user's pantry;
- the card writing to an entity it was not given in its configuration, or sending the pantry somewhere other than your Home Assistant instance and the Open Food Facts product lookup.

## Supported versions

Only the latest version on the `main` branch is supported. HACS installs `pantry-card.js` from the repository root.

## What the card does and doesn't do

- For each barcode it looks the product up at `https://world.openfoodfacts.org/api/v2/product`. It sends the barcode and the app name (`pantry-card`, version `0.1.0`). The timeout is 10 seconds.
- It writes that barcode to the `input_text` in `barcode_entity`, and, when you set `expiry_entity`, a short expiry summary to that `input_text`.
- It stores the pantry with Home Assistant's `frontend/set_user_data` / `frontend/get_user_data`, key `pantry_items`, for the signed-in user.
- Camera frames stay in the browser. The card does not upload them.
- You can read the source in `src/` before installing. `pantry-card.js` is that source, built.

---

## Italiano

Per i problemi di sicurezza **non aprire una issue pubblica**: usa la [scheda Security](https://github.com/andrea6687/pantry-card/security) → **Report a vulnerability**, che è privata.

È supportata solo l'ultima versione su `main`. HACS installa `pantry-card.js` dalla radice del repository.

La card chiede a Open Food Facts i dati di un barcode, scrive il barcode e (se lo configuri) il riepilogo scadenze negli `input_text` della card, e salva la dispensa nei dati utente di Home Assistant. I fotogrammi della fotocamera restano nel browser. Il codice è in `src/`: puoi leggerlo prima di installare.
