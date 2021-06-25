import { BaseModel } from './base.model';

export interface Ingredient extends BaseModel {
  title: string;
  img: string;
  fat: number;
  calories: number;
  carbohydrates: number;
}

export interface Ingredients {
  results: IngredientInfo[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface IngredientInfo extends BaseModel {
  name: string;
  image: string;
  nutrition: {
    nutrients: Nutrient[];
  };
}

export interface Nutrient {
  title: string;
  name: string;
  amount: number;
  unit: string;
}
