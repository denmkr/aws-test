import { TestBed } from '@angular/core/testing';

import { PositionProcessingService } from './position-processing.service';

describe('PositionProcessingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PositionProcessingService = TestBed.get(PositionProcessingService);
    expect(service).toBeTruthy();
  });
});
