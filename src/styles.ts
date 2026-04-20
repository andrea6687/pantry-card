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

    .pantry-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 4px;
        border-bottom: 1px solid var(--divider-color);
    }
    .pantry-item:last-child { border-bottom: none; }
    .pantry-item.has-warning { background: var(--pantry-warning-bg); border-radius: 4px; padding: 8px; }

    .item-thumb { width: 40px; height: 40px; object-fit: contain; border-radius: 4px; flex-shrink: 0; }
    .item-thumb-icon { --mdc-icon-size: 36px; color: var(--secondary-text-color); flex-shrink: 0; }

    .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .item-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-brand { font-size: 0.82em; color: var(--secondary-text-color); }
    .item-allergen-badge {
        font-size: 0.78em;
        color: var(--pantry-warning);
        display: flex;
        align-items: center;
        gap: 2px;
    }
    .item-allergen-badge ha-icon { --mdc-icon-size: 13px; }

    .item-qty {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
    }
    .qty-value { min-width: 22px; text-align: center; font-weight: bold; }
`;
