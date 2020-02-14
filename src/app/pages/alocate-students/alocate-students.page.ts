import { Component, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CalendarService } from 'src/app/services/calendar.service';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { StudentModel } from 'src/app/models/student.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ClassModel } from 'src/app/models/event.model';

@Component({
  selector: 'app-alocate-students',
  templateUrl: './alocate-students.page.html',
  styleUrls: ['./alocate-students.page.scss'],
})
export class AlocateStudentsPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public events: Map<ClassModel, boolean> = new Map();
  public eventsArray: Array<ClassModel>;

  public collapseStudents: boolean = false;
  public collapseFilters: boolean = true;

  public selectedStudents: Array<StudentModel>;

  public currentDate: Date;
  public viewTitle: string;

  constructor(private modalController: ModalController, private calendarService: CalendarService,
    private studentsContainer: StudentContainerService, private toastController: ToastController,
    private alertController: AlertController) {
    this.currentDate = new Date();
    this.viewTitle = '';
    this.resetAll();
  }

  ngAfterViewInit() {
    this.selectableComponentQuery._results.forEach((selectableComponent: IonicSelectableComponent) => {
      selectableComponent.clearButtonText = "Limpar";
      selectableComponent.searchPlaceholder = "Procurar";
      selectableComponent.closeButtonText = "Cancelar";
      selectableComponent.addButtonText = "Novo";
    });
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      setTimeout(() => {
        for (let i in eventSrc) {
          this.events.set(eventSrc[i], false);
        }
        this.calendarComponent.loadEvents();
      }, 0);
    });
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color
    });
    return toast.present();
  }

  toEventArray() {
    return Array.from(this.events.keys());
  }

  resetAll() {
    this.collapseStudents = false;
    this.collapseFilters = true;
    this.selectedStudents = new Array();
  }

  addStudent(stud: string) {
    this.studentsContainer.addStudent(new StudentModel(stud));
  }

  validateStudentSelectable() {
    let error: boolean = false;
    this.events.forEach((value: boolean, ev: ClassModel) => {
      if (value) {
        if (this.selectedStudents.length > (ev.studentQt - ev.students.length)) {
          error = true;
          this.events.set(ev, false);
        }
      }
    });
    if (error)
      this.presentToast('Os eventos que ficariam superlotados foram desmarcados', 'warning')
  }

  isSelected(ev: ClassModel) {
    return this.events.get(ev);
  }

  async onEventSelected(ev: ClassModel) {
    if (!this.events.get(ev)) {
      if (this.selectedStudents.length <= (ev.studentQt - ev.students.length)) {
        const alert = await this.alertController.create({
          header: 'Adicionar às próximas aulas?',
          message: `Alocar os alunos em todas as próximas aulas de ${ev.modality.name}, 
            do(a) profissional ${ev.professional.name}, às ${ev.startTime.toLocaleTimeString().slice(0, 5)} - 
            ${ev.startTime.toLocaleDateString(undefined, {weekday: 'long'})}?`,
          buttons: [
            {
              text: 'Não, apenas nessa',
              handler: () => {
                this.events.set(ev, true);
              }
            }, {
              text: 'Sim',
              handler: () => {
                this.events.forEach((value: boolean, key: ClassModel) => {
                  if(!value) {
                    let vDate = key.startTime.toLocaleDateString(undefined, {weekday: 'long'}) == ev.startTime.toLocaleDateString(undefined, {weekday: 'long'});
                    let vStartHour = key.startTime.getHours() == ev.startTime.getHours();
                    let vStartMinute = key.startTime.getMinutes() == ev.startTime.getMinutes();
                    let vEndHour = key.endTime.getHours() == ev.endTime.getHours();
                    let vEndMinute = key.endTime.getMinutes() == ev.endTime.getMinutes();
                    let vProf = key.professional.name == ev.professional.name;
                    let vMod = key.modality.name == ev.modality.name;
                    if (vDate && vStartHour && vStartMinute && vEndHour && vEndHour && vEndMinute && vProf && vMod)
                      this.events.set(key, true);
                  }
                });
              }
            }
          ]
        });
        await alert.present();
      } else {
        this.presentToast('Erro: mais alunos do que o máximo', 'danger');
      }
    } else
      this.events.set(ev, false);
  }

  changeTitle(title) {
    this.viewTitle = title;
  }

  log(...args) {
    for (let arg of args) {
      console.log(arg);
    }
  }
}
