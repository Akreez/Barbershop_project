import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  host = environment.api;

  private readonly http = inject(HttpClient);

  readBarbers$() {
    const url = this.host + '/barber';
    return this.http.get(url);
  }

  readUsers$() {
    const url = this.host + '/user';
    return this.http.get(url);
  }
}
