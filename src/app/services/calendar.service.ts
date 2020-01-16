import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../models/event.model';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  public event: EventModel;
  private eventSourceSubject: BehaviorSubject<EventModel[]>;
  private eventSource: Array<EventModel> = new Array();
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };
  
  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.resetEvent();
    this.eventSourceSubject = new BehaviorSubject<EventModel[]>(this.eventSource);
  }

  resetEvent() {
    let start = new Date();
    let end = this.addHourToDate(start, 1);
    this.event = new EventModel('', start, end, start.toISOString(), end.toISOString(), false);
  }

  private addHourToDate(date: Date, h: number): Date {
    let d = new Date(date);
    d.setHours(d.getHours() + h);
    return d;
  }

  addEvent() {
    let eventCopy: EventModel = Object.assign({}, this.event);

    if (this.event.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
      eventCopy.strStartTime = eventCopy.startTime.toISOString();
      eventCopy.strEndTime = eventCopy.endTime.toISOString();
    }

    this.eventSource.push(eventCopy);
    this.eventSourceSubject.next(this.eventSource);
    this.resetEvent();
  }

  getEventSource() {
    return this.eventSource;
  }

  getEventSourceObservable() {
    return this.eventSourceSubject;
  }

  getCalendarMode() {
    return this.calendarOptions.mode;
  }

  getCurrentDate() {
    return this.calendarOptions.currentDate;
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
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
    console.log(event, start, end);
  }

  onTimeSelected(event) {
    let selected = new Date(event.selectedTime);
    this.event.startTime = selected;
    this.event.endTime = this.addHourToDate(selected, 1);
    this.event.strStartTime = this.event.startTime.toISOString();
    this.event.strEndTime = this.event.endTime.toISOString();
  }
}
