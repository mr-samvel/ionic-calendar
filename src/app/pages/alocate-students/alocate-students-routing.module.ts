import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlocateStudentsPage } from './alocate-students.page';

const routes: Routes = [
  {
    path: '',
    component: AlocateStudentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlocateStudentsPageRoutingModule {}
