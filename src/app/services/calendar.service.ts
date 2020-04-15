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
          resolve(); // haha crimes contra a humanidade haha
        }
      );
    });
  }

  private monitorAlocatedStudents() {
    // TODO
    this.studentClassesRef.snapshotChanges().subscribe((retrieved) => {
      for (let sc of retrieved) {
        let scObject: StudentClassModel = { uid: sc.payload.doc.id, ...sc.payload.doc.data() } as StudentClassModel;
        if (!this.studentClassArray.some(e => JSON.stringify(e) === JSON.stringify(scObject))) {
          // atualizar de acordo com o que for novo
        }
      }
    });
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

  // TODO
  // tem um bug que faz com que alguns dias sejam pulados
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
        newEvents.push(newClass);
        startTime.setDate(startTime.getDate() + 7);
        endTime.setDate(startTime.getDate());
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
          scEvent.weekdaysRep[weekday] = true;
      } else { // create
        let uid = this.afStore.createId();
        if (day)
          scEvent = new StudentClassModel(uid, eventUID, student.uid, [day], null);
        else if (weekday) {
          let weekdayRep = new Array(7).fill(false);
          weekdayRep[weekday] = true;
          scEvent = new StudentClassModel(uid, eventUID, student.uid, null, weekdayRep);
        }
      }
      let clone = Object.assign({}, scEvent);
      delete clone.uid; 
      this.studentClassesRef.doc(scEvent.uid).set(clone);
    }
    // p/ cada estudante
    // checar todos os studentclassmodel e comparar estudante/studUID e eventUID/classUID
    // se sim, adicionar day à dayRep ou weekday a weekdayRep
    // se nao criar novo studentclassmodel e jogar ao servidor
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
