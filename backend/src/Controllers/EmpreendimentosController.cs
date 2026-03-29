using Microsoft.AspNetCore.Mvc;
using Monitori.Api.Models;
using Monitori.Api.Services;

namespace Monitori.Api.Controllers;

/// <summary>
/// Controller responsável pelo gerenciamento de empreendimentos imobiliários.
/// Fornece endpoints para CRUD, filtros avançados e estatísticas do sistema.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmpreendimentosController : ControllerBase
{
    private readonly IEmpreendimentoService _service;
    private readonly ILogger<EmpreendimentosController> _logger;

    public EmpreendimentosController(
        IEmpreendimentoService service,
        ILogger<EmpreendimentosController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Lista todos os empreendimentos com suporte a filtros e ordenação.
    /// </summary>
    /// <param name="nome">Filtro por nome (busca parcial, case-insensitive)</param>
    /// <param name="status">Filtro por status: 0=Ativo, 1=Inativo</param>
    /// <param name="ordenarPor">Critério de ordenação: "nome", "data" ou padrão (data de criação decrescente)</param>
    /// <returns>Lista de empreendimentos filtrada e ordenada</returns>
    /// <response code="200">Retorna a lista de empreendimentos</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EmpreendimentoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<EmpreendimentoDto>>> GetAll(
        [FromQuery] string? nome,
        [FromQuery] StatusEmpreendimento? status,
        [FromQuery] string? ordenarPor)
    {
        try
        {
            var filter = new EmpreendimentoFilter
            {
                Nome = nome,
                Status = status,
                OrdenarPor = ordenarPor
            };

            var result = await _service.GetAllAsync(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar empreendimentos");
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao listar empreendimentos",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Busca um empreendimento específico pelo ID.
    /// </summary>
    /// <param name="id">GUID único do empreendimento</param>
    /// <returns>Detalhes completos do empreendimento encontrado</returns>
    /// <response code="200">Empreendimento encontrado com sucesso</response>
    /// <response code="404">Empreendimento não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EmpreendimentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmpreendimentoDto>> GetById(Guid id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound(new ErrorResponse { Message = "Empreendimento não encontrado" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar empreendimento {Id}", id);
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao buscar empreendimento",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Cria um novo empreendimento no sistema.
    /// Regras de negócio aplicadas automaticamente:
    /// - Nome deve ter no mínimo 3 caracteres
    /// - CNPJ deve ser único no sistema
    /// - Status inicial sempre será "Ativo"
    /// </summary>
    /// <param name="request">Dados do empreendimento (nome, CNPJ, endereço)</param>
    /// <returns>Empreendimento criado com ID gerado</returns>
    /// <response code="201">Empreendimento criado com sucesso</response>
    /// <response code="400">Dados inválidos (nome muito curto ou campos obrigatórios vazios)</response>
    /// <response code="409">CNPJ já existe no sistema</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost]
    [ProducesResponseType(typeof(EmpreendimentoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmpreendimentoDto>> Create([FromBody] CriarEmpreendimentoRequest request)
    {
        try
        {
            var result = await _service.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar empreendimento");
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao criar empreendimento",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Atualiza dados de um empreendimento existente.
    /// Restrições:
    /// - Não é possível editar empreendimentos com status "Inativo"
    /// - Nome deve manter o mínimo de 3 caracteres
    /// </summary>
    /// <param name="id">GUID do empreendimento a ser atualizado</param>
    /// <param name="request">Novos dados (nome e endereço)</param>
    /// <returns>Empreendimento atualizado</returns>
    /// <response code="200">Atualização realizada com sucesso</response>
    /// <response code="400">Dados inválidos na requisição</response>
    /// <response code="404">Empreendimento não encontrado</response>
    /// <response code="409">Tentativa de editar empreendimento inativo</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EmpreendimentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmpreendimentoDto>> Update(
        Guid id,
        [FromBody] AtualizarEmpreendimentoRequest request)
    {
        try
        {
            var result = await _service.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar empreendimento {Id}", id);
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao atualizar empreendimento",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Realiza a inativação (soft delete) de um empreendimento.
    /// O registro permanece no banco de dados com status alterado para "Inativo".
    /// Empreendimentos inativos não podem ser editados nem reativados via API.
    /// </summary>
    /// <param name="id">GUID do empreendimento a ser inativado</param>
    /// <returns>Empreendimento com status atualizado para Inativo</returns>
    /// <response code="200">Inativação realizada com sucesso</response>
    /// <response code="404">Empreendimento não encontrado</response>
    /// <response code="409">Empreendimento já está inativo</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost("{id:guid}/inativar")]
    [ProducesResponseType(typeof(EmpreendimentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmpreendimentoDto>> Inativar(Guid id)
    {
        try
        {
            var result = await _service.InativarAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao inativar empreendimento {Id}", id);
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao inativar empreendimento",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Retorna estatísticas agregadas para o dashboard.
    /// Fornece contagem de empreendimentos por status (ativos/inativos) e total.
    /// Dados atualizados em tempo real.
    /// </summary>
    /// <returns>Objeto com contadores: ativos, inativos e total</returns>
    /// <response code="200">Estatísticas obtidas com sucesso</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStats), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DashboardStats>> GetStats()
    {
        try
        {
            var result = await _service.GetStatsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return StatusCode(500, new ErrorResponse
            {
                Message = "Erro interno ao obter estatísticas",
                Details = ex.Message
            });
        }
    }
}
