export class UserModel {
    static STUDENT_PROFILE: number = 0;
    static PROFESSIONAL_PROFILE: number = 1;
    username: string;
    uid: string;
    profile: number;
    email: string;

    constructor(username: string, uid: string, profile: number, email: string) {
        this.username = username;
        this.uid = uid;
        this.profile = profile;
        this.email = email;
    }
}