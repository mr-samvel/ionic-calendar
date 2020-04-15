import * as firebase from 'firebase';

export class StudentClassModel {
    uid: string;
    classUID: string;
    studentUID: string;
    // professionalUID: string; // exceção?
    daysRep: firebase.firestore.Timestamp[]; // se null então deve repetir indefinidamente de acordo com weekdaysRep
    weekdaysRep: boolean[] = new Array(7); // se null então só se aplica aos dias em daysRep

    constructor(uid: string, classUID: string, studentUID: string, daysRep: Date[], weekdaysRep: boolean[]) {
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
    }
}