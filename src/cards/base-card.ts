import { HomeAssistant } from 'custom-card-helpers';
import { HTMLTemplateResult } from 'lit';
import PantryCard from '..';
import { PantryCardConfig, PantryItem } from '../types/pantry-types';
import { STORAGE_KEY } from '../consts';

const HA_STORAGE_KEY = 'pantry_items';

/* Cache condivisa tra tutte le istanze della card sulla stessa pagina */
let _itemsCache: PantryItem[] | null = null;
let _loadPromise: Promise<PantryItem[]> | null = null;

export abstract class BaseCard {
    parent: PantryCard;
    config: PantryCardConfig;
    hass: HomeAssistant;

    constructor(parent: PantryCard) {
        this.parent = parent;
        this.config = parent.config;
        this.hass = parent._hass;
    }

    abstract render(): HTMLTemplateResult;
    abstract cardSize(): number;

    /* ── Storage: HA frontend/user_data (condiviso tra dispositivi) ── */

    protected getPantryItems(): PantryItem[] {
        return _itemsCache ?? [];
    }

    protected async loadPantryItems(): Promise<PantryItem[]> {
        if (_itemsCache !== null) return _itemsCache;
        if (_loadPromise) return _loadPromise;
        _loadPromise = this._fetchFromHA();
        _itemsCache = await _loadPromise;
        _loadPromise = null;
        return _itemsCache;
    }

    private async _fetchFromHA(): Promise<PantryItem[]> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (this.hass.connection as any).sendMessagePromise({
                type: 'frontend/get_user_data',
                key: HA_STORAGE_KEY,
            });

            if (result?.value?.length) return result.value as PantryItem[];

            /* Migrazione automatica da localStorage (prima versione) */
            return this._migrateFromLocalStorage();
        } catch {
            /* Fallback localStorage se HA storage non disponibile */
            return this._migrateFromLocalStorage();
        }
    }

    private _migrateFromLocalStorage(): PantryItem[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            const items: PantryItem[] = JSON.parse(stored);
            if (items.length > 0) {
                this._saveToHA(items);
                localStorage.removeItem(STORAGE_KEY);
            }
            return items;
        } catch {
            return [];
        }
    }

    private async _saveToHA(items: PantryItem[]): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.hass.connection as any).sendMessagePromise({
            type: 'frontend/set_user_data',
            key: HA_STORAGE_KEY,
            value: items,
        });
    }

    protected async savePantryItems(items: PantryItem[]): Promise<void> {
        _itemsCache = items;
        try {
            await this._saveToHA(items);
        } catch (e) {
            console.error('[pantry-card] Errore salvataggio su HA:', e);
        }
    }

    protected async addItem(item: PantryItem): Promise<void> {
        const items = [...this.getPantryItems()];
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) {
            items[idx].quantity = (items[idx].quantity || 1) + 1;
        } else {
            items.unshift(item);
        }
        await this.savePantryItems(items);
    }

    protected async removeItem(barcode: string): Promise<void> {
        await this.savePantryItems(this.getPantryItems().filter(i => i.barcode !== barcode));
    }

    protected syncExpiryToHA(): void {
        const entity = this.config.expiry_entity;
        if (!entity || !this.hass) return;

        const warnDays = this.config.expiry_warning_days ?? 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiring = this.getPantryItems()
            .filter(i => i.expiry_date)
            .map(i => {
                const diff = Math.ceil((new Date(i.expiry_date).getTime() - today.getTime()) / 86400000);
                return { name: i.name.substring(0, 20), diff };
            })
            .filter(i => i.diff <= warnDays)
            .sort((a, b) => a.diff - b.diff);

        let value = expiring.map(i => `${i.name}:${i.diff}`).join(',');
        if (value.length > 250) value = value.substring(0, 250);

        this.hass.callService('input_text', 'set_value', {
            entity_id: entity,
            value: value || 'ok',
        }).catch(() => {});
    }

    protected hasAllergenWarning(item: PantryItem): boolean {
        if (!this.config.allergens?.length || !item.allergens?.length) return false;
        return item.allergens.some(a =>
            this.config.allergens.some(ca => a.toLowerCase().includes(ca.toLowerCase()))
        );
    }

    /* Invalida cache globale (es. dopo evento pantry-updated da altro dispositivo) */
    static invalidateCache(): void {
        _itemsCache = null;
        _loadPromise = null;
    }
}
