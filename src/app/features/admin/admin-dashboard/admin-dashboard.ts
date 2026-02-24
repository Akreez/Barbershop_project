import { Component, inject } from '@angular/core';
import { ServicesApi } from '../../../core/services/services-api';
import { ReservationApi } from '../../../core/services/reservation-api';
import { UserApi } from '../../../core/services/user-api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly serviceApi = inject(ServicesApi);
  private readonly resApi = inject(ReservationApi);
  private readonly userApi = inject(UserApi);
  private readonly builder = inject(FormBuilder);
  public readonly auth = inject(Auth);

  services: any[] = [];
  serviceForm!: any;
  reservations: any[] = [];
  barbers: any[] = [];
  users: any[] = [];
  reservationForm!: any;
  filterStatus: 'active' | 'inactive' = 'active';


  ngOnInit() {
    this.reservationForm = this.builder.group({
      id: '',
      start_time: '',
      price: '',
      barber_id: '',
      customer_id: '',
      active: '',
      end_time: ''
    })

    this.serviceForm = this.builder.group({
      id: '',
      service: '',
      required_time: '',
      price: '',
    });

    this.readServices();
    this.readReservations();
    this.readBarbers();
    this.readUsers();
  }

  get filteredReservations() {
    return this.reservations.filter(res => 
      this.filterStatus === 'active' ? res.active == 1 : res.active == 0
    );
  }

  setFilter(status: 'active' | 'inactive') {
    this.filterStatus = status;
  }

  readServices() {
    this.serviceApi.readServices$().subscribe((res: any) => this.services = res.data);
  }

  createService(){
    this.serviceApi.createService$(this.serviceForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.serviceForm.reset();
        this.readServices();
      }
    })
  }

  updateService(){
    this.serviceApi.updateService$(this.serviceForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.serviceForm.reset();
        this.readServices();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }

  editService(service: any){
    this.serviceForm.patchValue(service);
  }
  
  cancel(){
    this.serviceForm.reset();
  }

  deleteService(id: number){
    this.serviceApi.deleteService$(id).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.readServices();
      }
    })
  }

  readReservations() {
    this.resApi.readReservations$().subscribe((res: any) => this.reservations = res.data);
  }

  updateReservation(){
    this.resApi.updateReservation$(this.reservationForm.value).subscribe({
      next: (res: any)=>{
        console.log(res);
        this.reservationForm.reset();
        this.readReservations();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }
  editReservation(res: any){
    this.reservationForm.patchValue(res);
  }

  deleteReservation(id: number){
    this.resApi.deleteReservation$(id).subscribe({
      next: (result: any)=>{
        console.log(result);
        this.readReservations();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }

  readBarbers() {
    this.userApi.readBarbers$().subscribe((res: any) => this.barbers = res.data);
  }

  readUsers() {
    this.userApi.readUsers$().subscribe((res: any) => this.users = res.data);
  }

  revokeRole(id: number){
    this.userApi.revokeRole$(id).subscribe({
      next: (res: any)=>{
        console.log(res.data);
        this.readUsers();
        this.readBarbers();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }

  giveAdmin(id: number){
    this.userApi.giveAdmin$(id).subscribe({
      next: (res: any)=>{
        console.log(res.data);
        this.readUsers();
        this.readBarbers();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }
  giveBarber(id: number){
    this.userApi.giveBarber$(id).subscribe({
      next: (res: any)=>{
        console.log(res.data);
        this.readUsers();
        this.readBarbers();
      },
      error: (err: any)=>{
        console.log(err);
      }
    })
  }
  giveInactive(id: number){
    if (confirm('Biztosan inaktívvá teszed a felhasználót? Nem fog tudni bejelentkezni.')) {
      this.userApi.giveInactive$(id).subscribe({
        next: (res: any) => {
          console.log('Felhasználó inaktiválva');
          this.readUsers();
          this.readBarbers();
        },
        error: (err) => console.error(err)
      });
    }
  } 
}
