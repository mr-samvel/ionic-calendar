import { Injectable } from '@angular/core';
import { ProfessionalModel } from '../models/professional.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalContainerService {
  private professionals: ProfessionalModel[];

  constructor() { 
    this.professionals = new Array();
  }

  getProfessionals() {
    return this.professionals;
  }

  addProfessional(prof: ProfessionalModel) {
    this.professionals.push(prof);
  }
}
