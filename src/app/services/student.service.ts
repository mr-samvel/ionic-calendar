import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private students: UserModel[];
  private usersRef: AngularFirestoreCollection<UserModel>;

  constructor(private afStore: AngularFirestore) {
    this.usersRef = this.afStore.collection<UserModel>('Users');
    this.subscribeToStudentsFromDB();
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
}
