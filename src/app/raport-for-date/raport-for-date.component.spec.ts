import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaportForDateComponent } from './raport-for-date.component';

describe('RaportTestComponent', () => {
  let component: RaportForDateComponent;
  let fixture: ComponentFixture<RaportForDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaportForDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaportForDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
