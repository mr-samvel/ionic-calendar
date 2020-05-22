import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

// Serviço responsável pelo gerenciamento de profissionais
export class ProfessionalService {
  private professionals: UserModel[]; // Vetor com todos os users com perfil de profissionais resgatados do firebase
  private usersRef: AngularFirestoreCollection<UserModel>; // Referencia da coleção 'Users' no firebase

  constructor(private afStore: AngularFirestore) { 
    this.usersRef = this.afStore.collection<UserModel>('Users');
    this.subscribeToProfessionalsFromDB();
  }

  // Se inscreve no observable da coleção 'Users'. Checa os usuários resgatados e adiciona ao vetor professionals se tiver papel de profissional.
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

  // Retorna todos os profissionais
  getProfessionals() {
    return this.professionals;
  }
  // Retorna o profissional com aquele uid, se houver
  getProfessionalByUID(uid: string): UserModel {
    return this.professionals.find(p => p.uid == uid);
  }
  // Retorna um vetor com os profissionais de acordo com os uids de entrada
  getProfessionalsByUID(uids: string[]): UserModel[] {
    let tmpArray = new Array();
    for(let uid of uids){
      tmpArray.push(this.getProfessionalByUID(uid));
    }
    return tmpArray;
  }

  //
  addProfessional(prof: any) {
    console.log("TODO");
    // this.professionals.push(prof);
  }
}
