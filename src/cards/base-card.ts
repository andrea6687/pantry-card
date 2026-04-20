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
    }

    protected hasAllergenWarning(item: PantryItem): boolean {
        if (!this.config.allergens?.length || !item.allergens?.length) return false;
        return item.allergens.some(a =>
            this.config.allergens.some(ca => a.toLowerCase().includes(ca.toLowerCase()))
        );
    }
}
