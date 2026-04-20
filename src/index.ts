import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { PantryCardConfig, PantryCardType } from './types/pantry-types';
import { CSSResult, html, HTMLTemplateResult, LitElement, PropertyValues } from 'lit';
import { styles } from './styles';
import { BaseCard } from './cards/base-card';
import PantryList from './cards/pantry-list';
import ScanResult from './cards/scan-result';
import { CARD_EDITOR_NAME, CARD_NAME } from './consts';

console.info(
    `%c PANTRY-CARD %c v0.1.0`,
    'color: #4caf50; background: #1a1a1a; font-weight: bold;',
    'color: #1a1a1a; background: #4caf50; font-weight: bold;'
);

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: CARD_NAME,
    name: 'Pantry Card',
    preview: false,
    description: 'Gestisci la tua dispensa con scanner codici a barre e Open Food Facts',
});
/* eslint-enable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class PantryCard extends LitElement {
    @property() _hass?: HomeAssistant;
    @property() config?: PantryCardConfig;
    @property() card?: BaseCard;

    private _onPantryUpdated = () => this.requestUpdate();

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('pantry-updated', this._onPantryUpdated);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener('pantry-updated', this._onPantryUpdated);
    }

    /* istanbul ignore next */
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import('./editor');
        return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static getStubConfig(): PantryCardConfig {
        return {
            card_type: PantryCardType.Scanner,
            barcode_entity: 'input_text.barcode_scanner',
            allergens: [],
        };
    }

    setConfig(config: PantryCardConfig): void {
        if (!config.card_type) throw new Error('card_type è obbligatorio');
        if (!config.barcode_entity) throw new Error('barcode_entity è obbligatorio');
        this.config = { ...config };
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        if (!this.config) return;

        if (!this.card) {
            this.config = { ...this.config, hass };
            switch (this.config.card_type) {
                case PantryCardType.Pantry:
                    this.card = new PantryList(this);
                    break;
                case PantryCardType.Scanner:
                default:
                    this.card = new ScanResult(this);
                    break;
            }
        } else {
            this.config.hass = hass;
            this.card.hass = hass;
            this.card.config = this.config;
        }
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        /* requestUpdate() manuale → changedProps vuoto → renderizza subito */
        if (changedProps.size === 0) return true;
        if (changedProps.has('card') || changedProps.has('config')) return true;
        if (changedProps.has('_hass')) {
            const oldHass = changedProps.get('_hass') as HomeAssistant | undefined;
            if (!oldHass) return true;
            /* aggiornamento HA: renderizza solo se cambia il barcode entity */
            const entity = this.config?.barcode_entity;
            if (!entity) return false;
            return oldHass.states[entity]?.state !== this._hass?.states[entity]?.state;
        }
        return false;
    }

    static get styles(): CSSResult {
        return styles;
    }

    render(): HTMLTemplateResult {
        if (!this._hass || !this.config || !this.card) return html``;

        try {
            return html`
                <ha-card elevation="2">
                    ${this.config.title
                        ? html`<h1 class="card-header">${this.config.title}</h1>`
                        : ''
                    }
                    ${this.card.render()}
                </ha-card>
            `;
        } catch (error) {
            return html`<hui-warning>${String(error)}</hui-warning>`;
        }
    }

    getCardSize(): number {
        return this.card?.cardSize() ?? 4;
    }
}
