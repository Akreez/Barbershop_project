import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ServicesApi {
  host = environment.serviceApi;

  constructor(private http: HttpClient) {}

  readServices$() {
    const url = this.host;
    return this.http.get(url);
  }

  createService$(service: any) {
    const url = this.host;
    return this.http.post(url, service);
  }
  
  updateService$(service: any) {
    const url = this.host + '/' + service.id;
    return this.http.put(url, service);
  }
  
  deleteService$(id: number) {
    const url = this.host + '/' + id;
    return this.http.delete(url);
  }
}
