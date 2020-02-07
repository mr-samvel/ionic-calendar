import { Injectable } from '@angular/core';
import { StudentModel } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentContainerService {
  private students: StudentModel[];

  constructor() {
    this.students = new Array();
   }

  getStudents() {
    return this.students;
  }

  addStudent(stud: StudentModel) {
    this.students.push(stud);
  }
}
