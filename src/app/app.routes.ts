import { Routes } from '@angular/router';
import { BookReservation } from './features/reservations/book-reservation/book-reservation';
import { ReservationList } from './features/reservations/reservation-list/reservation-list';
import { Home } from './features/home/home';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {path: '', redirectTo: 'főoldal', pathMatch: 'full'},
    {path: 'főoldal', component: Home},
    {path: 'foglalas', component: BookReservation, canActivate: [authGuard], data: { expectedRoles: ['user'] }},
    {path: 'lista', component: ReservationList, canActivate: [authGuard], data: { expectedRoles: ['user', 'barber'] }},
    {path: 'admin', component: AdminDashboard, canActivate: [authGuard], data: { expectedRoles: ['admin', 'super-admin'] }},
    {path: 'regisztráció', component: Register}
];
