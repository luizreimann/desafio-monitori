import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { Empreendimento, StatusEmpreendimento, DashboardStats } from '../../models/empreendimento.model';

@Component({
  selector: 'app-listagem',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div class="header-left">
        <h1>Gestão de Empreendimentos</h1>
        <p>Cadastre e gerencie seus empreendimentos imobiliários</p>
      </div>
      <a routerLink="/cadastrar" class="btn-primary">
        <i class="fa-solid fa-plus"></i> Novo Empreendimento
      </a>
    </div>

    <div class="stats-cards">
      <div class="stat-card ativos">
        <div class="stat-icon"><i class="fa-solid fa-check-circle"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{stats.ativos}}</span>
          <span class="stat-label">Ativos</span>
        </div>
      </div>
      <div class="stat-card inativos">
        <div class="stat-icon"><i class="fa-solid fa-pause-circle"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{stats.inativos}}</span>
          <span class="stat-label">Inativos</span>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon"><i class="fa-solid fa-building"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{stats.total}}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <form [formGroup]="filterForm" class="filter-form">
        <div class="filter-group">
          <label><i class="fa-solid fa-search"></i> Buscar por nome</label>
          <input type="text" formControlName="nome" placeholder="Digite o nome do empreendimento">
        </div>
        <div class="filter-group">
          <label><i class="fa-solid fa-filter"></i> Status</label>
          <select formControlName="status">
            <option value="">Todos</option>
            <option value="0">Ativo</option>
            <option value="1">Inativo</option>
          </select>
        </div>
        <div class="filter-group">
          <label><i class="fa-solid fa-sort"></i> Ordenar por</label>
          <select formControlName="ordenarPor">
            <option value="">Data de criação</option>
            <option value="nome">Nome</option>
            <option value="data">Data (antigos primeiro)</option>
          </select>
        </div>
      </form>
    </div>

    <div class="loading-overlay" *ngIf="loading">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>

    <div class="error-message" *ngIf="error">
      <i class="fa-solid fa-exclamation-triangle"></i>
      {{error}}
    </div>

    <div class="success-message" *ngIf="successMessage">
      <i class="fa-solid fa-check-circle"></i>
      {{successMessage}}
    </div>

    <div class="table-container" *ngIf="!loading && !error">
      <table class="data-table" *ngIf="empreendimentos.length > 0">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Endereço</th>
            <th>Status</th>
            <th>Data de Criação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let emp of empreendimentos" [class.inativo]="emp.status === StatusEmpreendimento.Inativo">
            <td class="nome">{{emp.nome}}</td>
            <td class="cnpj">{{formatCnpj(emp.cnpj)}}</td>
            <td class="endereco">{{emp.endereco || '-'}}</td>
            <td>
              <span class="status-badge" [class.ativo]="emp.status === StatusEmpreendimento.Ativo" [class.inativo]="emp.status === StatusEmpreendimento.Inativo">
                {{emp.status === StatusEmpreendimento.Ativo ? 'Ativo' : 'Inativo'}}
              </span>
            </td>
            <td class="data">{{emp.dataCriacao | date:'dd/MM/yyyy HH:mm'}}</td>
            <td class="acoes">
              <button 
                class="btn-icon edit" 
                [routerLink]="['/editar', emp.id]"
                [disabled]="emp.status === StatusEmpreendimento.Inativo"
                title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button 
                class="btn-icon inativar" 
                (click)="inativar(emp)"
                [disabled]="emp.status === StatusEmpreendimento.Inativo"
                title="Inativar">
                <i class="fa-solid fa-ban"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty-state" *ngIf="empreendimentos.length === 0">
        <i class="fa-solid fa-folder-open"></i>
        <h3>Nenhum empreendimento encontrado</h3>
        <p>Cadastre seu primeiro empreendimento clicando no botão acima.</p>
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
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background-color: #E34444;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary:hover {
      background-color: #c73a3a;
      transform: translateY(-1px);
    }
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .stat-card.ativos { border-left: 4px solid #10b981; }
    .stat-card.inativos { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #E34444; }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .stat-card.ativos .stat-icon { background-color: #d1fae5; color: #10b981; }
    .stat-card.inativos .stat-icon { background-color: #fef3c7; color: #f59e0b; }
    .stat-card.total .stat-icon { background-color: #fee2e2; color: #E34444; }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1B2735;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    .filter-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 1.5rem;
    }
    .filter-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1B2735;
    }
    .filter-group label i {
      margin-right: 0.5rem;
      color: #E34444;
    }
    .filter-group input,
    .filter-group select {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9375rem;
      transition: border-color 0.2s ease;
    }
    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: #E34444;
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
    .error-message, .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .error-message {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .success-message {
      background-color: #d1fae5;
      color: #059669;
    }
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      background-color: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table tr:hover td {
      background-color: #f9fafb;
    }
    .data-table tr.inativo {
      opacity: 0.6;
    }
    .data-table tr.inativo:hover td {
      background-color: #f3f4f6;
    }
    .nome {
      font-weight: 500;
      color: #1B2735;
    }
    .cnpj {
      font-family: monospace;
      color: #6b7280;
    }
    .endereco {
      color: #6b7280;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.ativo {
      background-color: #d1fae5;
      color: #059669;
    }
    .status-badge.inativo {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .acoes {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .btn-icon.edit {
      background-color: #dbeafe;
      color: #2563eb;
    }
    .btn-icon.edit:hover:not(:disabled) {
      background-color: #bfdbfe;
    }
    .btn-icon.inativar {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .btn-icon.inativar:hover:not(:disabled) {
      background-color: #fecaca;
    }
    .btn-icon:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }
    .empty-state i {
      font-size: 4rem;
      color: #e5e7eb;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }
    .empty-state p {
      margin: 0;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
      .filter-form {
        grid-template-columns: 1fr;
      }
      .data-table {
        font-size: 0.875rem;
      }
      .data-table th,
      .data-table td {
        padding: 0.75rem 0.5rem;
      }
    }
  `]
})
export class ListagemComponent implements OnInit {
  empreendimentos: Empreendimento[] = [];
  stats: DashboardStats = { ativos: 0, inativos: 0, total: 0 };
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  filterForm: FormGroup;
  StatusEmpreendimento = StatusEmpreendimento;

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      nome: [''],
      status: [''],
      ordenarPor: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.filterForm.valueChanges.subscribe(() => {
      this.loadEmpreendimentos();
    });
  }

  loadData(): void {
    this.loadEmpreendimentos();
    this.loadStats();
  }

  loadEmpreendimentos(): void {
    this.loading = true;
    this.error = null;
    
    const filter = {
      nome: this.filterForm.value.nome || undefined,
      status: this.filterForm.value.status !== '' ? parseInt(this.filterForm.value.status) : undefined,
      ordenarPor: this.filterForm.value.ordenarPor || undefined
    };

    this.empreendimentoService.getAll(filter).subscribe({
      next: (data) => {
        this.empreendimentos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.empreendimentoService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      }
    });
  }

  inativar(emp: Empreendimento): void {
    if (confirm(`Deseja inativar o empreendimento "${emp.nome}"?`)) {
      this.loading = true;
      this.empreendimentoService.inativar(emp.id).subscribe({
        next: () => {
          this.successMessage = 'Empreendimento inativado com sucesso!';
          this.loadData();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
    }
  }

  formatCnpj(cnpj: string): string {
    if (cnpj.length === 14) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
    }
    return cnpj;
  }
}
