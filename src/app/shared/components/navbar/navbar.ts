import { Component, inject } from '@angular/core';
import { ServicesApi } from '../../../core/services/services-api';
import { Router, RouterModule } from '@angular/router';
import { SelectionService } from '../../../core/services/selection/selection';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly serviceApi = inject(ServicesApi);
  private readonly router = inject(Router);
  public readonly selection = inject(SelectionService);

  services!: any;
  selectedService: any = null;

  ngOnInit() {
    this.readServices();
  }

  selectService(service: any) {
    this.selection.setService(service);
    console.log('Kiválasztott szolgáltatás:', service);

    this.router.navigate(['/foglalas']);
    
  }

  readServices() {
    this.serviceApi.readServices$().subscribe({
      next: (result: any) => {
        // console.log(result.data);
        this.services = result.data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  setRole(role: 'admin' | 'user' | 'barber' | null){
    this.selection.setMockUser(role);
  }
}
