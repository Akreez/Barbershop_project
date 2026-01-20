import { CommonModule, formatDate, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarCommonModule, CalendarEvent, CalendarView, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ReservationApi } from '../../../core/services/reservation-api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-reservation',
  imports: [
    CommonModule,
    CalendarCommonModule,
    CalendarWeekViewComponent,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    }
  ],
  templateUrl: './book-reservation.html',
  styleUrl: './book-reservation.css',
})
export class BookReservation {
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  reservationForm!: any;
  reservations!: any;

  constructor(private resApi: ReservationApi, private builder: FormBuilder) {}

  ngOnInit(){
    this.reservationForm = this.builder.group({
      id: '',
      start_time: '',
      end_time: '',
      price: '',
      barber_id: '',
      customer_id: '',
      active: '',
      
    })
  }

  hourSegmentClicked(date: any) {
    console.log('Kiválasztott időpont:', date.getHours() + ':' + date.getMinutes());
    const startTimeFormat = formatDate(date, 'yyyy-MM-dd HH:mm', 'en-GB');
    const endDate = new Date(date.getTime() + 30 * 60000)
    const endTimeFormat = formatDate(endDate, 'yyyy-MM-dd HH:mm', 'en-GB');
    this.reservationForm.patchValue({start_time: startTimeFormat, end_time: endTimeFormat, active:1});

    console.log(this.reservationForm.value);
  }

  createReservation(){
    this.resApi.createReservation$(this.reservationForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.reservationForm.reset();
      }
    })
  }
}
