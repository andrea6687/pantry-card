# 🥫 Pantry Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/releases)
[![GitHub stars](https://img.shields.io/github/stars/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A smart pantry manager for Home Assistant. Scan barcodes with your phone camera, fetch product data automatically from [Open Food Facts](https://world.openfoodfacts.org/), track expiry dates, manage quantities, and get notified before food expires.

> **Data is stored in Home Assistant's own database** and shared across all devices connected to the same HA instance — no extra setup required.

---

## ✨ Features

- 📷 **Barcode scanner** — tap the card to open the camera directly (Chrome/Android native, Safari/iOS via ZXing fallback)
- 📦 **Batch import** — scan multiple products at once via camera, gallery photos, or manual barcode entry, then import them all in one tap
- 🖼️ **Gallery import** — pick one or more photos from your device gallery and extract barcodes automatically
- 🌐 **Open Food Facts integration** — automatically fetches product name, brand, allergens, nutritional values and ingredients
- ⚠️ **Allergen alerts** — visual warning banner when a scanned product contains allergens you configured
- 🗓️ **Expiry tracking** — set expiry and purchase dates, color-coded warnings (green / orange / red)
- ✏️ **Inline editing** — edit category, purchase date and expiry date directly from the pantry list with a single tap
- 🏷️ **Categories** — organize products with predefined categories (Dairy, Meat & Fish, Fruit & Veg, etc.)
- 🔢 **Quantity management** — inline +/− controls directly in the pantry view
- 🔍 **Search, sort & filter** — search by name/brand, filter by category, sort by name/expiry/date added
- 🔔 **HA automation ready** — syncs expiring products to an `input_text` entity for push notifications
- ☁️ **Shared storage** — data saved in HA's database via WebSocket API, visible on every device
- ⚡ **Optimized rendering** — only re-renders when the barcode entity changes, not on every HA state update
- 🔄 **Auto-reset on error** — scanner returns to placeholder automatically after 5 seconds on any error
- 📱 **Mobile first** — designed for the Home Assistant mobile app

---

## 📋 Requirements

- Home Assistant 2023.9.0 or newer
- HACS (for easy installation)
- Home Assistant mobile app (recommended for barcode scanning)

---

## 🚀 Installation

### With HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to **Frontend**
3. Click the three dots menu → **Custom repositories**
4. Add `https://github.com/andrea6687/pantry-card` as category **Lovelace**
5. Search for **Pantry Card** and click **Download**
6. Restart Home Assistant or clear browser cache

### Manual

1. Download `pantry-card.js` from the [latest release](https://github.com/andrea6687/pantry-card/releases/latest)
2. Copy it to `/config/www/pantry-card/pantry-card.js`
3. Go to **Settings → Dashboards → Resources** and add:
   - URL: `/local/pantry-card/pantry-card.js`
   - Type: `JavaScript module`
4. Restart Home Assistant

---

## ⚙️ Setup

### 1. Create helper entities

Add to your `configuration.yaml`:

```yaml
input_text:
  barcode_scanner:
    name: Barcode Scanner
    max: 50
  pantry_expiring:        # optional — only needed for automations
    name: Pantry Expiring
    max: 255
```

Restart Home Assistant after saving.

### 2. Add the cards to your dashboard

Go to your dashboard → **Edit** → **Add card** → **Manual** and paste the YAML.

#### Scanner card

```yaml
type: custom:pantry-card
card_type: scanner
barcode_entity: input_text.barcode_scanner
title: Scan Product
allergens:
  - gluten
  - milk
```

#### Pantry list card

```yaml
type: custom:pantry-card
card_type: pantry
barcode_entity: input_text.barcode_scanner
title: My Pantry
allergens:
  - gluten
  - milk
```

#### Combined layout (recommended)

```yaml
type: vertical-stack
cards:
  - type: custom:pantry-card
    card_type: scanner
    barcode_entity: input_text.barcode_scanner
    expiry_entity: input_text.pantry_expiring
    expiry_warning_days: 7
    title: Scan Product
    allergens:
      - gluten
      - milk

  - type: custom:pantry-card
    card_type: pantry
    barcode_entity: input_text.barcode_scanner
    expiry_entity: input_text.pantry_expiring
    expiry_warning_days: 7
    title: My Pantry
    allergens:
      - gluten
      - milk
```

---

## 🔧 Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | ✅ | — | Must be `custom:pantry-card` |
| `card_type` | string | ✅ | — | `scanner` or `pantry` |
| `barcode_entity` | string | ✅ | — | `input_text` entity where barcodes are written |
| `title` | string | ❌ | — | Card title displayed at the top |
| `allergens` | list | ❌ | `[]` | Allergens to monitor — triggers warning banner |
| `expiry_entity` | string | ❌ | — | `input_text` entity to receive expiring products list (for automations) |
| `expiry_warning_days` | number | ❌ | `7` | Days before expiry to start showing warnings |

### Supported allergen names

Use English names as recognized by Open Food Facts:

`gluten` `milk` `eggs` `peanuts` `nuts` `soy` `fish` `shellfish` `sesame` `celery` `mustard` `lupin` `molluscs` `sulphites`

---

## 📱 How to Use

### Scanning a single product

1. **Tap the scanner card** — the camera opens automatically
2. **Point at the barcode** — detection is automatic, no button needed
3. The card queries **Open Food Facts** and shows name, brand, allergens and nutritional values
4. If allergens match your configured list, a **red warning banner** appears at the top
5. Tap **Aggiungi alla dispensa** to open the add form:
   - Set **quantity**
   - Choose a **category**
   - Optionally set **purchase date** (pre-filled with today) and **expiry date**
6. Tap **Salva in dispensa** — the product is saved and both cards update instantly
7. The scanner resets to the placeholder, ready for the next scan

> **On error:** a **Riprova** (retry) button and a **Nuova scansione** (new scan) button appear. The card resets automatically after **5 seconds**.

---

### 📦 Batch Import

Batch mode lets you add many products at once without filling in details for each one. Products are imported with quantity 1 and no dates — you can edit them later directly in the pantry list.

#### How to activate

Tap **Importazione batch** at the bottom of the scanner card placeholder.

#### Three ways to add products to the queue

| Method | How |
|--------|-----|
| 📷 **Camera** | Tap **Camera** → scan a barcode → scanner resets automatically, ready for the next one |
| 🖼️ **Gallery** | Tap **Galleria** → select one or more photos from your device → barcodes are extracted automatically |
| ⌨️ **Manual** | Type a barcode in the text field and press Enter or tap **+** |

Each barcode is looked up on Open Food Facts in the background. The queue shows the product name and thumbnail as results arrive.

#### Importing

- Items that were not found on Open Food Facts are shown in red and excluded from import
- Tap **Importa N prodotti** to save all valid items to the pantry in a single operation
- The queue clears and batch mode closes automatically

---

### Managing the pantry

- **Search** by product name, brand or category
- **Sort** by name, expiry date, or date added
- **Filter** by category using the chips
- **+/−** buttons update quantity instantly
- **Pencil icon** opens an inline edit panel for category, purchase date and expiry date
- **Trash icon** removes the product

### Editing a product

Tap the ✏️ pencil icon on any pantry item to expand the inline edit panel. You can update:

- **Category**
- **Purchase date**
- **Expiry date**

Tap **Salva** to confirm or **Annulla** to discard changes.

### Expiry color coding

| Indicator | Meaning |
|-----------|---------|
| 🟢 No border | More than `expiry_warning_days` remaining |
| 🟠 Orange left border | Expiring within `expiry_warning_days` |
| 🔴 Red left border | Already expired |

---

## ☁️ Data Storage

Pantry data is stored using **Home Assistant's built-in WebSocket storage API** (`frontend/set_user_data` / `frontend/get_user_data`).

| | |
|---|---|
| ✅ | Shared across **all devices** on the same HA instance |
| ✅ | Stored in the **HA database** — persists across restarts |
| ✅ | Included in **HA backups** automatically |
| ✅ | No extra integration or configuration required |
| ✅ | **Auto-migrates** existing data from the old localStorage format |

> Data is stored per HA user account. If your household uses multiple HA accounts, each will have their own pantry.

---

## 🔔 Expiry Notifications

### How it works

When a product with an expiry date is saved or deleted, the card writes a compact summary of expiring products to the `expiry_entity` you configured.

Format: `ProductName:days_remaining` — negative values mean already expired.

Example value in `input_text.pantry_expiring`: `Milk:1,Yogurt:-2,Butter:5`

### Template sensor

Add to `configuration.yaml`:

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

### Daily notification automation

Add to `automations.yaml`:

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
        title: "🛒 Pantry - Expiry alert"
        message: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% for item in raw.split(',') %}
          {% set parts = item.split(':') %}
          {% set name = parts[0] %}
          {% set days = parts[1] | int %}
          • {{ name }}
          {%- if days < -1 %} → expired {{ days | abs }} days ago
          {%- elif days == -1 %} → expired yesterday
          {%- elif days == 0 %} → expires TODAY
          {%- elif days == 1 %} → expires tomorrow
          {%- else %} → {{ days }} days left
          {%- endif %}
          {% endfor %}
```

> 💡 Replace `notify.mobile_app_your_phone` with your actual service name. Find it in **Developer Tools → Services → search "notify"**.

---

## 🗂️ Product Categories

| Category | Description |
|----------|-------------|
| Latticini | Dairy products |
| Carne e pesce | Meat & Fish |
| Frutta e verdura | Fruit & Vegetables |
| Pane e cereali | Bread & Cereals |
| Dolci e snack | Sweets & Snacks |
| Bevande | Beverages |
| Condimenti | Condiments & Sauces |
| Surgelati | Frozen foods |
| Altro | Other |

---

## 🛠️ Troubleshooting

### "Errore connessione Open Food Facts"

Open Food Facts is a community-run service that may occasionally be slow or unavailable.

- The card automatically resets after **5 seconds**
- Use **Riprova** to retry the same barcode immediately
- Use **Nuova scansione** to discard and scan a different product
- If the problem persists, the service may be temporarily down — try again later

### "Prodotto non trovato"

The scanned barcode is not in the Open Food Facts database.

- Try searching manually at [world.openfoodfacts.org](https://world.openfoodfacts.org)
- You can add the missing product to OFF to help other users

### Gallery import does not detect barcodes

- Use clear, well-lit photos taken close to the barcode
- Avoid blurry or rotated images
- Native detection (`BarcodeDetector`) works best on Android/Chrome; iOS/Safari uses ZXing as fallback

### Camera does not open

- Home Assistant **must be accessed via HTTPS** — browsers require a secure context for camera access
- **iOS / Safari**: Settings → Safari → Camera → Allow
- **Android / Chrome**: Site settings → Camera → Allow for your HA domain

### Card not appearing after installation

1. Clear your browser cache (hard refresh: `Ctrl+Shift+R`)
2. Check the resource is registered: **Settings → Dashboards → Resources**
3. Verify the file exists at `/config/www/pantry-card/pantry-card.js`
4. Make sure the resource URL is `/local/pantry-card/pantry-card.js` (type: JavaScript module)

### Pantry is empty after update

From v0.2.0, data is stored in HA's database instead of localStorage. If you were using a previous version, data is **migrated automatically** on first load — just open the pantry card once and it will transfer your existing items.

---

## 🏗️ Development

### Prerequisites

- Node.js 18+
- npm

### Setup & build

```bash
git clone https://github.com/andrea6687/pantry-card.git
cd pantry-card
npm install
npm run build       # production build → pantry-card.js
npm run dev         # watch mode
```

### Project structure

```
src/
├── index.ts                       # Main LitElement, shouldUpdate, hass setter
├── editor.ts                      # Visual Lovelace editor
├── consts.ts                      # Card name, storage key constants
├── styles.ts                      # All CSS (scanner, batch mode, pantry list, edit panel)
├── types/
│   └── pantry-types.ts            # TypeScript interfaces, enums (PantryItem, config…)
├── api/
│   └── open-food-facts-client.ts  # OFF API v2 with timeout, app identification
└── cards/
    ├── base-card.ts               # Abstract base: HA storage, allergen check, expiry sync
    ├── scan-result.ts             # Scanner, batch import (camera/gallery/manual), add form
    └── pantry-list.ts             # Pantry list: search, sort, filter, qty controls, inline edit
```

### Storage architecture

Data is persisted using HA's built-in WebSocket commands:

```
frontend/set_user_data  →  save pantry items to HA database
frontend/get_user_data  →  load pantry items from HA database
```

A module-level cache (`_itemsCache`) ensures instant UI responses without waiting for the async WebSocket call on every render.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Open Food Facts](https://world.openfoodfacts.org/) — free, open food product database
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — documentation inspiration
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — card architecture pattern
- [Lit](https://lit.dev/) — web components framework
- The Home Assistant community
