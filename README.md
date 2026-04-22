# Pantry Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/releases)
[![GitHub stars](https://img.shields.io/github/stars/andrea6687/pantry-card.svg)](https://github.com/andrea6687/pantry-card/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

> **[Italiano](#-documentazione-in-italiano) | [English](#-english-documentation)**

---

---

# Documentazione in Italiano

Gestore intelligente della dispensa per Home Assistant. Scansiona i codici a barre con la fotocamera del telefono, recupera automaticamente i dati dei prodotti da [Open Food Facts](https://world.openfoodfacts.org/), tieni traccia delle scadenze, gestisci le quantità e ricevi notifiche prima che il cibo scada. 
N.B. trattandosi di progetto gratuito e no-profit, Open Food Facts potrebbe non avere a disposizione tutti i prodotti presenti sul mercato. 

> **I dati sono salvati direttamente nel database di Home Assistant** e sono condivisi su tutti i dispositivi collegati alla stessa istanza HA — nessuna configurazione aggiuntiva richiesta.

---

## Funzionalità

- **Scanner codici a barre** — tocca la card per aprire la fotocamera direttamente (nativo su Chrome/Android, fallback ZXing per Safari/iOS)
- **Importazione batch** — scansiona più prodotti in una volta tramite fotocamera, foto dalla galleria o inserimento manuale del codice, poi importa tutto con un solo tocco
- **Import dalla galleria** — seleziona una o più foto dal dispositivo e i codici a barre vengono estratti automaticamente
- **Integrazione Open Food Facts** — recupera automaticamente nome, marca, allergeni, valori nutrizionali e ingredienti
- **Avvisi allergeni** — banner di avviso visivo quando un prodotto scansionato contiene allergeni configurati
- **Tracciamento scadenze** — imposta date di scadenza e acquisto, indicatori colorati (verde / arancio / rosso)
- **Modifica inline** — modifica categoria, data di acquisto e data di scadenza direttamente dalla lista dispensa con un solo tocco
- **Categorie** — organizza i prodotti con categorie predefinite (Latticini, Carne e pesce, Frutta e verdura, ecc.)
- **Gestione quantità** — controlli +/− direttamente nella vista dispensa
- **Ricerca, ordinamento e filtri** — cerca per nome/marca, filtra per categoria, ordina per nome/scadenza/data aggiunta
- **Pronto per automazioni HA** — sincronizza i prodotti in scadenza a un'entità `input_text` per notifiche push
- **Storage condiviso** — dati salvati nel database di HA tramite WebSocket API, visibili su ogni dispositivo
- **Rendering ottimizzato** — si aggiorna solo quando cambia l'entità barcode, non ad ogni aggiornamento di stato HA
- **Reset automatico su errore** — lo scanner torna al placeholder automaticamente dopo 5 secondi in caso di errore
- **Mobile first** — progettato per la app mobile di Home Assistant

---

## Requisiti

- Home Assistant 2023.9.0 o versione successiva
- HACS (per installazione semplice)
- App mobile Home Assistant (consigliata per la scansione)

---

## Installazione

### Con HACS (consigliato)

1. Apri HACS nella tua istanza Home Assistant
2. Vai su **Frontend**
3. Clicca il menu a tre punti → **Repository personalizzati**
4. Aggiungi `https://github.com/andrea6687/pantry-card` come categoria **Lovelace**
5. Cerca **Pantry Card** e clicca **Scarica**
6. Riavvia Home Assistant o svuota la cache del browser

### Manuale

1. Scarica `pantry-card.js` dall'[ultima release](https://github.com/andrea6687/pantry-card/releases/latest)
2. Copialo in `/config/www/pantry-card/pantry-card.js`
3. Vai su **Impostazioni → Dashboard → Risorse** e aggiungi:
   - URL: `/local/pantry-card/pantry-card.js`
   - Tipo: `Modulo JavaScript`
4. Riavvia Home Assistant

---

## Configurazione

### 1. Crea le entità helper

Aggiungi al tuo `configuration.yaml`:

```yaml
input_text:
  barcode_scanner:
    name: Barcode Scanner
    max: 50
  pantry_expiring:        # opzionale — necessario solo per le automazioni
    name: Pantry Expiring
    max: 255
```

Riavvia Home Assistant dopo aver salvato.

### 2. Aggiungi le card alla dashboard

Vai alla tua dashboard → **Modifica** → **Aggiungi card** → **Manuale** e incolla il YAML.

#### Card scanner

```yaml
type: custom:pantry-card
card_type: scanner
barcode_entity: input_text.barcode_scanner
title: Scansiona Prodotto
allergens:
  - gluten
  - milk
```

#### Card lista dispensa

```yaml
type: custom:pantry-card
card_type: pantry
barcode_entity: input_text.barcode_scanner
title: La Mia Dispensa
allergens:
  - gluten
  - milk
```

#### Layout combinato (consigliato)

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

---

## Opzioni di configurazione

| Opzione | Tipo | Obbligatorio | Default | Descrizione |
|---------|------|-------------|---------|-------------|
| `type` | string | SI | — | Deve essere `custom:pantry-card` |
| `card_type` | string | SI | — | `scanner` oppure `pantry` |
| `barcode_entity` | string | SI | — | Entità `input_text` dove vengono scritti i codici a barre |
| `title` | string | NO | — | Titolo della card visualizzato in cima |
| `allergens` | lista | NO | `[]` | Allergeni da monitorare — attiva il banner di avviso |
| `expiry_entity` | string | NO | — | Entità `input_text` che riceve la lista dei prodotti in scadenza (per automazioni) |
| `expiry_warning_days` | numero | NO | `7` | Giorni prima della scadenza per iniziare a mostrare gli avvisi |

### Nomi allergeni supportati

Usa i nomi in inglese come riconosciuti da Open Food Facts:

`gluten` `milk` `eggs` `peanuts` `nuts` `soy` `fish` `shellfish` `sesame` `celery` `mustard` `lupin` `molluscs` `sulphites`

---

## Come si usa

### Scansione di un singolo prodotto

1. **Tocca la card scanner** — la fotocamera si apre automaticamente
2. **Punta il codice a barre** — il rilevamento è automatico, non serve premere nessun pulsante
3. La card interroga **Open Food Facts** e mostra nome, marca, allergeni e valori nutrizionali
4. Se gli allergeni corrispondono alla tua lista configurata, appare un **banner rosso di avviso** in cima
5. Tocca **Aggiungi alla dispensa** per aprire il modulo di aggiunta:
   - Imposta la **quantità**
   - Scegli una **categoria**
   - Facoltativamente imposta la **data di acquisto** (precompilata con oggi) e la **data di scadenza**
6. Tocca **Salva in dispensa** — il prodotto viene salvato e entrambe le card si aggiornano istantaneamente
7. Lo scanner torna al placeholder, pronto per la scansione successiva

> **In caso di errore:** appaiono i pulsanti **Riprova** e **Nuova scansione**. La card si azzera automaticamente dopo **5 secondi**.

---

### Importazione batch

La modalità batch permette di aggiungere molti prodotti in una volta sola senza compilare i dettagli per ciascuno. I prodotti vengono importati con quantità 1 e senza date — puoi modificarli in seguito direttamente nella lista dispensa.

#### Come attivare

Tocca **Importazione batch** in fondo al placeholder della card scanner.

#### Tre modi per aggiungere prodotti alla coda

| Metodo | Come |
|--------|------|
| **Fotocamera** | Tocca **Camera** → scansiona un codice a barre → lo scanner si azzera automaticamente, pronto per il successivo |
| **Galleria** | Tocca **Galleria** → seleziona una o più foto dal dispositivo → i codici a barre vengono estratti automaticamente |
| **Manuale** | Digita un codice a barre nel campo testo e premi Invio o tocca **+** |

Ogni codice a barre viene cercato su Open Food Facts in background. La coda mostra il nome e la miniatura del prodotto man mano che arrivano i risultati.

#### Importazione

- I prodotti non trovati su Open Food Facts vengono mostrati in rosso ed esclusi dall'importazione
- Tocca **Importa N prodotti** per salvare tutti gli elementi validi nella dispensa in un'unica operazione
- La coda si svuota e la modalità batch si chiude automaticamente

---

### Gestire la dispensa

- **Cerca** per nome prodotto, marca o categoria
- **Ordina** per nome, data di scadenza o data di aggiunta
- **Filtra** per categoria usando i chip
- I pulsanti **+/−** aggiornano la quantità istantaneamente (rimuove il prodotto se la quantità scende a 0)
- L'**icona matita** apre un pannello di modifica inline per categoria, data di acquisto e data di scadenza
- L'**icona cestino** rimuove il prodotto

### Modifica di un prodotto

Tocca l'icona matita su qualsiasi elemento della dispensa per espandere il pannello di modifica inline. Puoi aggiornare:

- **Categoria**
- **Data di acquisto**
- **Data di scadenza**

Tocca **Salva** per confermare o **Annulla** per annullare le modifiche.

### Codici colore scadenze

| Indicatore | Significato |
|------------|-------------|
| Nessun bordo | Mancano più di `expiry_warning_days` giorni |
| Bordo sinistro arancio | Scade entro `expiry_warning_days` giorni |
| Bordo sinistro rosso | Già scaduto |

---

## Storage dei dati

I dati della dispensa sono salvati usando la **API WebSocket integrata di Home Assistant** (`frontend/set_user_data` / `frontend/get_user_data`).

| | |
|---|---|
| Condiviso su **tutti i dispositivi** della stessa istanza HA |
| Salvato nel **database HA** — persiste tra i riavvii |
| Incluso automaticamente nei **backup HA** |
| Nessuna integrazione o configurazione extra richiesta |
| **Migrazione automatica** dei dati esistenti dal vecchio formato localStorage |

> I dati sono salvati per account utente HA. Se nella casa si usano più account HA, ciascuno avrà la propria dispensa.

---

## Notifiche di scadenza

### Come funziona

Quando un prodotto con data di scadenza viene salvato o eliminato, la card scrive un riepilogo compatto dei prodotti in scadenza nell'entità `expiry_entity` configurata.

Formato: `NomeProdotto:giorni_rimanenti` — i valori negativi indicano prodotti già scaduti.

Esempio di valore in `input_text.pantry_expiring`: `Latte:1,Yogurt:-2,Burro:5`

### Sensore template

Aggiungi a `configuration.yaml`:

```yaml
template:
  - sensor:
      - name: "Dispensa - Prodotti in scadenza"
        unique_id: pantry_expiring_count
        state: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% if raw in ['ok', '', 'unknown', 'unavailable'] %}
            0
          {% else %}
            {{ raw.split(',') | count }}
          {% endif %}
```

### Automazione notifica giornaliera

Aggiungi a `automations.yaml`:

```yaml
- alias: "Dispensa - Avviso scadenza"
  triggers:
    - at: "08:00:00"
      trigger: time
  conditions:
    - condition: template
      value_template: >
        {{ states('input_text.pantry_expiring') not in ['ok', '', 'unknown', 'unavailable'] }}
  actions:
    - action: notify.mobile_app_il_tuo_telefono
      data:
        title: "Dispensa - Prodotti in scadenza"
        message: >
          {% set raw = states('input_text.pantry_expiring') %}
          {% for item in raw.split(',') %}
          {% set parts = item.split(':') %}
          {% set name = parts[0] %}
          {% set days = parts[1] | int %}
          • {{ name }}
          {%- if days < -1 %} → scaduto {{ days | abs }} giorni fa
          {%- elif days == -1 %} → scaduto ieri
          {%- elif days == 0 %} → scade OGGI
          {%- elif days == 1 %} → scade domani
          {%- else %} → tra {{ days }} giorni
          {%- endif %}
          {% endfor %}
```

> Sostituisci `notify.mobile_app_il_tuo_telefono` con il nome effettivo del tuo servizio. Trovalo in **Strumenti sviluppatore → Servizi → cerca "notify"**.

---

## Categorie prodotti

| Categoria | Descrizione |
|-----------|-------------|
| Latticini | Prodotti caseari |
| Carne e pesce | Carne e pesce |
| Frutta e verdura | Frutta e ortaggi |
| Pane e cereali | Pane e cereali |
| Dolci e snack | Dolci e snack |
| Bevande | Bevande |
| Condimenti | Condimenti e salse |
| Surgelati | Alimenti surgelati |
| Altro | Altro |

---

## Risoluzione problemi

### "Errore connessione Open Food Facts"

Open Food Facts è un servizio gestito dalla comunità che potrebbe occasionalmente essere lento o non disponibile.

- La card si azzera automaticamente dopo **5 secondi**
- Usa **Riprova** per ritentare subito lo stesso codice a barre
- Usa **Nuova scansione** per scartare e scansionare un prodotto diverso
- Se il problema persiste, il servizio potrebbe essere temporaneamente offline — riprova più tardi

### "Prodotto non trovato"

Il codice a barre scansionato non è nel database di Open Food Facts.

- Prova a cercare manualmente su [world.openfoodfacts.org](https://world.openfoodfacts.org)
- Puoi aggiungere il prodotto mancante su OFF per aiutare altri utenti

### L'import dalla galleria non rileva i codici a barre

- Usa foto nitide, ben illuminate e scattate vicino al codice a barre
- Evita immagini sfocate o ruotate
- Il rilevamento nativo (`BarcodeDetector`) funziona meglio su Android/Chrome; iOS/Safari usa ZXing come fallback

### La fotocamera non si apre

- Home Assistant **deve essere accessibile tramite HTTPS** — i browser richiedono un contesto sicuro per accedere alla fotocamera
- **iOS / Safari**: Impostazioni → Safari → Fotocamera → Consenti
- **Android / Chrome**: Impostazioni sito → Fotocamera → Consenti per il tuo dominio HA

### La card non appare dopo l'installazione

1. Svuota la cache del browser (aggiornamento forzato: `Ctrl+Shift+R`)
2. Verifica che la risorsa sia registrata: **Impostazioni → Dashboard → Risorse**
3. Controlla che il file esista in `/config/www/pantry-card/pantry-card.js`
4. Assicurati che l'URL della risorsa sia `/local/pantry-card/pantry-card.js` (tipo: modulo JavaScript)

### La dispensa è vuota dopo un aggiornamento

Dalla v0.2.0 i dati sono salvati nel database HA invece di localStorage. Se usavi una versione precedente, i dati vengono **migrati automaticamente** al primo caricamento — apri semplicemente la card dispensa una volta e i tuoi elementi esistenti verranno trasferiti.

---

## Sviluppo

### Prerequisiti

- Node.js 18+
- npm

### Setup e build

```bash
git clone https://github.com/andrea6687/pantry-card.git
cd pantry-card
npm install
npm run build       # build di produzione → pantry-card.js
npm run dev         # modalità watch
```

### Struttura del progetto

```
src/
├── index.ts                       # LitElement principale, shouldUpdate, setter hass
├── editor.ts                      # Editor visuale Lovelace
├── consts.ts                      # Costanti: nome card, chiave storage
├── styles.ts                      # CSS completo (scanner, batch, lista dispensa, pannello edit)
├── types/
│   └── pantry-types.ts            # Interfacce TypeScript, enum (PantryItem, config...)
├── api/
│   └── open-food-facts-client.ts  # API OFF v2 con timeout e identificazione app
└── cards/
    ├── base-card.ts               # Base astratta: storage HA, controllo allergeni, sync scadenze
    ├── scan-result.ts             # Scanner, batch import (camera/galleria/manuale), modulo aggiunta
    └── pantry-list.ts             # Lista dispensa: ricerca, sort, filtro, controlli quantità, edit inline
```

### Architettura storage

I dati sono salvati usando i comandi WebSocket integrati di HA:

```
frontend/set_user_data  →  salva gli elementi della dispensa nel database HA
frontend/get_user_data  →  carica gli elementi della dispensa dal database HA
```

Una cache a livello modulo (`_itemsCache`) garantisce risposte UI istantanee senza attendere la chiamata WebSocket asincrona ad ogni render.

---

## Contribuire

I contributi sono benvenuti! Apri prima una issue per discutere cosa vorresti modificare.

1. Fai il fork del repository
2. Crea il tuo branch: `git checkout -b feature/mia-funzionalita`
3. Committa le modifiche: `git commit -m 'feat: aggiungi mia funzionalità'`
4. Pusha il branch: `git push origin feature/mia-funzionalita`
5. Apri una Pull Request

---

## Licenza

MIT License — vedi [LICENSE](LICENSE) per i dettagli.

---

## Ringraziamenti

- [Open Food Facts](https://world.openfoodfacts.org/) — database aperto e gratuito di prodotti alimentari
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — ispirazione per la documentazione
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — pattern architettura card
- [Lit](https://lit.dev/) — framework per web components
- La community di Home Assistant

---

---

# English Documentation

A smart pantry manager for Home Assistant. Scan barcodes with your phone camera, fetch product data automatically from [Open Food Facts](https://world.openfoodfacts.org/), track expiry dates, manage quantities, and get notified before food expires.
Please note: as this is a free, non-profit project, Open Food Facts may not have all products available on the market.

> **Data is stored in Home Assistant's own database** and shared across all devices connected to the same HA instance — no extra setup required.

---

## Features

- **Barcode scanner** — tap the card to open the camera directly (Chrome/Android native, Safari/iOS via ZXing fallback)
- **Batch import** — scan multiple products at once via camera, gallery photos, or manual barcode entry, then import them all in one tap
- **Gallery import** — pick one or more photos from your device gallery and extract barcodes automatically
- **Open Food Facts integration** — automatically fetches product name, brand, allergens, nutritional values and ingredients
- **Allergen alerts** — visual warning banner when a scanned product contains allergens you configured
- **Expiry tracking** — set expiry and purchase dates, color-coded warnings (green / orange / red)
- **Inline editing** — edit category, purchase date and expiry date directly from the pantry list with a single tap
- **Categories** — organize products with predefined categories (Dairy, Meat & Fish, Fruit & Veg, etc.)
- **Quantity management** — inline +/− controls directly in the pantry view
- **Search, sort & filter** — search by name/brand, filter by category, sort by name/expiry/date added
- **HA automation ready** — syncs expiring products to an `input_text` entity for push notifications
- **Shared storage** — data saved in HA's database via WebSocket API, visible on every device
- **Optimized rendering** — only re-renders when the barcode entity changes, not on every HA state update
- **Auto-reset on error** — scanner returns to placeholder automatically after 5 seconds on any error
- **Mobile first** — designed for the Home Assistant mobile app

---

## Requirements

- Home Assistant 2023.9.0 or newer
- HACS (for easy installation)
- Home Assistant mobile app (recommended for barcode scanning)

---

## Installation

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

## Setup

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

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | YES | — | Must be `custom:pantry-card` |
| `card_type` | string | YES | — | `scanner` or `pantry` |
| `barcode_entity` | string | YES | — | `input_text` entity where barcodes are written |
| `title` | string | NO | — | Card title displayed at the top |
| `allergens` | list | NO | `[]` | Allergens to monitor — triggers warning banner |
| `expiry_entity` | string | NO | — | `input_text` entity to receive expiring products list (for automations) |
| `expiry_warning_days` | number | NO | `7` | Days before expiry to start showing warnings |

### Supported allergen names

Use English names as recognized by Open Food Facts:

`gluten` `milk` `eggs` `peanuts` `nuts` `soy` `fish` `shellfish` `sesame` `celery` `mustard` `lupin` `molluscs` `sulphites`

---

## How to Use

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

### Batch Import

Batch mode lets you add many products at once without filling in details for each one. Products are imported with quantity 1 and no dates — you can edit them later directly in the pantry list.

#### How to activate

Tap **Importazione batch** at the bottom of the scanner card placeholder.

#### Three ways to add products to the queue

| Method | How |
|--------|-----|
| **Camera** | Tap **Camera** → scan a barcode → scanner resets automatically, ready for the next one |
| **Gallery** | Tap **Galleria** → select one or more photos from your device → barcodes are extracted automatically |
| **Manual** | Type a barcode in the text field and press Enter or tap **+** |

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
- **+/−** buttons update quantity instantly (removes the item when quantity reaches 0)
- **Pencil icon** opens an inline edit panel for category, purchase date and expiry date
- **Trash icon** removes the product

### Editing a product

Tap the pencil icon on any pantry item to expand the inline edit panel. You can update:

- **Category**
- **Purchase date**
- **Expiry date**

Tap **Salva** to confirm or **Annulla** to discard changes.

### Expiry color coding

| Indicator | Meaning |
|-----------|---------|
| No border | More than `expiry_warning_days` remaining |
| Orange left border | Expiring within `expiry_warning_days` |
| Red left border | Already expired |

---

## Data Storage

Pantry data is stored using **Home Assistant's built-in WebSocket storage API** (`frontend/set_user_data` / `frontend/get_user_data`).

| | |
|---|---|
| Shared across **all devices** on the same HA instance |
| Stored in the **HA database** — persists across restarts |
| Included in **HA backups** automatically |
| No extra integration or configuration required |
| **Auto-migrates** existing data from the old localStorage format |

> Data is stored per HA user account. If your household uses multiple HA accounts, each will have their own pantry.

---

## Expiry Notifications

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
          {%- elif days == 0 %} → expires TODAY
          {%- elif days == 1 %} → expires tomorrow
          {%- else %} → {{ days }} days left
          {%- endif %}
          {% endfor %}
```

> Replace `notify.mobile_app_your_phone` with your actual service name. Find it in **Developer Tools → Services → search "notify"**.

---

## Product Categories

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

## Troubleshooting

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

## Development

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

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [Open Food Facts](https://world.openfoodfacts.org/) — free, open food product database
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — documentation inspiration
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — card architecture pattern
- [Lit](https://lit.dev/) — web components framework
- The Home Assistant community
