import * as firebase from 'firebase';

export class StudentClassModel {
    uid: string;
    classUID: string;
    studentUID: string;
    // professionalUID: string; // exceção?
    daysRep: firebase.firestore.Timestamp[]; // se null então deve repetir indefinidamente de acordo com weekdaysRep
    weekdaysRep: number[]; // repete nos dias de numero 0 a 6, se null então só se aplica aos dias em daysRep
    daysException: firebase.firestore.Timestamp[];

    constructor(uid: string, classUID: string, studentUID: string, daysRep: Date[], weekdaysRep: number[], daysException: Date[]) {
        this.uid = uid;
        this.classUID = classUID;
        this.studentUID = studentUID;
        this.daysRep = new Array();
        if (daysRep)
            daysRep.forEach(day => {
                this.daysRep.push(firebase.firestore.Timestamp.fromDate(day));
            });
        else 
            this.daysRep = null;
        this.weekdaysRep = weekdaysRep;
        this.daysException = new Array();
        if (daysException)
            daysException.forEach(day => {
                this.daysException.push(firebase.firestore.Timestamp.fromDate(day));
            });
        else 
            this.daysException = null;
    }   
}