import { html, HTMLTemplateResult } from 'lit';
import { until } from 'lit-html/directives/until.js';
import { BaseCard } from './base-card';
import { PantryCategory, PantryItem, PantrySort } from '../types/pantry-types';

export default class PantryList extends BaseCard {
    private _sort: PantrySort = PantrySort.Name;
    private _filterCategory = '';
    private _search = '';
    private _loaded = false;

    /* inline edit */
    private _editingBarcode: string | null = null;
    private _editExpiry = '';
    private _editPurchase = '';
    private _editCategory = '';

    cardSize(): number { return 10; }

    render(): HTMLTemplateResult {
        if (this.getPantryItems().length === 0 && !this._loaded) {
            return html`${until(
                this.loadPantryItems().then(() => { this._loaded = true; this.parent.requestUpdate(); }),
                html`<div class="loading"><ha-circular-progress active indeterminate></ha-circular-progress><p>Caricamento dispensa...</p></div>`
            )}`;
        }

        const allItems = this.getPantryItems();

        if (!allItems.length) {
            return html`
                <div class="empty-pantry">
                    <ha-icon icon="mdi:fridge-outline"></ha-icon>
                    <p>Dispensa vuota. Scansiona un prodotto!</p>
                </div>
            `;
        }

        const categories = [...new Set(allItems.map(i => i.category).filter(Boolean))] as string[];
        const items = this._applyFiltersAndSort(allItems);
        const expiring = allItems.filter(i => this._expiryStatus(i) !== 'ok');

        return html`
            ${expiring.length ? html`
                <div class="expiry-banner">
                    <ha-icon icon="mdi:alert-circle"></ha-icon>
                    ${expiring.filter(i => this._expiryStatus(i) === 'expired').length > 0
                        ? `${expiring.filter(i => this._expiryStatus(i) === 'expired').length} prodotto/i scaduto/i!`
                        : ''}
                    ${expiring.filter(i => this._expiryStatus(i) === 'soon').length > 0
                        ? `${expiring.filter(i => this._expiryStatus(i) === 'soon').length} in scadenza nei prossimi 3 giorni`
                        : ''}
                </div>` : ''}

            <div class="pantry-toolbar">
                <div class="search-wrap">
                    <ha-icon icon="mdi:magnify"></ha-icon>
                    <input type="text" placeholder="Cerca..." class="search-input"
                        .value=${this._search}
                        @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; this.parent.requestUpdate(); }}>
                </div>
                <div class="sort-btns">
                    <button class="sort-btn ${this._sort === PantrySort.Name ? 'active' : ''}"
                        @click=${() => this._setSort(PantrySort.Name)}>
                        <ha-icon icon="mdi:sort-alphabetical-ascending"></ha-icon> Nome
                    </button>
                    <button class="sort-btn ${this._sort === PantrySort.Expiry ? 'active' : ''}"
                        @click=${() => this._setSort(PantrySort.Expiry)}>
                        <ha-icon icon="mdi:calendar-clock"></ha-icon> Scadenza
                    </button>
                    <button class="sort-btn ${this._sort === PantrySort.Added ? 'active' : ''}"
                        @click=${() => this._setSort(PantrySort.Added)}>
                        <ha-icon icon="mdi:clock-outline"></ha-icon> Aggiunto
                    </button>
                </div>
            </div>

            ${categories.length ? html`
                <div class="category-filters">
                    <button class="cat-chip ${!this._filterCategory ? 'active' : ''}"
                        @click=${() => this._setCategory('')}>Tutti</button>
                    ${categories.map(cat => html`
                        <button class="cat-chip ${this._filterCategory === cat ? 'active' : ''}"
                            @click=${() => this._setCategory(cat)}>${cat}</button>`)}
                </div>` : ''}

            <div class="pantry-list">
                ${items.length
                    ? items.map(item => this._renderItem(item))
                    : html`<p class="no-results">Nessun prodotto trovato</p>`}
            </div>
        `;
    }

