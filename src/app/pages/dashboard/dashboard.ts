import { Component } from '@angular/core';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { AdminHeader } from './components/admin-header/admin-header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminSidebar, AdminHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
