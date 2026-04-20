import { html, HTMLTemplateResult } from 'lit';
import { until } from 'lit-html/directives/until.js';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BaseCard } from './base-card';
import OpenFoodFactsClient from '../api/open-food-facts-client';
import { PantryCategory, PantryItem } from '../types/pantry-types';

declare class BarcodeDetector {
    constructor(options?: { formats: string[] });
    detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
    static getSupportedFormats(): Promise<string[]>;
}

export default class ScanResult extends BaseCard {
    private _client = new OpenFoodFactsClient();
    private _lastBarcode = '';
    private _currentItem: PantryItem | null = null;
    private _error = '';
    private _fetching = false;

    /* scanner state */
    private _scanning = false;
    private _stream: MediaStream | null = null;
    private _rafId: number | null = null;
    private _detector: BarcodeDetector | null = null;
    private _zxingReader: BrowserMultiFormatReader | null = null;
    private _zxingControls: { stop: () => void } | null = null;

    /* add-form state */
    private _showForm = false;
    private _formQty = 1;
    private _formPurchase = '';
    private _formExpiry = '';
    private _formCategory = '';
    private _savedFeedback = false;

    cardSize(): number { return 7; }

    render(): HTMLTemplateResult {
        if (this._scanning) return this._renderScanner();

        const state = this.hass?.states[this.config.barcode_entity];
        const barcode = state?.state;

        if (!barcode || barcode === 'unknown' || barcode === '' || barcode === 'unavailable') {
            return this._renderPlaceholder();
        }

        if (barcode !== this._lastBarcode && !this._fetching) {
            this._lastBarcode = barcode;
            this._currentItem = null;
            this._error = '';
            this._showForm = false;
            this._fetching = true;
            return html`${until(this._fetchProduct(barcode), this._renderLoading())}`;
        }

        if (this._fetching) return this._renderLoading();
        if (this._error) return this._renderError(this._error, 'mdi:alert-circle', barcode);
        if (this._currentItem) return this._renderProduct(this._currentItem);
        return this._renderPlaceholder();
    }

    /* ── Scanner ── */

    private _renderScanner(): HTMLTemplateResult {
        return html`
            <div class="scanner-wrap">
                <video id="pantry-video" autoplay playsinline muted class="scanner-video"></video>
                <div class="scanner-frame">
                    <div class="corner tl"></div><div class="corner tr"></div>
                    <div class="corner bl"></div><div class="corner br"></div>
                </div>
                <p class="scanner-hint">Inquadra il codice a barre</p>
                <mwc-button @click=${() => this._closeScanner()}>
                    <ha-icon icon="mdi:close"></ha-icon>&nbsp;Annulla
                </mwc-button>
            </div>
        `;
    }

    private async _openScanner(): Promise<void> {
        this._scanning = true;
        this.parent.requestUpdate();
        if ('BarcodeDetector' in window) {
            await this._openNative();
        } else {
            await this._openZXing();
        }
    }

