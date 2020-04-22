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
          this.alocateNewStudents(scObject);
          this.unallocateObsoleteStudents(scObject);
          this.updateStudentClassArray(scObject);
        }
      }
    });
  }

  private alocateNewStudents(scObject: StudentClassModel) {
    let evs = this.eventSource.filter(ev => ev.uid == scObject.classUID);
    for (let ev of evs) {
      ev.students = ev.students.concat(this.checkStudentsOfClass(ev, [scObject]));
    }
  }

  private unallocateObsoleteStudents(scObject: StudentClassModel) {
    // TODO
    console.log('TODO');
  }

  private updateStudentClassArray(scObject: StudentClassModel) {
    let oldSCIndex = this.studentClassArray.findIndex(e => e.uid == scObject.uid);
    if (oldSCIndex !== -1)
      this.studentClassArray.splice(oldSCIndex);
    let clone = Object.assign({}, scObject);
    this.studentClassArray.push(clone);
  }

  private checkStudentsOfClass(event: ClassModel, studentClasses: StudentClassModel[]): UserModel[] {
    let students: UserModel[] = new Array();
    for (let sc of studentClasses) {
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
      this.eventSource.splice(this.eventSource.indexOf(event));
    }
    this.eventSourceSubject.next(this.eventSource);
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
        let newClass = new ClassModel(
          dbClass.uid,
          this.professionalContainer.getProfessionalByUID(dbClass.professionalUID),
          cloneStTime, cloneEndTime,
          this.modalityContainer.getModalityByUID(dbClass.modalityUID),
          [], dbClass.studentQt
        );
        let scs = this.studentClassArray.filter(e => e.classUID == newClass.uid);
        newClass.students = newClass.students.concat(this.checkStudentsOfClass(newClass, scs));
        newEvents.push(newClass);
        startTime.setDate(startTime.getDate() + 7);
        endTime.setDate(endTime.getDate() + 7);
      }
    }
    return newEvents;
  }

  private deleteObsoleteClasses(newClasses: DBClassTemplate[]) {
    for (let [index, cl] of this.dbClasses.entries()) {
      if (!newClasses.some((tmpCl) => tmpCl.uid == cl.uid)) {
        this.dbClasses.splice(index);
        this.goneUIDs.delete(cl.uid);
        this.eventSource = this.eventSource.filter((obj) => obj.uid != cl.uid);
      }
    }
    this.eventSourceSubject.next(this.eventSource);
  }
  private deleteClass(uid: string) {
    return this.dbClassesRef.doc(uid).delete();
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

  addStudentsToClasses(studentsArray: Array<UserModel>, eventUID: string, day: Date, weekday: number) {
    for (let student of studentsArray) {
      let scArray = this.studentClassArray.filter(e => e.studentUID == student.uid);
      let scEvent = scArray.find(e => e.classUID == eventUID);
      if (scEvent) { // update
        if (day)
          scEvent.daysRep.push(firebase.firestore.Timestamp.fromDate(day));
        else if (weekday)
          if (!scEvent.weekdaysRep)
            scEvent.weekdaysRep = [weekday];
          else if (!scEvent.weekdaysRep.includes(weekday))
            scEvent.weekdaysRep.push(weekday);
      } else { // create
        let uid = this.afStore.createId();
        if (day)
          scEvent = new StudentClassModel(uid, eventUID, student.uid, [day], null);
        else if (weekday) {
          let weekdayRep = [weekday];
          scEvent = new StudentClassModel(uid, eventUID, student.uid, null, weekdayRep);
        }
      }
      let clone = Object.assign({}, scEvent);
      delete clone.uid;
      this.studentClassesRef.doc(scEvent.uid).set(clone);
    }
  }

  deleteWeekdayRepetition(event: ClassModel) {
    let foundClass = this.dbClasses.find(e => e.uid == event.uid);
    let i = this.dbClasses.indexOf(foundClass);
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
    return this.deleteClass(this.dbClasses[i].uid);
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
