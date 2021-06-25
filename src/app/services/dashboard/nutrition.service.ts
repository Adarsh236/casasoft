import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, mergeMap } from 'rxjs/operators';
import {
  IngredientInfo,
  Nutrient,
} from 'src/app/models/dashboard-models/ingredient.model';
import { IngredientHTTPService } from './ingredient-http';

@Injectable({
  providedIn: 'root',
})
export class NutritionService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = [];

  // public fields
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private ingredientHTTPService: IngredientHTTPService) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // public methods
  getNutrients(title: string): Observable<Nutrient[]> {
    this.isLoadingSubject.next(true);
    return this.ingredientHTTPService.searchIngredients(title).pipe(
      map((ingredient: IngredientInfo) => {
        const nutrients = ['fat', 'calories', 'carbohydrates'];
        return ingredient.nutrition.nutrients.filter((n: Nutrient) =>
          nutrients.includes(n.name.toLowerCase())
        );
      }),
      catchError((err) => {
        return of([]);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
