import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Validadores reutilizados del checkout
function soloLetras(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as string;
  if (!val) return null;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val) ? null : { soloLetras: true };
}
function soloDigitos(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as string;
  if (!val) return null;
  return /^\d+$/.test(val) ? null : { soloDigitos: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  // Paso: 'cuenta' → solo email+pass | 'perfil' → datos personales
  step = signal<'cuenta' | 'perfil'>('cuenta');

  // Datos guardados tras el registro exitoso (para el paso 2)
  private registeredEmail = '';

  // ── Paso 1: credenciales ────────────────────────────────────────────────
  form: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [this.passwordsMatch] }
  );

  // ── Paso 2: perfil personal ─────────────────────────────────────────────
  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), soloLetras]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), soloLetras]],
    phone: ['', [Validators.required, soloDigitos, Validators.minLength(9), Validators.maxLength(9)]],
    documentType: ['DNI', Validators.required],
    documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11), soloDigitos]],
  });

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  }

  // Longitud máxima del documento según tipo
  get docMaxLength(): number {
    const tipo = this.profileForm.get('documentType')?.value;
    return tipo === 'RUC' ? 11 : tipo === 'CE' ? 9 : 8;
  }

  // ── Bloqueo de teclas ───────────────────────────────────────────────────
  onlyLettersKey(e: KeyboardEvent): void {
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/.test(e.key) &&
      !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  }
  onlyDigitsKey(e: KeyboardEvent): void {
    if (!/\d/.test(e.key) &&
      !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  }

  // ── Paso 1: registrar cuenta ────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;
    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail = email;
        // Avanzar al paso 2 en lugar de redirigir
        this.step.set('perfil');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message ?? err?.error?.errors?.[0]?.message ?? 'Error al registrar usuario'
        );
      }
    });
  }

  // ── Paso 2: guardar perfil y redirigir ──────────────────────────────────
  submitProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);

    const body = this.profileForm.value;

    this.http.put(`${environment.apiUrl}/api/v1/customer/profile`, body).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.auth.isAdmin() ? '/dashboard' : '/mi-cuenta']);
      },
      error: () => {
        // Si falla el perfil igual dejamos pasar — la cuenta ya fue creada
        this.loading.set(false);
        this.router.navigate(['/mi-cuenta']);
      }
    });
  }

  // ── Omitir perfil ───────────────────────────────────────────────────────
  skipProfile(): void {
    this.router.navigate([this.auth.isAdmin() ? '/dashboard' : '/mi-cuenta']);
  }

  // ── Helper errores del perfil ───────────────────────────────────────────
  profileError(field: string): string | null {
    const ctrl = this.profileForm.get(field);
    if (!ctrl?.touched || ctrl.valid) return null;
    const e = ctrl.errors!;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['soloLetras']) return 'Solo se permiten letras.';
    if (e['soloDigitos']) return 'Solo se permiten números.';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    return 'Campo inválido.';
  }
}
