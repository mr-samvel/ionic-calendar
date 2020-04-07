import { Injectable } from '@angular/core';
import { ModalityModel } from '../models/modality.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ModalityContainerService {
  private modalities: ModalityModel[];
  private modalitiesRef: AngularFirestoreCollection<ModalityModel>;

  constructor(private afStore: AngularFirestore) { 
    this.modalitiesRef = this.afStore.collection<ModalityModel>('Modalities');
    this.subscribeToModalitiesFromDB();
  }

  private subscribeToModalitiesFromDB() {
    this.modalitiesRef.snapshotChanges().subscribe((retrieved) => {
      let tmpArray: ModalityModel[] = new Array();
      for (let m of retrieved) {
        let modality: ModalityModel = {uid: m.payload.doc.id, ...m.payload.doc.data()};
        tmpArray.push(modality);
      }
      this.modalities = tmpArray;
    })
  }

  getModalities() {
    return this.modalities;
  }

  // addModality(mod: ModalityModel) {
  //   this.modalities.push(mod);
  //   console.log(this.modalities);
  // }
}
