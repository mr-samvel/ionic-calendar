import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassModel } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { ClassDetailsPage } from '../pages/class-details/class-details.page';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventSourceSubject: BehaviorSubject<ClassModel[]>;
  private eventSource: Array<ClassModel> = new Array();
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };

  constructor(private modalController: ModalController) {
    this.eventSourceSubject = new BehaviorSubject<ClassModel[]>(this.eventSource);
  }

  private async showClassDetailsModal(event: ClassModel) {
    const modal = await this.modalController.create({
      component: ClassDetailsPage,
      componentProps: {
        'event': event
      }
    });
    modal.onDidDismiss().then((returnedData) => {
      console.log(returnedData);
    });
    return await modal.present();
  }

  getEventSourceObservable(): BehaviorSubject<ClassModel[]> {
    return this.eventSourceSubject;
  }
  getCalendarMode(): 'month' | 'week' | 'day' {
    return this.calendarOptions.mode;
  }
  getCurrentDate(): Date {
    return this.calendarOptions.currentDate;
  }
  getViewTitle(): string {
    return this.calendarOptions.viewTitle;
  }

  addClasses(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.push(event);
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  today() {
    this.calendarOptions.currentDate = new Date();
  }

  changeMode(mode: 'month' | 'week' | 'day') {
    this.calendarOptions.mode = mode;
  }

  onViewTitleChanged(title) {
    this.calendarOptions.viewTitle = title;
  }

  onEventSelected(event) {
    this.showClassDetailsModal(event);
    console.log('Event selected:', event);
  }

  onTimeSelected(event) {
    console.log('On time selected:', event);
  }
}
