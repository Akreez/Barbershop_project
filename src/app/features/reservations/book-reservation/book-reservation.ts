import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CalendarCommonModule, CalendarEvent, CalendarModule, CalendarView, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ReservationApi } from '../../../core/services/reservation-api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectionService } from '../../../core/services/selection/selection';
import { UserApi } from '../../../core/services/user-api';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';


declare var bootstrap: any; // <--- EZT ADD HOZZÁ
@Component({
  selector: 'app-book-reservation',
  standalone: true,
  imports: [ CommonModule, CalendarModule , CalendarCommonModule, CalendarWeekViewComponent, ReactiveFormsModule],
  providers: [{ provide: DateAdapter, useFactory: adapterFactory }],
  templateUrl: './book-reservation.html',
  styleUrl: './book-reservation.css',
  
})
export class BookReservation implements OnInit, OnDestroy {
  private readonly resApi = inject(ReservationApi);
  private readonly builder = inject(FormBuilder);
  private readonly selection = inject(SelectionService);
  private readonly userApi = inject(UserApi);
  private readonly router = inject(Router);

  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  reservations: any[] = [];
  barbers: any[] = [];
  selectedService: any = null;
  private serviceSub!: Subscription;
  refresh = new Subject<void>();

  reservationForm = this.builder.group({
    start_time: ['', Validators.required],
    end_time: ['', Validators.required],
    price: [''],
    barber_id: [''], 
    customer_id: ['1'],
    active: [1]
  });

  ngOnInit() {
    this.serviceSub = this.selection.selectedService$.subscribe(service => {
      if (!service) {
        // Ha nincs kiválasztott szolgáltatás, visszaküldjük a főoldalra
        this.router.navigate(['/']); // Vagy ahogy a home útvonalad nevezi magát
        return;
      }
      this.selectedService = service;
    });
    this.serviceSub = this.selection.selectedService$.subscribe(s => {
      this.selectedService = s;
    });

    this.readBarbers();
    this.readReservations();

    // Figyeljük a borbély választót: ha változik, újraolvassuk a foglaltságot
    this.reservationForm.get('barber_id')?.valueChanges.subscribe(() => {
      this.readReservations();
    });
  }

  ngOnDestroy() {
    if (this.serviceSub) this.serviceSub.unsubscribe();
  }

  readBarbers() {
    this.userApi.readBarbers$().subscribe((res: any) => this.barbers = res.data);
  }

  readReservations() {
    this.resApi.readReservations$().subscribe((result: any) => {
      this.reservations = result.data;
      const selectedBarberId = this.reservationForm.get('barber_id')?.value;

      // Események (szürke blokkok) generálása a naptárba
      this.events = result.data
        .filter((r: any) => !selectedBarberId || r.barber_id == selectedBarberId)
        .map((r: any) => ({
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          title: '',
          cssClass: 'bg-disabled',
          color: { primary: '#e9ecef', secondary: '#e9ecef' }
        }));
      this.refresh.next();
    });
  }

  createReservation() {
    this.resApi.createReservation$(this.reservationForm.value).subscribe(() => {
      this.readReservations();
      this.reservationForm.patchValue({ start_time: '', end_time: '' });
    });
  }

  isSlotReserved(date: Date): boolean {
    const now = new Date();
    if (date.getTime() < now.getTime()) {
      return true; // Ha múltbéli, azonnal szürkítjük
    }

    if (!this.reservations || this.barbers.length === 0) return false;
    
    const selectedBarberId = this.reservationForm.get('barber_id')?.value;

    if (selectedBarberId) {
      // Ha van borbély választva, csak az ő foglalásait nézzük
      return this.reservations.some(res => {
        const start = new Date(res.start_time);
        const end = new Date(res.end_time);
        return (date >= start && date < end) && res.barber_id == selectedBarberId;
      });
    } else {
      // Ha nincs borbély választva, akkor akkor szürke, ha mindenki foglalt
      const reservationsAtTime = this.reservations.filter(res => {
        const start = new Date(res.start_time);
        const end = new Date(res.end_time);
        return date >= start && date < end;
      });
      return reservationsAtTime.length >= this.barbers.length;
    }
  }

  beforePeriodViewRender(event: any) {
    // Nézzük meg mindkét lehetséges helyet, ahol az oszlopok lehetnek
    const columns = event.hourColumns || (event.body && event.body.hourColumns) || (event.period && event.period.hourColumns);
    
    if (columns) {
      columns.forEach((column: any) => {
        column.hours.forEach((hour: any) => {
          hour.segments.forEach((segment: any) => {
            if (this.isSlotReserved(segment.date)) {
              segment.cssClass = 'bg-disabled';
            }
          });
        });
      });
    }
}

  hourSegmentClicked(date: Date) {
    if (this.isSlotReserved(date)) return;

    let barberId = this.reservationForm.get('barber_id')?.value;

    // Ha az "Összes" van kiválasztva, keresünk egy szabad borbélyt
    if (!barberId) {
      const freeBarber = this.barbers.find(b => !this.reservations.some(r => {
        const s = new Date(r.start_time);
        const e = new Date(r.end_time);
        return (date >= s && date < e) && r.barber_id == b.id;
      }));
      
      if (freeBarber) {
        barberId = freeBarber.id;
      } 
    }

    var duration = this.selectedService.required_time.split(':')[1];
    if(this.selectedService.required_time.split(':')[1] < 30){
      duration = 30;
    }else if(this.selectedService.required_time.split(':')[1] > 30 && this.selectedService.required_time.split(':')[1] < 60){
      duration = 60;
    }

    const endDate = new Date(date.getTime() + duration * 60000);

    this.reservationForm.patchValue({
      start_time: formatDate(date, 'yyyy-MM-dd HH:mm', 'en-GB'),
      end_time: formatDate(endDate, 'yyyy-MM-dd HH:mm', 'en-GB'),
      barber_id: barberId,
      price: this.selectedService.price
    });

    const modalElement = document.getElementById('reservationModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement, {
          focus: true,
          keyboard: true
        });
        modal.show();
    }
  }

}