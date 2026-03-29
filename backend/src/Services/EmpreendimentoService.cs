using Monitori.Api.Models;
using Monitori.Api.Repositories;

namespace Monitori.Api.Services;

/// <summary>
/// Serviço de domínio para gerenciamento de empreendimentos.
/// Implementa as regras de negócio e orquestra as operações de CRUD.
/// </summary>
/// <remarks>
/// Responsabilidades:
/// - Validação de regras de negócio
/// - Mapeamento entre entidades e DTOs
/// - Logging de operações
/// - Tratamento de exceções de domínio
/// </remarks>
public class EmpreendimentoService : IEmpreendimentoService
{
    private readonly IEmpreendimentoRepository _repository;
    private readonly ILogger<EmpreendimentoService> _logger;

    public EmpreendimentoService(
        IEmpreendimentoRepository repository,
        ILogger<EmpreendimentoService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<EmpreendimentoDto>> GetAllAsync(EmpreendimentoFilter? filter = null)
    {
        var empreendimentos = await _repository.GetAllAsync(filter);
        return empreendimentos.Select(MapToDto);
    }

    /// <inheritdoc />
    public async Task<EmpreendimentoDto?> GetByIdAsync(Guid id)
    {
        var empreendimento = await _repository.GetByIdAsync(id);
        return empreendimento == null ? null : MapToDto(empreendimento);
    }

    /// <inheritdoc />
    /// <exception cref="ArgumentException">Nome deve ter pelo menos 3 caracteres ou CNPJ inválido</exception>
    /// <exception cref="InvalidOperationException">CNPJ já existe no sistema</exception>
    public async Task<EmpreendimentoDto> CreateAsync(CriarEmpreendimentoRequest request)
    {
        // Validação: nome mínimo 3 caracteres
        if (string.IsNullOrWhiteSpace(request.Nome) || request.Nome.Length < 3)
            throw new ArgumentException("O nome deve ter pelo menos 3 caracteres");

        // Validação: CNPJ obrigatório
        if (string.IsNullOrWhiteSpace(request.Cnpj))
            throw new ArgumentException("O CNPJ é obrigatório");

        // Validação: CNPJ válido (dígitos verificadores)
        var cnpjLimpo = CnpjValidator.Sanitize(request.Cnpj);
        if (!CnpjValidator.IsValid(cnpjLimpo))
            throw new ArgumentException("CNPJ inválido. Verifique os dígitos informados.");

        // Validação: CNPJ único
        var existente = await _repository.GetByCnpjAsync(cnpjLimpo);
        if (existente != null)
            throw new InvalidOperationException("Já existe um empreendimento com este CNPJ");

        // Criação da entidade com valores padrão
        var empreendimento = new Empreendimento
        {
            Nome = request.Nome.Trim(),
            Cnpj = cnpjLimpo,
            Endereco = request.Endereco?.Trim() ?? string.Empty,
            Status = StatusEmpreendimento.Ativo,
            DataCriacao = DateTime.UtcNow
        };

        await _repository.CreateAsync(empreendimento);
        _logger.LogInformation("Empreendimento criado: {Id} - {Nome}", empreendimento.Id, empreendimento.Nome);

        return MapToDto(empreendimento);
    }

    /// <inheritdoc />
    /// <exception cref="KeyNotFoundException">Empreendimento não encontrado</exception>
    /// <exception cref="InvalidOperationException">Não pode editar empreendimento inativo</exception>
    /// <exception cref="ArgumentException">Nome deve ter pelo menos 3 caracteres</exception>
    public async Task<EmpreendimentoDto> UpdateAsync(Guid id, AtualizarEmpreendimentoRequest request)
    {
        var empreendimento = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Empreendimento não encontrado");

        // Regra de negócio: não edita inativos
        if (empreendimento.Status == StatusEmpreendimento.Inativo)
            throw new InvalidOperationException("Não é possível editar um empreendimento inativo");

        // Validação: nome mínimo 3 caracteres
        if (string.IsNullOrWhiteSpace(request.Nome) || request.Nome.Length < 3)
            throw new ArgumentException("O nome deve ter pelo menos 3 caracteres");

        empreendimento.Nome = request.Nome.Trim();
        empreendimento.Endereco = request.Endereco?.Trim() ?? string.Empty;

        await _repository.UpdateAsync(empreendimento);
        _logger.LogInformation("Empreendimento atualizado: {Id}", empreendimento.Id);

        return MapToDto(empreendimento);
    }

    /// <inheritdoc />
    /// <exception cref="KeyNotFoundException">Empreendimento não encontrado</exception>
    /// <exception cref="InvalidOperationException">Já está inativo</exception>
    public async Task<EmpreendimentoDto> InativarAsync(Guid id)
    {
        var empreendimento = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Empreendimento não encontrado");

        // Idempotência: verifica se já está inativo
        if (empreendimento.Status == StatusEmpreendimento.Inativo)
            throw new InvalidOperationException("Empreendimento já está inativo");

        empreendimento.Status = StatusEmpreendimento.Inativo;
        await _repository.UpdateAsync(empreendimento);
        _logger.LogInformation("Empreendimento inativado: {Id}", empreendimento.Id);

        return MapToDto(empreendimento);
    }

    /// <inheritdoc />
    public async Task<DashboardStats> GetStatsAsync()
    {
        return await _repository.GetStatsAsync();
    }

    /// <summary>
    /// Mapeia uma entidade Empreendimento para seu DTO correspondente.
    /// </summary>
    /// <param name="e">Entidade de domínio</param>
    /// <returns>DTO para exposição na API</returns>
    private static EmpreendimentoDto MapToDto(Empreendimento e) => new()
    {
        Id = e.Id,
        Nome = e.Nome,
        Cnpj = e.Cnpj,
        Endereco = e.Endereco,
        Status = e.Status,
        DataCriacao = e.DataCriacao
    };
}
