using System.ComponentModel.DataAnnotations;

namespace Monitori.Api.Models;

/// <summary>
/// Entidade de domínio principal: Empreendimento imobiliário.
/// Representa um projeto/construção gerenciado pelo sistema.
/// </summary>
/// <remarks>
/// Regras:
/// - Nome obrigatório, mínimo 3 caracteres
/// - CNPJ obrigatório e único no sistema
/// - Status inicial sempre Ativo
/// - Data de criação automática (UTC)
/// </remarks>
public class Empreendimento
{
    /// <summary>Identificador único gerado automaticamente</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Nome do empreendimento (obrigatório, mín 3 chars)</summary>
    [Required(ErrorMessage = "O nome é obrigatório")]
    [MinLength(3, ErrorMessage = "O nome deve ter pelo menos 3 caracteres")]
    public string Nome { get; set; } = string.Empty;

    /// <summary>CNPJ único do empreendimento (obrigatório)</summary>
    [Required(ErrorMessage = "O CNPJ é obrigatório")]
    public string Cnpj { get; set; } = string.Empty;

    /// <summary>Endereço completo (opcional)</summary>
    public string Endereco { get; set; } = string.Empty;

    /// <summary>Status: Ativo ou Inativo (padrão: Ativo)</summary>
    public StatusEmpreendimento Status { get; set; } = StatusEmpreendimento.Ativo;

    /// <summary>Data/hora de criação automática (UTC)</summary>
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Status possíveis de um empreendimento.
/// Usado para controle de ciclo de vida (soft delete).
/// </summary>
public enum StatusEmpreendimento
{
    /// <summary>Empreendimento ativo e editável</summary>
    Ativo,
    
    /// <summary>Empreendimento inativo (soft delete), não editável</summary>
    Inativo
}
