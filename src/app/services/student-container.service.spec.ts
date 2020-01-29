import { TestBed } from '@angular/core/testing';

import { StudentContainerService } from './student-container.service';

describe('StudentContainerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StudentContainerService = TestBed.get(StudentContainerService);
    expect(service).toBeTruthy();
  });
});
