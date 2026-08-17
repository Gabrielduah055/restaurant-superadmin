import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-super-admin-layout',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './super-admin-layout.component.html',
  styleUrl: './super-admin-layout.component.scss',
})
export class SuperAdminLayoutComponent {
  mobileNavigationOpen = false;
}
