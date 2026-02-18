import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedServiceSource = new BehaviorSubject<any>(null);
  selectedService$ = this.selectedServiceSource.asObservable();

  private currentUser = new BehaviorSubject<{role: 'admin' | 'user' | null}>({role: null});
  currentUser$ = this.currentUser.asObservable();

  setService(service: any) {
    this.selectedServiceSource.next(service);
  }

  setMockUser(role: 'admin' | 'user' | null) {
    this.currentUser.next({ role });
  }
}