import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassModel, DBClassTemplate } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { ClassDetailsPage } from '../pages/class-details/class-details.page';
import { StudentModel } from '../models/student.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsRef: AngularFirestoreCollection<DBClassTemplate>;
  private eventSourceSubject: BehaviorSubject<ClassModel[]>;
  private eventSource: Array<ClassModel> = new Array();
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };

  constructor(private modalController: ModalController, private afStore: AngularFirestore) {
    this.eventSourceSubject = new BehaviorSubject<ClassModel[]>(this.eventSource);
    this.eventsRef = this.afStore.collection<DBClassTemplate>('Events');
    //monitor db event changes
      // onchange traduzir e addClasses()
  }

  getEventSourceObservable(): BehaviorSubject<ClassModel[]> {
    return this.eventSourceSubject;
  }
  getCalendarMode(): 'month' | 'week' | 'day' {
    return this.calendarOptions.mode;
  }
  getCurrentDate(): Date {
    return this.calendarOptions.currentDate;
  }
  getViewTitle(): string {
    return this.calendarOptions.viewTitle;
  }

  addClasses(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.push(event);
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  pushClassesToDB(events: Array<DBClassTemplate>) {
    for(let event of events) {
      const uid = this.afStore.createId();
      console.log(uid);
      event.uid = uid;

      const clone: any = Object.assign({}, event);
      
      clone.professional = event.professional.name; 
      clone.modality = event.modality.name;
      clone.students = [];
      
      delete clone.uid;
      console.log(clone);
      this.eventsRef.doc(uid).set(clone);
    }
  }

  addStudentsToClasses(studentsArray: Array<StudentModel>, events: Array<ClassModel>) {        
    for (let event of events) {
      this.eventSource[this.eventSource.indexOf(event)].students = this.eventSource[this.eventSource.indexOf(event)].students.concat(studentsArray);
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  today() {
    this.calendarOptions.currentDate = new Date();
  }
  changeMode(mode: 'month' | 'week' | 'day') {
    this.calendarOptions.mode = mode;
  }
  onViewTitleChanged(title) {
    this.calendarOptions.viewTitle = title;
  }
  onEventSelected(event) {
    console.log('Event selected:', event);
  }
  onTimeSelected(event) {
    console.log('On time selected:', event);
  }
}
