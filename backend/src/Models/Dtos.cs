namespace Monitori.Api.Models;

/// <summary>
/// DTO para exposição de empreendimentos na API.
/// Representa a visão completa da entidade para leitura.
/// </summary>
public class EmpreendimentoDto
{
    /// <summary>Identificador único GUID</summary>
    public Guid Id { get; set; }
    
    /// <summary>Nome do empreendimento (mínimo 3 caracteres)</summary>
    public string Nome { get; set; } = string.Empty;
    
    /// <summary>CNPJ único do empreendimento</summary>
    public string Cnpj { get; set; } = string.Empty;
    
    /// <summary>Endereço completo (opcional)</summary>
    public string Endereco { get; set; } = string.Empty;
    
    /// <summary>Status: 0=Ativo, 1=Inativo</summary>
    public StatusEmpreendimento Status { get; set; }
    
    /// <summary>Data/hora de criação UTC</summary>
    public DateTime DataCriacao { get; set; }
}

/// <summary>
/// Request para criação de novo empreendimento.
/// Todas as regras de validação são aplicadas no service.
/// </summary>
public class CriarEmpreendimentoRequest
{
    /// <summary>Nome do empreendimento (obrigatório, mín 3 caracteres)</summary>
    public string Nome { get; set; } = string.Empty;
    
    /// <summary>CNPJ do empreendimento (obrigatório, único)</summary>
    public string Cnpj { get; set; } = string.Empty;
    
    /// <summary>Endereço completo (opcional)</summary>
    public string Endereco { get; set; } = string.Empty;
}

/// <summary>
/// Request para atualização de empreendimento.
/// Campos disponíveis: Nome e Endereço (CNPJ não pode ser alterado).
/// </summary>
public class AtualizarEmpreendimentoRequest
{
    /// <summary>Nome atualizado (obrigatório, mín 3 caracteres)</summary>
    public string Nome { get; set; } = string.Empty;
    
    /// <summary>Endereço atualizado (opcional)</summary>
    public string Endereco { get; set; } = string.Empty;
}

/// <summary>
/// Filtros para listagem de empreendimentos.
/// Todos os campos são opcionais.
/// </summary>
public class EmpreendimentoFilter
{
    /// <summary>Filtro por nome (busca parcial, case-insensitive)</summary>
    public string? Nome { get; set; }
    
    /// <summary>Filtro por status: 0=Ativo, 1=Inativo</summary>
    public StatusEmpreendimento? Status { get; set; }
    
    /// <summary>Ordenação: "nome", "data" ou padrão (data desc)</summary>
    public string? OrdenarPor { get; set; }
}

/// <summary>
/// Estatísticas para o dashboard.
/// Dados agregados em tempo real.
/// </summary>
public class DashboardStats
{
    /// <summary>Quantidade de empreendimentos ativos</summary>
    public int Ativos { get; set; }
    
    /// <summary>Quantidade de empreendimentos inativos</summary>
    public int Inativos { get; set; }
    
    /// <summary>Total de empreendimentos (Ativos + Inativos)</summary>
    public int Total => Ativos + Inativos;
}

/// <summary>
/// Modelo padronizado para respostas de erro.
/// Usado em todos os endpoints para consistência.
/// </summary>
public class ErrorResponse
{
    /// <summary>Mensagem amigável para o usuário</summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>Detalhes técnicos (apenas em desenvolvimento)</summary>
    public string? Details { get; set; }
}
