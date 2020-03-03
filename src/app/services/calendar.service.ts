import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassModel } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { ClassDetailsPage } from '../pages/class-details/class-details.page';
import { StudentModel } from '../models/student.model';


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

  addStudentsToClasses(studentsArray: Array<StudentModel>, events: Array<ClassModel>) {        
    for (let event of events) {
      this.eventSource[this.eventSource.indexOf(event)].students = this.eventSource[this.eventSource.indexOf(event)].students.concat(studentsArray);
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
    console.log('Event selected:', event);
  }

  onTimeSelected(event) {
    console.log('On time selected:', event);
  }
}
