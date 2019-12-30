import { TestBed } from '@angular/core/testing';

import { UserContainerService } from './user-container.service';

describe('UserContainerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserContainerService = TestBed.get(UserContainerService);
    expect(service).toBeTruthy();
  });
});
