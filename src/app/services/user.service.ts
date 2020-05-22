import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

// Serviço responsável pelo gerenciamento de usuários
export class UserService {
  private currentUser: UserModel; // Usuário da sessão atual/logado

  constructor(private afs: AngularFirestore) { }

  // autoexplicativo
  setCurrentUser(user: UserModel) {
    this.currentUser = user;
  }

  // retorna uma promessa que é resolvida com o resgate de um usuário no servidor com o uid correspondente ao passado no argumento
  retrieveUserFromServer(uid): Promise<UserModel> {
    const snapshot = this.afs.collection<UserModel>('Users').doc(uid).get();
    return snapshot.toPromise().then(data => {
      return {
        uid: data.id,
        ...data.data()
      } as UserModel
    });//.catch(() => { return null; });
  }

  // setta o usuário corrente como null
  deleteCurrentUser() {
    this.currentUser = null;
  }

  // retorna o usuário corrente
  getCurrentUser() {
    return this.currentUser;
  }
  // retorna o username do usuário corrente
  getUsername(): string {
    return this.currentUser.username;
  }
}
