import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangePeriodPageRoutingModule } from './change-period-routing.module';

import { ChangePeriodPage } from './change-period.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangePeriodPageRoutingModule
  ],
  declarations: [ChangePeriodPage]
})
export class ChangePeriodPageModule {}
