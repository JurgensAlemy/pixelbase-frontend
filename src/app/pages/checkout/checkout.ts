import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

type Step = 'datos' | 'pago' | 'confirmacion';
type PaymentMethod = 'VISA' | 'MASTERCARD' | 'YAPE' | 'PLIN' | 'TRANSFER';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [Header, Footer, ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private cart = inject(CartService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  step = signal<Step>('datos');
  selectedPayment = signal<PaymentMethod>('VISA');
  processing = signal(false);
  orderNumber = signal('');

  readonly items = this.cart.items;
  readonly subtotal = this.cart.subtotal;
  readonly shipping = this.cart.shipping;
  readonly total = this.cart.total;

  readonly personalForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    documentType: ['DNI', Validators.required],
    documentNumber: ['', [Validators.required, Validators.minLength(8)]],
    addressLine: ['', Validators.required],
    department: ['Lima', Validators.required],
    province: ['Lima', Validators.required],
    district: ['', Validators.required],
    reference: [''],
  });

  readonly cardForm = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardName: ['', Validators.required],
    cardExpiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  readonly paymentMethods: { id: PaymentMethod; label: string; icon: string; type: 'card' | 'mobile' | 'bank' }[] = [
    { id: 'VISA', label: 'Tarjeta Visa', icon: 'fa-brands fa-cc-visa', type: 'card' },
    { id: 'MASTERCARD', label: 'Tarjeta Mastercard', icon: 'fa-brands fa-cc-mastercard', type: 'card' },
    { id: 'YAPE', label: 'Yape', icon: 'fa-solid fa-mobile-screen', type: 'mobile' },
    { id: 'PLIN', label: 'Plin', icon: 'fa-solid fa-mobile-screen', type: 'mobile' },
    { id: 'TRANSFER', label: 'Transferencia bancaria', icon: 'fa-solid fa-building-columns', type: 'bank' },
  ];

  readonly isCardPayment = computed(() =>
    this.selectedPayment() === 'VISA' || this.selectedPayment() === 'MASTERCARD'
  );

  readonly departments = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Ica', 'Cajamarca', 'Puno'];

  nextStep(): void {
    if (this.step() === 'datos') {
      if (this.personalForm.invalid) {
        this.personalForm.markAllAsTouched();
        return;
      }
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

  placeOrder(): void {
    this.processing.set(true);
    // Simulación del procesamiento del pago
    // El backend no tiene endpoint de órdenes disponible públicamente
    setTimeout(() => {
      const num = 'PX-' + Math.floor(Math.random() * 90000 + 10000);
      this.orderNumber.set(num);
      this.cart.clear();
      this.step.set('confirmacion');
      this.processing.set(false);
    }, 2000);
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    this.cardForm.patchValue({ cardNumber: val });
    input.value = val.replace(/(\d{4})/g, '$1 ').trim();
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
