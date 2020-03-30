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
  private dbClasses: Array<DBClassTemplate> = new Array();
  private goneUIDs: Map<string, Date> = new Map();

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
    this.monitorDBEventChanges();
  }

  monitorDBEventChanges() {
    this.eventsRef.snapshotChanges().subscribe((retrieved) => {
      for (let cl of retrieved) {
        let dbClass: DBClassTemplate = {uid: cl.payload.doc.id, ...cl.payload.doc.data()} as DBClassTemplate;
        let found = false;
        for (let uid of this.goneUIDs.keys())
          if (dbClass.uid == uid) {
            found = true;
            break;
          }
        if (found)
          continue;
        this.goneUIDs.set(dbClass.uid, new Date());
        this.dbClasses.push(dbClass);
      }
      this.checkForNewClasses(new Date());
    });
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
      event.uid = uid;

      const clone: any = Object.assign({}, event);
      
      clone.professional = event.professional.name; 
      clone.modality = event.modality.name;
      clone.students = [];
      
      delete clone.uid;
      this.eventsRef.doc(uid).set(clone);
    }
  }

  checkForNewClasses(selectedDate: Date) {
    let now = new Date(selectedDate);
    let finalDate: Date = new Date();
    finalDate.setMonth(finalDate.getMonth() + 1);
    
    for (let dbClass of this.dbClasses) {
      let newEvents: Array<ClassModel> = new Array();
      let found = false;
      for (let [goneUID, goneFinalDate] of this.goneUIDs) {
        if (dbClass.uid == goneUID) {
          found = true;
          if (finalDate > goneFinalDate) {
            this.goneUIDs.set(goneUID, finalDate);
            newEvents = this.translateDBClassToEvents(dbClass, goneFinalDate, finalDate);
          }
          break;
        }
      }
      if (!found) { 
        this.goneUIDs.set(dbClass.uid, finalDate);
        newEvents = this.translateDBClassToEvents(dbClass, now, finalDate);
      }

      if (newEvents.length > 0)
        this.addClasses(newEvents);
    }
  }

  //starttime e endtime estao errados.
  translateDBClassToEvents(dbClass: DBClassTemplate, startDate: Date, finalDate: Date): ClassModel[] {
    let newEvents: ClassModel[] = new Array();
    for (let [dayOfWeek, value] of dbClass.weekday.entries()) {
      if (!value)
        continue;
      let startTime = new Date(startDate);
      while (startTime.getDay() != dayOfWeek)
        startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(+dbClass.startTime.slice(0, 2), +dbClass.startTime.slice(3, 5), 0, 0);
      
      let endTime = new Date(startTime);
      endTime.setHours(+dbClass.endTime.slice(0, 2), +dbClass.endTime.slice(3, 5), 0, 0);

      while(startTime < finalDate) {
        let newClass = new ClassModel(
          dbClass.professional,
          startTime, endTime,
          dbClass.modality, dbClass.students,
          dbClass.students.length
        );
        newEvents.push(newClass);
        startTime.setDate(startTime.getDate() + 7);
        endTime.setDate(startTime.getDate());
      }
    }
    return newEvents;
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
  onTimeSelected(event: { selectedTime: Date, events: ClassModel[] }) {
    console.log('On time selected:', event);
    // load
    // trocar para on range selected
    // this.checkForNewClasses(event.selectedTime);
    // fim load
  }
}
