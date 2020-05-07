import { TestBed } from '@angular/core/testing';

import { ModalityService } from './modality.service';

describe('ModalityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModalityService = TestBed.get(ModalityService);
    expect(service).toBeTruthy();
  });
});
