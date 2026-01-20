import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ReservationApi {

  host = environment.resApi;

  constructor(private http: HttpClient) {}

  readReservations$() {
    const url = this.host;
    return this.http.get(url);
  }

  createReservation$(reservation: any) {
    const url = this.host;
    return this.http.post(url, reservation);
  }

  updateReservation$(reservation: any) {
    const url = this.host;
    return this.http.put(url, reservation);
  }

  deleteReservation$(id: number) {
    const url = this.host + '/' + id;
    return this.http.delete(url);
  }

}
