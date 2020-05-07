import { TestBed } from '@angular/core/testing';

import { ProfessionalService } from './professional.service';

describe('ProfessionalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessionalService = TestBed.get(ProfessionalService);
    expect(service).toBeTruthy();
  });
});
