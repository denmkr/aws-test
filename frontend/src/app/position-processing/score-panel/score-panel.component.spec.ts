import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePanelComponent } from './score-panel.component';

describe('ScorePanelComponent', () => {
  let component: ScorePanelComponent;
  let fixture: ComponentFixture<ScorePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
