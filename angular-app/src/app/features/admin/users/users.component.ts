import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-users">
      <h2>User Management</h2>
      <p>Manage system users here.</p>
    </div>
  `,
  styles: [
    `
      .admin-users {
        padding: 2rem;
      }
    `,
  ],
})
export class AdminUsersComponent {}
