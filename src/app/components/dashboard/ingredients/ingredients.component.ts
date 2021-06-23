// tslint:disable:no-string-literal
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IngredientsService } from 'src/app/services/dashboard/ingredients.service';
import {
  GroupingState,
  PaginatorState,
  ICreateAction,
  IEditAction,
  IDeleteAction,
  IDeleteSelectedAction,
  IGroupingView,
} from 'src/app/components/shared/crud-table';
import { DeleteIngredientModalComponent } from './components/delete-ingredient-modal/delete-ingredient-modal.component';
import { DeleteIngredientsModalComponent } from './components/delete-ingredients-modal/delete-ingredients-modal.component';
import { EditIngredientModalComponent } from './components/edit-ingredient-modal/edit-ingredient-modal.component';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss'],
})
export class IngredientsComponent
  implements
    OnInit,
    OnDestroy,
    ICreateAction,
    IEditAction,
    IDeleteAction,
    IDeleteSelectedAction,
    IGroupingView
{
  paginator: PaginatorState;
  grouping: GroupingState;
  isLoading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public ingredientService: IngredientsService
  ) {}

  ngOnInit(): void {
    this.ingredientService.fetch();
    this.grouping = this.ingredientService.grouping;
    this.paginator = this.ingredientService.paginator;
    const sb = this.ingredientService.isLoading$.subscribe(
      (res) => (this.isLoading = res)
    );
    this.subscriptions.push(sb);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.ingredientService.patchState({ paginator });
  }

  // form actions
  create() {
    this.edit(undefined);
  }

  edit(id: number) {
    console.log('edit', id);
    const modalRef = this.modalService.open(EditIngredientModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.ingredientService.fetch(),
      () => {}
    );
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteIngredientModalComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.ingredientService.fetch(),
      () => {}
    );
  }

  deleteSelected() {
    const modalRef = this.modalService.open(DeleteIngredientsModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(
      () => this.ingredientService.fetch(),
      () => {}
    );
  }
}
