import { LitElement, html, TemplateResult, css, CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { CARD_EDITOR_NAME } from './consts';
import { PantryCardConfig, PantryCardType } from './types/pantry-types';

@customElement(CARD_EDITOR_NAME)
export class PantryCardEditor extends LitElement implements LovelaceCardEditor {
    @property() _hass?: HomeAssistant;
    @property() _config?: PantryCardConfig;

    set hass(hass: HomeAssistant) { this._hass = hass; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setConfig(config: any): void { this._config = { ...config } as PantryCardConfig; }

    private _changed(ev: Event): void {
        if (!this._config) return;
        const target = ev.target as HTMLInputElement | HTMLSelectElement;
        const key = target.dataset.key;
        if (!key) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = target.value;
        if (key === 'allergens') {
            value = (target.value as string).split(',').map(s => s.trim()).filter(Boolean);
        }

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: { ...this._config, [key]: value } },
            bubbles: true,
            composed: true,
        }));
    }

    protected render(): TemplateResult {
        if (!this._hass || !this._config) return html``;
        return html`
            <div class="form">
                <div class="row">
                    <label>Tipo card</label>
                    <select data-key="card_type" @change=${this._changed}>
                        <option value="${PantryCardType.Scanner}" ?selected=${this._config.card_type === PantryCardType.Scanner}>Scanner</option>
                        <option value="${PantryCardType.Pantry}" ?selected=${this._config.card_type === PantryCardType.Pantry}>Dispensa</option>
                    </select>
                </div>
                <div class="row">
                    <label>Titolo (opzionale)</label>
                    <input type="text" data-key="title" .value=${this._config.title || ''} @change=${this._changed} placeholder="La mia dispensa">
                </div>
                <div class="row">
                    <label>Entity codice a barre</label>
                    <input type="text" data-key="barcode_entity" .value=${this._config.barcode_entity || ''} @change=${this._changed} placeholder="input_text.barcode_scanner">
                </div>
                <div class="row">
                    <label>Allergeni da monitorare (separati da virgola)</label>
                    <input type="text" data-key="allergens"
                        .value=${(this._config.allergens || []).join(', ')}
                        @change=${this._changed}
                        placeholder="gluten, milk, eggs, nuts">
                    <small>Usa i nomi in inglese (es. gluten, milk, eggs, peanuts, nuts, soy, fish)</small>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResult {
        return css`
            .form { padding: 8px 0; }
            .row { display: flex; flex-direction: column; margin-bottom: 14px; }
            label { font-size: 0.85em; color: var(--secondary-text-color); margin-bottom: 5px; font-weight: 500; }
            small { font-size: 0.78em; color: var(--secondary-text-color); margin-top: 4px; }
            input, select {
                padding: 8px 10px;
                border: 1px solid var(--divider-color);
                border-radius: 6px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-size: 0.95em;
                outline: none;
            }
            input:focus, select:focus {
                border-color: var(--primary-color);
            }
        `;
    }
}
