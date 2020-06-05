import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { StudentAlocationModel } from '../models/student-alocation.model';
import { ClassModel } from '../models/event.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

// Serviço responsável pelo gerenciamento de alunos.
export class StudentService {
  private students: UserModel[]; // Vetor com todos os users com perfil de alunos resgatados do firebase
  private usersRef: AngularFirestoreCollection<UserModel>; // Referencia da coleção 'Users' no firebase

  private studentAlocationsRef: AngularFirestoreCollection<StudentAlocationModel>; // Referencia da coleção 'StudentAlocation' no firebase
  private studentAlocationsArray: Array<StudentAlocationModel> = new Array(); // Vetor com todos os objetos StudentAlocationModel resgatados do firebase

  constructor(private afStore: AngularFirestore) {
    this.usersRef = this.afStore.collection<UserModel>('Users');
    this.subscribeToStudentsFromDB();
    this.studentAlocationsRef = this.afStore.collection<StudentAlocationModel>('StudentAlocation');
   }
  
  // Se inscreve no observable da coleção 'Users'. Checa os usuários resgatados e adiciona ao vetor alunos se tiver papel de aluno.
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

  // Retorna todos os estudantes
  getStudents() {
    return this.students;
  }
  // Retorna o aluno com aquele uid, se houver
  getStudentByUID(uid: string): UserModel {
    return this.students.find(e => e.uid == uid);
  }
  // Retorna um vetor com os profissionais de acordo com os uids de entrada
  getStudentsByUID(uids: string[]): UserModel[] {
    let tmpArray = new Array();
    for(let uid of uids){
      tmpArray.push(this.getStudentByUID(uid));
    }
    return tmpArray;
  }

  //
  addStudent(stud: any) {
    console.log("TODO");
    // this.students.push(stud);
  }

  // Se inscreve no observable da coleção 'StudentAlocation' e atualiza studentAlocationsArray
  // Com o vetor atualizado, chama aloca os alunos nos eventos que são passados no argumento
  monitorAlocatedStudents(evSrc: ClassModel[]) {
    this.studentAlocationsRef.snapshotChanges().subscribe((retrieved) => {
      for (let sc of retrieved) {
        let scObject: StudentAlocationModel = { uid: sc.payload.doc.id, ...sc.payload.doc.data() } as StudentAlocationModel;
        if (!this.studentAlocationsArray.some(e => e == scObject)) {
          this.updateStudentAlocationArray(scObject);
        }
      }
      this.alocateStudents(evSrc);
    });
  }
  // Checa e adiciona os alunos pertencentes às aulas passadas no argumento
  private alocateStudents(eventSource: ClassModel[]) {
    for (let ev of eventSource) {
      ev.students = new Array();
      ev.students = ev.students.concat(this.checkStudentsOfClass(ev));
    }
  }
  // Atualiza studentAlocationsArray, comparando o argumento com os objetos do vetor, removendo duplicados
  private updateStudentAlocationArray(scObject: StudentAlocationModel) {
    let oldSCIndex = this.studentAlocationsArray.findIndex(e => e.uid == scObject.uid);
    if (oldSCIndex !== -1)
      this.studentAlocationsArray.splice(oldSCIndex, 1);
    let clone = Object.assign({}, scObject);
    this.studentAlocationsArray.push(clone);
  }

  // Retorna os alunos pertencentes a aula passada no argumento
  checkStudentsOfClass(event: ClassModel): UserModel[] {
    let students: UserModel[] = new Array();
    for (let sc of this.studentAlocationsArray) {
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

  // Esse método aloca alunos em uma determinada turma (podendo ser um ou vários dias das aulas de mesmo tipo).
  // Instancia e adiciona um novo objeto de StudentAlocationModel/atualiza um já existente, no firebase de acordo com os argumentos passados:
  // studentsArray são os estudantes que vão ser adicionados as aulas (objetos DBClassTemplate no firebase) com o uid correspondente a eventUID
  // se day != null, os alunos são alocados a aula daquele dia específico
  // se weekday != null, os alunos são alocados as aulas que ocorrem no dia com aquele número (0=Domingo, 1=Segunda, etc)
  // se exceptions != null, os alunos não serão alocados nos dias passados neste vetor
  addStudentsToClasses(studentsArray: Array<UserModel>, eventUID: string, day: Date, weekday: number, exceptions: Date[]) {
    console.log(eventUID);
    for (let student of studentsArray) {
      let scArray = this.studentAlocationsArray.filter(e => e.studentUID == student.uid);
      let scEvent = scArray.find(e => e.classUID == eventUID);
      console.log(scEvent);
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
          scEvent = new StudentAlocationModel(uid, eventUID, student.uid, [day], null, exceptions);
        else if (weekday)
          scEvent = new StudentAlocationModel(uid, eventUID, student.uid, null, [weekday], exceptions);
      }
      let clone = Object.assign({}, scEvent);
      delete clone.uid;
      this.studentAlocationsRef.doc(scEvent.uid).set(clone);
    }
  }

  // Esse método desaloca os alunos de uma turma (podendo ser de um ou vários dias das aulas de mesmo tipo).
  // Procura no firebase o objeto StudentAlocationModel correspondente a cada estudante àquela aula e o atualiza de acordo com os argumentos passados:
  // studentsArray são os estudantes que vão ser removidos das aulas (objetos DBClassTemplate no firebase) com o uid correspondente a eventUID
  // se exceptionDay != null, os alunos são desalocados da aula daquele dia específico
  // se exceptionWeekday != null, os alunos são desalocados das aulas que ocorrem no dia com aquele número (0=Domingo, 1=Segunda, etc)
  removeStudentsFromClasses(studentsArray: UserModel[], eventUID: string, exceptionDay: Date, exceptionWeekday: number) {
    for (let student of studentsArray) {
      let scArray = this.studentAlocationsArray.filter(e => e.studentUID == student.uid);
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
      this.studentAlocationsRef.doc(scEvent.uid).set(clone);
    }
  }
}
