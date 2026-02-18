import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly router = inject(Router);
  private isAuthenticated = false;

  loginSuccess(){
    this.isAuthenticated = true;
  }

  logout(){
    this.isAuthenticated = false;
    this.router.navigate(["/home"])
  }
}