    private _renderItem(item: PantryItem): HTMLTemplateResult {
        const warning = this.hasAllergenWarning(item);
        const expStatus = this._expiryStatus(item);
        const isEditing = this._editingBarcode === item.barcode;

        return html`
            <div class="pantry-item expiry-${expStatus} ${warning ? 'has-warning' : ''}">

                <div class="item-top-row">
                    ${item.image_url
                        ? html`<img src="${item.image_url}" class="item-thumb">`
                        : html`<ha-icon icon="mdi:food" class="item-thumb-icon"></ha-icon>`}

                    <div class="item-header">
                        <div class="item-name-row">
                            <span class="item-name">${item.name}</span>
                            ${warning ? html`<ha-icon icon="mdi:alert-circle" class="warning-icon"></ha-icon>` : ''}
                        </div>
                        ${item.brand ? html`<span class="item-brand">${item.brand}</span>` : ''}
                        ${item.category ? html`<span class="cat-badge">${item.category}</span>` : ''}
                    </div>

                    <mwc-icon-button class="edit-btn" @click=${() => this._startEdit(item)}>
                        <ha-icon icon="mdi:pencil-outline"></ha-icon>
                    </mwc-icon-button>
                    <mwc-icon-button class="delete-btn" @click=${() => this._remove(item.barcode)}>
                        <ha-icon icon="mdi:delete-outline"></ha-icon>
                    </mwc-icon-button>
                </div>

                <div class="item-details-row">
                    <div class="item-detail">
                        <ha-icon icon="mdi:numeric"></ha-icon>
                        <span>Quantità</span>
                        <div class="inline-qty">
                            <button class="qty-btn" @click=${() => this._decrease(item)}>−</button>
                            <span class="qty-value">${item.quantity || 1}</span>
                            <button class="qty-btn" @click=${() => this._increase(item)}>+</button>
                        </div>
                    </div>

                    ${item.purchase_date ? html`
                        <div class="item-detail">
                            <ha-icon icon="mdi:cart-outline"></ha-icon>
                            <span>Acquisto</span>
                            <strong>${this._formatDate(item.purchase_date)}</strong>
                        </div>` : html`
                        <div class="item-detail muted">
                            <ha-icon icon="mdi:cart-outline"></ha-icon>
                            <span>Acquisto</span>
                            <strong>—</strong>
                        </div>`}

                    ${item.expiry_date ? html`
                        <div class="item-detail expiry-detail-${expStatus}">
                            <ha-icon icon="mdi:calendar-clock"></ha-icon>
                            <span>Scadenza</span>
                            <strong>${this._formatExpiry(item.expiry_date)}</strong>
                        </div>` : html`
                        <div class="item-detail muted">
                            <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
                            <span>Scadenza</span>
                            <strong>—</strong>
                        </div>`}
                </div>

                ${isEditing ? this._renderEditPanel(item) : ''}
            </div>
        `;
    }

    private _renderEditPanel(item: PantryItem): HTMLTemplateResult {
        return html`
            <div class="item-edit-panel">
                <div class="form-grid">
                    <div class="form-field">
                        <label>Categoria</label>
                        <select class="form-select"
                            @change=${(e: Event) => { this._editCategory = (e.target as HTMLSelectElement).value; }}>
                            <option value="" ?selected=${!this._editCategory}>-- Nessuna --</option>
                            ${Object.values(PantryCategory).map(cat => html`
                                <option value="${cat}" ?selected=${this._editCategory === cat}>${cat}</option>`)}
                        </select>
                    </div>
                    <div class="form-field">
                        <label>Data acquisto</label>
                        <input type="date" class="form-input"
                            .value=${this._editPurchase}
                            @change=${(e: Event) => { this._editPurchase = (e.target as HTMLInputElement).value; }}>
                    </div>
                    <div class="form-field">
                        <label>Data scadenza</label>
                        <input type="date" class="form-input"
                            .value=${this._editExpiry}
                            @change=${(e: Event) => { this._editExpiry = (e.target as HTMLInputElement).value; }}>
                    </div>
                </div>
                <div class="form-actions">
                    <mwc-button @click=${() => { this._editingBarcode = null; this.parent.requestUpdate(); }}>
                        Annulla
                    </mwc-button>
                    <mwc-button raised @click=${() => this._saveEdit(item)}>
                        <ha-icon icon="mdi:content-save"></ha-icon>&nbsp;Salva
                    </mwc-button>
                </div>
            </div>
        `;
    }

