export class UserModel {
    static STUDENT_PROFILE: number = 0;
    static PROFESSIONAL_PROFILE: number = 1;
    username: string;
    uid: string;
    roles: Array<number>;
    email: string;

    constructor(username: string, uid: string, roles: Array<number>, email: string) {
        this.username = username;
        this.uid = uid;
        this.roles = roles;
        this.email = email;
    }
}