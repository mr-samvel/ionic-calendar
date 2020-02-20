import { TestBed } from '@angular/core/testing';

import { ProfessionalContainerService } from './professional-container.service';

describe('ProfessionalContainerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessionalContainerService = TestBed.get(ProfessionalContainerService);
    expect(service).toBeTruthy();
  });
});
