import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ClassModel } from 'src/app/models/event.model';
import { ModalController, AlertController } from '@ionic/angular';
import { StudentService } from 'src/app/services/student.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage implements AfterViewInit {
  public event: ClassModel;
  private availableStudents: UserModel[] = new Array();

  constructor(private modalController: ModalController, private alertController: AlertController,
    private studentsService: StudentService, private calendarService: CalendarService) { }

  ngAfterViewInit() {
    this.updateAvailableStudents();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  private updateAvailableStudents() {
    for (let student of this.studentsService.getStudents()) {
      if (!this.availableStudents.find(element => element == student) && !this.event.students.find(element => element == student)) {
        this.availableStudents.push(student);
      }
    }
  }

  counter(n: number) {
    return [...Array(n).keys()];
  }

  async addStudent() {
    let inputsArray = new Array();
    for (let student of this.availableStudents) {
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
            this.addToClasses(data);
            this.availableStudents.splice(this.availableStudents.indexOf(data), 1);
          }
        }
      ]
    });
    await alert.present();
  }
  async addToClasses(stud: UserModel) {
    const alert = await this.alertController.create({
      header: 'Adicionar às aulas?',
      message: `Adicionar a todas as aulas de ${this.event.modality.name}, 
        do(a) profissional ${this.event.professional.username}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.studentsService.addStudentsToClasses([stud], this.event.uid, this.event.startTime, null, null);
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.studentsService.addStudentsToClasses([stud], this.event.uid, null, this.event.startTime.getDay(), null);
          }
        }
      ]
    });
    await alert.present();
  }

  async removeStudent(stud: UserModel) {
    const alert = await this.alertController.create({
      header: 'Remover estudante das aulas?',
      message: `Deseja remover ${stud.username} de todas as aulas de ${this.event.modality.name}, 
        do(a) profissional ${this.event.professional.username}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas dessa',
          handler: () => {
            this.studentsService.removeStudentsFromClasses([stud], this.event.uid, this.event.startTime, null);
            this.availableStudents.push(stud);
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.studentsService.removeStudentsFromClasses([stud], this.event.uid, null, this.event.startTime.getDay());
            this.availableStudents.push(stud);
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
          this.confirmDeleteClassAlert();
      });
    } else
      return this.confirmDeleteClassAlert();
  }
  private async confirmDeleteClassAlert() {
    const delAlert = await this.alertController.create({
      header: "Cancelar aulas",
      message: `Deseja cancelar todas as aulas de ${this.event.modality.name}, 
      do(a) profissional ${this.event.professional.username}, às ${this.event.startTime.toLocaleTimeString().slice(0, 5)} - 
      ${this.event.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: "Não, somente essa",
          handler: () => {
            this.calendarService.addClassExceptionDay(this.event);
            this.closeModal();
          }
        },
        {
          text: "Sim",
          handler: () => {
            this.calendarService.deleteClassWeekdayRepetition(this.event);
            this.closeModal();
          }
        }
      ]
    });
    await delAlert.present();
  }
}
