import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

type Step = 'datos' | 'pago' | 'confirmacion';
type PaymentMethod = 'VISA' | 'MASTERCARD' | 'YAPE' | 'PLIN' | 'TRANSFER';

// ── Validadores personalizados ──────────────────────────────────────────────

/** Solo letras y espacios (sin números ni símbolos) */
function soloLetras(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as string;
  if (!val) return null;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val) ? null : { soloLetras: true };
}

/** Solo dígitos */
function soloDigitos(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as string;
  if (!val) return null;
  return /^\d+$/.test(val) ? null : { soloDigitos: true };
}

/** DNI: exactamente 8 dígitos · RUC: exactamente 11 · CE: 9 dígitos */
function documentoValido(group: AbstractControl): ValidationErrors | null {
  const tipo = group.get('documentType')?.value;
  const num = (group.get('documentNumber')?.value ?? '') as string;
  if (!tipo || !num) return null;
  const rules: Record<string, RegExp> = {
    DNI: /^\d{8}$/,
    RUC: /^\d{11}$/,
    CE: /^\d{9}$/,
  };
  return rules[tipo]?.test(num) !== false ? null : { documentoInvalido: true };
}

/** Tarjeta: 16 dígitos sin espacios */
function tarjetaValida(ctrl: AbstractControl): ValidationErrors | null {
  const val = (ctrl.value as string).replace(/\s/g, '');
  if (!val) return null;
  return /^\d{16}$/.test(val) ? null : { tarjetaInvalida: true };
}

