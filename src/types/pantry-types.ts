import { HomeAssistant } from 'custom-card-helpers';

export enum PantryCardType {
    Scanner = 'scanner',
    Pantry = 'pantry',
}

export interface PantryCardConfig {
    card_type: PantryCardType;
    barcode_entity: string;
    allergens?: string[];
    title?: string;
    hass?: HomeAssistant;
}

export interface NutritionInfo {
    energy_kcal?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    proteins?: number;
    salt?: number;
}

export interface PantryItem {
    barcode: string;
    name: string;
    brand?: string;
    image_url?: string;
    allergens?: string[];
    nutrients?: NutritionInfo;
    ingredients?: string;
    added_at: string;
    quantity?: number;
}

export interface OFFProduct {
    product_name?: string;
    brands?: string;
    image_url?: string;
    allergens_tags?: string[];
    ingredients_text?: string;
    nutriments?: {
        'energy-kcal_100g'?: number;
        fat_100g?: number;
        'saturated-fat_100g'?: number;
        carbohydrates_100g?: number;
        sugars_100g?: number;
        fiber_100g?: number;
        proteins_100g?: number;
        salt_100g?: number;
    };
}

export interface OFFResponse {
    status: number;
    product?: OFFProduct;
}
