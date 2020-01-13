import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  @ViewChild(CalendarComponent, {static: false}) calendarComponent: CalendarComponent;

  collapseEvent: boolean = true;
  
  event: IEvent = {
    allDay: false,
    startTime: new Date(),
    endTime: new Date(),
    title: ''
  };

  constructor(@Inject(LOCALE_ID) private locale: string, private calendarService: CalendarService) { }

  ngOnInit() {
    this.resetEvent();
  }

  resetEvent() {
    this.collapseEvent = true;
    this.event.title = '';
    this.event.startTime = new Date();
    this.event.endTime = new Date();
    this.event.allDay = false;
  }

  addEvent() {
    this.calendarService.addEvent(this.event);
    this.calendarComponent.loadEvents();
    this.resetEvent();
  }
}
