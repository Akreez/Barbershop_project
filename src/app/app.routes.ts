import { Routes } from '@angular/router';
import { BookReservation } from './features/reservations/book-reservation/book-reservation';
import { ReservationList } from './features/reservations/reservation-list/reservation-list';
import { Home } from './features/home/home';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
    {path: '', redirectTo: 'főoldal', pathMatch: 'full'},
    {path: 'főoldal', component: Home},
    {path: 'foglalas', component: BookReservation},
    {path: 'lista', component: ReservationList},
    {path: 'admin', component: AdminDashboard},
    {path: 'regisztráció', component: Register}
];
