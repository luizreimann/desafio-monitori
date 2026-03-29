import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <img src="assets/logo-black.svg" alt="Monitori" class="logo-img">
          </div>
          <nav class="nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <i class="fa-solid fa-list"></i> Empreendimentos
            </a>
            <a routerLink="/dashboard" routerLinkActive="active">
              <i class="fa-solid fa-chart-pie"></i> Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #FAFAFA;
    }
    .header {
      background-color: #FAFAFA;
      border-bottom: 2px solid #E34444;
      color: #1B2735;
      padding: 0 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .logo {
      display: flex;
      align-items: center;
    }
    .logo-img {
      height: 40px;
      width: auto;
    }
    .nav {
      display: flex;
      gap: 0.5rem;
    }
    .nav a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: #1B2735;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    .nav a:hover {
      color: #E34444;
      background-color: rgba(227, 68, 68, 0.1);
    }
    .nav a.active {
      color: white;
      background-color: #E34444;
    }
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        height: auto;
        padding: 1rem 0;
        gap: 1rem;
      }
      .nav {
        flex-wrap: wrap;
        justify-content: center;
      }
      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {}
