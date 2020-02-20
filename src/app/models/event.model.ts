import { IEvent } from 'ionic2-calendar/calendar';
import { ProfessionalModel } from './professional.model';
import { ModalityModel } from './modality.model';
import { StudentModel } from './student.model';

export class EventModel implements IEvent {
    // Esses atributos implementam a interface IEvent do componente ionic2-calendar
    title: string;
    startTime: Date;
    endTime: Date;
    allDay: boolean;

    constructor(title: string, startTime: Date, endTime: Date, allDay: boolean) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
    }
}

export class ClassModel {
    // implementar isso é o que nos interessa.
    professional: ProfessionalModel;
    startTime: Date;
    endTime: Date;
    modality: ModalityModel;
    students: Array<StudentModel>;
    studentQt: number;

    constructor(prof: ProfessionalModel, start: Date, end: Date, modality: ModalityModel, students: StudentModel[], studentQt: number) {
        this.professional = prof;
        this.startTime = start;
        this.endTime = end;
        this.modality = modality;
        this.students = students;
        this.studentQt = studentQt;
     }
}