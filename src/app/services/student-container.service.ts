import { Injectable } from '@angular/core';
import { StudentModel } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentContainerService {
  private students: StudentModel[];

  constructor() { }

  getModalities() {
    return this.students;
  }

  addModality(stud: StudentModel) {
    this.students.push(stud);
  }
}
