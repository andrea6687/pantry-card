import { HomeAssistant } from 'custom-card-helpers';
import { HTMLTemplateResult } from 'lit';
import PantryCard from '..';
import { PantryCardConfig, PantryItem } from '../types/pantry-types';
import { STORAGE_KEY } from '../consts';

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

    protected getPantryItems(): PantryItem[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    protected savePantryItems(items: PantryItem[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    protected addItem(item: PantryItem): void {
        const items = this.getPantryItems();
        const idx = items.findIndex(i => i.barcode === item.barcode);
        if (idx >= 0) {
            items[idx].quantity = (items[idx].quantity || 1) + 1;
        } else {
            items.unshift(item);
        }
        this.savePantryItems(items);
    }

    protected removeItem(barcode: string): void {
        this.savePantryItems(this.getPantryItems().filter(i => i.barcode !== barcode));
        this.syncExpiryToHA();
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

        /* formato compatto: "Nutella:-2,Latte:1,Pasta:5" (negativo = scaduto) */
        let value = expiring.map(i => `${i.name}:${i.diff}`).join(',');
        if (value.length > 250) value = value.substring(0, 250);

        this.hass.callService('input_text', 'set_value', {
            entity_id: entity,
            value: value || 'ok',
        }).catch(() => { /* entity non configurata, ignora */ });
    }

    protected hasAllergenWarning(item: PantryItem): boolean {
        if (!this.config.allergens?.length || !item.allergens?.length) return false;
        return item.allergens.some(a =>
            this.config.allergens.some(ca => a.toLowerCase().includes(ca.toLowerCase()))
        );
    }
}
