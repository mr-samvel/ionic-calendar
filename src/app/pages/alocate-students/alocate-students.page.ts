import { Component, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
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
    private studentsContainer: StudentContainerService, private toastController: ToastController) {
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

  private async presentDangerToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger'
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
        if(this.selectedStudents.length > (ev.studentQt - ev.students.length)) {
          error = true;
          this.events.set(ev, false);
        }
      }
    });
    if (error)
      this.presentDangerToast('Os eventos que ficariam superlotados foram desmarcados')
  }

  isSelected(ev: ClassModel) {
    return this.events.get(ev);
  }

  onEventSelected(ev:ClassModel) {
    if(this.selectedStudents.length <= (ev.studentQt - ev.students.length)) {
      // Adicionar a todas as mesmas classes?
      this.events.set(ev, !this.events.get(ev));
    } else {
      this.presentDangerToast('Erro: mais alunos do que o máximo');
    }
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
