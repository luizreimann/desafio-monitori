using Microsoft.EntityFrameworkCore;
using Monitori.Api.Models;

namespace Monitori.Api.Data;

/// <summary>
/// Contexto do Entity Framework Core para a aplicação Monitori.
/// Configura o acesso a dados usando banco em memória (InMemory).
/// </summary>
/// <remarks>
/// Para produção, substituir por SQL Server, PostgreSQL, etc.
/// O banco InMemory é usado aqui para simplificar o desafio técnico.
/// </remarks>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>
    /// DbSet de empreendimentos - tabela principal do sistema.
    /// </summary>
    public DbSet<Empreendimento> Empreendimentos => Set<Empreendimento>();
}
