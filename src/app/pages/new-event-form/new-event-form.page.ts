import { Component, OnInit } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { ModalController } from '@ionic/angular';
import { ProfessionalModel } from 'src/app/models/professional.model';
import { ModalityModel } from 'src/app/models/modality.model';

@Component({
  selector: 'app-new-event-form',
  templateUrl: './new-event-form.page.html',
  styleUrls: ['./new-event-form.page.scss'],
})
export class NewEventFormPage implements OnInit {
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

  constructor(private calendarService: CalendarService, private modalController: ModalController) {
    this.resetInputTemplate();
   }

  ngOnInit() {
  }

  async closeModal() {
    let onClosedData = 'modal fechou';
    await this.modalController.dismiss(onClosedData);
  }

  validateForm() {
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
          for (let j = 0; j < this.inputTemplate.classQt; j++) {
            let prof = new ProfessionalModel(this.inputTemplate.professional);

            let start = new Date();
            start.setDate(start.getDate() + (((7 - start.getDay()) % 7 + dayIndex) % 7) + i * 7);
            start.setHours(+this.inputTemplate.startTime.slice(11, 13));
            start.setMinutes(+this.inputTemplate.startTime.slice(14, 16) + this.inputTemplate.duration * j);
            start.setSeconds(55, 0);

            let end = new Date(start);
            end.setMinutes(start.getMinutes() + this.inputTemplate.duration, 0, 0);

            let mod = new ModalityModel(this.inputTemplate.modality);
            
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
