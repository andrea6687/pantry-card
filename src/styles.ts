import { css } from 'lit';

export const styles = css`
    :host {
        --pantry-warning: #ff5722;
        --pantry-success: #4caf50;
        --pantry-warning-bg: rgba(255, 87, 34, 0.08);
    }

    ha-card { padding: 16px; overflow: hidden; }

    /* ── Placeholder / loading ── */
    .scan-placeholder, .empty-pantry {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 16px;
        color: var(--secondary-text-color);
        gap: 8px;
    }
    .scan-placeholder ha-icon,
    .empty-pantry ha-icon { --mdc-icon-size: 48px; }
    .scan-placeholder small { font-size: 0.75em; opacity: 0.7; }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        gap: 12px;
        color: var(--secondary-text-color);
    }

    /* ── Error ── */
    .scan-error {
        padding: 12px;
        color: var(--pantry-warning);
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 4px;
        background: var(--pantry-warning-bg);
    }

    /* ── Scan result ── */
    .scan-result { padding: 4px 0; }
    .scan-result.has-warning { border-left: 4px solid var(--pantry-warning); padding-left: 12px; }

    .allergen-warning {
        background: var(--pantry-warning);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        font-size: 0.95em;
    }

    .product-header {
        display: flex;
        gap: 14px;
        margin-bottom: 12px;
        align-items: flex-start;
    }

    .product-image {
        width: 80px;
        height: 80px;
        object-fit: contain;
        border-radius: 6px;
        flex-shrink: 0;
    }

    .product-icon { --mdc-icon-size: 64px; color: var(--secondary-text-color); flex-shrink: 0; }

    .product-info { flex: 1; }
    .product-info h2 { margin: 0 0 4px; font-size: 1.1em; line-height: 1.3; }
    .brand { color: var(--secondary-text-color); margin: 0 0 4px; font-size: 0.9em; }
    .barcode { color: var(--secondary-text-color); margin: 0; font-size: 0.8em; display: flex; align-items: center; gap: 4px; }
    .barcode ha-icon { --mdc-icon-size: 14px; }

    /* ── Allergens ── */
    .allergens {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        margin: 8px 0;
        font-size: 0.9em;
    }
    .allergen-tag {
        background: var(--secondary-background-color);
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.85em;
    }
    .allergen-tag.match {
        background: var(--pantry-warning);
        color: white;
        font-weight: bold;
    }

    /* ── Nutrients ── */
    .nutrients { margin: 10px 0; }
    .nutrients strong { font-size: 0.9em; }
    .nutrients table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .nutrients td { padding: 3px 8px; font-size: 0.88em; }
    .nutrients td:last-child { text-align: right; font-weight: 600; }
    .nutrients tr:nth-child(even) { background: var(--secondary-background-color); }

    /* ── Ingredients ── */
    .ingredients { margin: 8px 0; }
    .ingredients strong { font-size: 0.9em; }
    .ingredients p { margin: 4px 0; font-size: 0.85em; color: var(--secondary-text-color); line-height: 1.4; }

    /* ── Actions ── */
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }

    /* ── Camera scanner ── */
    .scanner-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
    }

    .scanner-video {
        width: 100%;
        max-height: 280px;
        border-radius: 8px;
        background: #000;
        object-fit: cover;
    }

    .scanner-frame {
        position: relative;
        width: 100%;
        max-width: 280px;
        height: 180px;
        margin-top: -260px;
        pointer-events: none;
    }

    .corner {
        position: absolute;
        width: 24px;
        height: 24px;
        border-color: var(--primary-color, #03a9f4);
        border-style: solid;
    }
    .corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
    .corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
    .corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
    .corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }

    .scanner-hint {
        margin: 60px 0 0;
        font-size: 0.9em;
        color: var(--secondary-text-color);
    }

    .scan-placeholder { cursor: pointer; }
    .scan-placeholder:hover ha-icon { color: var(--primary-color); }

    .actions { gap: 8px; }

    /* ── Add form ── */
    .add-form {
        margin-top: 16px;
        padding: 14px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color, #03a9f4);
    }
    .add-form h3 {
        margin: 0 0 12px;
        font-size: 1em;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
    }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .form-field label { font-size: 0.8em; color: var(--secondary-text-color); font-weight: 500; }
    .form-input, .form-select {
        padding: 7px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 0.9em;
    }
    .qty-control { display: flex; align-items: center; gap: 4px; }
    .qty-control .qty-value { min-width: 28px; text-align: center; font-weight: bold; font-size: 1.1em; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .saved-feedback {
        margin-top: 10px;
        color: var(--pantry-success);
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
    }

    /* ── Pantry list ── */
    .pantry-warning-summary {
        background: var(--pantry-warning-bg);
        border-left: 4px solid var(--pantry-warning);
        padding: 8px 12px;
        border-radius: 0 4px 4px 0;
        margin-bottom: 12px;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--pantry-warning);
    }

    /* ── Toolbar ── */
    .pantry-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
        align-items: center;
    }
    .search-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        min-width: 150px;
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        padding: 4px 10px;
        background: var(--secondary-background-color);
    }
    .search-input {
        border: none;
        background: transparent;
        color: var(--primary-text-color);
        font-size: 0.9em;
        outline: none;
        width: 100%;
    }
    .sort-btns { display: flex; gap: 4px; }
    .sort-btn {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 4px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 0.8em;
        cursor: pointer;
        white-space: nowrap;
    }
    .sort-btn.active {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: transparent;
    }
    .sort-btn ha-icon { --mdc-icon-size: 14px; }

    /* ── Category chips ── */
    .category-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
    }
    .cat-chip {
        padding: 3px 12px;
        border-radius: 14px;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 0.82em;
        cursor: pointer;
    }
    .cat-chip.active {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: transparent;
    }

    /* ── Expiry banner ── */
    .expiry-banner {
        background: var(--pantry-warning-bg);
        border-left: 4px solid var(--pantry-warning);
        padding: 8px 12px;
        border-radius: 0 4px 4px 0;
        margin-bottom: 10px;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--pantry-warning);
    }

    .no-results { color: var(--secondary-text-color); text-align: center; padding: 16px; }

    /* ── Pantry items ── */
    .pantry-item {
        padding: 10px 6px;
        border-bottom: 1px solid var(--divider-color);
    }
    .pantry-item:last-child { border-bottom: none; }
    .pantry-item.has-warning { background: var(--pantry-warning-bg); border-radius: 6px; padding: 10px; }
    .pantry-item.expiry-expired { border-left: 3px solid #f44336; padding-left: 10px; }
    .pantry-item.expiry-soon { border-left: 3px solid #ff9800; padding-left: 10px; }

    /* top row: image + name + delete */
    .item-top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .item-thumb { width: 44px; height: 44px; object-fit: contain; border-radius: 6px; flex-shrink: 0; }
    .item-thumb-icon { --mdc-icon-size: 40px; color: var(--secondary-text-color); flex-shrink: 0; }

    .item-header { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .item-name-row { display: flex; align-items: center; gap: 4px; }
    .item-name { font-weight: 600; font-size: 0.95em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .warning-icon { color: var(--pantry-warning); --mdc-icon-size: 16px; flex-shrink: 0; }
    .item-brand { font-size: 0.8em; color: var(--secondary-text-color); }
    .cat-badge {
        display: inline-block;
        font-size: 0.72em;
        padding: 1px 8px;
        border-radius: 10px;
        background: var(--primary-color, #03a9f4);
        color: white;
        width: fit-content;
    }
    .delete-btn { --mdc-icon-size: 18px; flex-shrink: 0; color: var(--secondary-text-color); }

    /* details row: qty | acquisto | scadenza */
    .item-details-row {
        display: flex;
        gap: 0;
        border-top: 1px solid var(--divider-color);
        margin-top: 4px;
    }
    .item-detail {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 4px;
        gap: 2px;
        border-right: 1px solid var(--divider-color);
        font-size: 0.78em;
        color: var(--secondary-text-color);
        text-align: center;
    }
    .item-detail:last-child { border-right: none; }
    .item-detail ha-icon { --mdc-icon-size: 14px; }
    .item-detail strong { color: var(--primary-text-color); font-size: 0.95em; }
    .item-detail.muted strong { color: var(--secondary-text-color); }

    .expiry-detail-soon strong { color: #e65100; }
    .expiry-detail-expired strong { color: #c62828; font-weight: bold; }

    /* inline qty buttons */
    .inline-qty { display: flex; align-items: center; gap: 2px; margin-top: 2px; }
    .qty-btn {
        width: 26px;
        height: 26px;
        border: 1px solid var(--divider-color);
        border-radius: 50%;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 1.1em;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
    }
    .qty-btn:active { background: var(--primary-color, #03a9f4); color: white; }
    .qty-value { min-width: 24px; text-align: center; font-weight: bold; font-size: 1em; color: var(--primary-text-color); }
`;
