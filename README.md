# Pantry Card

🇮🇹 [Versione italiana](README.it.md)

**Scan a barcode and keep your pantry, with expiry dates, inside Home Assistant.**

A Lovelace card. You point the phone camera at a product, the card reads the barcode, asks [Open Food Facts](https://world.openfoodfacts.org/) for the name, brand, photo, allergens, ingredients and nutrition, and saves the product in your pantry. There are two cards: one scans, one lists what you stored. Buttons and messages are in Italian.

Open Food Facts is a free community database, so a product you buy may not be in it yet.

The pantry is stored on your Home Assistant instance, for the user who is signed in. It is not kept in the browser. Another Home Assistant user in the same house has a separate pantry.

## Quick install

### With HACS

[`hacs.json`](hacs.json) sits in the repository root and names `pantry-card.js` as the file to install.

1. Open HACS in Home Assistant and go to **Frontend**.
2. Open the three-dots menu and choose **Custom repositories**.
3. Add `https://github.com/andrea6687/pantry-card` with category **Lovelace**.
4. Search for **Pantry Card** and download it.
5. Restart Home Assistant, or clear the browser cache.

### Manual

1. Copy [`pantry-card.js`](pantry-card.js) from this repository. The same filename is also attached to the [latest release](https://github.com/andrea6687/pantry-card/releases/latest).
2. Put it at `/config/www/pantry-card/pantry-card.js`.
3. Go to **Settings → Dashboards → Resources** and add:
   - URL: `/local/pantry-card/pantry-card.js`
   - Type: JavaScript module
4. Restart Home Assistant.

## Setup

You need one `input_text` for the barcode. A second `input_text` is optional: the card writes a short expiry summary there, which you can use in automations.

### 1. Helper entities

Add this to `configuration.yaml` and restart Home Assistant:

```yaml
input_text:
  barcode_scanner:
    name: Barcode Scanner
    max: 50
  pantry_expiring:        # optional — only for the expiry summary
    name: Pantry Expiring
    max: 255
```

The card never writes more than 250 characters into `pantry_expiring`, so `max: 255` is enough.

### 2. Add the cards

On the dashboard, choose **Edit → Add card**. The visual editor (card type, title, barcode entity, expiry entity, warning days, allergens) is in Italian. You can paste YAML instead.

Both cards require `barcode_entity`. `card_type` is `scanner` or `pantry`.

Scanner:

```yaml
type: custom:pantry-card
card_type: scanner
barcode_entity: input_text.barcode_scanner
title: Scansiona Prodotto
allergens:
  - gluten
  - milk
```

Pantry list:

```yaml
type: custom:pantry-card
card_type: pantry
barcode_entity: input_text.barcode_scanner
title: La Mia Dispensa
allergens:
  - gluten
  - milk
```

Both together, with the expiry summary:

```yaml
type: vertical-stack
cards:
  - type: custom:pantry-card
    card_type: scanner
    barcode_entity: input_text.barcode_scanner
    expiry_entity: input_text.pantry_expiring
    expiry_warning_days: 7
    title: Scansiona Prodotto
    allergens:
      - gluten
      - milk

  - type: custom:pantry-card
    card_type: pantry
    barcode_entity: input_text.barcode_scanner
    expiry_entity: input_text.pantry_expiring
    expiry_warning_days: 7
    title: La Mia Dispensa
    allergens:
      - gluten
      - milk
```

Put the same `barcode_entity` on both cards. On one dashboard page, saving a product updates the list straight away.

## Configuration

| Option | Required | Default | What it does |
|--------|----------|---------|--------------|
| `type` | yes | — | `custom:pantry-card` |
| `card_type` | yes | — | `scanner` or `pantry` |
| `barcode_entity` | yes | — | `input_text` the scanner writes the barcode into |
| `title` | no | none | Heading on the card |
| `allergens` | no | none | English names to warn about |
| `expiry_entity` | no | none | `input_text` that receives the expiry summary |
| `expiry_warning_days` | no | `7` | How many days before expiry a product is included in that summary |

Allergen names are matched as text. Open Food Facts tags such as `en:milk` are stored as `milk`, and the card warns when a tag contains the name you wrote, ignoring case. Any English name Open Food Facts uses will work. Examples: `gluten`, `milk`, `eggs`, `peanuts`, `nuts`, `soy`, `fish`, `shellfish`, `sesame`, `celery`, `mustard`, `lupin`, `molluscs`, `sulphites`.

## How to use it

### One product

1. Tap the scanner placeholder (**Tocca per scansionare**). The camera opens, with the hint **Inquadra il codice a barre**. **Annulla** closes it.
2. Detection is automatic. The barcode is written to `barcode_entity` with the `input_text.set_value` service, then the card asks Open Food Facts. The request gives up after 10 seconds.
3. When the product is found you see the name, brand, barcode, photo, allergens, ingredients and, when Open Food Facts has them, nutrition per 100 g. If an allergen matches your list, a red banner says **ATTENZIONE: Contiene allergeni!**
4. **Aggiungi alla dispensa** opens the form. Quantity starts at 1. Category is optional. The purchase date starts as today. The expiry date is empty until you set it.
5. **Salva in dispensa** stores the product, clears `barcode_entity`, and the list card on the same page refreshes.

A barcode that is not in the pantry yet is saved with the quantity you chose. A barcode that is already there only increases the existing quantity by 1. Dates and category of the old row are left as they were.

If Open Food Facts fails, the card shows the error, **Riprova**, **Nuova scansione**, and **reset in 5s**. After 5 seconds it clears the barcode and returns to the placeholder. The messages are:

- `Prodotto "…" non trovato in Open Food Facts`
- `Open Food Facts non risponde (timeout)`
- `Nessuna connessione internet`
- `Errore Open Food Facts (…)`

**Riprova** asks again for the same barcode. **Nuova scansione** clears it immediately.

If Open Food Facts returns a product with no name, the name shown is **Prodotto sconosciuto**.

### Batch import

**Importazione batch**, under the placeholder, queues many barcodes and saves them in one step. Each saved product has quantity 1, no category and no dates. You set those later from the list.

- **Camera** reads one barcode and closes. Tap **Camera** again for the next one.
- **Galleria** takes one or more photos. Photos with no readable barcode are counted: `N immagine/i senza barcode rilevabile`.
- Type a code and press Enter, or tap **+**. A code already in the queue is skipped.
- Each row shows **Ricerca...** while Open Food Facts answers, then the name and photo, or **Non trovato** / **Errore OFF**.
- **Importa N prodotti** saves only the rows that were found, then closes batch mode. A barcode already in the pantry has its quantity increased by 1.

### The list

An empty pantry says **Dispensa vuota. Scansiona un prodotto!**

- **Cerca...** matches the name, the brand or the category.
- **Nome**, **Scadenza** and **Aggiunto** sort the list. **Nome** is the default (Italian alphabetical order). **Aggiunto** puts the newest first. Products with no expiry date go last when you sort by **Scadenza**.
- Category chips come from the products you actually have, plus **Tutti**.
- **+** and **−** change the quantity. From 1, **−** removes the product. The trash icon removes it too.
- The pencil opens category, purchase date and expiry date. **Salva** keeps the change, **Annulla** discards it.

Categories you can pick, in the add form and in the editor:

| Category | |
|----------|--|
| Latticini | dairy |
| Carne e pesce | meat and fish |
| Frutta e verdura | fruit and vegetables |
| Pane e cereali | bread and cereals |
| Dolci e snack | sweets and snacks |
| Bevande | drinks |
| Condimenti | condiments |
| Surgelati | frozen food |
| Altro | anything else |

### Expiry colors on the list

The colored bar does not use `expiry_warning_days`. That option only decides what is written into `expiry_entity`. On the list the thresholds are fixed:

| What you see | Meaning |
|--------------|---------|
| No colored bar | No expiry date, or more than 3 days left |
| Orange bar | 3 days or fewer. The banner counts these as **in scadenza nei prossimi 3 giorni** |
| Red bar | Already expired. The banner counts these as **prodotto/i scaduto/i** |

Next to the date: **Scade oggi!**, **Scade domani**, **Scade in Ng** up to 7 days, **Scaduto Ng fa** when it is past, and the stored date after that. Purchase dates are shown as `dd/mm/yyyy`.

Changing quantity with **+** / **−** does not refresh `expiry_entity`, even when **−** removes the last one. Saving, editing, the trash icon and batch import do.

## Expiry notifications

When the summary is updated, every product that has an expiry date and whose remaining days are less than or equal to `expiry_warning_days` (7 if you omit it) becomes `Name:days`. The name is cut at 20 characters. Soonest first, joined with commas, cut at 250 characters. A negative number means already expired. If nothing falls in the window, the entity is set to `ok`.

Example: `Latte:1,Yogurt:-2,Burro:5`

A comma or a colon inside a product name will break a template that splits on those characters.

This sensor counts the entries. Add it to `configuration.yaml`:

```yaml
template:
  - sensor:
      - name: "Pantry - Expiring products"
        unique_id: pantry_expiring_count
        state: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% if raw in ['ok', '', 'unknown', 'unavailable'] %}
            0
          {% else %}
            {{ raw.split(',') | count }}
          {% endif %}
```

This automation notifies every morning. Add it to `automations.yaml` and replace `notify.mobile_app_your_phone` with your notify service (**Developer tools → Actions**, search for `notify`):

```yaml
- alias: "Pantry - Expiry alert"
  triggers:
    - at: "08:00:00"
      trigger: time
  conditions:
    - condition: template
      value_template: >
        {{ states('input_text.pantry_expiring') not in ['ok', '', 'unknown', 'unavailable'] }}
  actions:
    - action: notify.mobile_app_your_phone
      data:
        title: "Pantry - Expiry alert"
        message: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% for item in raw.split(',') %}
          {% set parts = item.split(':') %}
          {% set name = parts[0] %}
          {% set days = parts[1] | int %}
          • {{ name }}
          {%- if days < -1 %} → expired {{ days | abs }} days ago
          {%- elif days == -1 %} → expired yesterday
          {%- elif days == 0 %} → expires today
          {%- elif days == 1 %} → expires tomorrow
          {%- else %} → {{ days }} days left
          {%- endif %}
          {% endfor %}
```

## Where the data lives

The card loads and saves with Home Assistant WebSocket commands `frontend/get_user_data` and `frontend/set_user_data`, under the key `pantry_items`.

- It follows the signed-in user. The same user sees the same pantry on another device the next time that device opens the card. Two dashboards open at once on different devices do not push updates to each other.
- On one page, the cards tell each other to refresh through a `pantry-updated` event in the browser.
- The first time the Home Assistant store is empty, items saved by an older version under the browser key `ha-pantry-card-items` are copied over and that key is removed.
- If Home Assistant storage cannot be read, the card falls back to that same browser key.
- A cache in the page keeps the list from waiting on the WebSocket at every redraw.

## Known limitations

- The interface is Italian.
- The camera needs a secure page (HTTPS) and permission. If the browser refuses it, the scanner closes.
- Where the browser has `BarcodeDetector`, the formats are EAN-13, EAN-8, Code 128, UPC-A and UPC-E. Otherwise the card uses ZXing (`@zxing/browser`), including when it reads a photo from the gallery.
- The list's "soon" state is 3 days. `expiry_warning_days` affects only the text in `expiry_entity`.
- Saving a barcode that is already in the pantry adds 1 to the quantity and keeps the old dates and category.
- The card redraws when `barcode_entity` changes and when it updates itself, not on every Home Assistant state change.
- There is no automated test suite in this repository.

## Development

```
npm install
npm run build     # writes pantry-card.js in the repository root
npm run dev       # webpack in watch mode
```

```
src/index.ts                         the Lovelace card, when it redraws, the visual editor hook
src/editor.ts                        visual editor
src/consts.ts                        card name and the old browser storage key
src/styles.ts                        CSS
src/types/pantry-types.ts            config, pantry item, categories, Open Food Facts types
src/api/open-food-facts-client.ts    Open Food Facts API v2, 10 second timeout
src/cards/base-card.ts               Home Assistant storage, allergens, expiry summary
src/cards/scan-result.ts             camera, batch import, add form
src/cards/pantry-list.ts             search, sort, filter, quantity, inline edit
pantry-card.js                       built file served by HACS
hacs.json                            HACS: file in the repository root
```

To contribute, read [CONTRIBUTING.md](CONTRIBUTING.md).

## Thanks

- [Open Food Facts](https://world.openfoodfacts.org/) — the product database
- [Lit](https://lit.dev/) — the web component library
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — documentation that this card learned from
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — the card structure this project followed
- The Home Assistant community

## License

[MIT](LICENSE) © Andrea Sportello

---

If Pantry Card saved a product from going off at the back of the fridge, a ⭐ on the repository helps other people find it. Bugs and ideas are welcome in the [issues](https://github.com/andrea6687/pantry-card/issues).
