import { CommonModule, formatDate, registerLocaleData } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CalendarCommonModule, CalendarEvent, CalendarModule, CalendarView, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ReservationApi } from '../../../core/services/reservation-api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectionService } from '../../../core/services/selection/selection';
import { UserApi } from '../../../core/services/user-api';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import localeHu from '@angular/common/locales/hu';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeHu);


declare var bootstrap: any;
@Component({
  selector: 'app-book-reservation',
  standalone: true,
  imports: [ CommonModule, CalendarModule , CalendarCommonModule, CalendarWeekViewComponent, ReactiveFormsModule],
  providers: [{ provide: DateAdapter, useFactory: adapterFactory }, { provide: LOCALE_ID, useValue: 'hu-HU' }],
  templateUrl: './book-reservation.html',
  styleUrl: './book-reservation.css',
  
})
export class BookReservation implements OnInit, OnDestroy {
  private readonly resApi = inject(ReservationApi);
  private readonly builder = inject(FormBuilder);
  private readonly selection = inject(SelectionService);
  private readonly userApi = inject(UserApi);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  view: CalendarView = CalendarView.Week;
  locale: string = 'hu';
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  reservations: any[] = [];
  barbers: any[] = [];
  selectedService: any = null;
  private serviceSub!: Subscription;
  refresh = new Subject<void>();
  weekStartsOn: number = 1;

  showBarberError: boolean = false;

  reservationForm = this.builder.group({
    start_time: ['', Validators.required],
    end_time: ['', Validators.required],
    price: [''],
    barber_id: [''], 
    customer_id: [''],
    active: [1]
  });

  ngOnInit() {
    this.serviceSub = this.selection.selectedService$.subscribe(service => {
      if (!service) {
        // Ha nincs kiválasztott szolgáltatás, visszaküldjük a főoldalra
        this.router.navigate(['/']);
        return;
      }
      this.selectedService = service;
    });
    this.serviceSub = this.selection.selectedService$.subscribe(s => {
      this.selectedService = s;

      if (this.reservationForm) {
        this.reservationForm.patchValue({
          barber_id: ''
        });
        this.refresh.next(); 
      }
    });

    this.readBarbers();
    this.readReservations();

    this.reservationForm.get('barber_id')?.valueChanges.subscribe((val) => {
      if (val) this.showBarberError = false;
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
      this.reservations = result.data.filter((r: any) => r.active == 1 || r.active === true);
      
      const selectedBarberId = this.reservationForm.get('barber_id')?.value;

      // Események (szürke blokkok) generálása a naptárba
      if(!selectedBarberId){
        this.events = [];
      }else{
        this.events = this.reservations
        .filter((r: any) => !selectedBarberId || r.barber_id == selectedBarberId)
        .map((r: any) => ({
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          title: '',
          cssClass: 'bg-disabled',
          color: { primary: '#e9ecef', secondary: '#e9ecef' }
        }));
      }
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
    
    const selectedBarberId = this.reservationForm.get('barber_id')?.value;

    if (!selectedBarberId) return false;

    // Ha van borbély választva, csak az ő foglalásait nézzük
    return this.reservations.some(res => {
      const start = new Date(res.start_time);
      const end = new Date(res.end_time);
      return (date >= start && date < end) && res.barber_id == selectedBarberId;
    });
  }

  // Segédfüggvény az időtartam kiszámításához (hogy ne kelljen duplikálni)
  getDurationMinutes(): number {
    if (!this.selectedService) return 30;
    let minutes = parseInt(this.selectedService.required_time.split(':')[1]);
    if (minutes < 30) return 30;
    if (minutes > 30 && minutes < 60) return 60;
    return minutes;
  }

  beforePeriodViewRender(event: any) {
    const columns = event.hourColumns || (event.body && event.body.hourColumns) || (event.period && event.period.hourColumns);
    const duration = this.getDurationMinutes();
    const selectedBarberId = this.reservationForm.get('barber_id')?.value;

    if (columns) {
      columns.forEach((column: any) => {
        column.hours.forEach((hour: any) => {
          hour.segments.forEach((segment: any) => {
            const segmentDate = segment.date;
            const endDate = new Date(segmentDate.getTime() + duration * 60000);

            // 1. Alap ellenőrzés: Múltbéli-e vagy eleve foglalt-e a kezdőpont?
            if (this.isSlotReserved(segmentDate)) {
              segment.cssClass = 'bg-disabled';
              return;
            }

            // 2. Dinamikus ellenőrzés: Ha ide kattintana, elférne-e a teljes szolgáltatás?
            if (selectedBarberId) {
              // Konkrét borbély esetén: szabad-e neki a teljes intervallum?
              if (this.isIntervalReserved(segmentDate, endDate, selectedBarberId)) {
                segment.cssClass = 'bg-disabled';
              }
            } 
          });
        });
      });
    }
  }
  // beforePeroidViewRender vége

  // Új segédfüggvény az intervallum ellenőrzéséhez
  isIntervalReserved(start: Date, end: Date, barberId: any): boolean {
    if (!this.reservations || this.reservations.length === 0) return false;

    return this.reservations.some(res => {
      // Csak az adott borbély aktív foglalásait nézzük
      if (res.barber_id != barberId) return false;

      const resStart = new Date(res.start_time);
      const resEnd = new Date(res.end_time);

      // Ütközés akkor van, ha az új intervallum belelóg egy létezőbe
      // Matematikailag: (StartA < EndB) ÉS (EndA > StartB)
      return start < resEnd && end > resStart;
    });
  }

  hourSegmentClicked(date: Date) {
    if (this.isSlotReserved(date)) return;

    let barberId = this.reservationForm.get('barber_id')?.value;

    if (!barberId) {
      this.showBarberError = true;
      // Ugorjunk a választóhoz
      const element = document.getElementById('barber-selector');
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Időtartam kiszámítása (a te logikád alapján)
    let duration = parseInt(this.selectedService.required_time.split(':')[1]);
    if (duration < 30) duration = 30;
    else if (duration > 30 && duration < 60) duration = 60;

    const endDate = new Date(date.getTime() + duration * 60000);

    // HA NINCS borbély választva, keresnünk kell egyet, aki a TELJES intervallum alatt szabad
    if (!barberId) {
      const freeBarber = this.barbers.find(b => !this.isIntervalReserved(date, endDate, b.id));
      
      if (freeBarber) {
        barberId = freeBarber.id;
      } else {
        return;
      }
    } else {
      // HA VAN választott borbély, ellenőrizzük, hogy ő szabad-e végig
      if (this.isIntervalReserved(date, endDate, barberId)) {
        return;
      }
    }

    this.reservationForm.patchValue({
      start_time: formatDate(date, 'yyyy-MM-dd HH:mm', 'hu-HU'),
      end_time: formatDate(endDate, 'yyyy-MM-dd HH:mm', 'hu-HU'),
      barber_id: barberId,
      price: this.selectedService.price,
      customer_id: this.auth.id(),
    });

    const modalElement = document.getElementById('reservationModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
  }
  // hourSegmentClicked vége

}