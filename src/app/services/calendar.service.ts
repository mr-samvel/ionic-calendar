import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassModel, DBClassTemplate } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private dbClassesRef: AngularFirestoreCollection<DBClassTemplate>;
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
    this.dbClassesRef = this.afStore.collection<DBClassTemplate>('Events');
    this.monitorDBEventChanges();
  }

  monitorDBEventChanges() {
    this.dbClassesRef.snapshotChanges().subscribe((retrieved) => {
      let tmpClasses: DBClassTemplate[] = new Array();
      for (let cl of retrieved) {
        let dbClass: DBClassTemplate = { uid: cl.payload.doc.id, ...cl.payload.doc.data() } as DBClassTemplate;
        tmpClasses.push(dbClass);

        let found = false;
        for (let uid of this.goneUIDs.keys()) {
          if (dbClass.uid == uid) {
            found = true;
            break;
          }
        }
        if (found)
          continue;
        this.goneUIDs.set(dbClass.uid, new Date());
      }

      this.deleteObsoleteClasses(tmpClasses);
      this.dbClasses = tmpClasses;
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

  addEvents(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.push(event);
    }
    this.eventSourceSubject.next(this.eventSource);
  }
  deleteEvents(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.splice(this.eventSource.indexOf(event));
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  pushClassesToDB(events: Array<DBClassTemplate>) {
    for (let event of events) {
      const uid = this.afStore.createId();
      event.uid = uid;

      const clone: any = Object.assign({}, event);

      clone.professional = event.professional.username;
      clone.modality = event.modality.username;
      clone.students = [];

      delete clone.uid;
      this.dbClassesRef.doc(uid).set(clone);
    }
  }

  checkForNewClasses(selectedDate: Date) {
    let now = new Date(selectedDate);
    let finalDate: Date = new Date(selectedDate);
    finalDate.setMonth(finalDate.getMonth() + 1);

    for (let dbClass of this.dbClasses) {
      let newEvents: Array<ClassModel> = new Array();
      let found = false;
      for (let [goneUID, goneFinalDate] of this.goneUIDs) {
        if (dbClass.uid == goneUID) {
          found = true;
          if (finalDate > goneFinalDate && dbClass.endDate.toDate() > finalDate) {
            this.goneUIDs.set(goneUID, finalDate);
            newEvents = this.translateDBClassToEvents(dbClass, goneFinalDate, finalDate);
          } else if (dbClass.endDate.toDate() > goneFinalDate && finalDate > dbClass.endDate.toDate()) {
            this.goneUIDs.set(goneUID, new Date(dbClass.endDate.toDate()));
            newEvents = this.translateDBClassToEvents(dbClass, goneFinalDate, dbClass.endDate.toDate());
          }
          break;
        }
      }
      if (!found) {
        this.goneUIDs.set(dbClass.uid, finalDate);
        newEvents = this.translateDBClassToEvents(dbClass, now, finalDate);
      }

      if (newEvents.length > 0)
        this.addEvents(newEvents);
    }
  }

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

      while (startTime < finalDate) {
        let cloneStTime = new Date(startTime);
        let cloneEndTime = new Date(endTime);
        let newClass = new ClassModel(
          dbClass.uid,
          dbClass.professional,
          cloneStTime, cloneEndTime,
          dbClass.modality,
          dbClass.students, dbClass.studentQt
        );
        newEvents.push(newClass);
        startTime.setDate(startTime.getDate() + 7);
        endTime.setDate(startTime.getDate());
      }
    }
    return newEvents;
  }

  deleteObsoleteClasses(newClasses: DBClassTemplate[]) {
    for (let [index, cl] of this.dbClasses.entries()) {
      if (!newClasses.some((tmpCl) => tmpCl.uid == cl.uid)) {
        this.dbClasses.splice(index);
        this.goneUIDs.delete(cl.uid);
        this.eventSource = this.eventSource.filter((obj) => obj.uid != cl.uid);
      }
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  addStudentsToClasses(studentsArray: Array<StudentModel>, events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource[this.eventSource.indexOf(event)].students = this.eventSource[this.eventSource.indexOf(event)].students.concat(studentsArray);
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  deleteWeekdayRepetition(event: ClassModel) {
    let foundClass = this.dbClasses.find(e => e.uid == event.uid);
    let i = this.dbClasses.indexOf(foundClass);
    this.dbClasses[i].weekday[event.startTime.getDay()] = false;

    let deletes = new Array();
    for (let ev of this.eventSource) {
      let vDate = ev.startTime.toLocaleDateString(undefined, { weekday: 'long' }) == event.startTime.toLocaleDateString(undefined, { weekday: 'long' });
      let vStartHour = ev.startTime.getHours() == event.startTime.getHours();
      let vStartMinute = ev.startTime.getMinutes() == event.startTime.getMinutes();
      let vEndHour = ev.endTime.getHours() == event.endTime.getHours();
      let vEndMinute = ev.endTime.getMinutes() == event.endTime.getMinutes();
      let vProf = ev.professional.name == event.professional.name;
      let vMod = ev.modality.name == event.modality.name;
      if (vDate && vStartHour && vStartMinute && vEndHour && vEndHour && vEndMinute && vProf && vMod)
        deletes.push(ev);
    }
    this.deleteEvents(deletes);
    if (this.dbClasses[i].weekday.includes(true))
      return this.dbClassesRef.doc(this.dbClasses[i].uid).update({ "weekday": this.dbClasses[i].weekday });
    return this.deleteClass(this.dbClasses[i].uid);
  }
  deleteClass(uid: string) {
    return this.dbClassesRef.doc(uid).delete();
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
    // console.log('Event selected:', event);
  }
  onCurrentDateChanged(ev: Date) {
    this.checkForNewClasses(ev);
  }
  onTimeSelected(event: { selectedTime: Date, events: ClassModel[] }) {
    // console.log('On time selected:', event);
  }
}
