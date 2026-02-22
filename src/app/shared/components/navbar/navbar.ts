import { Component, inject } from '@angular/core';
import { ServicesApi } from '../../../core/services/services-api';
import { Router, RouterModule } from '@angular/router';
import { SelectionService } from '../../../core/services/selection/selection';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly serviceApi = inject(ServicesApi);
  private readonly router = inject(Router);
  public readonly selection = inject(SelectionService);
  private readonly builder = inject(FormBuilder);
  public readonly auth = inject(Auth);

  services!: any;
  selectedService: any = null;

  protected loginForm = this.builder.group({
    username: [''],
    password: ['']
  })

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

  login() {
    this.auth.login$(this.loginForm.value).subscribe({
      next: (res: any) => {
        if (res.success) {
          const user = res.data[0];
          
          localStorage.setItem('token', user.token);

          this.auth.loginSuccess({
            id: user.id,
            role: user.role,
            email: user.email
          });

          this.router.navigate(['/főoldal']);
        } else {
          console.log("A hitelesítés sikertelen!");
        }
      }
    });
  }

  logout(){
    this.auth.logout();
    this.router.navigate(['/főoldal']);
  }
}
