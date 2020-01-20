import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassModel } from '../models/event.model';


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
  
  constructor() {
    this.eventSourceSubject = new BehaviorSubject<ClassModel[]>(this.eventSource);
  }
  
  private addHourToDate(date: Date, h: number): Date {
    let d = new Date(date);
    d.setHours(d.getHours() + h);
    return d;
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

  addClass(event: ClassModel) {
    this.eventSource.push(event);
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
    // TODO
    console.log('Event selected:', event);
  }

  onTimeSelected(event) {
    // TODO
  }
}
