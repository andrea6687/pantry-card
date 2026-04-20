# 🥫 Pantry Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/releases)
[![GitHub stars](https://img.shields.io/github/stars/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A smart pantry manager for Home Assistant. Scan barcodes with your phone camera, fetch product data automatically from [Open Food Facts](https://world.openfoodfacts.org/), track expiry dates, manage quantities, and get notified before food expires.

---

## ✨ Features

- 📷 **Barcode scanner** — tap to open camera directly from the card (Chrome/Android native, Safari/iOS via ZXing fallback)
- 🌐 **Open Food Facts integration** — automatically fetches product name, brand, allergens, nutritional values and ingredients
- ⚠️ **Allergen alerts** — visual warning when a scanned product contains allergens you configured
- 🗓️ **Expiry tracking** — set expiry and purchase dates, get color-coded warnings (green / orange / red)
- 🏷️ **Categories** — organize products with predefined categories (Dairy, Meat & Fish, Fruit & Veg, etc.)
- 🔢 **Quantity management** — quick +/− controls directly in the pantry view
- 🔍 **Search & filter** — search by name/brand, filter by category, sort by name/expiry/date added
- 🔔 **HA automation ready** — syncs expiring products to an `input_text` entity for automations and notifications
- ⚡ **Optimized rendering** — only re-renders when the barcode entity changes, not on every HA state update
- 📱 **Mobile first** — designed for use on the Home Assistant mobile app

---

## 📋 Requirements

- Home Assistant 2023.9.0 or newer
- HACS installed (for easy installation)
- Home Assistant mobile app (for best barcode scanning experience)

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
  pantry_expiring:          # optional — needed for automations
    name: Pantry Expiring
    max: 255
```

Restart Home Assistant after saving.

### 2. Add the cards to your dashboard

Go to your dashboard, click **Edit** → **Add card** → **Manual** and paste the YAML.

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

### Common options (both card types)

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | ✅ | — | Must be `custom:pantry-card` |
| `card_type` | string | ✅ | — | `scanner` or `pantry` |
| `barcode_entity` | string | ✅ | — | `input_text` entity where barcodes are written |
| `title` | string | ❌ | — | Card title displayed at the top |
| `allergens` | list | ❌ | `[]` | List of allergens to monitor (English names) |
| `expiry_entity` | string | ❌ | — | `input_text` entity to sync expiring products for automations |
| `expiry_warning_days` | number | ❌ | `7` | Days before expiry to start warning |

### Supported allergen names

Use English names as recognized by Open Food Facts:

`gluten` `milk` `eggs` `peanuts` `nuts` `soy` `fish` `shellfish` `sesame` `celery` `mustard` `lupin` `molluscs` `sulphites`

---

## 📱 How to Use

### Scanning a product

1. **Tap the scanner card** — your camera opens automatically
2. **Point at the barcode** — scanning is fully automatic, no button needed
3. The card fetches product data from **Open Food Facts**
4. If the product contains a monitored allergen, a **red warning banner** appears
5. **Fill in the form** — set quantity, category, purchase date, expiry date
6. Tap **Save to Pantry** — product is saved and both cards update instantly

> On error, the card shows a **Retry** and **New Scan** button, and automatically resets to the placeholder after 5 seconds.

### Managing the pantry

- **Search** products by name, brand or category using the search bar
- **Sort** by name, expiry date, or date added using the sort buttons
- **Filter** by category using the chips at the top
- Use **+/−** buttons to adjust quantities inline
- Tap the **trash icon** to remove a product

### Expiry color coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | More than `expiry_warning_days` remaining |
| 🟠 Orange | Expiring within `expiry_warning_days` |
| 🔴 Red | Expired |

---

## 🔔 Expiry Notifications

### How it works

When a product with an expiry date is added or removed, the card writes a compact list to the configured `expiry_entity`. Format: `ProductName:days_remaining` (negative = already expired).

Example: `Milk:1,Yogurt:-2,Butter:5`

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
  trigger:
    - platform: time
      at: "08:00:00"
  condition:
    - condition: template
      value_template: >
        {{ states('input_text.pantry_expiring') not in ['ok', '', 'unknown', 'unavailable'] }}
  action:
    - action: notify.mobile_app_your_phone
      data:
        title: "🛒 Pantry - Expiry alert"
        message: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% for item in raw.split(',') %}
          {% set parts = item.split(':') %}
          {% set days = parts[1] | int %}
          • {{ parts[0] }}
          {%- if days < 0 %} — expired {{ days | abs }} days ago
          {%- elif days == 0 %} — expires TODAY
          {%- elif days == 1 %} — expires tomorrow
          {%- else %} — {{ days }} days left{% endif %}
          {% endfor %}
```

> 💡 Replace `notify.mobile_app_your_phone` with your notification service. Find yours in **Developer Tools → Services → search notify**.

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

## 💾 Data Storage

Pantry items are stored in the **browser's localStorage** under the key `ha-pantry-card-items`.

| | |
|---|---|
| ✅ | Persists across page reloads |
| ✅ | No extra HA configuration needed |
| ⚠️ | Per-browser/per-device — not synced across devices |
| ⚠️ | Clearing browser data will delete pantry items |

---

## 🛠️ Troubleshooting

### "Errore connessione Open Food Facts"

Open Food Facts is a community-run service and may occasionally be slow or unavailable. The card automatically resets after 5 seconds. Use **Riprova** to retry immediately.

### "Prodotto non trovato"

The scanned barcode is not in the Open Food Facts database. Try searching at [world.openfoodfacts.org](https://world.openfoodfacts.org). You can contribute the missing product to help the community.

### Camera does not open

- Home Assistant must be accessed via **HTTPS** — camera requires a secure context
- **iOS**: Settings → Safari → Camera → Allow
- **Android**: Chrome → Site settings → Camera → Allow

### Card not appearing after installation

- Clear browser cache
- Verify resource URL: `/local/pantry-card/pantry-card.js`
- Check file exists at `/config/www/pantry-card/pantry-card.js`

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
npm run build       # → pantry-card.js
npm run dev         # watch mode
```

### Project structure

```
src/
├── index.ts                       # Main LitElement card
├── editor.ts                      # Visual Lovelace editor
├── consts.ts                      # Constants
├── styles.ts                      # CSS
├── types/
│   └── pantry-types.ts            # TypeScript interfaces & enums
├── api/
│   └── open-food-facts-client.ts  # OFF API client
└── cards/
    ├── base-card.ts               # Abstract base (localStorage, allergens, expiry sync)
    ├── scan-result.ts             # Scanner + product display
    └── pantry-list.ts             # Pantry list with sort/filter
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Open Food Facts](https://world.openfoodfacts.org/) — free food product database
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — documentation inspiration
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — card architecture pattern
- [Lit](https://lit.dev/) — web components framework
- The Home Assistant community
