import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TennisCourtComponent } from './tennis-court.component';

describe('TennisCourtComponent', () => {
  let component: TennisCourtComponent;
  let fixture: ComponentFixture<TennisCourtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TennisCourtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TennisCourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
