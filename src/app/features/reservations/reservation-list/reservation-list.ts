import { Component } from '@angular/core';
import { ReservationApi } from '../../../core/services/reservation-api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-list',
  imports: [ReactiveFormsModule],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css',
})
export class ReservationList {

  reservationForm!: any;
  reservations!: any;

  constructor(
    private resApi: ReservationApi,
    private builder: FormBuilder
  ){}

  ngOnInit(){
    this.reservationForm = this.builder.group({
      id: '',
      start_time: '',
      price: '',
      barber_id: '',
      customer_id: '',
      active: '',
      end_time: ''
    })
    this.readReservations();
  }

  readReservations(){
    this.resApi.readReservations$().subscribe({
      next: (result: any)=>{
        // console.log(result.data);
        this.reservations = result.data
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }


}
