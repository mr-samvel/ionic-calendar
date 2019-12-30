import { Component, OnInit, ViewChildren } from '@angular/core';
import { CalendarComponent } from 'ionic2-calendar/calendar';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  @ViewChildren(CalendarComponent) calendarComponent: CalendarComponent;

  minDate: string = new Date().toISOString();
  eventSource: Array<object> = new Array();
  pickedDay: string;
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };

  constructor() { }

  ngOnInit() {
    this.resetEvent();
    // TODO: pegar eventos
  }

  addEvent() {
    //TODO
  }

  resetEvent() {
    //TODO
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  changeMode(mode: 'month' | 'week' | 'day') {
    this.calendar.mode = mode;
  }

  onViewTitleChanged(title) {
    this.pickedDay = title;
  }

  onEventSelected(event) {
    //TODO
  }

  onTimeSelected(event) {
    //TODO
  }
}
