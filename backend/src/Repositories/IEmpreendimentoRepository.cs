using Monitori.Api.Models;

namespace Monitori.Api.Repositories;

/// <summary>
/// Interface do repositório de empreendimentos.
/// Define operações de persistência sem expor detalhes do EF Core.
/// </summary>
/// <remarks>
/// Segue o padrão Repository para desacoplar a camada de dados.
/// Facilita testes unitários e troca de tecnologia de persistência.
/// </remarks>
public interface IEmpreendimentoRepository
{
    /// <summary>
    /// Lista empreendimentos com filtros e ordenação.
    /// </summary>
    /// <param name="filter">Critérios opcionais de filtro</param>
    /// <returns>Coleção de entidades</returns>
    Task<IEnumerable<Empreendimento>> GetAllAsync(EmpreendimentoFilter? filter = null);

    /// <summary>Busca por ID.</summary>
    /// <param name="id">GUID</param>
    /// <returns>Entidade ou null</returns>
    Task<Empreendimento?> GetByIdAsync(Guid id);

    /// <summary>Busca por CNPJ (para validação de unicidade).</summary>
    /// <param name="cnpj">CNPJ sem formatação</param>
    /// <returns>Entidade ou null</returns>
    Task<Empreendimento?> GetByCnpjAsync(string cnpj);

    /// <summary>Cria novo registro.</summary>
    /// <param name="empreendimento">Entidade populada</param>
    /// <returns>Entidade criada com ID</returns>
    Task<Empreendimento> CreateAsync(Empreendimento empreendimento);

    /// <summary>Atualiza registro existente.</summary>
    /// <param name="empreendimento">Entidade modificada</param>
    /// <returns>Entidade atualizada</returns>
    Task<Empreendimento> UpdateAsync(Empreendimento empreendimento);

    /// <summary>Obtém estatísticas agregadas.</summary>
    /// <returns>Contadores de ativos/inativos</returns>
    Task<DashboardStats> GetStatsAsync();
}
