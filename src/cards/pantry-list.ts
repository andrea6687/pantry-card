import { html, HTMLTemplateResult } from 'lit';
import { BaseCard } from './base-card';
import { PantryItem } from '../types/pantry-types';

export default class PantryList extends BaseCard {
    cardSize(): number { return 8; }

    render(): HTMLTemplateResult {
        const items = this.getPantryItems();

        if (!items.length) {
            return html`
                <div class="empty-pantry">
                    <ha-icon icon="mdi:fridge-outline"></ha-icon>
                    <p>Dispensa vuota. Scansiona un prodotto!</p>
                </div>
            `;
        }

        const warnings = items.filter(i => this.hasAllergenWarning(i));

        return html`
            ${warnings.length ? html`
                <div class="pantry-warning-summary">
                    <ha-icon icon="mdi:alert"></ha-icon>
                    ${warnings.length} prodotto${warnings.length > 1 ? 'i' : ''} con allergeni:
                    ${warnings.map(w => w.name).join(', ')}
                </div>
            ` : ''}
            <div class="pantry-list">
                ${items.map(item => this._renderItem(item))}
            </div>
        `;
    }

    private _renderItem(item: PantryItem): HTMLTemplateResult {
        const warning = this.hasAllergenWarning(item);
        return html`
            <div class="pantry-item ${warning ? 'has-warning' : ''}">
                ${item.image_url
                    ? html`<img src="${item.image_url}" class="item-thumb">`
                    : html`<ha-icon icon="mdi:food" class="item-thumb-icon"></ha-icon>`
                }
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    ${item.brand ? html`<span class="item-brand">${item.brand}</span>` : ''}
                    ${warning ? html`<span class="item-allergen-badge"><ha-icon icon="mdi:alert-circle"></ha-icon> allergeni</span>` : ''}
                </div>
                <div class="item-qty">
                    <mwc-icon-button @click=${() => this._decrease(item)}>
                        <ha-icon icon="mdi:minus"></ha-icon>
                    </mwc-icon-button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <mwc-icon-button @click=${() => this._increase(item)}>
                        <ha-icon icon="mdi:plus"></ha-icon>
                    </mwc-icon-button>
                </div>
                <mwc-icon-button @click=${() => this._remove(item.barcode)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                </mwc-icon-button>
            </div>
        `;
    }

    private _increase(item: PantryItem): void {
        const items = this.getPantryItems();
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) items[idx].quantity = (items[idx].quantity || 1) + 1;
        this.savePantryItems(items);
        this.parent.requestUpdate();
    }

    private _decrease(item: PantryItem): void {
        const items = this.getPantryItems();
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) {
            if ((items[idx].quantity || 1) <= 1) {
                items.splice(idx, 1);
            } else {
                items[idx].quantity = (items[idx].quantity || 1) - 1;
            }
        }
        this.savePantryItems(items);
        this.parent.requestUpdate();
    }

    private _remove(barcode: string): void {
        this.removeItem(barcode);
        this.parent.requestUpdate();
    }
}
