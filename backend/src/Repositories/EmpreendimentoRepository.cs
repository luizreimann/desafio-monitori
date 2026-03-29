using Microsoft.EntityFrameworkCore;
using Monitori.Api.Data;
using Monitori.Api.Models;

namespace Monitori.Api.Repositories;

/// <summary>
/// Implementação do repositório de empreendimentos usando EF Core.
/// Responsável por todas as operações de persistência no banco de dados.
/// </summary>
/// <remarks>
/// Implementa padrões:
/// - Query filtering com IQueryable para performance
/// - Async/await para operações não-bloqueantes
/// - Soft delete via status (não exclui fisicamente)
/// </remarks>
public class EmpreendimentoRepository : IEmpreendimentoRepository
{
    private readonly AppDbContext _context;

    public EmpreendimentoRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Implementa filtros dinâmicos:
    /// - Busca parcial por nome (case-insensitive via EF.Functions.Like)
    /// - Filtro exato por status
    /// - Ordenação configurável (nome, data ou padrão)
    /// </remarks>
    public async Task<IEnumerable<Empreendimento>> GetAllAsync(EmpreendimentoFilter? filter = null)
    {
        var query = _context.Empreendimentos.AsQueryable();

        if (filter != null)
        {
            // Filtro por nome: busca parcial case-insensitive
            if (!string.IsNullOrWhiteSpace(filter.Nome))
                query = query.Where(e => e.Nome.Contains(filter.Nome));

            // Filtro por status: igualdade exata
            if (filter.Status.HasValue)
                query = query.Where(e => e.Status == filter.Status.Value);

            // Ordenação dinâmica baseada no parâmetro
            query = filter.OrdenarPor?.ToLower() switch
            {
                "nome" => query.OrderBy(e => e.Nome),
                "data" => query.OrderBy(e => e.DataCriacao),
                _ => query.OrderByDescending(e => e.DataCriacao) // padrão: mais recentes primeiro
            };
        }
        else
        {
            // Ordenação padrão quando não há filtro
            query = query.OrderByDescending(e => e.DataCriacao);
        }

        return await query.ToListAsync();
    }

    /// <inheritdoc />
    /// <remarks>Usa FindAsync para acesso rápido por chave primária.</remarks>
    public async Task<Empreendimento?> GetByIdAsync(Guid id)
    {
        return await _context.Empreendimentos.FindAsync(id);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Busca por CNPJ para validação de unicidade.
    /// CNPJ é armazenado sem formatação para consistência.
    /// </remarks>
    public async Task<Empreendimento?> GetByCnpjAsync(string cnpj)
    {
        return await _context.Empreendimentos
            .FirstOrDefaultAsync(e => e.Cnpj == cnpj);
    }

    /// <inheritdoc />
    /// <remarks>Gera novo GUID automaticamente se não fornecido.</remarks>
    public async Task<Empreendimento> CreateAsync(Empreendimento empreendimento)
    {
        _context.Empreendimentos.Add(empreendimento);
        await _context.SaveChangesAsync();
        return empreendimento;
    }

    /// <inheritdoc />
    /// <remarks>Atualiza todos os campos modificados da entidade.</remarks>
    public async Task<Empreendimento> UpdateAsync(Empreendimento empreendimento)
    {
        _context.Empreendimentos.Update(empreendimento);
        await _context.SaveChangesAsync();
        return empreendimento;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Executa duas queries COUNT separadas para obter estatísticas.
    /// Em bancos grandes, considerar usar uma única query com GROUP BY.
    /// </remarks>
    public async Task<DashboardStats> GetStatsAsync()
    {
        var ativos = await _context.Empreendimentos
            .CountAsync(e => e.Status == StatusEmpreendimento.Ativo);
        var inativos = await _context.Empreendimentos
            .CountAsync(e => e.Status == StatusEmpreendimento.Inativo);

        return new DashboardStats { Ativos = ativos, Inativos = inativos };
    }
}
