import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type ModalMode = 'closed' | 'create' | 'edit' | 'detail' | 'delete-confirm';
type RoleColor = 'red' | 'blue' | 'purple' | 'green' | 'gray';

interface PermissionModule {
  id: string;
  label: string;
}

interface PermissionAction {
  id: string;
  label: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  color: RoleColor;
  usersCount: number;
  permissions: string[]; // ["products.view", "products.create", ...]
  isSystem: boolean;
}

const MODULES: PermissionModule[] = [
  { id: 'products',  label: 'Productos' },
  { id: 'orders',    label: 'Pedidos'   },
  { id: 'customers', label: 'Clientes'  },
  { id: 'reports',   label: 'Reportes'  },
  { id: 'settings',  label: 'Ajustes'   },
  { id: 'roles',     label: 'Roles'     },
];

const ACTIONS: PermissionAction[] = [
  { id: 'view',   label: 'Ver'      },
  { id: 'create', label: 'Crear'    },
  { id: 'edit',   label: 'Editar'   },
  { id: 'delete', label: 'Eliminar' },
];

const ALL_PERMISSIONS: string[] = MODULES.flatMap((m) =>
  ACTIONS.map((a) => `${m.id}.${a.id}`),
);

@Component({
  selector: 'app-roles-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, ReactiveFormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  private fb = inject(FormBuilder);

  readonly modules = MODULES;
  readonly actions = ACTIONS;
  readonly totalPermissions = ALL_PERMISSIONS.length;

  readonly roles = signal<Role[]>([
    {
      id: 1,
      name: 'Administrador',
      description: 'Acceso total a todas las funciones del sistema.',
      color: 'red',
      usersCount: 3,
      permissions: [...ALL_PERMISSIONS],
      isSystem: true,
    },
    {
      id: 2,
      name: 'Gerente',
      description: 'Gestión completa de catálogo, pedidos y clientes. Sin acceso a configuración.',
      color: 'blue',
      usersCount: 5,
      permissions: [
        'products.view',  'products.create', 'products.edit', 'products.delete',
        'orders.view',    'orders.create',   'orders.edit',   'orders.delete',
        'customers.view', 'customers.create','customers.edit','customers.delete',
        'reports.view',
      ],
      isSystem: false,
    },
    {
      id: 3,
      name: 'Editor',
      description: 'Manejo de catálogo y reportes. Solo lectura de pedidos.',
      color: 'purple',
      usersCount: 8,
      permissions: [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view',
        'customers.view',
        'reports.view',
      ],
      isSystem: false,
    },
    {
      id: 4,
      name: 'Vendedor',
      description: 'Atiende pedidos y consulta clientes. No edita productos.',
      color: 'green',
      usersCount: 12,
      permissions: [
        'products.view',
        'orders.view', 'orders.create', 'orders.edit',
        'customers.view', 'customers.create',
      ],
      isSystem: false,
    },
    {
      id: 5,
      name: 'Soporte',
      description: 'Solo lectura de pedidos y clientes para resolver dudas.',
      color: 'gray',
      usersCount: 4,
      permissions: ['orders.view', 'customers.view', 'products.view', 'reports.view'],
      isSystem: false,
    },
  ]);

  readonly searchQuery = signal('');

  readonly filteredRoles = computed<Role[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.roles();
    return this.roles().filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  });

  readonly stats = computed(() => {
    const all = this.roles();
    const totalUsers = all.reduce((s, r) => s + r.usersCount, 0);
    const mostUsed = [...all].sort((a, b) => b.usersCount - a.usersCount)[0];
    return {
      totalRoles: all.length,
      totalUsers,
      totalPermissions: this.totalPermissions,
      mostUsedName: mostUsed?.name ?? '—',
    };
  });

  /* ---------- Modal ---------- */
  readonly modalMode = signal<ModalMode>('closed');
  readonly selectedRole = signal<Role | null>(null);
  readonly selectedPermissions = signal<Set<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    color: ['blue' as RoleColor, Validators.required],
  });

  readonly colorOptions: { value: RoleColor; label: string }[] = [
    { value: 'blue',   label: 'Azul'   },
    { value: 'green',  label: 'Verde'  },
    { value: 'purple', label: 'Morado' },
    { value: 'red',    label: 'Rojo'   },
    { value: 'gray',   label: 'Gris'   },
  ];

  /* ---------- Helpers ---------- */
  permissionCount(r: Role): number {
    return r.permissions.length;
  }

  permissionRatio(r: Role): string {
    return `${r.permissions.length}/${this.totalPermissions}`;
  }

  permissionPercent(r: Role): number {
    return Math.round((r.permissions.length / this.totalPermissions) * 100);
  }

  hasPermission(r: Role, key: string): boolean {
    return r.permissions.includes(key);
  }

  /* ---------- Matrix interaction (durante create/edit) ---------- */
  isChecked(moduleId: string, actionId: string): boolean {
    return this.selectedPermissions().has(`${moduleId}.${actionId}`);
  }

  togglePermission(moduleId: string, actionId: string): void {
    const key = `${moduleId}.${actionId}`;
    const set = new Set(this.selectedPermissions());
    if (set.has(key)) set.delete(key);
    else set.add(key);
    this.selectedPermissions.set(set);
  }

  isModuleAllChecked(moduleId: string): boolean {
    return this.actions.every((a) =>
      this.selectedPermissions().has(`${moduleId}.${a.id}`),
    );
  }

  isModuleSomeChecked(moduleId: string): boolean {
    return (
      !this.isModuleAllChecked(moduleId) &&
      this.actions.some((a) =>
        this.selectedPermissions().has(`${moduleId}.${a.id}`),
      )
    );
  }

  toggleModuleAll(moduleId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const set = new Set(this.selectedPermissions());
    for (const a of this.actions) {
      const key = `${moduleId}.${a.id}`;
      if (checked) set.add(key);
      else set.delete(key);
    }
    this.selectedPermissions.set(set);
  }

  checkAllPermissions(): void {
    this.selectedPermissions.set(new Set(ALL_PERMISSIONS));
  }

  clearAllPermissions(): void {
    this.selectedPermissions.set(new Set());
  }

  selectedCount(): number {
    return this.selectedPermissions().size;
  }

  /* ---------- Event handlers ---------- */
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------- Acciones de modal ---------- */
  openCreate(): void {
    this.selectedRole.set(null);
    this.form.reset({ name: '', description: '', color: 'blue' });
    this.selectedPermissions.set(new Set());
    this.modalMode.set('create');
  }

  openEdit(role: Role): void {
    this.selectedRole.set(role);
    this.form.reset({
      name: role.name,
      description: role.description,
      color: role.color,
    });
    this.selectedPermissions.set(new Set(role.permissions));
    this.modalMode.set('edit');
  }

  openDetail(role: Role): void {
    this.selectedRole.set(role);
    this.modalMode.set('detail');
  }

  requestDelete(role: Role): void {
    if (role.isSystem) return;
    this.selectedRole.set(role);
    this.modalMode.set('delete-confirm');
  }

  closeModal(): void {
    this.modalMode.set('closed');
    this.selectedRole.set(null);
    this.selectedPermissions.set(new Set());
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const permissions = Array.from(this.selectedPermissions());
    const current = this.selectedRole();

    if (current) {
      this.roles.update((list) =>
        list.map((r) =>
          r.id === current.id
            ? { ...current, ...value, permissions }
            : r,
        ),
      );
    } else {
      const nextId = Math.max(0, ...this.roles().map((r) => r.id)) + 1;
      this.roles.update((list) => [
        ...list,
        {
          id: nextId,
          ...value,
          permissions,
          usersCount: 0,
          isSystem: false,
        },
      ]);
    }

    this.closeModal();
  }

  confirmDelete(): void {
    const role = this.selectedRole();
    if (!role || role.isSystem) return;
    this.roles.update((list) => list.filter((r) => r.id !== role.id));
    this.closeModal();
  }

  editFromDetail(): void {
    const r = this.selectedRole();
    if (r) this.openEdit(r);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
