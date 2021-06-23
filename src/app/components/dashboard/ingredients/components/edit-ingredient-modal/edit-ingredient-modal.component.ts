import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NgbActiveModal,
  NgbDateAdapter,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, first, tap } from 'rxjs/operators';
import {
  Ingredient,
  Nutrient,
} from 'src/app/models/dashboard-models/ingredient.model';
import { IngredientsService } from 'src/app/services/dashboard/ingredients.service';
import { NutritionService } from 'src/app/services/dashboard/nutrition.service';
import {
  CustomAdapter,
  CustomDateParserFormatter,
} from 'src/app/components/shared/core';
import { DomSanitizer } from '@angular/platform-browser';

const EMPTY_INGREDIENT: Ingredient = {
  id: undefined,
  title: '',
  img: './assets/media/users/300_25.jpg',
  fat: 0,
  calories: 0,
  carbohydrates: 0,
};

@Component({
  selector: 'app-edit-ingredient-modal',
  templateUrl: './edit-ingredient-modal.component.html',
  styleUrls: ['./edit-ingredient-modal.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class EditIngredientModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading$: Observable<boolean>;
  ingredient: Ingredient;
  formGroup: FormGroup;
  fetchMsg: boolean;

  private subscriptions: Subscription[] = [];
  constructor(
    private ingredientsService: IngredientsService,
    private nutritionService: NutritionService,
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    private sanitizer: DomSanitizer
  ) {
    this.isLoading$ =
      this.ingredientsService.isLoading$ && this.nutritionService.isLoading$;
  }

  ngOnInit(): void {
    this.loadCustomer();
  }

  loadCustomer() {
    if (!this.id) {
      this.ingredient = EMPTY_INGREDIENT;
      this.loadForm();
    } else {
      const sb = this.ingredientsService
        .getItemById(this.id)
        .pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of(EMPTY_INGREDIENT);
          })
        )
        .subscribe((ingredient: Ingredient) => {
          this.ingredient = ingredient;
          this.loadForm();
        });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {
    this.formGroup = this.fb.group({
      img: [this.ingredient.img],
      title: [
        this.ingredient.title,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ]),
      ],
      fat: [this.ingredient.fat, Validators.compose([Validators.required])],
      calories: [
        this.ingredient.calories,
        Validators.compose([Validators.required]),
      ],
      carbohydrates: [
        this.ingredient.carbohydrates,
        Validators.compose([Validators.required]),
      ],
    });
  }

  selectedAndSubmitFile(event: any) {
    const e = event.target;
    if (e.files && e.files[0]) {
      const file = e.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.ingredient.img = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  getImg() {
    if (!this.ingredient.img) {
      return './assets/media/users/blank.png';
    }

    return this.ingredient.img;
  }

  deletePic() {
    console.log('updateField', this.ingredient, this.ingredient.img);
    this.ingredient.img = '';
  }

  fetchNutrients() {
    this.prepareCustomer();
    const sbCreate = this.nutritionService
      .getNutrients(this.ingredient.title)
      .pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.ingredient);
        })
      )
      .subscribe((nutrient: Nutrient[]) => {
        nutrient.forEach((e) => this.updateFields(e));
        if (nutrient.length) this.fetchMsg = false;
        else this.fetchMsg = true;
        console.log('updateField', this.fetchMsg);
        this.loadForm();
      });
    this.subscriptions.push(sbCreate);
  }

  save() {
    this.prepareCustomer();
    if (this.ingredient.id) {
      this.edit();
    } else {
      this.create();
    }
  }

  edit() {
    const sbUpdate = this.ingredientsService
      .update(this.ingredient)
      .pipe(
        tap(() => {
          this.modal.close();
        }),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.ingredient);
        })
      )
      .subscribe((res) => (this.ingredient = res));
    this.subscriptions.push(sbUpdate);
  }

  create() {
    const sbCreate = this.ingredientsService
      .create(this.ingredient)
      .pipe(
        tap(() => {
          this.modal.close();
        }),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.ingredient);
        })
      )
      .subscribe((res: Ingredient) => (this.ingredient = res));
    this.subscriptions.push(sbCreate);
  }

  cancel() {
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  private prepareCustomer() {
    const formData = this.formGroup.value;
    this.ingredient.title = formData.title;
    this.ingredient.img = formData.img;
    this.ingredient.fat = formData.fat;
    this.ingredient.calories = formData.calories;
    this.ingredient.carbohydrates = formData.carbohydrates;
  }

  private updateFields(nutrient: Nutrient) {
    switch (nutrient.name.toLowerCase()) {
      case 'fat':
        this.ingredient.fat = this.getNum(nutrient.amount);
        break;
      case 'calories':
        this.ingredient.calories = this.getNum(nutrient.amount);
        break;
      case 'carbohydrates':
        this.ingredient.carbohydrates = this.getNum(nutrient.amount);
        break;
      default:
        break;
    }
  }

  private getNum(num: number) {
    return num ? num : 0;
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }
}
