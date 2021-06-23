import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';
import {
  NgbDatepickerModule,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { NavBarComponent } from 'src/app/components/shared/nav-bar/nav-bar.component';
import { CRUDTableModule } from 'src/app/components/shared/crud-table';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

import { IngredientsComponent } from './ingredients/ingredients.component';
import { DeleteIngredientModalComponent } from './ingredients/components/delete-ingredient-modal/delete-ingredient-modal.component';
import { DeleteIngredientsModalComponent } from './ingredients/components/delete-ingredients-modal/delete-ingredients-modal.component';
import { EditIngredientModalComponent } from './ingredients/components/edit-ingredient-modal/edit-ingredient-modal.component';

@NgModule({
  declarations: [
    NavBarComponent,
    DashboardComponent,
    IngredientsComponent,
    DeleteIngredientModalComponent,
    DeleteIngredientsModalComponent,
    EditIngredientModalComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
    NgbModalModule,
    NgbDatepickerModule,
    MatToolbarModule,
    MatIconModule,
  ],
  entryComponents: [
    DeleteIngredientModalComponent,
    DeleteIngredientsModalComponent,
    EditIngredientModalComponent,
  ],
})
export class DashboardModule {}