    private async _openNative(): Promise<void> {
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 } },
            });
            this._detector = new BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e'],
            });
            setTimeout(() => {
                const video = this.parent.shadowRoot?.querySelector<HTMLVideoElement>('#pantry-video');
                if (!video || !this._stream) return;
                video.srcObject = this._stream;
                video.play();
                this._scanLoop(video);
            }, 100);
        } catch {
            this._scanning = false;
            this._error = 'Accesso fotocamera negato';
            this.parent.requestUpdate();
        }
    }

    private _scanLoop(video: HTMLVideoElement): void {
        if (!this._scanning || !this._detector) return;
        this._rafId = requestAnimationFrame(async () => {
            if (!this._scanning) return;
            try {
                const results = await this._detector.detect(video);
                if (results.length > 0) { await this._onDetected(results[0].rawValue); return; }
            } catch { /* frame non pronto */ }
            this._scanLoop(video);
        });
    }

    private async _openZXing(): Promise<void> {
        try {
            this._zxingReader = new BrowserMultiFormatReader();
            setTimeout(async () => {
                const video = this.parent.shadowRoot?.querySelector<HTMLVideoElement>('#pantry-video');
                if (!video) return;
                try {
                    this._zxingControls = await this._zxingReader.decodeFromConstraints(
                        { video: { facingMode: 'environment' } },
                        video,
                        (result, err) => { if (result) this._onDetected(result.getText()); void err; }
                    );
                } catch {
                    this._scanning = false;
                    this._error = 'Accesso fotocamera negato';
                    this.parent.requestUpdate();
                }
            }, 100);
        } catch {
            this._scanning = false;
            this._error = 'Scanner non disponibile';
            this.parent.requestUpdate();
        }
    }

    private async _onDetected(barcode: string): Promise<void> {
        this._closeScanner();
        try {
            await this.hass.callService('input_text', 'set_value', {
                entity_id: this.config.barcode_entity,
                value: barcode,
            });
        } catch {
            this._error = 'Impossibile aggiornare entity HA';
            this.parent.requestUpdate();
        }
    }

    private _closeScanner(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;
        this._stream?.getTracks().forEach(t => t.stop());
        this._stream = null;
        this._zxingControls?.stop();
        this._zxingControls = null;
        this._zxingReader = null;
        this._scanning = false;
        this.parent.requestUpdate();
    }

    /* ── Fetch OFF ── */

    private async _fetchProduct(barcode: string): Promise<HTMLTemplateResult> {
        try {
            const item = await this._client.getProduct(barcode);
            this._fetching = false;
            if (!item) {
                this._error = `Prodotto "${barcode}" non trovato in Open Food Facts`;
                this._scheduleErrorReset();
                this.parent.requestUpdate();
                return this._renderError(this._error, 'mdi:help-circle', barcode);
            }
            this._currentItem = item;
            this.parent.requestUpdate();
            return this._renderProduct(item);
        } catch (e) {
            this._fetching = false;
            const msg = (e as Error).message;
            this._error = msg === 'TIMEOUT'
                ? 'Open Food Facts non risponde (timeout)'
                : msg === 'NETWORK'
                ? 'Nessuna connessione internet'
                : `Errore Open Food Facts (${msg})`;
            this._scheduleErrorReset();
            this.parent.requestUpdate();
            return this._renderError(this._error, 'mdi:wifi-off', barcode);
        }
    }

    private _errorResetTimer: ReturnType<typeof setTimeout> | null = null;

    private _scheduleErrorReset(): void {
        if (this._errorResetTimer) clearTimeout(this._errorResetTimer);
        this._errorResetTimer = setTimeout(() => this._resetToPlaceholder(), 5000);
    }

    private _resetToPlaceholder(): void {
        this._error = '';
        this._lastBarcode = '';
        this._currentItem = null;
        this._fetching = false;
        this._errorResetTimer = null;
        this.hass?.callService('input_text', 'set_value', {
            entity_id: this.config.barcode_entity,
            value: '',
        }).catch(() => {});
        this.parent.requestUpdate();
    }

    private _renderError(msg: string, icon: string, barcode: string): HTMLTemplateResult {
        return html`
            <div class="scan-error">
                <ha-icon icon="${icon}"></ha-icon> ${msg}
                <span class="error-countdown"> — reset in 5s</span>
            </div>
            <div class="actions" style="margin-top:12px">
                <mwc-button outlined @click=${() => this._retry(barcode)}>
                    <ha-icon icon="mdi:refresh"></ha-icon>&nbsp;Riprova
                </mwc-button>
                <mwc-button outlined @click=${() => this._resetToPlaceholder()}>
                    <ha-icon icon="mdi:barcode-scan"></ha-icon>&nbsp;Nuova scansione
                </mwc-button>
            </div>
        `;
    }

    private _retry(barcode: string): void {
        if (this._errorResetTimer) clearTimeout(this._errorResetTimer);
        this._errorResetTimer = null;
        this._lastBarcode = '';
        this._error = '';
        this._fetching = false;
        this.parent.requestUpdate();
    }

    /* ── Templates ── */

    private _renderPlaceholder(): HTMLTemplateResult {
        return html`
            <div class="scan-placeholder" @click=${() => this._openScanner()}>
                <ha-icon icon="mdi:barcode-scan"></ha-icon>
                <p>Tocca per scansionare</p>
                <small>${this.config.barcode_entity}</small>
            </div>
        `;
    }

    private _renderLoading(): HTMLTemplateResult {
        return html`
            <div class="loading">
                <ha-circular-progress active indeterminate></ha-circular-progress>
                <p>Ricerca prodotto...</p>
            </div>
        `;
    }

    private _renderProduct(item: PantryItem): HTMLTemplateResult {
        const warning = this.hasAllergenWarning(item);
        return html`
            <div class="scan-result ${warning ? 'has-warning' : ''}">
                ${warning ? html`
                    <div class="allergen-warning">
                        <ha-icon icon="mdi:alert"></ha-icon> ATTENZIONE: Contiene allergeni!
                    </div>` : ''}

                <div class="product-header">
                    ${item.image_url
                        ? html`<img src="${item.image_url}" alt="${item.name}" class="product-image">`
                        : html`<ha-icon icon="mdi:food-variant" class="product-icon"></ha-icon>`}
                    <div class="product-info">
                        <h2>${item.name}</h2>
                        ${item.brand ? html`<p class="brand">${item.brand}</p>` : ''}
                        <p class="barcode"><ha-icon icon="mdi:barcode"></ha-icon> ${item.barcode}</p>
                    </div>
                </div>

                ${item.allergens?.length ? html`
                    <div class="allergens">
                        <strong>Allergeni:</strong>
                        ${item.allergens.map(a => html`
                            <span class="allergen-tag ${this.config.allergens?.some(ca => a.toLowerCase().includes(ca.toLowerCase())) ? 'match' : ''}">
                                ${a}
                            </span>`)}
                    </div>` : ''}

                ${this._renderNutrients(item)}

                ${item.ingredients ? html`
                    <div class="ingredients">
                        <strong>Ingredienti:</strong>
                        <p>${item.ingredients}</p>
                    </div>` : ''}

                ${this._showForm ? this._renderAddForm(item) : html`
                    <div class="actions">
                        <mwc-button outlined @click=${() => this._openScanner()}>
                            <ha-icon icon="mdi:barcode-scan"></ha-icon>&nbsp;Nuova scansione
                        </mwc-button>
                        <mwc-button raised @click=${() => this._openAddForm()}>
                            <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Aggiungi alla dispensa
                        </mwc-button>
                    </div>`}

                ${this._savedFeedback ? html`
                    <div class="saved-feedback">
                        <ha-icon icon="mdi:check-circle"></ha-icon> Salvato in dispensa!
                    </div>` : ''}
            </div>
        `;
    }

    private _renderAddForm(item: PantryItem): HTMLTemplateResult {
        return html`
            <div class="add-form">
                <h3><ha-icon icon="mdi:fridge-outline"></ha-icon> Aggiungi alla dispensa</h3>

                <div class="form-grid">
                    <div class="form-field">
                        <label>Quantità</label>
                        <div class="qty-control">
                            <mwc-icon-button @click=${() => { if (this._formQty > 1) { this._formQty--; this.parent.requestUpdate(); } }}>
                                <ha-icon icon="mdi:minus"></ha-icon>
                            </mwc-icon-button>
                            <span class="qty-value">${this._formQty}</span>
                            <mwc-icon-button @click=${() => { this._formQty++; this.parent.requestUpdate(); }}>
                                <ha-icon icon="mdi:plus"></ha-icon>
                            </mwc-icon-button>
                        </div>
                    </div>

                    <div class="form-field">
                        <label>Categoria</label>
                        <select class="form-select" @change=${(e: Event) => { this._formCategory = (e.target as HTMLSelectElement).value; }}>
                            <option value="">-- Nessuna --</option>
                            ${Object.values(PantryCategory).map(cat => html`
                                <option value="${cat}" ?selected=${this._formCategory === cat}>${cat}</option>`)}
                        </select>
                    </div>

                    <div class="form-field">
                        <label>Data acquisto (facoltativa)</label>
                        <input type="date" class="form-input"
                            .value=${this._formPurchase}
                            @change=${(e: Event) => { this._formPurchase = (e.target as HTMLInputElement).value; }}>
                    </div>

                    <div class="form-field">
                        <label>Data scadenza (facoltativa)</label>
                        <input type="date" class="form-input"
                            .value=${this._formExpiry}
                            @change=${(e: Event) => { this._formExpiry = (e.target as HTMLInputElement).value; }}>
                    </div>
                </div>

                <div class="form-actions">
                    <mwc-button @click=${() => this._cancelForm()}>Annulla</mwc-button>
                    <mwc-button raised @click=${() => this._saveItem(item)}>
                        <ha-icon icon="mdi:content-save"></ha-icon>&nbsp;Salva in dispensa
                    </mwc-button>
                </div>
            </div>
        `;
    }

    private _renderNutrients(item: PantryItem): HTMLTemplateResult {
        const n = item.nutrients;
        if (!n) return html``;
        const rows = [
            { label: 'Energia', value: n.energy_kcal, unit: 'kcal', decimals: 0 },
            { label: 'Grassi', value: n.fat, unit: 'g', decimals: 1 },
            { label: '- di cui saturi', value: n.saturated_fat, unit: 'g', decimals: 1 },
            { label: 'Carboidrati', value: n.carbohydrates, unit: 'g', decimals: 1 },
            { label: '- di cui zuccheri', value: n.sugars, unit: 'g', decimals: 1 },
            { label: 'Fibre', value: n.fiber, unit: 'g', decimals: 1 },
            { label: 'Proteine', value: n.proteins, unit: 'g', decimals: 1 },
            { label: 'Sale', value: n.salt, unit: 'g', decimals: 2 },
        ].filter(r => r.value !== undefined && r.value !== null);

        if (!rows.length) return html``;
        return html`
            <div class="nutrients">
                <strong>Valori nutrizionali (per 100g):</strong>
                <table><tbody>
                    ${rows.map(r => html`
                        <tr>
                            <td>${r.label}</td>
                            <td>${(r.value as number).toFixed(r.decimals)} ${r.unit}</td>
                        </tr>`)}
                </tbody></table>
            </div>
        `;
    }

    /* ── Form logic ── */

    private _openAddForm(): void {
        this._formQty = 1;
        this._formPurchase = new Date().toISOString().split('T')[0];
        this._formExpiry = '';
        this._formCategory = '';
        this._showForm = true;
        this._savedFeedback = false;
        this.parent.requestUpdate();
    }

    private _cancelForm(): void {
        this._showForm = false;
        this.parent.requestUpdate();
    }

    private _saveItem(item: PantryItem): void {
        const toSave: PantryItem = {
            ...item,
            quantity: this._formQty,
            purchase_date: this._formPurchase || undefined,
            expiry_date: this._formExpiry || undefined,
            category: this._formCategory || undefined,
        };
        this.addItem(toSave);
        this.syncExpiryToHA();

        /* reset scanner */
        this._showForm = false;
        this._currentItem = null;
        this._lastBarcode = '';
        this._error = '';

        /* svuota entity barcode → scanner torna al placeholder */
        this.hass.callService('input_text', 'set_value', {
            entity_id: this.config.barcode_entity,
            value: '',
        }).catch(() => {});

        /* notifica tutte le card sulla pagina (es. pantry list) */
        window.dispatchEvent(new CustomEvent('pantry-updated'));

        this.parent.requestUpdate();
    }
}
