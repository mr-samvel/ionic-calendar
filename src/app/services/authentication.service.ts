import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import { NavController, LoadingController, Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// Serviço responsável pela autenticação/observação do estado do usuário.
export class AuthenticationService {
  private userState: boolean; // Se true, usuário está logado
  private usersRef: AngularFirestoreCollection<UserModel>; // Referencia da coleção 'Users' no firebase
  private recentlyLoggedIn: boolean = false; // Se true, usuário fez login manual nessa seção

  constructor(private userService: UserService, private navCtrl: NavController,
    private afStore: AngularFirestore, private loadingController: LoadingController,
    private gplus: GooglePlus, private platform: Platform, private afAuth: AngularFireAuth,) {
      this.usersRef = this.afStore.collection<UserModel>('Users');
      this.monitorUserStateChanges();
  }
  
  private async presentLoader() {
    (await this.loadingController.create({message: 'Autenticando...'})).present();
  }
  private dismissLoader() {
    this.loadingController.getTop().then(loader => loader.dismiss());
  }

  // monitora e atualiza this.userState de acordo com o estado do usuário (logado ou nao)
  private monitorUserStateChanges() {
    this.afAuth.authState.subscribe(async (user: User) => {
      if (user) {
        this.userState = true;
        if (!this.recentlyLoggedIn) {
          this.presentLoader();
          let dbUser = await this.userService.retrieveUserFromServer(user.uid);
          this.userService.storeCurrentUser(dbUser);
          this.dismissLoader();
        }
      } else {
        this.userState = false;
        this.userService.deleteCurrentUser();
      }
    });
  }

  // chama um popup dentro do aplicativo usando o app da Google p/ fazer login
  // feito o login, retorna a credencial do usuário
  private async nativeGoogleLogin(): Promise<auth.UserCredential> {
    try {
      const gplusUser = await this.gplus.login({
        'webClientId': environment.googleWebClientID,
        'offline': true,
        'scopes': 'profile email'
      });
      return await this.afAuth.auth.signInWithCredential(auth.GoogleAuthProvider.credential(gplusUser.idToken));
    } catch(err) {
      console.error(err);
    }
  }
  // redireciona a uma pagina no navegador que faz o login com uma conta google
  // feito o login, retorna a credencial do usuário
  private async webGoogleLogin(): Promise<auth.UserCredential> {
    try {
      const provider = new auth.GoogleAuthProvider();
      return await this.afAuth.auth.signInWithPopup(provider);
    } catch(err) {
      console.error(err);
    }
  }

  // chama um método de login de acordo com a plataforma (mobile ou web);
  // feito o login, cadastra o usuário (se for o primeiro login) no firebase e redireciona à pagina inicial.
  async googleLogin() {
    let googleCredential: auth.UserCredential;
    if (this.platform.is('cordova'))
      googleCredential = await this.nativeGoogleLogin();
    else
      googleCredential = await this.webGoogleLogin();
    
    const googleUser = googleCredential.user;
    const user = new UserModel(googleUser.displayName, googleUser.uid, [UserModel.STUDENT_PROFILE], googleUser.email);
    this.userService.storeCurrentUser(user);
    this.usersRef.doc(user.uid).get().toPromise().then(snap => {
      let retrievedUser: UserModel = {uid: snap.id, ...snap.data()} as UserModel;
      let clone = Object.assign({}, user);
      delete clone.uid;
      if (!snap.exists)
        this.usersRef.doc(user.uid).set(clone);
    });
    
    this.recentlyLoggedIn = true;
    this.navCtrl.navigateRoot('/tabs/tab1');
  }

  logoff() {
    this.afAuth.auth.signOut();
    if (this.platform.is('cordova'))
      this.gplus.logout();
  }

  isLoggedIn(): boolean {
    return this.userState;
  }

}
