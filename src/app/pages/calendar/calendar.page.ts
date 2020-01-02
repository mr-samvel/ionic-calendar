import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  @ViewChild(CalendarComponent, {static: false}) calendarComponent: CalendarComponent;

  minDate: string = new Date().toISOString();
  eventSource: Array<object> = new Array();
  viewTitle: string;
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };
  collapseEvent: boolean = true;
  event = {
    title: '',
    desc: '',
    startTime: '',
    endTime: '',
    allDay: false
  }

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  ngOnInit() {
    this.resetEvent();
  }

  resetEvent() {
    this.collapseEvent = true;
    this.event.title = '';
    this.event.desc = '';
    this.event.startTime = '';
    this.event.endTime = '';
    this.event.allDay = false;
  }

  addEvent() {
    let eventCopy = {
      title: this.event.title,
      startTime:  new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      allDay: this.event.allDay,
      desc: this.event.desc
    }
 
    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;
 
      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }
 
    this.eventSource.push(eventCopy);
    this.calendarComponent.loadEvents()
    this.resetEvent();
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  changeMode(mode: 'month' | 'week' | 'day') {
    this.calendar.mode = mode;
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onEventSelected(event) {
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
    console.log(event, start, end)
  }

  onTimeSelected(event) {
    let selected = new Date(event.selectedTime);
    this.event.startTime = selected.toISOString();

    selected.setHours(selected.getHours() + 1);
    this.event.endTime = (selected.toISOString());
  }
}
