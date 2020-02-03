import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewEventFormPageRoutingModule } from './new-event-form-routing.module';

import { NewEventFormPage } from './new-event-form.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgCalendarModule } from 'ionic2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewEventFormPageRoutingModule,
    IonicSelectableModule,
    NgCalendarModule
  ],
  declarations: [NewEventFormPage]
})
export class NewEventFormPageModule {}
