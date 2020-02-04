import { Component, OnInit, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { ModalController } from '@ionic/angular';
import { ProfessionalModel } from 'src/app/models/professional.model';
import { ModalityModel } from 'src/app/models/modality.model';
import { ModalityContainerService } from 'src/app/services/modality-container.service';
import { ProfessionalContainerService } from 'src/app/services/professional-container.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';

@Component({
  selector: 'app-new-event-form',
  templateUrl: './new-event-form.page.html',
  styleUrls: ['./new-event-form.page.scss'],
})
export class NewEventFormPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public segment: string = 'form';

  public periods = [];
  public period = {currentDate: new Date(),}
  
  public inputTemplate: {
    professional: ProfessionalModel,
    days: Array<boolean>,
    weekRepeat: number,
    duration: number,
    startTime: string,
    classQt: number,
    modality: ModalityModel,
    studentQt: number
  };

  constructor(private calendarService: CalendarService, private modalController: ModalController,
    private modalityContainer: ModalityContainerService, private professionalContainer: ProfessionalContainerService) {
    this.resetInputTemplate();
  }

  ngAfterViewInit() {
    this.selectableComponentQuery._results.forEach((selectableComponent: IonicSelectableComponent) => {
      selectableComponent.searchPlaceholder = "Procurar";
      selectableComponent.closeButtonText = "Cancelar";
      selectableComponent.addButtonText = "Adicionar";
    });
  }

  async closeModal() {
    let onClosedData = 'modal fechou';
    await this.modalController.dismiss(onClosedData);
  }

  validateNext() {
    let vMod = this.inputTemplate.modality != null;
    let vProf = this.inputTemplate.professional != null;
    let vDuration = this.inputTemplate.duration > 0;
    let vStudentQt = this.inputTemplate.studentQt > 0;
    if (vProf && vDuration && vMod && vStudentQt)
      return true;
    return false;
  }

  validateTot() {
    return true;
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

  resetPeriods() {
    this.periods = new Array();
  }

  onEventSelected(event) {
    console.log(event);
  }

  log(...args) {
    for(let arg of args) {
      console.log(arg)
    }
  }

  onTimeSelected(ev: {events: any, time: Date}) {
    let start = ev.time;
    let end = new Date();
    end.setMinutes(start.getMinutes() + this.inputTemplate.duration);
    let period = { startTime: start, endTime: end}
    this.periods.push(period);
    this.calendarComponent.loadEvents();
  }

  addModality(mod: string) {
    this.modalityContainer.addModality(new ModalityModel(mod));
  }

  addProfessional(pro: string) {
    this.professionalContainer.addProfessional(new ProfessionalModel(pro));
  }

  addEvent() {
    let classes: ClassModel[] = [];
    this.inputTemplate.days.forEach((dayValue, dayIndex) => {
      if (dayValue) {
        for (let i = 0; i < this.inputTemplate.weekRepeat + 1; i++) {
          for (let j = 0; j < this.inputTemplate.classQt; j++) {
            let prof = this.inputTemplate.professional;

            let start = new Date();
            start.setDate(start.getDate() + (((7 - start.getDay()) % 7 + dayIndex) % 7) + i * 7);
            start.setHours(+this.inputTemplate.startTime.slice(11, 13));
            start.setMinutes(+this.inputTemplate.startTime.slice(14, 16) + this.inputTemplate.duration * j);
            start.setSeconds(55, 0);

            let end = new Date(start);
            end.setMinutes(start.getMinutes() + this.inputTemplate.duration, 0, 0);

            let mod = this.inputTemplate.modality;

            let newClass = new ClassModel(
              prof,
              start, end,
              mod,
              [],
              this.inputTemplate.studentQt
            );
            classes.push(newClass);
          }
        }
      }
    });
    this.calendarService.addClasses(classes);
    this.resetInputTemplate();
    this.closeModal();
  }
}
