import { Component, inject } from '@angular/core';
import { ServicesApi } from '../../../core/services/services-api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-services',
  imports: [ReactiveFormsModule],
  templateUrl: './manage-services.html',
  styleUrl: './manage-services.css',
})
export class ManageServices {
  readonly serviceApi = inject(ServicesApi);
  readonly builder = inject(FormBuilder);

  services!: any;
  serviceForm!: any;

  ngOnInit() {
    this.readServices();
    this.serviceForm = this.builder.group({
      id: '',
      service: '',
      required_time: '',
      price: '',
    });
  }

  readServices() {
    this.serviceApi.readServices$().subscribe({
      next: (result: any) => {
        console.log(result.data);
        this.services = result.data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  createService(){
    this.serviceApi.createService$(this.serviceForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.serviceForm.reset();
      }
    })
  }

  updateService(){
    this.serviceApi.updateService$(this.serviceForm.value).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.serviceForm.reset();
        this.readServices();
      }
    })
  }

  editService(service: any){
    this.serviceForm.patchValue(service);
  }

  deleteService(id: number){
    this.serviceApi.deleteService$(id).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.readServices();
      }
    })
  }
}
