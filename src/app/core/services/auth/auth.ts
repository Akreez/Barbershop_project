import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  host = environment.api;

  private _isAuthenticated = signal(!!localStorage.getItem('token'));
  readonly isAuthenticated = this._isAuthenticated.asReadonly()

  login$(user: any){
    const url = this.host + '/login';
    return this.http.post(url, user);
  }

  loginSuccess(){
    this._isAuthenticated.set(true);
  }

  logout(){
    localStorage.removeItem('token');
    this._isAuthenticated.set(false);
    this.router.navigate(['/főoldal']);
  }
}
