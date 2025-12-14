import { TestBed } from '@angular/core/testing';

import { BookingsComponent } from './bookings.component';

describe('BookingsComponent', () => {
  let component: BookingsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
