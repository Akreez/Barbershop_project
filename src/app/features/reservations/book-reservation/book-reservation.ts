import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CalendarCommonModule, CalendarEvent, CalendarView, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ReservationApi } from '../../../core/services/reservation-api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SelectionService } from '../../../core/services/selection/selection';
import { UserApi } from '../../../core/services/user-api';

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

  private readonly resApi = inject(ReservationApi);
  private readonly builder = inject(FormBuilder);
  private readonly selection = inject(SelectionService);
  private readonly userApi = inject(UserApi);

  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  reservationForm!: any;
  reservations!: any;
  selectedService: any = null;
  barbers!: any;

  beforePeriodViewRender(body: any): void {
    const now = new Date();

    body.hourColumns.forEach((column: any) => {
      column.hours.forEach((hour: any) => {
        hour.segments.forEach((segment: any) => {
          
          // 1. Múltbéli időpontok ellenőrzése
          if (segment.date < now) {
            segment.cssClass = 'bg-disabled'; // Egyedi CSS osztály
          }

          // 2. Foglalt időpontok ellenőrzése (ha a 'reservations' tömbben benne vannak)
          // Itt a backendről lekért 'reservations' tömbön kell végigmenni
          if (this.isSlotReserved(segment.date)) {
            segment.cssClass = 'bg-disabled';
          }
        });
      });
    });
  }

  isSlotReserved(date: Date): boolean {
    if (!this.reservations) return false;
    // Itt hasonlítsd össze a dátumot a létező foglalásokkal
    return this.reservations.some((res: any) => {
      const start = new Date(res.start_time);
      const end = new Date(res.end_time);
      return date >= start && date < end;
    });
  }

  ngOnInit(){
    this.selection.selectedService$.subscribe(service => {
      if (service) {
        this.selectedService = service;
        this.reservationForm.patchValue({
          price: service.price
        });
      }
    })
    this.readBarbers();
    this.readReservations();
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
    const barberId = this.reservationForm.get('barber_id')?.value;

    if (date < new Date()) {
      return; // Ha múltbéli, meg sem nyitjuk a modalt
    }
    if (!this.selectedService) {
      alert('Kérjük, előbb válasszon egy szolgáltatást!');
      return;
    }  
    console.log('Kiválasztott időpont:', date.getHours() + ':' + date.getMinutes());
    const startTimeFormat = formatDate(date, 'yyyy-MM-dd HH:mm', 'en-GB');
    var duration = this.selectedService.required_time.split(':')[1];
    const endDate = new Date(date.getTime() + duration * 60000)
    const endTimeFormat = formatDate(endDate, 'yyyy-MM-dd HH:mm', 'en-GB');
    this.reservationForm.patchValue({
    start_time: startTimeFormat,
    end_time: endTimeFormat,
    barber_id: barberId,
    active: 1
  });

    console.log(this.reservationForm.value);
  }

  readReservations(){
    this.resApi.readReservations$().subscribe({
      next: (result: any)=>{
        // console.log(result.data);
        this.reservations = result.data;
        this.events = result.data.map((r: any) => ({
        start: new Date(r.start_time),
        end: new Date(r.end_time),
        // title: 'Foglalt',
        cssClass: 'bg-disabled', 
        color: {
          primary: '#e9ecef', 
          secondary: '#e9ecef'
        }
      }));
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }

  createReservation(){
    this.resApi.createReservation$(this.reservationForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.reservationForm.reset();
        this.readReservations();
      }
    })
  }

  readBarbers(){
    this.userApi.readBarbers$().subscribe({
      next: (result: any)=>{
        // console.log(result.data);
        this.barbers = result.data;
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }
}
