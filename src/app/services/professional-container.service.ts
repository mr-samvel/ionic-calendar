import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalContainerService {
  private professionals: UserModel[];
  private usersRef: AngularFirestoreCollection<UserModel>;

  constructor(private afStore: AngularFirestore) { 
    this.usersRef = this.afStore.collection<UserModel>('Users');
    this.subscribeToProfessionalsFromDB();
  }

  private subscribeToProfessionalsFromDB() {
    this.usersRef.snapshotChanges().subscribe((retrieved) => {
      let tmpArray: UserModel[] = new Array();
      for(let u of retrieved) {
        let user: UserModel = {uid: u.payload.doc.id, ...u.payload.doc.data()};
        if (user.roles.includes(UserModel.PROFESSIONAL_PROFILE))
          tmpArray.push(user);
      }
      this.professionals = tmpArray;
    });
  }

  getProfessionals() {
    return this.professionals;
  }

  // addProfessional(prof: ProfessionalModel) {
  //   this.professionals.push(prof);
  // }
}
