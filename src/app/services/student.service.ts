import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { StudentClassModel } from '../models/student-class.model';
import { ClassModel } from '../models/event.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private students: UserModel[];
  private usersRef: AngularFirestoreCollection<UserModel>;

  private studentClassesRef: AngularFirestoreCollection<StudentClassModel>;
  private studentClassArray: Array<StudentClassModel> = new Array();

  constructor(private afStore: AngularFirestore) {
    this.usersRef = this.afStore.collection<UserModel>('Users');
    this.subscribeToStudentsFromDB();
    this.studentClassesRef = this.afStore.collection<StudentClassModel>('StudentClass');
   }
  
  private subscribeToStudentsFromDB() {
    this.usersRef.snapshotChanges().subscribe((retrieved) => {
      let tmpArray: UserModel[] = new Array();
      for(let u of retrieved) {
        let user: UserModel = {uid: u.payload.doc.id, ...u.payload.doc.data()};
        if (user.roles.includes(UserModel.STUDENT_PROFILE))
          tmpArray.push(user);
      }
      this.students = tmpArray;
    });
  }

  getStudents() {
    return this.students;
  }
  getStudentByUID(uid: string): UserModel {
    return this.students.find(e => e.uid == uid);
  }
  getStudentsByUID(uids: string[]): UserModel[] {
    let tmpArray = new Array();
    for(let uid of uids){
      tmpArray.push(this.getStudentByUID(uid));
    }
    return tmpArray;
  }

  addStudent(stud: any) {
    console.log("TODO");
    // this.students.push(stud);
  }

  monitorAlocatedStudents(evSrc: ClassModel[]) {
    this.studentClassesRef.snapshotChanges().subscribe((retrieved) => {
      for (let sc of retrieved) {
        let scObject: StudentClassModel = { uid: sc.payload.doc.id, ...sc.payload.doc.data() } as StudentClassModel;
        if (!this.studentClassArray.some(e => e == scObject)) {
          this.updateStudentClassArray(scObject);
        }
      }
      this.alocateStudents(evSrc);
    });
  }
  private alocateStudents(eventSource: ClassModel[]) {
    for (let ev of eventSource) {
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

  checkStudentsOfClass(event: ClassModel): UserModel[] {
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
            students.push(this.getStudentByUID(sc.studentUID));
        }
      }
      if (sc.weekdaysRep) {
        for (let trueDay of sc.weekdaysRep) {
          if (event.startTime.getDay() == trueDay &&
            !event.students.some(s => s.uid == sc.studentUID) &&
            !students.some(s => s.uid == sc.studentUID)
          )
            students.push(this.getStudentByUID(sc.studentUID));
        }
      }
    }
    return students;
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
}
