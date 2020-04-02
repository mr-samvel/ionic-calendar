import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { ModalController, AlertController } from '@ionic/angular';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { StudentModel } from 'src/app/models/student.model';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage implements AfterViewInit {
  public event: ClassModel;
  public selectedStudents: StudentModel[] = new Array();
  private tempStudents: StudentModel[] = new Array();

  constructor(private modalController: ModalController, private alertController: AlertController,
    private studentsContainer: StudentContainerService, private calendarService: CalendarService) { }

  ngAfterViewInit() {
    this.selectedStudents = new Array();
    this.updateTempStudents();
  }

  async closeModal() {
    let onClosedData = 'modal fechou';  
    await this.modalController.dismiss(onClosedData);
  }

  private updateTempStudents() {
    for (let student of this.studentsContainer.getStudents()) {
      if (!this.tempStudents.find(element => element == student) && !this.event.students.find(element => element == student)) {
        this.tempStudents.push(student);
      }
    }
  }

  counter(n: number) {
    return [...Array(n).keys()];
  }

  async addStudent() {
    let inputsArray = new Array();
    for (let student of this.tempStudents) {
      inputsArray.push({
        name: student.name,
        type: 'radio',
        label: student.name,
        value: student,
        checked: false
      })
    }
    const alert = await this.alertController.create({
      header: 'Adicionar estudante',
      inputs: inputsArray,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Adicionar',
          handler: (data) => {
            this.selectedStudents.push(data);
            this.tempStudents.splice(this.tempStudents.indexOf(data), 1);
          }
        }
      ]
    });
    await alert.present();
  }

  submit() {
    let temp = this.selectedStudents;
    this.selectedStudents = new Array();
    this.addToClasses(temp);
  }

  private async addToClasses(studs: StudentModel[]) {
    let eventSource: ClassModel[];
    let selectedEvents: ClassModel[] = new Array();
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      eventSource = eventSrc;
    });
    const alert = await this.alertController.create({
      header: 'Adicionar às aulas?',
      message: `Adicionar a todas as aulas de ${this.event.modality.name}, 
        do(a) profissional ${this.event.professional.name}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.calendarService.addStudentsToClasses(studs, [this.event]);
            this.closeModal();
          }
        }, {
          text: 'Sim',
          handler: () => {
            eventSource.forEach((ev: ClassModel) => {
              let vDate = ev.startTime.toLocaleDateString(undefined, { weekday: 'long' }) == this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' });
              let vStartHour = ev.startTime.getHours() == this.event.startTime.getHours();
              let vStartMinute = ev.startTime.getMinutes() == this.event.startTime.getMinutes();
              let vEndHour = ev.endTime.getHours() == this.event.endTime.getHours();
              let vEndMinute = ev.endTime.getMinutes() == this.event.endTime.getMinutes();
              let vProf = ev.professional.name == this.event.professional.name;
              let vMod = ev.modality.name == this.event.modality.name;
              if (vDate && vStartHour && vStartMinute && vEndHour && vEndHour && vEndMinute && vProf && vMod)
                selectedEvents.push(ev);
            });
            this.calendarService.addStudentsToClasses(studs, selectedEvents);
            this.closeModal();
          }
        }
      ]
    });
    await alert.present();
  }


  async deleteClass() {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let confirmWarning = false;

    if (this.event.startTime < tomorrow) {
      const warning = await this.alertController.create({
        cssClass: "alert-warning",
        header: "Cuidado!",
        message: "Você está cancelando uma aula com pouco tempo para avisar os alunos!\nDeseja continuar?",
        buttons: [
          {
            text: "Não",
            cssClass: "warning-button",
            role: "cancel"
          },
          {
            text: "Sim",
            cssClass: "warning-button",
            handler: () => confirmWarning = true
          }
        ]
      });
      await warning.present();
      warning.onDidDismiss().then(() => {
        if(confirmWarning)
          this.confirmAlert();
      });
    } else
      return this.confirmAlert();
  }
  private async confirmAlert() {
    const delAlert = await this.alertController.create({
      header: "Cancelar aulas",
      message: `Deseja cancelar todas as aulas de ${this.event.modality.name}, 
      do(a) profissional ${this.event.professional.name}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
      ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: "Não, somente essa",
          handler: () => {
            console.log("TODO");
            this.closeModal();
          }
        },
        {
          text: "Sim",
          handler: () => {
            this.calendarService.deleteWeekdayRepetition(this.event);
            this.closeModal();
          }
        }
      ]
    });
    await delAlert.present();
  }

}
