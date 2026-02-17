import { Routes } from '@angular/router';
import { BookReservation } from './features/reservations/book-reservation/book-reservation';
import { ReservationList } from './features/reservations/reservation-list/reservation-list';
import { ManageServices } from './features/barberServices/manage-services/manage-services';
import { Home } from './features/home/home';

export const routes: Routes = [
    {path: '', redirectTo: 'főoldal', pathMatch: 'full'},
    {path: 'főoldal', component: Home},
    {path: 'foglalas', component: BookReservation},
    {path: 'lista', component: ReservationList},
    {path: 'szolgaltatasok', component: ManageServices}
];
