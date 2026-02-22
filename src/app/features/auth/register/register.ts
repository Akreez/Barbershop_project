import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth/auth';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);

  registerForm = this.builder.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  },{
    validators: (group: any) => group.get('password').value === group.get('confirmPassword').value ? null : { mismatch: true }
  })

  onSubmit() {
    if (this.registerForm.valid) {
      this.auth.register$(this.registerForm.value).subscribe({
        next: (res: any) => {
          alert('Sikeres regisztráció! Most már bejelentkezhetsz.');
          this.router.navigate(['/']);
        },
        error: (err) => console.error('Hiba történt:', err)
      });
    }
  }
}
