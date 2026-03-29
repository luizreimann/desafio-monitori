using Microsoft.EntityFrameworkCore;
using Monitori.Api.Data;
using Monitori.Api.Repositories;
using Monitori.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Monitori API",
        Version = "v1",
        Description = "API para gestão de empreendimentos imobiliários"
    });

    // Configuração para usar arquivo XML de documentação
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("MonitoriDb"));

builder.Services.AddScoped<IEmpreendimentoRepository, EmpreendimentoRepository>();
builder.Services.AddScoped<IEmpreendimentoService, EmpreendimentoService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "http://localhost",
            "http://frontend"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
