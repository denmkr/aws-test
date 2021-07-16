import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionProcessingComponent } from './position-processing.component';

describe('PositionProcessingComponent', () => {
  let component: PositionProcessingComponent;
  let fixture: ComponentFixture<PositionProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
