import { TestBed } from '@angular/core/testing';

import { MercureService } from './mercure.service';

describe('MessageService', () => {
  let service: MercureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MercureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
