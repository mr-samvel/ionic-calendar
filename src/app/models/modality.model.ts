// Descreve as modalidades disponíveis
export class ModalityModel {
    uid: string; // id que adquire com o firebase
    name: string; // nome da modalidade, ex. 'Pilates'

    constructor(uid: string, name: string) {
        this.uid = uid;
        this.name = name;
    }
}