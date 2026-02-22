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
}
