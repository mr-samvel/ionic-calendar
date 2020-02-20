import { TestBed } from '@angular/core/testing';

import { ModalityContainerService } from './modality-container.service';

describe('ModalityContainerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModalityContainerService = TestBed.get(ModalityContainerService);
    expect(service).toBeTruthy();
  });
});
