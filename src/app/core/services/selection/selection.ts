import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedServiceSource = new BehaviorSubject<any>(null);
  selectedService$ = this.selectedServiceSource.asObservable();

  private currentUser = new BehaviorSubject<{role: 'admin' | 'user' | 'barber' | null}>({role: null});
  currentUser$ = this.currentUser.asObservable();
  loggedIn = false;

  setService(service: any) {
    this.selectedServiceSource.next(service);
  }

  setMockUser(role: 'admin' | 'user' | 'barber' | null) {
    this.currentUser.next({ role });
    this.loggedIn = !this.loggedIn;
  }
}