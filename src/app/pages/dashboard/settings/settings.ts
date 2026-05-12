import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type Section = 'general' | 'store' | 'payments' | 'shipping' | 'notifications';

interface SectionDef {
  id: Section;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private fb = inject(FormBuilder);

  readonly activeSection = signal<Section>('general');
  readonly toastMessage = signal<string | null>(null);

  readonly sections: SectionDef[] = [
    { id: 'general',       label: 'General',        icon: 'fa-circle-user',  description: 'Información de tu cuenta de administrador.' },
    { id: 'store',         label: 'Tienda',         icon: 'fa-store',        description: 'Datos públicos de tu tienda online.' },
    { id: 'payments',      label: 'Pagos',          icon: 'fa-credit-card',  description: 'Métodos de pago aceptados y configuración fiscal.' },
    { id: 'shipping',      label: 'Envíos',         icon: 'fa-truck-fast',   description: 'Costos y zonas de cobertura.' },
    { id: 'notifications', label: 'Notificaciones', icon: 'fa-bell',         description: '¿Cuándo y cómo quieres ser notificado?' },
  ];

  /* ---------- Formularios por sección ---------- */
  readonly generalForm = this.fb.nonNullable.group({
    adminName: ['Admin Principal', [Validators.required, Validators.minLength(3)]],
    email: ['admin@pixelbase.io', [Validators.required, Validators.email]],
    language: ['es', Validators.required],
    timezone: ['America/Lima', Validators.required],
  });

  readonly storeForm = this.fb.nonNullable.group({
    storeName: ['PixelBase', [Validators.required, Validators.minLength(3)]],
    storeEmail: ['contacto@pixelbase.io', [Validators.required, Validators.email]],
    storePhone: ['+51 999 888 777', Validators.required],
    storeAddress: ['Av. La Marina 1234, San Miguel, Lima', Validators.required],
    currency: ['PEN', Validators.required],
    logoUrl: ['/img/logo-pixelBase.png', Validators.required],
  });

  readonly paymentsForm = this.fb.nonNullable.group({
    visa:     [true],
    mastercard:[true],
    yape:     [true],
    plin:     [true],
    pagoEfectivo: [false],
    transferBank: [false],
    igvPercent: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  readonly shippingForm = this.fb.nonNullable.group({
    baseCost: [15, [Validators.required, Validators.min(0)]],
    freeFrom: [500, [Validators.required, Validators.min(0)]],
    coverage: ['Lima Metropolitana, Callao', Validators.required],
    estimatedDays: [3, [Validators.required, Validators.min(1)]],
    pickupAvailable: [true],
  });

  readonly notificationsForm = this.fb.nonNullable.group({
    emailNewOrder: [true],
    emailLowStock: [true],
    emailDailySummary: [false],
    pushNotifications: [true],
    smsImportantUpdates: [false],
    lowStockThreshold: [5, [Validators.required, Validators.min(1)]],
  });

  /* ---------- Helpers ---------- */
  isActive(section: Section): boolean {
    return this.activeSection() === section;
  }

  setSection(section: Section): void {
    this.activeSection.set(section);
  }

  currentSectionDef(): SectionDef {
    return this.sections.find((s) => s.id === this.activeSection())!;
  }

  /* ---------- Save handlers ---------- */
  save(section: Section): void {
    const form = this.formFor(section);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.showToast('Cambios guardados correctamente');
  }

  reset(section: Section): void {
    this.formFor(section).reset(this.defaultValuesFor(section));
    this.showToast('Valores restaurados');
  }

  private formFor(section: Section): FormGroup {
    switch (section) {
      case 'general':       return this.generalForm;
      case 'store':         return this.storeForm;
      case 'payments':      return this.paymentsForm;
      case 'shipping':      return this.shippingForm;
      case 'notifications': return this.notificationsForm;
    }
  }

  private defaultValuesFor(section: Section): Record<string, unknown> {
    const defaults: Record<Section, Record<string, unknown>> = {
      general: {
        adminName: 'Admin Principal',
        email: 'admin@pixelbase.io',
        language: 'es',
        timezone: 'America/Lima',
      },
      store: {
        storeName: 'PixelBase',
        storeEmail: 'contacto@pixelbase.io',
        storePhone: '+51 999 888 777',
        storeAddress: 'Av. La Marina 1234, San Miguel, Lima',
        currency: 'PEN',
        logoUrl: '/img/logo-pixelBase.png',
      },
      payments: {
        visa: true, mastercard: true, yape: true, plin: true,
        pagoEfectivo: false, transferBank: false, igvPercent: 18,
      },
      shipping: {
        baseCost: 15, freeFrom: 500,
        coverage: 'Lima Metropolitana, Callao',
        estimatedDays: 3, pickupAvailable: true,
      },
      notifications: {
        emailNewOrder: true, emailLowStock: true, emailDailySummary: false,
        pushNotifications: true, smsImportantUpdates: false, lowStockThreshold: 5,
      },
    };
    return defaults[section];
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(message: string): void {
    this.toastMessage.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
