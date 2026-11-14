# Pantry Card

🇬🇧 [English version](README.md)

**Scansioni un codice a barre e tieni la dispensa, con le scadenze, dentro Home Assistant.**

Una card Lovelace. Punti la fotocamera del telefono su un prodotto, la card legge il codice a barre, chiede a [Open Food Facts](https://world.openfoodfacts.org/) nome, marca, foto, allergeni, ingredienti e valori nutrizionali, e salva il prodotto in dispensa. Le card sono due: una scansiona, l'altra elenca quello che hai salvato. Pulsanti e messaggi sono in italiano.

Open Food Facts è un database gratuito e di comunità, quindi un prodotto che compri può non esserci ancora.

La dispensa sta sull'istanza di Home Assistant, per l'utente che ha fatto l'accesso. Non resta nel browser. Un altro utente di Home Assistant nella stessa casa ha una dispensa separata.

## Installazione rapida

### Con HACS

[`hacs.json`](hacs.json) è nella radice del repository e indica `pantry-card.js` come file da installare.

1. Apri HACS in Home Assistant e vai su **Frontend**.
2. Apri il menu con i tre puntini e scegli **Repository personalizzati**.
3. Aggiungi `https://github.com/andrea6687/pantry-card` con categoria **Lovelace**.
4. Cerca **Pantry Card** e scaricala.
5. Riavvia Home Assistant, oppure svuota la cache del browser.

### Manuale

1. Copia [`pantry-card.js`](pantry-card.js) da questo repository. Lo stesso file è allegato anche all'[ultima release](https://github.com/andrea6687/pantry-card/releases/latest).
2. Mettilo in `/config/www/pantry-card/pantry-card.js`.
3. Vai su **Impostazioni → Dashboard → Risorse** e aggiungi:
   - URL: `/local/pantry-card/pantry-card.js`
   - Tipo: modulo JavaScript
4. Riavvia Home Assistant.

## Configurazione

Serve un `input_text` per il codice a barre. Un secondo `input_text` è facoltativo: la card ci scrive un riepilogo delle scadenze, che puoi usare nelle automazioni.

### 1. Entità helper

Aggiungi questo a `configuration.yaml` e riavvia Home Assistant:

```yaml
input_text:
  barcode_scanner:
    name: Barcode Scanner
    max: 50
  pantry_expiring:        # facoltativo — solo per il riepilogo scadenze
    name: Pantry Expiring
    max: 255
```

La card non scrive mai più di 250 caratteri in `pantry_expiring`, quindi `max: 255` basta.

### 2. Aggiungi le card

Nella dashboard scegli **Modifica → Aggiungi card**. L'editor visuale (tipo di card, titolo, entità del barcode, entità scadenze, giorni di avviso, allergeni) è in italiano. In alternativa incolla lo YAML.

Entrambe le card richiedono `barcode_entity`. `card_type` è `scanner` oppure `pantry`.

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

Lista dispensa:

```yaml
type: custom:pantry-card
card_type: pantry
barcode_entity: input_text.barcode_scanner
title: La Mia Dispensa
allergens:
  - gluten
  - milk
```

Le due insieme, con il riepilogo scadenze:

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

Usa lo stesso `barcode_entity` su entrambe. Nella stessa pagina della dashboard, salvare un prodotto aggiorna subito la lista.

## Opzioni

| Opzione | Obbligatoria | Default | A cosa serve |
|---------|--------------|---------|--------------|
| `type` | sì | — | `custom:pantry-card` |
| `card_type` | sì | — | `scanner` oppure `pantry` |
| `barcode_entity` | sì | — | `input_text` in cui lo scanner scrive il codice |
| `title` | no | nessuno | Titolo in cima alla card |
| `allergens` | no | nessuno | Nomi in inglese da segnalare |
| `expiry_entity` | no | nessuno | `input_text` che riceve il riepilogo scadenze |
| `expiry_warning_days` | no | `7` | Entro quanti giorni un prodotto entra in quel riepilogo |

I nomi degli allergeni si confrontano come testo. I tag di Open Food Facts come `en:milk` vengono salvati come `milk`, e la card avvisa quando un tag contiene il nome che hai scritto, senza distinguere maiuscole e minuscole. Vale qualsiasi nome inglese usato da Open Food Facts. Esempi: `gluten`, `milk`, `eggs`, `peanuts`, `nuts`, `soy`, `fish`, `shellfish`, `sesame`, `celery`, `mustard`, `lupin`, `molluscs`, `sulphites`.

## Come si usa

### Un prodotto

1. Tocca il riquadro dello scanner (**Tocca per scansionare**). Si apre la fotocamera, con la scritta **Inquadra il codice a barre**. **Annulla** la chiude.
2. Il rilevamento è automatico. Il codice viene scritto in `barcode_entity` con il servizio `input_text.set_value`, poi la card interroga Open Food Facts. La richiesta si interrompe dopo 10 secondi.
3. Se il prodotto c'è, vedi nome, marca, codice, foto, allergeni, ingredienti e, quando Open Food Facts li ha, i valori nutrizionali per 100 g. Se un allergene coincide con la tua lista, un banner rosso dice **ATTENZIONE: Contiene allergeni!**
4. **Aggiungi alla dispensa** apre il modulo. La quantità parte da 1. La categoria è facoltativa. La data di acquisto parte da oggi. La data di scadenza resta vuota finché non la imposti.
5. **Salva in dispensa** memorizza il prodotto, svuota `barcode_entity` e la card lista sulla stessa pagina si aggiorna.

Un codice che non è ancora in dispensa viene salvato con la quantità che hai scelto. Un codice già presente aumenta solo di 1 la quantità esistente. Date e categoria della riga vecchia restano quelle di prima.

Se Open Food Facts non risponde, la card mostra l'errore, **Riprova**, **Nuova scansione** e **reset in 5s**. Dopo 5 secondi cancella il codice e torna al riquadro iniziale. I messaggi sono:

- `Prodotto "…" non trovato in Open Food Facts`
- `Open Food Facts non risponde (timeout)`
- `Nessuna connessione internet`
- `Errore Open Food Facts (…)`

**Riprova** richiede di nuovo lo stesso codice. **Nuova scansione** lo cancella subito.

Se Open Food Facts restituisce un prodotto senza nome, il nome mostrato è **Prodotto sconosciuto**.

### Importazione batch

**Importazione batch**, sotto il riquadro iniziale, mette in coda molti codici e li salva in un colpo solo. Ogni prodotto salvato ha quantità 1, nessuna categoria e nessuna data. Quelle le imposti dopo, dalla lista.

- **Camera** legge un codice e si chiude. Tocca di nuovo **Camera** per il successivo.
- **Galleria** accetta una o più foto. Le foto senza un codice leggibile vengono contate: `N immagine/i senza barcode rilevabile`.
- Scrivi un codice e premi Invio, oppure tocca **+**. Un codice già in coda viene saltato.
- Ogni riga mostra **Ricerca...** mentre Open Food Facts risponde, poi nome e foto, oppure **Non trovato** / **Errore OFF**.
- **Importa N prodotti** salva solo le righe trovate e chiude la modalità batch. Un codice già in dispensa aumenta la quantità di 1.

### La lista

Una dispensa vuota dice **Dispensa vuota. Scansiona un prodotto!**

- **Cerca...** confronta nome, marca o categoria.
- **Nome**, **Scadenza** e **Aggiunto** ordinano la lista. **Nome** è il default (ordine alfabetico italiano). **Aggiunto** mette prima i più recenti. I prodotti senza data di scadenza vanno in fondo quando ordini per **Scadenza**.
- I chip delle categorie escono dai prodotti che hai davvero, più **Tutti**.
- **+** e **−** cambiano la quantità. Da 1, **−** toglie il prodotto. Anche l'icona del cestino lo toglie.
- La matita apre categoria, data di acquisto e data di scadenza. **Salva** conferma, **Annulla** lascia tutto com'era.

Categorie che puoi scegliere, nel modulo di aggiunta e nella modifica, con questi nomi esatti: Latticini, Carne e pesce, Frutta e verdura, Pane e cereali, Dolci e snack, Bevande, Condimenti, Surgelati, Altro.

### Colori delle scadenze nella lista

La barra colorata non usa `expiry_warning_days`. Quell'opzione decide solo cosa viene scritto in `expiry_entity`. Nella lista le soglie sono fisse:

| Cosa vedi | Significato |
|-----------|-------------|
| Nessuna barra colorata | Nessuna data di scadenza, oppure mancano più di 3 giorni |
| Barra arancione | 3 giorni o meno. Il banner li conta come **in scadenza nei prossimi 3 giorni** |
| Barra rossa | Già scaduto. Il banner li conta come **prodotto/i scaduto/i** |

Accanto alla data: **Scade oggi!**, **Scade domani**, **Scade in Ng** fino a 7 giorni, **Scaduto Ng fa** se la data è passata, e la data salvata oltre i 7 giorni. Le date di acquisto sono mostrate come `gg/mm/aaaa`.

Cambiare la quantità con **+** / **−** non aggiorna `expiry_entity`, neanche quando **−** toglie l'ultimo pezzo. Salvare, modificare, l'icona del cestino e l'importazione batch sì.

## Notifiche di scadenza

Quando il riepilogo viene aggiornato, ogni prodotto con una data di scadenza i cui giorni rimanenti sono minori o uguali a `expiry_warning_days` (7 se non lo imposti) diventa `Nome:giorni`. Il nome è tagliato a 20 caratteri. Prima quelli più urgenti, uniti da virgole, tagliati a 250 caratteri. Un numero negativo vuol dire già scaduto. Se non c'è niente in quella finestra, l'entità viene impostata a `ok`.

Esempio: `Latte:1,Yogurt:-2,Burro:5`

Una virgola o un due punti nel nome del prodotto rompono un template che divide su quei caratteri.

Questo sensore conta le voci. Aggiungilo a `configuration.yaml`:

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

Questa automazione avvisa ogni mattina. Aggiungila a `automations.yaml` e sostituisci `notify.mobile_app_il_tuo_telefono` con il tuo servizio di notifica (**Strumenti per sviluppatori → Azioni**, cerca `notify`):

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
          {%- elif days == 0 %} → scade oggi
          {%- elif days == 1 %} → scade domani
          {%- else %} → tra {{ days }} giorni
          {%- endif %}
          {% endfor %}
```

## Dove stanno i dati

La card carica e salva con i comandi WebSocket di Home Assistant `frontend/get_user_data` e `frontend/set_user_data`, con la chiave `pantry_items`.

- Segue l'utente che ha fatto l'accesso. Lo stesso utente vede la stessa dispensa su un altro dispositivo la prossima volta che quel dispositivo apre la card. Due dashboard aperte insieme su dispositivi diversi non si aggiornano a vicenda.
- Nella stessa pagina, le card si dicono di aggiornarsi con un evento `pantry-updated` nel browser.
- La prima volta che lo storage di Home Assistant è vuoto, gli elementi salvati da una versione precedente sotto la chiave del browser `ha-pantry-card-items` vengono copiati e quella chiave viene rimossa.
- Se lo storage di Home Assistant non si riesce a leggere, la card torna a quella stessa chiave del browser.
- Una cache nella pagina evita di aspettare il WebSocket a ogni ridisegno.

## Limiti noti

- L'interfaccia è in italiano.
- La fotocamera ha bisogno di una pagina sicura (HTTPS) e del permesso. Se il browser la rifiuta, lo scanner si chiude.
- Dove il browser ha `BarcodeDetector`, i formati sono EAN-13, EAN-8, Code 128, UPC-A e UPC-E. Altrimenti la card usa ZXing (`@zxing/browser`), anche quando legge una foto dalla galleria.
- Lo stato "in scadenza" della lista è di 3 giorni. `expiry_warning_days` riguarda solo il testo in `expiry_entity`.
- Salvare un codice già in dispensa aggiunge 1 alla quantità e tiene le date e la categoria vecchie.
- La card si ridisegna quando cambia `barcode_entity` e quando si aggiorna da sola, non a ogni cambio di stato di Home Assistant.
- In questo repository non ci sono test automatici.

## Sviluppo

```
npm install
npm run build     # scrive pantry-card.js nella radice del repository
npm run dev       # webpack in modalità watch
```

```
src/index.ts                         la card Lovelace, quando si ridisegna, l'aggancio all'editor
src/editor.ts                        editor visuale
src/consts.ts                        nome della card e vecchia chiave di storage nel browser
src/styles.ts                        CSS
src/types/pantry-types.ts            configurazione, prodotto, categorie, tipi di Open Food Facts
src/api/open-food-facts-client.ts    API v2 di Open Food Facts, timeout di 10 secondi
src/cards/base-card.ts               storage di Home Assistant, allergeni, riepilogo scadenze
src/cards/scan-result.ts             fotocamera, importazione batch, modulo di aggiunta
src/cards/pantry-list.ts             ricerca, ordine, filtro, quantità, modifica in riga
pantry-card.js                       file compilato servito da HACS
hacs.json                            HACS: file nella radice del repository
```

Per contribuire leggi [CONTRIBUTING.md](CONTRIBUTING.md).

## Ringraziamenti

- [Open Food Facts](https://world.openfoodfacts.org/) — il database dei prodotti
- [Lit](https://lit.dev/) — la libreria dei web component
- [Bubble Card](https://github.com/Clooos/Bubble-Card) — la documentazione da cui questa card ha imparato
- [formulaone-card](https://github.com/marcokreeft87/formulaone-card) — la struttura di card che questo progetto ha seguito
- La comunità di Home Assistant

## Licenza

[MIT](LICENSE) © Andrea Sportello

---

Se Pantry Card ti ha evitato di scoprire uno yogurt scaduto in fondo al frigo, una ⭐ al repository aiuta altre persone a trovarlo. Problemi e idee sono benvenuti nelle [issue](https://github.com/andrea6687/pantry-card/issues).
