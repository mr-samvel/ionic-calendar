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
  getModalityByUID(uid: string): ModalityModel {
    return this.modalities.find(m => m.uid == uid);
  }
  getModalitiesByUID(uids: string[]): ModalityModel[] {
    let tmpArray = new Array();
    for(let uid of uids){
      tmpArray.push(this.getModalityByUID(uid));
    }
    return tmpArray;
  }

  addModality(mod: ModalityModel) {
    console.log("TODO");
    // this.modalities.push(mod);
    // console.log(this.modalities);
  }
}
