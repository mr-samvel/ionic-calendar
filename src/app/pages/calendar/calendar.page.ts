import { Component, OnInit, ViewChild, Inject, LOCALE_ID, AfterViewInit } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { ClassModel } from 'src/app/models/event.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements AfterViewInit {
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public inputTemplate: {
    professional: string,
    days: Array<boolean>,
    weekRepeat: number,
    duration: number,
    startTime: string,
    classQt: number,
    modality: string,
    studentQt: number
  };

  public collapseEvent: boolean = true;
  public eventSource: Array<ClassModel>;

  constructor(private calendarService: CalendarService) {
    this.resetInputTemplate();
  }

  getDay() {
  }

  ngAfterViewInit() {
    this.loadEventsOnSourceChange();
  }

  private loadEventsOnSourceChange() {
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      this.eventSource = eventSrc;
      this.calendarComponent.loadEvents();
    });
  }

  private validateForm() {
    // TODO
    return true;
  }

  resetInputTemplate() {
    this.inputTemplate = {
      professional: 'ex.: Marcos',
      days: new Array<boolean>(false, false, false, false, false, false, false),
      weekRepeat: 0,
      duration: 0,
      startTime: new Date().toISOString(),
      classQt: 0,
      modality: 'ex.: Pilates',
      studentQt: 0
    };
  }

  addEvent() {
    this.inputTemplate.days.forEach((dayValue, dayIndex) => {
      if (dayValue) {
        for (let i = 0; i < this.inputTemplate.weekRepeat + 1; i++) {
          let d = new Date()
          d.setDate(d.getDate() + (((7 - d.getDay()) % 7 + dayIndex) % 7) + i*7);
          console.log(d);
        }
      }
    });
    // let newClass = new ClassModel(
    //   this.inputTemplate.professional,
    //   new Date(), new Date(),
    //   this.inputTemplate.modality,
    //   [''],
    //   this.inputTemplate.studentQt
    // );
    // this.resetInputTemplate();
    // console.log(this.inputTemplate);
  }

  onTimeSelected(event) {
    let selected = new Date(event.selectedTime);
    this.inputTemplate.startTime = selected.toISOString();
  }
}
