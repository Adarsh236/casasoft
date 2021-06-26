import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NgbActiveModal,
  NgbDateAdapter,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { NgxImageCompressService } from 'ngx-image-compress';

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

const EMPTY_INGREDIENT: Ingredient = {
  id: undefined,
  title: '',
  img: '',
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
    private imageCompress: NgxImageCompressService
  ) {
    this.isLoading$ =
      this.ingredientsService.isLoading$ && this.nutritionService.isLoading$;
  }

  ngOnInit(): void {
    this.loadIngredient();
  }

  loadIngredient() {
    if (!this.id) {
      EMPTY_INGREDIENT.title = '';
      EMPTY_INGREDIENT.img = '';
      EMPTY_INGREDIENT.fat = 0;
      EMPTY_INGREDIENT.calories = 0;
      EMPTY_INGREDIENT.carbohydrates = 0;
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
    const numberRegex = '^(?=.)([+]?([0-9]*)(\.([0-9]+))?)$';
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
      fat: [
        this.ingredient.fat,
        Validators.compose([
          Validators.required,
          Validators.pattern(numberRegex),
        ]),
      ],
      calories: [
        this.ingredient.calories,
        Validators.compose([
          Validators.required,
          Validators.pattern(numberRegex),
        ]),
      ],
      carbohydrates: [
        this.ingredient.carbohydrates,
        Validators.compose([
          Validators.required,
          Validators.pattern(numberRegex),
        ]),
      ],
    });
  }

  selectedAndSubmitFile() {
    this.isLoading$ = of(true);
    try {
      this.imageCompress.uploadFile().then(({ image, orientation }) => {
        this.imageCompress
          .compressFile(image, orientation, 50, 50)
          .then((result) => {
            if (result) {
              this.ingredient.img = result;
            }
          });
      });
    } catch (error) {
      console.error('image upload failed');
    }
    this.isLoading$ = of(false);
  }

  getImg() {
    if (!this.ingredient.img) {
      return './assets/media/users/blank.png';
    }

    return this.ingredient.img;
  }

  deletePic() {
    this.ingredient.img = '';
  }

  fetchNutrients() {
    this.prepareIngredient();
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
        this.loadForm();
      });
    this.subscriptions.push(sbCreate);
  }

  save() {
    this.prepareIngredient();
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

  private prepareIngredient() {
    const formValues = this.formGroup.value;
    formValues.img = this.ingredient.img;
    this.ingredient = Object.assign(this.ingredient, formValues);
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
