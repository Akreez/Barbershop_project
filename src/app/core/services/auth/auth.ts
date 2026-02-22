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
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  private _role = signal<string | null>(localStorage.getItem('role'));
  readonly role = this._role.asReadonly();
  private _id = signal<string | null>(localStorage.getItem('id'));
  readonly id = this._id.asReadonly();
  private _email = signal<string | null>(localStorage.getItem('email'));
  readonly email = this._email.asReadonly();

  register$(user: any){
    const url = this.host + '/register';
    return this.http.post(url, user);
  }

  login$(user: any){
    const url = this.host + '/login';
    return this.http.post(url, user);
  }

  loginSuccess(userData: { id: any, role: string, email: string }){
    this._isAuthenticated.set(true);
    this._role.set(userData.role);
    this._id.set(userData.id.toString());
    this._email.set(userData.email);

    localStorage.setItem('role', userData.role);
    localStorage.setItem('id', userData.id.toString());
    localStorage.setItem('email', userData.email);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('email');

    this._isAuthenticated.set(false);
    this._role.set(null);
    this._id.set(null);
    this._email.set(null);
    
    this.router.navigate(['/főoldal']);
  }
}
