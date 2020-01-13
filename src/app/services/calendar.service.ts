import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventSource: IEvent[];
  private event: IEvent;
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };


  constructor(@Inject(LOCALE_ID) private locale: string) { }

  addScale() {
    // TODO
  }

  addEvent(event: IEvent) {
    let eventCopy = {
      title: event.title,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      allDay: event.allDay
    }
    if (event.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }

    this.eventSource.push(event);
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
    console.log(event, start, end)
  }

  onTimeSelected(event) {
    let selected = new Date(event.selectedTime);
    this.event.startTime = selected;

    selected.setHours(selected.getHours() + 1);
    this.event.endTime = selected;
  }
}
