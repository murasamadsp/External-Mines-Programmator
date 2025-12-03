import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="admin-container">
      <nav class="admin-nav">
        <h2>Admin Panel</h2>
        <ul>
          <li><a routerLink="dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="users" routerLinkActive="active">Users</a></li>
        </ul>
      </nav>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      height: 100vh;
    }

    .admin-nav {
      width: 200px;
      background: #f5f5f5;
      padding: 1rem;
      border-right: 1px solid #ddd;
    }

    .admin-nav ul {
      list-style: none;
      padding: 0;
    }

    .admin-nav a {
      display: block;
      padding: 0.5rem;
      text-decoration: none;
      color: #333;
    }

    .admin-nav a.active {
      background: #007bff;
      color: white;
    }

    .admin-content {
      flex: 1;
      padding: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}