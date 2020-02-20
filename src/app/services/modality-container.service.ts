import { Injectable } from '@angular/core';
import { ModalityModel } from '../models/modality.model';

@Injectable({
  providedIn: 'root'
})
export class ModalityContainerService {
  private modalities: ModalityModel[];

  constructor() { 
    this.modalities = [new ModalityModel('Pilates'), new ModalityModel('Fisioterapia')];
  }

  getModalities() {
    return this.modalities;
  }

  addModality(mod: ModalityModel) {
    this.modalities.push(mod);
    console.log(this.modalities);
  }
}
