import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';

import { Ingredient } from '../../models/dashboard-models/ingredient.model';
import {
  IngredientInfo,
  Ingredients,
} from 'src/app/models/dashboard-models/ingredient.model';
import { environment } from 'src/environments/environment';

const API_BASE_URL = `${environment.Spoonacular_Base_Url}/food/ingredients`;

const EMPTY_INGREDIENT: IngredientInfo = {
  id: '',
  name: '',
  image: '',
  nutrition: {
    nutrients: [],
  },
};

@Injectable({
  providedIn: 'root',
})
export class IngredientHTTPService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  private getUrl(url: string): string {
    return `${API_BASE_URL}${url}?apiKey=${environment.Spoonacular_API_KEY}`;
  }

  searchIngredients(title: string): Observable<any> {
    const url = this.getUrl('/search') + `&query=${title}&number=1`;
    return this.http.get<any>(url, this.httpOptions).pipe(
      map((ingredients: Ingredients) => {
        let id: number;
        const results = ingredients.results;
        if (results.length) id = results[0].id;

        return id ? id : 0;
      }),
      mergeMap((id: number) => {
        if (id) return this.getIngredientInfo(id);
        else return of(EMPTY_INGREDIENT);
      })
    );
  }

  getIngredientInfo(id: number): Observable<any> {
    const url = this.getUrl(`/${id}/information`) + `&amount=100&unit=g`;
    return this.http.get<Ingredient>(url, this.httpOptions);
  }
}
