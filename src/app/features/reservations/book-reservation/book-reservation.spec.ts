import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookReservation } from './book-reservation';

describe('BookReservation', () => {
  let component: BookReservation;
  let fixture: ComponentFixture<BookReservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookReservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookReservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
