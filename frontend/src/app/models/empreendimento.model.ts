export interface Empreendimento {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  status: StatusEmpreendimento;
  dataCriacao: Date;
}

export enum StatusEmpreendimento {
  Ativo = 0,
  Inativo = 1
}

export interface CriarEmpreendimentoRequest {
  nome: string;
  cnpj: string;
  endereco: string;
}

export interface AtualizarEmpreendimentoRequest {
  nome: string;
  endereco: string;
}

export interface EmpreendimentoFilter {
  nome?: string;
  status?: StatusEmpreendimento;
  ordenarPor?: string;
}

export interface DashboardStats {
  ativos: number;
  inativos: number;
  total: number;
}
