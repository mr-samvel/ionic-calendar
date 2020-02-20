import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlocateStudentsPageRoutingModule } from './alocate-students-routing.module';
import { AlocateStudentsPage } from './alocate-students.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgCalendarModule } from 'ionic2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlocateStudentsPageRoutingModule,
    IonicSelectableModule,
    NgCalendarModule
  ],
  declarations: [AlocateStudentsPage]
})
export class AlocateStudentsPageModule {}
