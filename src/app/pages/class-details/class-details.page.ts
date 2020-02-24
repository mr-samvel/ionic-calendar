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
  private tempStudents: StudentModel[] = new Array();

  constructor(private modalController: ModalController, private alertController: AlertController,
    private studentsContainer: StudentContainerService, private calendarService: CalendarService) { }

  ngAfterViewInit() {
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
            this.calendarService.addStudentsToClasses([data], [this.event]);
            this.tempStudents.splice(this.tempStudents.indexOf(data), 1);
          }
        }
      ]
    });
    await alert.present();
  }

}
