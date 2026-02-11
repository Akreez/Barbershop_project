import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedServiceSource = new BehaviorSubject<any>(null);
  selectedService$ = this.selectedServiceSource.asObservable();

  setService(service: any) {
    this.selectedServiceSource.next(service);
  }
}