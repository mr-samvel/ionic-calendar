import { Injectable } from '@angular/core';
import { ModalityModel } from '../models/modality.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

// Serviço responsável pelo gerenciamento das modalidades
export class ModalityService {
  private modalities: ModalityModel[]; // Vetor com todas as modalidades resgatadas do firebase
  private modalitiesRef: AngularFirestoreCollection<ModalityModel>; // Referencia da coleção 'Modalities' no firebase

  constructor(private afStore: AngularFirestore) { 
    this.modalitiesRef = this.afStore.collection<ModalityModel>('Modalities');
    this.subscribeToModalitiesFromDB();
  }

  // Se inscreve no observable da coleção modalidades e atualiza o vetor modalities de acordo com as mudanças no servidor
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

  // Retorna o vetor modalities
  getModalities() {
    return this.modalities;
  }
  // Retorna a modalidade com o uid igual ao passado no argumento, se existir
  getModalityByUID(uid: string): ModalityModel {
    return this.modalities.find(m => m.uid == uid);
  }
  // Retorna um vetor de modalidades com os uids correspondentes ao vetor de strings de entrada
  getModalitiesByUID(uids: string[]): ModalityModel[] {
    let tmpArray = new Array();
    for(let uid of uids){
      tmpArray.push(this.getModalityByUID(uid));
    }
    return tmpArray;
  }

  // Instancia e adiciona uma nova modalidade ao firebase
  addModality(name: string) {
    const nUID = this.afStore.createId();
    let newMod = new ModalityModel(nUID, name);
    let clone = Object.assign({}, newMod);
    delete clone.uid;
    this.modalitiesRef.doc(nUID).set(clone);
  }
}
