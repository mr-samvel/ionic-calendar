import { Component, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarService } from 'src/app/services/calendar.service';
import { StudentContainerService } from 'src/app/services/student-container.service';
import { StudentModel } from 'src/app/models/student.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CalendarComponent } from 'ionic2-calendar/calendar';

@Component({
  selector: 'app-alocate-students',
  templateUrl: './alocate-students.page.html',
  styleUrls: ['./alocate-students.page.scss'],
})
export class AlocateStudentsPage implements AfterViewInit {
  @ViewChildren(IonicSelectableComponent) private selectableComponentQuery: any;
  @ViewChild(CalendarComponent, { static: false }) calendarComponent: CalendarComponent;

  public events = [];

  public collapseStudents: boolean = false;
  public collapseFilters: boolean = true;

  public selectedStudents: Array<StudentModel>;

  public currentDate: Date;
  public viewTitle: string;

  constructor(private modalController: ModalController, private calendarService: CalendarService,
    private studentsContainer: StudentContainerService) {
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
      this.events = eventSrc;
      this.calendarComponent.loadEvents();
    })
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  resetAll() {
    this.collapseStudents = false;
    this.collapseFilters = true;
    this.selectedStudents = new Array();
  }

  addStudent(stud: string) {
    this.studentsContainer.addStudent(new StudentModel(stud));
  }

  onEventSelected(ev) {
    console.log(ev);
  }

  changeTitle(title) {
    this.viewTitle = title;
  }

}
