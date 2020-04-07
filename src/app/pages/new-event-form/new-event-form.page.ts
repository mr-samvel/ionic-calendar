import { Component, OnInit, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { DBClassTemplate } from 'src/app/models/event.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { ModalController, Events, ToastController } from '@ionic/angular';
import { ModalityModel } from 'src/app/models/modality.model';
import { ModalityContainerService } from 'src/app/services/modality-container.service';
import { ProfessionalContainerService } from 'src/app/services/professional-container.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ChangePeriodPage } from '../change-period/change-period.page';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-new-event-form',
  templateUrl: './new-event-form.page.html',
  styleUrls: ['./new-event-form.page.scss'],
})
export class NewEventFormPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public segment: string = 'form';

  public periods: { startTime: Date, endTime: Date }[] = [];
  public time = { currentDate: new Date() };

  public inputTemplate: {
    professional: UserModel,
    days: Array<boolean>,
    monthRepeat: number,
    duration: number,
    startTime: string,
    classQt: number,
    modality: ModalityModel,
    studentQt: number
  };

  constructor(private calendarService: CalendarService, private modalController: ModalController,
    private modalityContainer: ModalityContainerService, private professionalContainer: ProfessionalContainerService,
    private toastController: ToastController) {
    this.resetInputTemplate();
  }

  ngAfterViewInit() {
    this.selectableComponentQuery._results.forEach((selectableComponent: IonicSelectableComponent) => {
      selectableComponent.searchPlaceholder = "Procurar";
      selectableComponent.closeButtonText = "Cancelar";
      selectableComponent.addButtonText = "Novo";
    });
  }

  async closeModal() {
    await this.modalController.dismiss();
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
    let vMonthRepeat = this.inputTemplate.monthRepeat != null;
    let vPeriods = this.periods.length > 0;
    if (vMonthRepeat && vPeriods)
      return true;
    return false;
  }

  resetInputTemplate() {
    this.inputTemplate = {
      professional: null,
      days: new Array<boolean>(false, false, false, false, false, false, false),
      monthRepeat: null,
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

  onEventSelected(ev) {
    this.presentChangeModal(ev);
  }

  onTimeSelected(ev: { events: any, time: Date }) {
    if (ev.events.length == 0) {
      let start = ev.time;
      let end = new Date(start);
      end.setMinutes(start.getMinutes() + this.inputTemplate.duration);
      let period = { startTime: start, endTime: end };
      this.periods.push(period);
      this.calendarComponent.loadEvents();
    }
  }

  private async presentChangeModal(ev) {
    const modal = await this.modalController.create({
      component: ChangePeriodPage,
      componentProps: { ev: ev, duration: this.inputTemplate.duration },
      cssClass: 'custom-modal-css'
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        let i = this.periods.indexOf(dataReturned.data.ev);
        if (dataReturned.data.command == 'update') {
          this.periods[i] = dataReturned.data.ev;
        }
        else if (dataReturned.data.command == 'delete') {
          this.periods.splice(i, 1);
        }
        this.calendarComponent.loadEvents();
      }
    });
    return await modal.present();
  }

  private async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success'
    });
    return toast.present();
  }

  addModality(mod: string) {
    console.log("TODO");
    // this.modalityContainer.addModality(new ModalityModel(mod));
  }

  addProfessional(pro: string) {
    console.log("TODO");
    // this.professionalContainer.addProfessional(new ProfessionalModel(pro));
  }

  addEvent() {
    let dbClasses: DBClassTemplate[] = new Array();
    let now = new Date();
    let smallestDay: Date;

    for (let period of this.periods) {
      let days: boolean[] = new Array(7).fill(false);

      if (period.startTime < now) {
        smallestDay = new Date(period.startTime);
        smallestDay.setDate(period.startTime.getDate() + 7);
      } else
        smallestDay = period.startTime;

      for (let i = 0; i < this.periods.length; i++) {
        let oInnerPeriod = this.periods[i];
        if (oInnerPeriod.startTime.toTimeString() == period.startTime.toTimeString()) {
          if (oInnerPeriod.startTime >= now && oInnerPeriod.startTime < smallestDay)
            smallestDay = oInnerPeriod.startTime;
          days[oInnerPeriod.startTime.getDay()] = true;
          if (oInnerPeriod != period)
            delete this.periods[i];
        }
      }

      for (let i = this.periods.length-1; i >= 0; i--) {
        if (this.periods[i] == undefined)
          this.periods.splice(i, 1);
      }

      let startDate: Date = smallestDay;
      let endDate: Date = new Date(startDate);

      if (this.inputTemplate.monthRepeat == 0)
        endDate.setFullYear(startDate.getFullYear() + 1);
      else
        endDate.setMonth(startDate.getMonth() + this.inputTemplate.monthRepeat);

      while(endDate.getDay() != 6)
        endDate.setDate(endDate.getDate() + 1);

      let dbClass = new DBClassTemplate(
        this.inputTemplate.professional, this.inputTemplate.modality,
        [], this.inputTemplate.studentQt,
        startDate, endDate,
        period.startTime.toTimeString(), period.endTime.toTimeString(),
        days
      );
      dbClasses.push(dbClass);
    }

    this.calendarService.pushClassesToDB(dbClasses);
    this.presentSuccessToast('Novas classes adicionadas!');
    this.closeModal();
  }
}
