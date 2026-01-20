import { Routes } from '@angular/router';
import { BookReservation } from './features/reservations/book-reservation/book-reservation';
import { ReservationList } from './features/reservations/reservation-list/reservation-list';

export const routes: Routes = [
    {path: 'foglalas', component: BookReservation},
    {path: 'lista', component: ReservationList}
];
