using Monitori.Api.Models;

namespace Monitori.Api.Services;

/// <summary>
/// Interface do serviço de empreendimentos.
/// Define as operações de negócio para gerenciamento de empreendimentos imobiliários.
/// </summary>
/// <remarks>
/// Regras de negócio implementadas:
/// - Nome mínimo: 3 caracteres
/// - CNPJ único no sistema
/// - Status inicial: Ativo
/// - Empreendimentos inativos não podem ser editados
/// </remarks>
public interface IEmpreendimentoService
{
    /// <summary>
    /// Lista todos os empreendimentos com filtros e ordenação opcionais.
    /// </summary>
    /// <param name="filter">Critérios de filtro e ordenação (nome, status, ordenarPor)</param>
    /// <returns>Coleção de empreendimentos em formato DTO</returns>
    Task<IEnumerable<EmpreendimentoDto>> GetAllAsync(EmpreendimentoFilter? filter = null);

    /// <summary>
    /// Busca um empreendimento específico pelo ID.
    /// </summary>
    /// <param name="id">GUID do empreendimento</param>
    /// <returns>DTO do empreendimento ou null se não encontrado</returns>
    Task<EmpreendimentoDto?> GetByIdAsync(Guid id);

    /// <summary>
    /// Cria um novo empreendimento aplicando validações de negócio.
    /// </summary>
    /// <param name="request">Dados do novo empreendimento</param>
    /// <returns>DTO do empreendimento criado com ID gerado</returns>
    /// <exception cref="ArgumentException">Quando nome tem menos de 3 caracteres ou CNPJ está vazio</exception>
    /// <exception cref="InvalidOperationException">Quando CNPJ já existe no sistema</exception>
    Task<EmpreendimentoDto> CreateAsync(CriarEmpreendimentoRequest request);

    /// <summary>
    /// Atualiza um empreendimento existente.
    /// Restrição: não permite edição de empreendimentos inativos.
    /// </summary>
    /// <param name="id">GUID do empreendimento</param>
    /// <param name="request">Novos dados (nome e endereço)</param>
    /// <returns>DTO atualizado</returns>
    /// <exception cref="KeyNotFoundException">Quando empreendimento não existe</exception>
    /// <exception cref="InvalidOperationException">Quando empreendimento está inativo</exception>
    /// <exception cref="ArgumentException">Quando nome tem menos de 3 caracteres</exception>
    Task<EmpreendimentoDto> UpdateAsync(Guid id, AtualizarEmpreendimentoRequest request);

    /// <summary>
    /// Inativa um empreendimento (soft delete).
    /// O registro permanece no banco com status = Inativo.
    /// </summary>
    /// <param name="id">GUID do empreendimento</param>
    /// <returns>DTO com status alterado para Inativo</returns>
    /// <exception cref="KeyNotFoundException">Quando empreendimento não existe</exception>
    /// <exception cref="InvalidOperationException">Quando já está inativo</exception>
    Task<EmpreendimentoDto> InativarAsync(Guid id);

    /// <summary>
    /// Obtém estatísticas agregadas para o dashboard.
    /// Contagem em tempo real de ativos, inativos e total.
    /// </summary>
    /// <returns>Objeto com contadores</returns>
    Task<DashboardStats> GetStatsAsync();
}
