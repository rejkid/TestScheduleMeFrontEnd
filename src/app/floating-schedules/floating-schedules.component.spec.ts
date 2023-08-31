import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSchedulesComponent } from './floating-schedules.component';

describe('FloatingSchedulesComponent', () => {
  let component: FloatingSchedulesComponent;
  let fixture: ComponentFixture<FloatingSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingSchedulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
