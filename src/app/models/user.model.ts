// modelo do usuário
export class UserModel {
    static STUDENT_PROFILE: number = 0;
    static PROFESSIONAL_PROFILE: number = 1;

    username: string; // username que adquire através do google
    uid: string; // uid que adquire através do google
    roles: Array<number>; // perfis/permissões
    email: string; // email que adquire através do google

    constructor(username: string, uid: string, roles: Array<number>, email: string) {
        this.username = username;
        this.uid = uid;
        this.roles = roles;
        this.email = email;
    }
}