import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { Empreendimento, CriarEmpreendimentoRequest, AtualizarEmpreendimentoRequest } from '../../models/empreendimento.model';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <button class="btn-back" (click)="voltar()">
        <i class="fa-solid fa-arrow-left"></i> Voltar
      </button>
      <h1>{{isEdicao ? 'Editar' : 'Novo'}} Empreendimento</h1>
    </div>

    <div class="loading-overlay" *ngIf="loading">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>

    <div class="error-message" *ngIf="error">
      <i class="fa-solid fa-exclamation-triangle"></i>
      {{error}}
    </div>

    <div class="form-container" *ngIf="!loading">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="nome">
            <i class="fa-solid fa-building"></i> Nome *
          </label>
          <input 
            type="text" 
            id="nome" 
            formControlName="nome"
            placeholder="Digite o nome do empreendimento"
            [class.error]="form.get('nome')?.invalid && form.get('nome')?.touched">
          <div class="error-text" *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched">
            <span *ngIf="form.get('nome')?.errors?.['required']">Nome é obrigatório</span>
            <span *ngIf="form.get('nome')?.errors?.['minlength']">Nome deve ter pelo menos 3 caracteres</span>
          </div>
        </div>

        <div class="form-group" *ngIf="!isEdicao">
          <label for="cnpj">
            <i class="fa-solid fa-id-card"></i> CNPJ *
          </label>
          <input 
            type="text" 
            id="cnpj" 
            formControlName="cnpj"
            placeholder="00.000.000/0000-00"
            maxlength="18"
            [class.error]="form.get('cnpj')?.invalid && form.get('cnpj')?.touched"
            (input)="formatarCnpj($event)">
          <div class="error-text" *ngIf="form.get('cnpj')?.invalid && form.get('cnpj')?.touched">
            CNPJ é obrigatório
          </div>
        </div>

        <div class="form-group">
          <label for="endereco">
            <i class="fa-solid fa-map-marker-alt"></i> Endereço
          </label>
          <input 
            type="text" 
            id="endereco" 
            formControlName="endereco"
            placeholder="Digite o endereço completo">
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="voltar()">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
            <span *ngIf="!saving">
              <i class="fa-solid" [class.fa-save]="isEdicao" [class.fa-plus]="!isEdicao"></i>
              {{isEdicao ? 'Salvar' : 'Cadastrar'}}
            </span>
            <span *ngIf="saving">
              <i class="fa-solid fa-spinner fa-spin"></i>
              Salvando...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: all 0.2s ease;
    }
    .btn-back:hover {
      background-color: #f9fafb;
      color: #374151;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1B2735;
      margin: 0;
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
    .form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 2rem;
      max-width: 600px;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-group label i {
      color: #E34444;
    }
    .form-group input {
      width: 100%;
      padding: 0.875rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9375rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #E34444;
      box-shadow: 0 0 0 3px rgba(227, 68, 68, 0.1);
    }
    .form-group input.error {
      border-color: #dc2626;
    }
    .form-group input.error:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.375rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    .btn-secondary {
      padding: 0.875rem 1.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background-color: #E34444;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #c73a3a;
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    @media (max-width: 640px) {
      .form-container {
        padding: 1.5rem;
      }
      .form-actions {
        flex-direction: column-reverse;
      }
      .form-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class FormularioComponent implements OnInit {
  form: FormGroup;
  isEdicao = false;
  empreendimentoId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private empreendimentoService: EmpreendimentoService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', Validators.required],
      endereco: ['']
    });
  }

  ngOnInit(): void {
    this.empreendimentoId = this.route.snapshot.paramMap.get('id');
    this.isEdicao = !!this.empreendimentoId;

    if (this.isEdicao) {
      this.form.get('cnpj')?.disable();
      this.carregarEmpreendimento();
    }
  }

  carregarEmpreendimento(): void {
    if (!this.empreendimentoId) return;
    
    this.loading = true;
    this.empreendimentoService.getById(this.empreendimentoId).subscribe({
      next: (emp) => {
        this.form.patchValue({
          nome: emp.nome,
          endereco: emp.endereco
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  formatarCnpj(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 14) value = value.slice(0, 14);
    
    if (value.length > 12) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d+)/, '$1.$2');
    }
    
    input.value = value;
    this.form.get('cnpj')?.setValue(value.replace(/\D/g, ''));
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    this.error = null;

    if (this.isEdicao) {
      const request: AtualizarEmpreendimentoRequest = {
        nome: this.form.value.nome.trim(),
        endereco: this.form.value.endereco?.trim() || ''
      };

      this.empreendimentoService.update(this.empreendimentoId!, request).subscribe({
        next: () => {
          this.router.navigate(['/'], { queryParams: { sucesso: 'editado' } });
        },
        error: (err) => {
          this.error = err.message;
          this.saving = false;
        }
      });
    } else {
      const request: CriarEmpreendimentoRequest = {
        nome: this.form.value.nome.trim(),
        cnpj: this.form.value.cnpj.replace(/\D/g, ''),
        endereco: this.form.value.endereco?.trim() || ''
      };

      this.empreendimentoService.create(request).subscribe({
        next: () => {
          this.router.navigate(['/'], { queryParams: { sucesso: 'criado' } });
        },
        error: (err) => {
          this.error = err.message;
          this.saving = false;
        }
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
