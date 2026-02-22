import { Component, inject } from '@angular/core';
import { ServicesApi } from '../../../core/services/services-api';
import { ReservationApi } from '../../../core/services/reservation-api';
import { UserApi } from '../../../core/services/user-api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly serviceApi = inject(ServicesApi);
  private readonly resApi = inject(ReservationApi);
  private readonly userApi = inject(UserApi);

  services: any[] = [];
  reservations: any[] = [];
  barbers: any[] = [];
  users: any[] = [];

  ngOnInit() {
    this.readServices();
    this.readReservations();
    this.readBarbers();
    this.readUsers();
  }

  readServices() {
    this.serviceApi.readServices$().subscribe((res: any) => this.services = res.data);
  }

  readReservations() {
    this.resApi.readReservations$().subscribe((res: any) => this.reservations = res.data);
  }

  readBarbers() {
    this.userApi.readBarbers$().subscribe((res: any) => this.barbers = res.data);
  }

  readUsers() {
    this.userApi.readUsers$().subscribe((res: any) => this.users = res.data);
  }
}
