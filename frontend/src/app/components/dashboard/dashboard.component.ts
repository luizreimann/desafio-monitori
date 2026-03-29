import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { DashboardStats } from '../../models/empreendimento.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div class="header-left">
        <h1>Dashboard</h1>
        <p>Visão geral dos empreendimentos</p>
      </div>
      <a routerLink="/" class="btn-secondary">
        <i class="fa-solid fa-arrow-left"></i> Voltar para listagem
      </a>
    </div>

    <div class="loading-overlay" *ngIf="loading">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>

    <div class="error-message" *ngIf="error">
      <i class="fa-solid fa-exclamation-triangle"></i>
      {{error}}
    </div>

    <div class="dashboard-content" *ngIf="!loading && !error">
      <div class="stats-overview">
        <div class="stat-card ativos">
          <div class="stat-icon">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{stats.ativos}}</span>
            <span class="stat-label">Empreendimentos Ativos</span>
          </div>
        </div>
        <div class="stat-card inativos">
          <div class="stat-icon">
            <i class="fa-solid fa-pause-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{stats.inativos}}</span>
            <span class="stat-label">Empreendimentos Inativos</span>
          </div>
        </div>
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fa-solid fa-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{stats.total}}</span>
            <span class="stat-label">Total de Empreendimentos</span>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-card">
          <div class="chart-header">
            <h2>
              <i class="fa-solid fa-chart-pie"></i>
              Distribuição por Status
            </h2>
            <button class="btn-refresh" (click)="refreshData()" [disabled]="refreshing">
              <i class="fa-solid" [class.fa-sync-alt]="!refreshing" [class.fa-spinner.fa-spin]="refreshing"></i>
              {{refreshing ? 'Atualizando...' : 'Atualizar'}}
            </button>
          </div>
          
          <div class="chart-content">
            <div class="chart-visual">
              <!-- Gráfico SVG de Pizza -->
              <svg *ngIf="stats.total > 0" viewBox="-10 -10 220 220" width="220" height="220" class="pie-chart-svg">
                <!-- Círculo de fundo -->
                <circle cx="100" cy="100" r="80" fill="#f3f4f6"/>
                
                <!-- Fatia Ativos (verde) - calculada dinamicamente -->
                <circle *ngIf="stats.ativos > 0" cx="100" cy="100" r="80" fill="transparent" 
                        [attr.stroke]="'#10b981'" stroke-width="60"
                        [attr.stroke-dasharray]="getCircleDash(stats.ativos)"
                        stroke-dashoffset="0"
                        transform="rotate(-90 100 100)"/>
                
                <!-- Fatia Inativos (laranja) -->
                <circle *ngIf="stats.inativos > 0" cx="100" cy="100" r="80" fill="transparent"
                        [attr.stroke]="'#f59e0b'" stroke-width="60"
                        [attr.stroke-dasharray]="getCircleDash(stats.inativos)"
                        [attr.stroke-dashoffset]="getCircleOffset(stats.ativos)"
                        transform="rotate(-90 100 100)"/>
                
                <!-- Centro branco para criar donut -->
                <circle cx="100" cy="100" r="50" fill="white"/>
                
                <!-- Texto central -->
                <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="600" fill="#1B2735">{{stats.total}}</text>
                <text x="100" y="110" text-anchor="middle" font-size="10" fill="#6b7280">Total</text>
              </svg>
              
              <div class="empty-chart" *ngIf="stats.total === 0">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Sem dados</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color ativos"></div>
                <div class="legend-info">
                  <span class="legend-label">Ativos</span>
                  <span class="legend-value">{{stats.ativos}} ({{getPercentage(stats.ativos)}}%)</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-color inativos"></div>
                <div class="legend-info">
                  <span class="legend-label">Inativos</span>
                  <span class="legend-value">{{stats.inativos}} ({{getPercentage(stats.inativos)}}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="last-update">
            <i class="fa-solid fa-clock"></i>
            Última atualização: {{lastUpdate | date:'dd/MM/yyyy HH:mm:ss'}}
          </div>
        </div>

        <div class="info-card">
          <h3>
            <i class="fa-solid fa-info-circle"></i>
            Informações
          </h3>
          <p>Este dashboard exibe a distribuição dos empreendimentos cadastrados no sistema por status.</p>
          <p>Os dados são atualizados automaticamente a cada 30 segundos ou manualmente ao clicar no botão de atualizar.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }
    .header-left h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #1B2735;
      margin: 0 0 0.5rem 0;
    }
    .header-left p {
      color: #666;
      margin: 0;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
    }
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #E34444;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background-color: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.75rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .stat-card.ativos { border-left: 4px solid #10b981; }
    .stat-card.inativos { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #E34444; }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }
    .stat-card.ativos .stat-icon { background-color: #d1fae5; color: #10b981; }
    .stat-card.inativos .stat-icon { background-color: #fef3c7; color: #f59e0b; }
    .stat-card.total .stat-icon { background-color: #fee2e2; color: #E34444; }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1B2735;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    .chart-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    .chart-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 1.5rem;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .chart-header h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1B2735;
      margin: 0;
    }
    .chart-header h2 i {
      color: #E34444;
    }
    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #374151;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-refresh:hover:not(:disabled) {
      background: #f3f4f6;
    }
    .btn-refresh:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .chart-content {
      display: flex;
      align-items: center;
      gap: 3rem;
    }
    .chart-visual {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .pie-chart-svg {
      transform: rotate(0deg);
    }
    .pie-chart-svg circle {
      transition: all 0.3s ease;
    }
    .empty-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #9ca3af;
    }
    .empty-chart i {
      font-size: 4rem;
    }
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
    .legend-color.ativos { background-color: #10b981; }
    .legend-color.inativos { background-color: #f59e0b; }
    .legend-info {
      display: flex;
      flex-direction: column;
    }
    .legend-label {
      font-weight: 500;
      color: #374151;
    }
    .legend-value {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .last-update {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .info-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 1.5rem;
    }
    .info-card h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1B2735;
      margin: 0 0 1rem 0;
    }
    .info-card h3 i {
      color: #3b82f6;
    }
    .info-card p {
      color: #6b7280;
      font-size: 0.9375rem;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }
    .auto-refresh-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .auto-refresh-indicator.active {
      background: #d1fae5;
      color: #059669;
    }
    @media (max-width: 1024px) {
      .chart-section {
        grid-template-columns: 1fr;
      }
      .chart-content {
        flex-direction: column;
      }
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = { ativos: 0, inativos: 0, total: 0 };
  loading = true;
  refreshing = false;
  error: string | null = null;
  lastUpdate = new Date();
  autoRefreshEnabled = true;
  private refreshInterval: any;

  constructor(private empreendimentoService: EmpreendimentoService) {}

  ngOnInit(): void {
    this.loadStats();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.autoRefreshEnabled) {
        this.loadStats(false);
      }
    }, 30000);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.error = null;

    this.empreendimentoService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.lastUpdate = new Date();
        this.loading = false;
        this.refreshing = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        this.refreshing = false;
      }
    });
  }

  refreshData(): void {
    this.refreshing = true;
    this.loadStats(false);
  }

  getPercentage(value: number): string {
    if (this.stats.total === 0) return '0';
    return ((value / this.stats.total) * 100).toFixed(1);
  }

  // Cálculos para o gráfico SVG donut
  private readonly CIRCLE_RADIUS = 80;
  private readonly CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 80; // ~502.65

  getCircleDash(value: number): string {
    if (this.stats.total === 0) return '0 502.65';
    const percentage = value / this.stats.total;
    const dashLength = percentage * this.CIRCLE_CIRCUMFERENCE;
    return `${dashLength} ${this.CIRCLE_CIRCUMFERENCE}`;
  }

  getCircleOffset(ativosValue: number): string {
    if (this.stats.total === 0) return '0';
    const percentage = ativosValue / this.stats.total;
    const offset = -(percentage * this.CIRCLE_CIRCUMFERENCE);
    return `${offset}`;
  }
}
