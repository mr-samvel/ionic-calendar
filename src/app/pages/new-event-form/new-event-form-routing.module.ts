import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewEventFormPage } from './new-event-form.page';

const routes: Routes = [
  {
    path: '',
    component: NewEventFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewEventFormPageRoutingModule {}
