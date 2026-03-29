import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empreendimento, CriarEmpreendimentoRequest, AtualizarEmpreendimentoRequest, EmpreendimentoFilter, DashboardStats } from '../models/empreendimento.model';

@Injectable({
  providedIn: 'root'
})
export class EmpreendimentoService {
  private apiUrl = '/api/empreendimentos';

  constructor(private http: HttpClient) {}

  getAll(filter?: EmpreendimentoFilter): Observable<Empreendimento[]> {
    let params = new HttpParams();
    
    if (filter?.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter?.status !== undefined) {
      params = params.set('status', filter.status.toString());
    }
    if (filter?.ordenarPor) {
      params = params.set('ordenarPor', filter.ordenarPor);
    }

    return this.http.get<Empreendimento[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Empreendimento> {
    return this.http.get<Empreendimento>(`${this.apiUrl}/${id}`);
  }

  create(request: CriarEmpreendimentoRequest): Observable<Empreendimento> {
    return this.http.post<Empreendimento>(this.apiUrl, request);
  }

  update(id: string, request: AtualizarEmpreendimentoRequest): Observable<Empreendimento> {
    return this.http.put<Empreendimento>(`${this.apiUrl}/${id}`, request);
  }

  inativar(id: string): Observable<Empreendimento> {
    return this.http.post<Empreendimento>(`${this.apiUrl}/${id}/inativar`, {});
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
