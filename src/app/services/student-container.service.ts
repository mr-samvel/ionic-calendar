import { Injectable } from '@angular/core';
import { StudentModel } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentContainerService {
  private students: StudentModel[];

  constructor() {
    this.students = [new StudentModel('Artur'), new StudentModel('Rafael'), new StudentModel('Mauro')];
   }

  getStudents() {
    return this.students;
  }

  addStudent(stud: StudentModel) {
    this.students.push(stud);
  }
}
