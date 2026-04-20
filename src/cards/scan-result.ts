import { html, HTMLTemplateResult } from 'lit';
import { until } from 'lit-html/directives/until.js';
import { BaseCard } from './base-card';
import OpenFoodFactsClient from '../api/open-food-facts-client';
import { PantryItem } from '../types/pantry-types';

/* BarcodeDetector non è ancora nelle lib TS standard */
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

    private _scanning = false;
    private _stream: MediaStream | null = null;
    private _rafId: number | null = null;
    private _detector: BarcodeDetector | null = null;

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
            this._fetching = true;
            return html`${until(this._fetchProduct(barcode), this._renderLoading())}`;
        }

        if (this._fetching) return this._renderLoading();
        if (this._error) return html`<div class="scan-error"><ha-icon icon="mdi:alert-circle"></ha-icon> ${this._error}</div>`;
        if (this._currentItem) return this._renderProduct(this._currentItem);
        return this._renderPlaceholder();
    }

    /* ── Scanner fotocamera ── */

    private _renderScanner(): HTMLTemplateResult {
        return html`
            <div class="scanner-wrap">
                <video id="pantry-video" autoplay playsinline muted class="scanner-video"></video>
                <div class="scanner-frame">
                    <div class="corner tl"></div>
                    <div class="corner tr"></div>
                    <div class="corner bl"></div>
                    <div class="corner br"></div>
                </div>
                <p class="scanner-hint">Inquadra il codice a barre</p>
                <mwc-button @click=${() => this._closeScanner()}>
                    <ha-icon icon="mdi:close"></ha-icon>&nbsp;Annulla
                </mwc-button>
            </div>
        `;
    }

    private async _openScanner(): Promise<void> {
        if (!('BarcodeDetector' in window)) {
            this._error = 'BarcodeDetector non supportato da questo browser';
            this.parent.requestUpdate();
            return;
        }

        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 } },
            });
            this._detector = new BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e'],
            });
            this._scanning = true;
            this.parent.requestUpdate();
            /* Aspetta render, poi aggancia stream al video */
            setTimeout(() => this._attachAndScan(), 100);
        } catch {
            this._error = 'Accesso fotocamera negato';
            this.parent.requestUpdate();
        }
    }

    private _attachAndScan(): void {
        const video = this.parent.shadowRoot?.querySelector<HTMLVideoElement>('#pantry-video');
        if (!video || !this._stream) return;
        video.srcObject = this._stream;
        video.play();
        this._scanLoop(video);
    }

    private _scanLoop(video: HTMLVideoElement): void {
        if (!this._scanning || !this._detector) return;

        this._rafId = requestAnimationFrame(async () => {
            if (!this._scanning) return;
            try {
                const results = await this._detector.detect(video);
                if (results.length > 0) {
                    await this._onDetected(results[0].rawValue);
                    return;
                }
            } catch { /* frame non pronto */ }
            this._scanLoop(video);
        });
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
        this._stream?.getTracks().forEach(t => t.stop());
        this._stream = null;
        this._scanning = false;
        this.parent.requestUpdate();
    }

    /* ── Fetch OFF ── */

    private async _fetchProduct(barcode: string): Promise<HTMLTemplateResult> {
        try {
            const item = await this._client.getProduct(barcode);
            this._fetching = false;
            if (!item) {
                this._error = `Prodotto "${barcode}" non trovato`;
                this.parent.requestUpdate();
                return html`<div class="scan-error"><ha-icon icon="mdi:help-circle"></ha-icon> ${this._error}</div>`;
            }
            this._currentItem = item;
            this.parent.requestUpdate();
            return this._renderProduct(item);
        } catch {
            this._fetching = false;
            this._error = 'Errore connessione Open Food Facts';
            this.parent.requestUpdate();
            return html`<div class="scan-error"><ha-icon icon="mdi:wifi-off"></ha-icon> ${this._error}</div>`;
        }
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
                        <ha-icon icon="mdi:alert"></ha-icon>
                        ATTENZIONE: Contiene allergeni!
                    </div>
                ` : ''}

                <div class="product-header">
                    ${item.image_url
                        ? html`<img src="${item.image_url}" alt="${item.name}" class="product-image">`
                        : html`<ha-icon icon="mdi:food-variant" class="product-icon"></ha-icon>`
                    }
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
                            </span>
                        `)}
                    </div>
                ` : ''}

                ${this._renderNutrients(item)}

                ${item.ingredients ? html`
                    <div class="ingredients">
                        <strong>Ingredienti:</strong>
                        <p>${item.ingredients}</p>
                    </div>
                ` : ''}

                <div class="actions">
                    <mwc-button outlined @click=${() => this._openScanner()}>
                        <ha-icon icon="mdi:barcode-scan"></ha-icon>&nbsp;Nuova scansione
                    </mwc-button>
                    <mwc-button raised @click=${() => this._addToPantry(item)}>
                        <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Aggiungi
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
                <table>
                    <tbody>
                        ${rows.map(r => html`
                            <tr>
                                <td>${r.label}</td>
                                <td>${(r.value as number).toFixed(r.decimals)} ${r.unit}</td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `;
    }

    private _addToPantry(item: PantryItem): void {
        this.addItem(item);
        this.parent.dispatchEvent(new CustomEvent('pantry-item-added', {
            detail: { item },
            bubbles: true,
            composed: true,
        }));
        this.parent.requestUpdate();
    }
}
