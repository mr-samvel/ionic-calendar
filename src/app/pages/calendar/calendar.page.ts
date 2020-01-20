import { Component, OnInit, ViewChild, Inject, LOCALE_ID, AfterViewInit } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements AfterViewInit {
  @ViewChild(CalendarComponent, {static: false}) calendarComponent: CalendarComponent;

  public inputTemplate: {
    professional: string,
    days: Array<boolean>,
    duration: number,
    startTime: string,
    classQt: number,
    modality: string,
    studentQt: number 
  };
  
  public collapseEvent: boolean = true;
  public minDate: string = new Date().toISOString();
  
  constructor(private calendarService: CalendarService) { 
    this.resetInputTemplate();
  }

  ngAfterViewInit() {
    this.loadEventsOnSourceChange();
  }
  
  private loadEventsOnSourceChange() {
    this.calendarService.getEventSourceObservable().subscribe( eventSrc => {
      this.calendarComponent.loadEvents();
    });
  }

  private validateForm() {
    // TODO
    return true;
  }

  resetInputTemplate() {
    this.inputTemplate = {
      professional: '',
      days: new Array<boolean>(false, false, false, false, false, false, false),
      duration: 0,
      startTime: '',
      classQt: 0,
      modality: '',
      studentQt: 0
    };
  }
  
  addEvent() {
    // TODO
    console.log(this.inputTemplate);
  }
  
}
