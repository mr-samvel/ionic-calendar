import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../models/event.model';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventSource: Array<EventModel> = new Array();
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };
  public event: EventModel = new EventModel('', new Date(), new Date(), false);

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  resetEvent() {
    this.event.title = '';
    this.event.startTime = new Date();
    // this.event.endTime = this.event.startTime.setHours(this.event.startTime.getHours() + 1);
    this.event.allDay = false;
  } 

  addScale() {
    // TODO
  }

  addEvent() {
    let eventCopy: EventModel = {
      title: this.event.title,
      startTime: new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      allDay: this.event.allDay
    }
    if (this.event.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }

    this.eventSource.push(eventCopy);
    this.resetEvent();
    // observer? onEventAdd -> calendarComponent.loadEvents();
  }

  getEventSource() {
    return this.eventSource;
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

    selected.setHours(selected.getHours() + 1);
    this.event.endTime = selected;
  }
}
