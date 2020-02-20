import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangePeriodPage } from './change-period.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePeriodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangePeriodPageRoutingModule {}
