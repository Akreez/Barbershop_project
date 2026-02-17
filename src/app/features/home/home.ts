import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionService } from '../../core/services/selection/selection';
import { ServicesApi } from '../../core/services/services-api';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly serviceApi = inject(ServicesApi);
  private router = inject(Router);
  private selection = inject(SelectionService);

  services!: any;


  ngOnInit() {
    this.readServices();
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

  selectService(service: any) {
    this.selection.setService(service);
    console.log('Kiválasztott szolgáltatás:', service);

    this.router.navigate(['/foglalas']);
    
  }

  scrollToServices() {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  }
}
