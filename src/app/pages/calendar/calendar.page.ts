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
  minDate: string = new Date().toISOString();
  
  constructor(private calendarService: CalendarService) { }

  ngOnInit() { }
  
}
