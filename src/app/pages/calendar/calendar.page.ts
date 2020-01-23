import { Component, OnInit, ViewChild, Inject, LOCALE_ID, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CalendarComponent, IEvent } from 'ionic2-calendar/calendar';
import { formatDate } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { ClassModel } from 'src/app/models/event.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  encapsulation: ViewEncapsulation.None
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

  ngAfterViewInit() {
    this.subscribeToEventChange();
  }

  private subscribeToEventChange() {
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      this.eventSource = eventSrc;
      console.log(this.eventSource);
      this.calendarComponent.loadEvents();
    });
  }

  public validateForm() {
    let vProf = this.inputTemplate.professional != null;
    let vDays = this.inputTemplate.days != [false, false, false, false, false, false, false];
    let vStartTime = this.inputTemplate.startTime != null
    let vDuration = this.inputTemplate.duration > 0;
    let vClassQt = this.inputTemplate.classQt > 0;
    let vMod = this.inputTemplate.modality != null;
    let vStudentQt = this.inputTemplate.studentQt > 0;
    if (vProf && vDays && vStartTime && vDuration && vClassQt && vMod && vStudentQt)
      return true;
    return false;
  }

  resetInputTemplate() {
    this.inputTemplate = {
      professional: null,
      days: new Array<boolean>(false, false, false, false, false, false, false),
      weekRepeat: null,
      duration: null,
      startTime: null,
      classQt: null,
      modality: null,
      studentQt: null
    };
  }

  addEvent() {
    let classes: ClassModel[] = [];
    this.inputTemplate.days.forEach((dayValue, dayIndex) => {
      if (dayValue) {
        for (let i = 0; i < this.inputTemplate.weekRepeat + 1; i++) {
          let start = new Date();
          start.setHours(+this.inputTemplate.startTime.slice(11, 13), +this.inputTemplate.startTime.slice(14, 16))
          start.setDate(start.getDate() + (((7 - start.getDay()) % 7 + dayIndex) % 7) + i * 7);
          let end = new Date(start);
          end.setMinutes(this.inputTemplate.duration * this.inputTemplate.classQt);

          let newClass = new ClassModel(
            this.inputTemplate.professional,
            start, end,
            this.inputTemplate.modality,
            [''],
            this.inputTemplate.studentQt
          );
          classes.push(newClass);
        }
      }
    });
    this.calendarService.addClasses(classes);
    this.resetInputTemplate();
  }

  onTimeSelected(event) {
    let selected = new Date(event.selectedTime);
    this.inputTemplate.startTime = selected.toISOString();
  }

  showClassDetails(event) {
    console.log(event);
  }

  log(...args) {
    for (let arg of args) {
      console.log(arg);
    }
  }
}
