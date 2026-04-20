import { OFFResponse, PantryItem, NutritionInfo } from '../types/pantry-types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,brands,image_url,allergens_tags,ingredients_text,nutriments';
const APP_PARAMS = 'app_name=pantry-card&app_version=0.1.0&app_uuid=ha-pantry-card';

export default class OpenFoodFactsClient {
    async getProduct(barcode: string): Promise<PantryItem | null> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        let res: Response;
        try {
            res = await fetch(`${BASE_URL}/${barcode}?fields=${FIELDS}&${APP_PARAMS}`, { signal: controller.signal });
        } catch (e) {
            if ((e as Error).name === 'AbortError') throw new Error('TIMEOUT');
            throw new Error('NETWORK');
        } finally {
            clearTimeout(timeout);
        }
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: OFFResponse = await res.json();
        if (data.status !== 1 || !data.product) return null;

        const p = data.product;
        const nutrients: NutritionInfo = {
            energy_kcal: p.nutriments?.['energy-kcal_100g'],
            fat: p.nutriments?.fat_100g,
            saturated_fat: p.nutriments?.['saturated-fat_100g'],
            carbohydrates: p.nutriments?.carbohydrates_100g,
            sugars: p.nutriments?.sugars_100g,
            fiber: p.nutriments?.fiber_100g,
            proteins: p.nutriments?.proteins_100g,
            salt: p.nutriments?.salt_100g,
        };

        return {
            barcode,
            name: p.product_name || 'Prodotto sconosciuto',
            brand: p.brands,
            image_url: p.image_url,
            allergens: p.allergens_tags?.map(a => a.replace('en:', '')),
            ingredients: p.ingredients_text,
            nutrients,
            added_at: new Date().toISOString(),
            quantity: 1,
        };
    }
}
