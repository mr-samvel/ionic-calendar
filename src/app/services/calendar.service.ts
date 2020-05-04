import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { ClassModel, DBClassTemplate } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { UserModel } from '../models/user.model';
import { ProfessionalContainerService } from './professional-container.service';
import { StudentContainerService } from './student-container.service';
import { ModalityContainerService } from './modality-container.service';
import { StudentClassModel } from '../models/student-class.model';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private dbClassesRef: AngularFirestoreCollection<DBClassTemplate>;
  private dbClasses: Array<DBClassTemplate> = new Array();
  private goneUIDs: Map<string, Date> = new Map();

  private studentClassesRef: AngularFirestoreCollection<StudentClassModel>;
  private studentClassArray: Array<StudentClassModel> = new Array();

  private eventSourceSubject: BehaviorSubject<ClassModel[]>;
  private eventSource: Array<ClassModel> = new Array();
  private calendarOptions: { viewTitle: string, mode: 'month' | 'week' | 'day', currentDate: Date } = {
    viewTitle: '',
    mode: 'week',
    currentDate: new Date()
  };

  constructor(private modalController: ModalController, private afStore: AngularFirestore, private modalityContainer: ModalityContainerService,
    private professionalContainer: ProfessionalContainerService, private studentContainer: StudentContainerService, ) {
    this.eventSourceSubject = new BehaviorSubject<ClassModel[]>(this.eventSource);
    this.dbClassesRef = this.afStore.collection<DBClassTemplate>('Events');
    this.studentClassesRef = this.afStore.collection<StudentClassModel>('StudentClass');
    this.monitorDBEventChanges().then(() => this.monitorAlocatedStudents());
  }

  private monitorDBEventChanges() {
    return new Promise(resolve => {
      this.dbClassesRef.snapshotChanges().subscribe(
        (retrieved) => {
          let tmpClasses: DBClassTemplate[] = new Array();
          for (let cl of retrieved) {
            let dbClass: DBClassTemplate = { uid: cl.payload.doc.id, ...cl.payload.doc.data() } as DBClassTemplate;
            tmpClasses.push(dbClass);
            if (Array.from(this.goneUIDs.keys()).includes(dbClass.uid))
              continue;
            this.goneUIDs.set(dbClass.uid, new Date());
          }

          this.deleteObsoleteClasses(tmpClasses);
          this.dbClasses = tmpClasses;
          this.checkForNewClasses(new Date());
          resolve();
        }
      );
    });
  }

  private monitorAlocatedStudents() {
    this.studentClassesRef.snapshotChanges().subscribe((retrieved) => {
      for (let sc of retrieved) {
        let scObject: StudentClassModel = { uid: sc.payload.doc.id, ...sc.payload.doc.data() } as StudentClassModel;
        if (!this.studentClassArray.some(e => e == scObject)) {
          this.updateStudentClassArray(scObject);
        }
      }
      this.alocateStudents();
    });
  }

  private alocateStudents() {
    for (let ev of this.eventSource) {
      ev.students = new Array();
      ev.students = ev.students.concat(this.checkStudentsOfClass(ev));
    }
  }

  private updateStudentClassArray(scObject: StudentClassModel) {
    let oldSCIndex = this.studentClassArray.findIndex(e => e.uid == scObject.uid);
    if (oldSCIndex !== -1)
      this.studentClassArray.splice(oldSCIndex, 1);
    let clone = Object.assign({}, scObject);
    this.studentClassArray.push(clone);
  }

  private checkStudentsOfClass(event: ClassModel): UserModel[] {
    let students: UserModel[] = new Array();
    for (let sc of this.studentClassArray) {
      if (sc.classUID != event.uid)
        continue;
      let exceptions: Date[] = new Array();
      if (sc.daysException)
        sc.daysException.forEach(e => {
          exceptions.push(e.toDate());
        });
      if (exceptions.some(e => e.getTime() == event.startTime.getTime()))
        continue;
      if (sc.daysRep) {
        for (let d of sc.daysRep) {
          let date = d.toDate();
          if (event.startTime.getTime() == date.getTime() &&
            !event.students.some(s => s.uid == sc.studentUID) &&
            !students.some(s => s.uid == sc.studentUID)
          )
            students.push(this.studentContainer.getStudentByUID(sc.studentUID));
        }
      }
      if (sc.weekdaysRep) {
        for (let trueDay of sc.weekdaysRep) {
          if (event.startTime.getDay() == trueDay &&
            !event.students.some(s => s.uid == sc.studentUID) &&
            !students.some(s => s.uid == sc.studentUID)
          )
            students.push(this.studentContainer.getStudentByUID(sc.studentUID));
        }
      }
    }
    return students;
  }

  private addEvents(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.push(event);
    }
    this.eventSourceSubject.next(this.eventSource);
  }
  private deleteEvents(events: Array<ClassModel>) {
    for (let event of events) {
      this.eventSource.splice(this.eventSource.indexOf(event), 1);
    }
    this.eventSourceSubject.next(this.eventSource);
  }

  private deleteObsoleteClasses(newClasses: DBClassTemplate[]) {
    for (let [index, cl] of this.dbClasses.entries()) {
      if (!newClasses.some((tmpCl) => tmpCl.uid == cl.uid)) {
        this.dbClasses.splice(index, 1);
        this.goneUIDs.delete(cl.uid);
        this.eventSource = this.eventSource.filter((obj) => obj.uid != cl.uid);
      }
    }
    this.eventSourceSubject.next(this.eventSource);
  }
  private deleteDBClass(uid: string) {
    return this.dbClassesRef.doc(uid).delete();
  }

  private checkForNewClasses(selectedDate: Date) {
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

  private translateDBClassToEvents(dbClass: DBClassTemplate, startDate: Date, finalDate: Date): ClassModel[] {
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
        if (dbClass.exceptionDays)
          if (dbClass.exceptionDays.some(d => d.toDate().getTime() == cloneStTime.getTime())) {
            startTime.setDate(startTime.getDate() + 7);
            endTime.setDate(endTime.getDate() + 7);
            continue;
          }
        let newClass = new ClassModel(
          dbClass.uid,
          this.professionalContainer.getProfessionalByUID(dbClass.professionalUID),
          cloneStTime, cloneEndTime,
          this.modalityContainer.getModalityByUID(dbClass.modalityUID),
          [], dbClass.studentQt
        );
        newClass.students = newClass.students.concat(this.checkStudentsOfClass(newClass));
        newEvents.push(newClass);
        startTime.setDate(startTime.getDate() + 7);
        endTime.setDate(endTime.getDate() + 7);
      }
    }
    return newEvents;
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

  pushClassesToDB(events: Array<DBClassTemplate>) {
    for (let event of events) {
      const uid = this.afStore.createId();
      event.uid = uid;

      const clone: any = Object.assign({}, event);

      delete clone.uid;
      this.dbClassesRef.doc(uid).set(clone);
    }
  }

  addStudentsToClasses(studentsArray: Array<UserModel>, eventUID: string, day: Date, weekday: number, exceptions: Date[]) {
    for (let student of studentsArray) {
      let scArray = this.studentClassArray.filter(e => e.studentUID == student.uid);
      let scEvent = scArray.find(e => e.classUID == eventUID);
      if (scEvent) { // update
        if (day) {
          if (!scEvent.daysRep)
            scEvent.daysRep = [firebase.firestore.Timestamp.fromDate(day)];
          else
            scEvent.daysRep.push(firebase.firestore.Timestamp.fromDate(day));
          if (scEvent.daysException) {
            let iE = scEvent.daysException.findIndex(e => e.toDate().getTime() == day.getTime());
            if (iE != -1)
              scEvent.daysException.splice(iE, 1);
          }
        }
        else if (weekday)
          if (!scEvent.weekdaysRep)
            scEvent.weekdaysRep = [weekday];
          else if (!scEvent.weekdaysRep.includes(weekday))
            scEvent.weekdaysRep.push(weekday);
          if (scEvent.daysException) {
            for (let [iE, dE] of scEvent.daysException.entries()) {
              if (dE.toDate().getDay() == weekday)
                scEvent.daysException.splice(iE, 1);
            }
          }
        if (exceptions)
          exceptions.forEach(exc => scEvent.daysException.push(firebase.firestore.Timestamp.fromDate(exc)));
      } else { // create
        let uid = this.afStore.createId();
        if (day)
          scEvent = new StudentClassModel(uid, eventUID, student.uid, [day], null, exceptions);
        else if (weekday)
          scEvent = new StudentClassModel(uid, eventUID, student.uid, null, [weekday], exceptions);
      }
      let clone = Object.assign({}, scEvent);
      delete clone.uid;
      this.studentClassesRef.doc(scEvent.uid).set(clone);
    }
  }

  removeStudentsFromClasses(studentsArray: UserModel[], eventUID: string, exceptionDay: Date, exceptionWeekday: number) {
    for (let student of studentsArray) {
      let scArray = this.studentClassArray.filter(e => e.studentUID == student.uid);
      let scEvent = scArray.find(e => e.classUID == eventUID);
      if (scEvent) {
        if (exceptionDay) {
          if (scEvent.daysRep) {
            let iDayRep = scEvent.daysRep.findIndex(e => e.toDate().getTime() == exceptionDay.getTime());
            if (iDayRep > -1)
              scEvent.daysRep.splice(iDayRep, 1);
          }
          if (scEvent.weekdaysRep) {
            let exc = firebase.firestore.Timestamp.fromDate(exceptionDay);
            if (scEvent.daysException)
              scEvent.daysException.push(exc);
            else
              scEvent.daysException = [exc];
          }
        }
        if (exceptionWeekday) {
          if (scEvent.weekdaysRep) {
            let iWeekdayRep = scEvent.weekdaysRep.findIndex(e => e == exceptionWeekday);
            if (iWeekdayRep > -1)
              scEvent.weekdaysRep.splice(iWeekdayRep, 1);
          }
          if (scEvent.daysRep) {
            let removes = new Array();
            for (let [index, d] of scEvent.daysRep.entries()) {
              let day = d.toDate();
              if (day.getDay() == exceptionWeekday)
                removes.push(index);
            }
            for (let r of removes)
              scEvent.daysRep.splice(r, 1);
          }
        }
        if (!scEvent.daysRep && !scEvent.weekdaysRep && scEvent.daysException) // limpar
          scEvent.daysException = null;
      }
      let clone = Object.assign({}, scEvent);
      delete clone.uid;
      this.studentClassesRef.doc(scEvent.uid).set(clone);
    }
  }

  addClassExceptionDay(exceptionEvent: ClassModel) {
    let foundDBClass = this.dbClasses.find(e => e.uid == exceptionEvent.uid);
    let excepTimestamp = firebase.firestore.Timestamp.fromDate(exceptionEvent.startTime);
    if (foundDBClass.exceptionDays)
      foundDBClass.exceptionDays.push(excepTimestamp);
    else 
      foundDBClass.exceptionDays = [excepTimestamp];

    this.deleteEvents([exceptionEvent]);
    return this.dbClassesRef.doc(foundDBClass.uid).update({"exceptionDays": foundDBClass.exceptionDays});
  }

  deleteClassWeekdayRepetition(event: ClassModel) {
    let i = this.dbClasses.findIndex(e => e.uid == event.uid);
    this.dbClasses[i].weekday[event.startTime.getDay()] = false;

    let deletes = new Array();
    for (let ev of this.eventSource) {
      let vDate = ev.startTime.getDay() == event.startTime.getDay();
      let vUID = ev.uid == event.uid;
      if (vDate && vUID)
        deletes.push(ev);
    }
    this.deleteEvents(deletes);
    if (this.dbClasses[i].weekday.includes(true))
      return this.dbClassesRef.doc(this.dbClasses[i].uid).update({ "weekday": this.dbClasses[i].weekday });
    return this.deleteDBClass(this.dbClasses[i].uid);
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
