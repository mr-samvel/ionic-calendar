import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { ModalController, AlertController } from '@ionic/angular';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage implements AfterViewInit {
  public event: ClassModel;
  public selectedStudents: UserModel[] = new Array();
  private tempStudents: UserModel[] = new Array();

  constructor(private modalController: ModalController, private alertController: AlertController,
    private studentsContainer: StudentContainerService, private calendarService: CalendarService) { }

  ngAfterViewInit() {
    this.selectedStudents = new Array();
    this.updateTempStudents();
  }

  async closeModal() {
    await this.modalController.dismiss();
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
        name: student.username,
        type: 'radio',
        label: student.username,
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

  private async addToClasses(studs: UserModel[]) {
    const alert = await this.alertController.create({
      header: 'Adicionar às aulas?',
      message: `Adicionar a todas as aulas de ${this.event.modality.name}, 
        do(a) profissional ${this.event.professional.username}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.calendarService.addStudentsToClasses(studs, this.event.uid, this.event.startTime, null);
            this.closeModal();
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.calendarService.addStudentsToClasses(studs, this.event.uid, null, this.event.startTime.getDay());
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
      do(a) profissional ${this.event.professional.username}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
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