/** MM/AA con mes 01-12 */
function expiryValida(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as string;
  if (!val) return null;
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(val)) return { expiryInvalida: true };
  const [m, y] = val.split('/').map(Number);
  const now = new Date();
  const expDate = new Date(2000 + y, m - 1);
  return expDate >= new Date(now.getFullYear(), now.getMonth()) ? null : { expiryVencida: true };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [Header, Footer, ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private cart = inject(CartService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  step = signal<Step>('datos');
  selectedPayment = signal<PaymentMethod>('VISA');
  processing = signal(false);
  orderNumber = signal('');
  errorMessage = signal<string | null>(null);

  deliveryType = signal<'A_DOMICILIO' | 'RECOJO_EN_TIENDA'>('A_DOMICILIO');
  stores = signal<any[]>([]);
  selectedStoreId = signal<number | null>(null);
  differentRecipient = signal(false);

  readonly items = this.cart.items;
  readonly subtotal = this.cart.subtotal;
  readonly shipping = this.cart.shipping;
  readonly total = this.cart.total;

  readonly departments = [
    'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura',
    'Lambayeque', 'Junín', 'Ica', 'Cajamarca', 'Puno',
  ];

  readonly paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'VISA', label: 'Tarjeta Visa', icon: 'fa-brands fa-cc-visa' },
    { id: 'MASTERCARD', label: 'Tarjeta Mastercard', icon: 'fa-brands fa-cc-mastercard' },
    { id: 'YAPE', label: 'Yape', icon: 'fa-solid fa-mobile-screen' },
    { id: 'PLIN', label: 'Plin', icon: 'fa-solid fa-mobile-screen' },
    { id: 'TRANSFER', label: 'Transferencia bancaria', icon: 'fa-solid fa-building-columns' },
  ];

  readonly isCardPayment = computed(() =>
    this.selectedPayment() === 'VISA' || this.selectedPayment() === 'MASTERCARD'
  );

  // ── Formulario datos personales ───────────────────────────────────────────
  readonly personalForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), soloLetras]],
      lastName: ['', [Validators.required, Validators.minLength(2), soloLetras]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, soloDigitos, Validators.minLength(9), Validators.maxLength(9)]],
      documentType: ['DNI', Validators.required],
      documentNumber: ['', [Validators.required, soloDigitos]],
      // Dirección
      addressLine: ['', Validators.required],
      department: ['Lima', Validators.required],
      province: ['Lima', Validators.required],
      district: ['', [Validators.required, soloLetras]],
      reference: [''],
      // Receptor
      recipientFirstName: ['', soloLetras],
      recipientLastName: ['', soloLetras],
      recipientPhone: ['', [soloDigitos, Validators.minLength(9), Validators.maxLength(9)]],
    },
    { validators: documentoValido }
  );

  // ── Formulario tarjeta ───────────────────────────────────────────────────
  readonly cardForm = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, tarjetaValida]],
    cardName: ['', [Validators.required, soloLetras]],
    cardExpiry: ['', [Validators.required, expiryValida]],
    cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  // ── Helpers para mostrar errores ─────────────────────────────────────────
  fieldError(formName: 'personal' | 'card', field: string): string | null {
    const form = formName === 'personal' ? this.personalForm : this.cardForm;
    const ctrl = (form as any).get(field) as import('@angular/forms').AbstractControl | null;
    if (!ctrl?.touched || ctrl.valid) return null;
    const e = ctrl.errors!;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['soloLetras']) return 'Solo se permiten letras.';
    if (e['soloDigitos']) return 'Solo se permiten números.';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['email']) return 'Ingresa un correo electrónico válido.';
    if (e['tarjetaInvalida']) return 'La tarjeta debe tener 16 dígitos.';
    if (e['expiryInvalida']) return 'Formato inválido. Usa MM/AA.';
    if (e['expiryVencida']) return 'La tarjeta está vencida.';
    return 'Campo inválido.';
  }

  docError(): string | null {
    if (!this.personalForm.touched) return null;
    const e = this.personalForm.errors;
    if (e?.['documentoInvalido']) {
      const tipo = this.personalForm.get('documentType')?.value;
      const lengths: Record<string, string> = { DNI: '8', RUC: '11', CE: '9' };
      return `El ${tipo} debe tener ${lengths[tipo as keyof typeof lengths] ?? '?'} dígitos.`;
    }
    return null;
  }

  // ── Bloqueo de teclas ────────────────────────────────────────────────────
  onlyLettersKey(e: KeyboardEvent): void {
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  }

  onlyDigitsKey(e: KeyboardEvent): void {
    if (!/\d/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.getProfile().subscribe({
        next: (profile) => {
          this.personalForm.patchValue({
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            email: this.auth.currentUser()?.email ?? '',
            phone: profile.phone ?? '',
            documentType: profile.documentType ?? 'DNI',
            documentNumber: profile.documentNumber ?? '',
          });
          this.orderService.getAddresses().subscribe({
            next: (addresses) => {
              const def = addresses.find((a: any) => a.isDefault) ?? addresses[0];
              if (def) {
                this.personalForm.patchValue({
                  addressLine: def.addressLine ?? '',
                  department: def.department ?? 'Lima',
                  province: def.province ?? 'Lima',
                  district: def.district ?? '',
                  reference: def.reference ?? '',
                });
              }
            },
            error: () => { }
          });
        },
        error: () => { }
      });
    }
    this.loadStores();
  }

  loadStores(): void {
    this.orderService.getStores().subscribe({
      next: (s) => this.stores.set(s),
      error: () => { }
    });
  }

  // ── Navegación ───────────────────────────────────────────────────────────
  nextStep(): void {
    if (this.step() === 'datos') {
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'documentType', 'documentNumber'];
      if (this.deliveryType() === 'A_DOMICILIO') requiredFields.push('addressLine', 'district');
      if (this.deliveryType() === 'RECOJO_EN_TIENDA' && !this.selectedStoreId()) {
        this.errorMessage.set('Debes seleccionar una tienda para el recojo.');
        return;
      }
      this.personalForm.markAllAsTouched();
      if (requiredFields.some(k => this.personalForm.get(k)?.invalid) || this.personalForm.errors?.['documentoInvalido']) return;
      this.errorMessage.set(null);
      this.step.set('pago');
    } else if (this.step() === 'pago') {
      if (this.isCardPayment() && this.cardForm.invalid) {
        this.cardForm.markAllAsTouched();
        return;
      }
      this.placeOrder();
    }
  }

  prevStep(): void {
    if (this.step() === 'pago') this.step.set('datos');
  }

  // ── Crear orden ──────────────────────────────────────────────────────────
  placeOrder(): void {
    this.processing.set(true);
    this.errorMessage.set(null);

    const f = this.personalForm.value;
    const useOther = this.differentRecipient() && f.recipientFirstName && f.recipientLastName && f.recipientPhone;
    const recipient = useOther
      ? { firstName: f.recipientFirstName!, lastName: f.recipientLastName!, phone: f.recipientPhone! }
      : { firstName: f.firstName!, lastName: f.lastName!, phone: f.phone! };

    const pmMap: Record<PaymentMethod, string> = {
      VISA: 'TARJETA', MASTERCARD: 'TARJETA',
      YAPE: 'YAPE', PLIN: 'YAPE', TRANSFER: 'PAGO_EFECTIVO',
    };

    const body: any = {
      deliveryType: this.deliveryType(),
      customer: {
        firstName: f.firstName!, lastName: f.lastName!,
        email: f.email!, phone: f.phone!,
        docType: f.documentType!, docNumber: f.documentNumber!,
      },
      recipient,
      items: this.items().map(i => ({ productSlug: i.slug, quantity: i.quantity })),
      paymentMethod: pmMap[this.selectedPayment()],
    };

    if (this.deliveryType() === 'A_DOMICILIO') {
      body.address = {
        addressLine: f.addressLine!, department: f.department!,
        province: f.province!, district: f.district!, reference: f.reference ?? null,
      };
    }
    if (this.deliveryType() === 'RECOJO_EN_TIENDA') body.storeId = this.selectedStoreId();

    this.orderService.createOrder(body).subscribe({
      next: (res) => {
        this.orderNumber.set(res.orderCode ?? res.code ?? 'PX-OK');
        this.cart.clear();
        this.step.set('confirmacion');
        this.processing.set(false);
      },
      error: (err) => {
        this.processing.set(false);
        this.errorMessage.set(
          err?.error?.message ?? err?.error?.errors?.[0]?.message ?? 'Error al procesar el pedido. Intenta de nuevo.'
        );
      }
    });
  }

  // ── Formateo de campos ───────────────────────────────────────────────────
  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').substring(0, 16);
    this.cardForm.patchValue({ cardNumber: val });
    input.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardForm.patchValue({ cardExpiry: val });
    input.value = val;
  }

  stepIndex(): number {
    return this.step() === 'datos' ? 0 : this.step() === 'pago' ? 1 : 2;
  }

  getPaymentLabel(): string {
    return this.paymentMethods.find(p => p.id === this.selectedPayment())?.label ?? '';
  }
}