    /* ── Edit ── */

    private _startEdit(item: PantryItem): void {
        this._editingBarcode = item.barcode;
        this._editExpiry = item.expiry_date || '';
        this._editPurchase = item.purchase_date || '';
        this._editCategory = item.category || '';
        this.parent.requestUpdate();
    }

    private async _saveEdit(item: PantryItem): Promise<void> {
        const items = [...this.getPantryItems()];
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) {
            items[idx] = {
                ...items[idx],
                expiry_date: this._editExpiry || undefined,
                purchase_date: this._editPurchase || undefined,
                category: this._editCategory || undefined,
            };
        }
        await this.savePantryItems(items);
        this.syncExpiryToHA();
        this._editingBarcode = null;
        window.dispatchEvent(new CustomEvent('pantry-updated'));
        this.parent.requestUpdate();
    }

    /* ── Filters / sort ── */

    private _applyFiltersAndSort(items: PantryItem[]): PantryItem[] {
        let result = [...items];

        if (this._search) {
            const q = this._search.toLowerCase();
            result = result.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.brand?.toLowerCase().includes(q) ||
                i.category?.toLowerCase().includes(q)
            );
        }

        if (this._filterCategory) {
            result = result.filter(i => i.category === this._filterCategory);
        }

        switch (this._sort) {
            case PantrySort.Name:
                result.sort((a, b) => a.name.localeCompare(b.name, 'it'));
                break;
            case PantrySort.Expiry:
                result.sort((a, b) => {
                    if (!a.expiry_date && !b.expiry_date) return 0;
                    if (!a.expiry_date) return 1;
                    if (!b.expiry_date) return -1;
                    return a.expiry_date.localeCompare(b.expiry_date);
                });
                break;
            case PantrySort.Added:
                result.sort((a, b) => b.added_at.localeCompare(a.added_at));
                break;
        }

        return result;
    }

    private _setSort(sort: PantrySort): void {
        this._sort = sort;
        this.parent.requestUpdate();
    }

    private _setCategory(cat: string): void {
        this._filterCategory = cat;
        this.parent.requestUpdate();
    }

    /* ── Expiry ── */

    private _formatDate(dateStr: string): string {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    private _expiryStatus(item: PantryItem): 'ok' | 'soon' | 'expired' {
        if (!item.expiry_date) return 'ok';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(item.expiry_date);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
        if (diffDays < 0) return 'expired';
        if (diffDays <= 3) return 'soon';
        return 'ok';
    }

    private _formatExpiry(dateStr: string): string {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(dateStr);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
        if (diffDays < 0) return `Scaduto ${Math.abs(diffDays)}g fa`;
        if (diffDays === 0) return 'Scade oggi!';
        if (diffDays === 1) return 'Scade domani';
        if (diffDays <= 7) return `Scade in ${diffDays}g`;
        return dateStr;
    }

    /* ── CRUD ── */

    private async _increase(item: PantryItem): Promise<void> {
        const items = [...this.getPantryItems()];
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) items[idx].quantity = (items[idx].quantity || 1) + 1;
        await this.savePantryItems(items);
        this._notify();
    }

    private async _decrease(item: PantryItem): Promise<void> {
        const items = [...this.getPantryItems()];
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) {
            if ((items[idx].quantity || 1) <= 1) {
                items.splice(idx, 1);
            } else {
                items[idx].quantity = (items[idx].quantity || 1) - 1;
            }
        }
        await this.savePantryItems(items);
        this._notify();
    }

    private async _remove(barcode: string): Promise<void> {
        await this.removeItem(barcode);
        this.syncExpiryToHA();
        this._notify();
    }

    private _notify(): void {
        window.dispatchEvent(new CustomEvent('pantry-updated'));
    }
}
