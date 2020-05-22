import * as firebase from 'firebase';

// faz a relação entre estudantes e aulas
export class StudentAlocationModel {
    uid: string; // id do objeto adquirido pelo firebase
    classUID: string; // uid da aula
    studentUID: string; // uid do estudante
    daysRep: firebase.firestore.Timestamp[]; // dias em que essa relação se aplica; se null então deve repetir indefinidamente de acordo com weekdaysRep
    weekdaysRep: number[]; // dias da semana em que essa relação se aplica; repete nos dias de numero 0 a 6, se null então só se aplica aos dias em daysRep
    daysException: firebase.firestore.Timestamp[]; // dias em que essas regras nao se aplicam

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