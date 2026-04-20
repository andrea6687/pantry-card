import { html, HTMLTemplateResult } from 'lit';
import { until } from 'lit-html/directives/until.js';
import { BaseCard } from './base-card';
import OpenFoodFactsClient from '../api/open-food-facts-client';
import { PantryItem } from '../types/pantry-types';

export default class ScanResult extends BaseCard {
    private _client = new OpenFoodFactsClient();
    private _lastBarcode = '';
    private _currentItem: PantryItem | null = null;
    private _error = '';
    private _fetching = false;

    cardSize(): number { return 7; }

    render(): HTMLTemplateResult {
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

    private _renderPlaceholder(): HTMLTemplateResult {
        return html`
            <div class="scan-placeholder">
                <ha-icon icon="mdi:barcode-scan"></ha-icon>
                <p>Scansiona un codice a barre</p>
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
                    <mwc-button raised @click=${() => this._addToPantry(item)}>
                        <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Aggiungi alla dispensa
                    </mwc-button>
                </div>
            </div>
        `;
    }

    private _renderNutrients(item: PantryItem): HTMLTemplateResult {
        const n = item.nutrients;
        if (!n) return html``;
        const rows = [
            { label: 'Energia', value: n.energy_kcal, unit: 'kcal' },
            { label: 'Grassi', value: n.fat, unit: 'g' },
            { label: '- di cui saturi', value: n.saturated_fat, unit: 'g' },
            { label: 'Carboidrati', value: n.carbohydrates, unit: 'g' },
            { label: '- di cui zuccheri', value: n.sugars, unit: 'g' },
            { label: 'Fibre', value: n.fiber, unit: 'g' },
            { label: 'Proteine', value: n.proteins, unit: 'g' },
            { label: 'Sale', value: n.salt, unit: 'g' },
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
                                <td>${typeof r.value === 'number' ? r.value.toFixed(r.unit === 'kcal' ? 0 : 1) : r.value} ${r.unit}</td>
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
