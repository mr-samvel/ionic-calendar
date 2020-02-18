import { Component, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CalendarService } from 'src/app/services/calendar.service';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { StudentModel } from 'src/app/models/student.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ClassModel } from 'src/app/models/event.model';
import { ProfessionalContainerService } from 'src/app/services/professional-container.service';
import { ModalityContainerService } from 'src/app/services/modality-container.service';

@Component({
  selector: 'app-alocate-students',
  templateUrl: './alocate-students.page.html',
  styleUrls: ['./alocate-students.page.scss'],
})
export class AlocateStudentsPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  private events: Map<ClassModel, boolean> = new Map();
  public filteredEvents: Array<ClassModel>;

  public collapseStudents: boolean;
  public collapseFilters: boolean;

  public selectedStudents: Array<StudentModel>;

  public currentDate: Date;
  public viewTitle: string;

  constructor(private modalController: ModalController, private calendarService: CalendarService,
    private studentsContainer: StudentContainerService, private professionalsContainer: ProfessionalContainerService,
    private modalitiesContainer: ModalityContainerService,
    private toastController: ToastController, private alertController: AlertController) {
    this.currentDate = new Date();
    this.viewTitle = '';
    this.resetAll();
    this.calendarService.getEventSourceObservable().subscribe(eventSrc => {
      this.filteredEvents = eventSrc;
      for (let i in eventSrc) {
        this.events.set(eventSrc[i], false);
      }
    });
  }

  ngAfterViewInit() {
    this.selectableComponentQuery._results.forEach((selectableComponent: IonicSelectableComponent) => {
      selectableComponent.clearButtonText = "Limpar";
      selectableComponent.searchPlaceholder = "Procurar";
      selectableComponent.closeButtonText = "Cancelar";
      selectableComponent.addButtonText = "Novo";
    });
    this.calendarComponent.loadEvents();
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


  resetAll() {
    this.collapseStudents = false;
    this.collapseFilters = false;
    this.selectedStudents = new Array();
  }

  changeTitle(title) {
    this.viewTitle = title;
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

  filterByPro(pro: string) {
    if (pro) {
      this.events.forEach((value: boolean, key: ClassModel) => {
        if (pro != key.professional.name)
          this.filteredEvents.splice(this.filteredEvents.indexOf(key), 1);
      });
    }
  }

  filterByMod(mod: string) {
    if (mod) {
      this.events.forEach((value: boolean, key: ClassModel) => {
        if (mod != key.modality.name)
          this.filteredEvents.splice(this.filteredEvents.indexOf(key), 1);
      });
    }
  }

  applyFilters(pro: string, mod: string) {
    this.filterByPro(pro);
    this.filterByMod(mod);
    this.calendarComponent.loadEvents();
  }

  clearFilters() {
    this.filteredEvents = Array.from(this.events.keys());
    this.calendarComponent.loadEvents();
  }

  private async selectClasses(ev: ClassModel) {
    const alert = await this.alertController.create({
      header: 'Adicionar às aulas?',
      message: `Selecionar todas as aulas de ${ev.modality.name}, 
        do(a) profissional ${ev.professional.name}, às ${ev.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${ev.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.events.set(ev, true);
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.events.forEach((value: boolean, key: ClassModel) => {
              let vDate = key.startTime.toLocaleDateString(undefined, { weekday: 'long' }) == ev.startTime.toLocaleDateString(undefined, { weekday: 'long' });
              let vStartHour = key.startTime.getHours() == ev.startTime.getHours();
              let vStartMinute = key.startTime.getMinutes() == ev.startTime.getMinutes();
              let vEndHour = key.endTime.getHours() == ev.endTime.getHours();
              let vEndMinute = key.endTime.getMinutes() == ev.endTime.getMinutes();
              let vProf = key.professional.name == ev.professional.name;
              let vMod = key.modality.name == ev.modality.name;
              if (vDate && vStartHour && vStartMinute && vEndHour && vEndHour && vEndMinute && vProf && vMod)
                this.events.set(key, true);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async deselectClasses(ev: ClassModel) {
    const alert = await this.alertController.create({
      header: 'Desselecionar as aulas?',
      message: `Desselecionar todas as aulas de ${ev.modality.name}, 
        do(a) profissional ${ev.professional.name}, às ${ev.startTime.toLocaleTimeString().slice(0, 5)} - 
        ${ev.startTime.toLocaleDateString(undefined, { weekday: 'long' })}?`,
      buttons: [
        {
          text: 'Não, apenas essa',
          handler: () => {
            this.events.set(ev, false);
          }
        }, {
          text: 'Sim',
          handler: () => {
            this.events.forEach((value: boolean, key: ClassModel) => {
              let vDate = key.startTime.toLocaleDateString(undefined, { weekday: 'long' }) == ev.startTime.toLocaleDateString(undefined, { weekday: 'long' });
              let vStartHour = key.startTime.getHours() == ev.startTime.getHours();
              let vStartMinute = key.startTime.getMinutes() == ev.startTime.getMinutes();
              let vEndHour = key.endTime.getHours() == ev.endTime.getHours();
              let vEndMinute = key.endTime.getMinutes() == ev.endTime.getMinutes();
              let vProf = key.professional.name == ev.professional.name;
              let vMod = key.modality.name == ev.modality.name;
              if (vDate && vStartHour && vStartMinute && vEndHour && vEndHour && vEndMinute && vProf && vMod)
                this.events.set(key, false);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async onEventSelected(ev: ClassModel) {
    if (!this.events.get(ev)) {
      if (this.selectedStudents.length <= (ev.studentQt - ev.students.length)) {
        return this.selectClasses(ev);
      } else {
        this.presentToast('Erro: mais alunos do que o máximo', 'danger');
      }
    } else
      return this.deselectClasses(ev);
  }

  submit() {
    let sendArray: ClassModel[] = new Array();
    this.events.forEach((value: boolean, key: ClassModel) => {
      if (value)
        sendArray.push(key);
    });
    this.calendarService.addStudentsToClasses(this.selectedStudents, sendArray);
    this.resetAll();
    this.closeModal();
  }
}
