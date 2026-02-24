import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SelectionService } from '../../core/services/selection/selection';
import { ServicesApi } from '../../core/services/services-api';
import { Auth } from '../../core/services/auth/auth';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly serviceApi = inject(ServicesApi);
  private router = inject(Router);
  private selection = inject(SelectionService);
  public readonly auth = inject(Auth);
  private readonly builder = inject(FormBuilder);

  services!: any;
  protected loginForm = this.builder.group({
    username: [''],
    password: ['']
  })

  ngOnInit() {
    this.readServices();
  }

  cancel(){
    this.loginForm.reset();
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

          this.loginForm.reset();

          this.router.navigate(['/főoldal']);
        } else {
          console.log("A hitelesítés sikertelen!");
        }
      }
    });
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
}
