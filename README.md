# Monitori - Gestão de Empreendimentos

Sistema de gestão de empreendimentos imobiliários desenvolvido como desafio técnico para a vaga de Desenvolvedor .NET Full Stack Sênior.

## 🚀 Tecnologias Utilizadas

### Backend
- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM com banco em memória (InMemory)
- **Swagger/OpenAPI** - Documentação da API
- **Serilog** (estruturado) - Logging

### Frontend
- **Angular 17** - Framework SPA
- **Standalone Components** - Arquitetura moderna sem NgModules
- **Reactive Forms** - Formulários reativos com validação
- **RxJS** - Programação reativa
- **Font Awesome** - Ícones

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📋 Funcionalidades

- ✅ Cadastro de empreendimentos (nome, CNPJ, endereço)
- ✅ Listagem com filtros (nome, status) e ordenação
- ✅ Edição de empreendimentos ativos
- ✅ Inativação (soft delete)
- ✅ Validações de negócio (CNPJ único, nome mínimo 3 caracteres)
- ✅ Dashboard com estatísticas em tempo real
- ✅ Tratamento de erros e feedback ao usuário
- ✅ Loading states e UX responsiva

## 🛠️ Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd desafio-monitori

# Execute com Docker Compose
docker-compose up --build

# Acesse:
# Frontend: http://localhost:4200
# Backend API: http://localhost:5001
# Swagger: http://localhost:5001/swagger
```

### Opção 2: Executar Localmente

#### Backend
```bash
cd backend
dotnet restore
dotnet run

# API disponível em: http://localhost:5000
```

#### Frontend
```bash
cd frontend
npm install
npm start

# Aplicação disponível em: http://localhost:4200
```

## 📁 Estrutura do Projeto

```
desafio-monitori/
├── backend/                    # API .NET 8
│   ├── src/
│   │   ├── Controllers/       # API Controllers
│   │   ├── Models/            # Entidades e DTOs
│   │   ├── Repositories/      # Acesso a dados
│   │   ├── Services/          # Lógica de negócio
│   │   └── Data/              # DbContext
│   ├── Dockerfile
│   └── Monitori.Api.csproj
├── frontend/                   # Angular 17
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes standalone
│   │   │   ├── services/     # Serviços HTTP
│   │   │   └── models/       # Interfaces TypeScript
│   │   ├── index.html
│   │   └── styles.scss
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🏗️ Decisões Técnicas

### Backend

1. **Arquitetura em Camadas**: Separação clara entre Controller, Service e Repository para manter responsabilidades isoladas e facilitar testes.

2. **Banco In-Memory**: Escolhi Entity Framework Core com banco em memória para simplificar a execução do desafio sem dependências externas.

3. **Dapper vs EF Core**: Optei pelo EF Core pela produtividade no desenvolvimento rápido e pela facilidade de manutenção.

4. **DTOs**: Uso de DTOs para desacoplar a API dos modelos de domínio e controlar exatamente o que é exposto.

5. **Validações**: Validações tanto no modelo (Data Annotations) quanto na camada de serviço para garantir integridade dos dados.

6. **Tratamento de Erros**: Middleware de tratamento de erros com retornos HTTP apropriados e mensagens amigáveis.

### Frontend

1. **Standalone Components**: Adotei a nova arquitetura de componentes standalone do Angular 17, eliminando a necessidade de NgModules e simplificando a estrutura.

2. **Reactive Forms**: Formulários reativos para melhor controle de estado, validações e testabilidade.

3. **HTTP Interceptor**: Interceptor para tratamento global de erros HTTP, evitando código repetido em cada serviço.

4. **Loading States**: Feedback visual de carregamento em todas as operações assíncronas.

5. **CSS Responsivo**: Design mobile-first com CSS Grid e Flexbox, garantindo boa experiência em todos os dispositivos.

### DevOps

1. **Multi-stage Docker Builds**: Dockerfiles otimizados com multi-stage builds para imagens menores e mais seguras.

2. **Docker Compose**: Orquestração simples com rede isolada para comunicação entre serviços.

## 🔄 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/empreendimentos` | Listar todos (com filtros opcionais) |
| GET | `/api/empreendimentos/{id}` | Buscar por ID |
| POST | `/api/empreendimentos` | Criar novo |
| PUT | `/api/empreendimentos/{id}` | Atualizar |
| POST | `/api/empreendimentos/{id}/inativar` | Inativar |
| GET | `/api/empreendimentos/stats` | Estatísticas para dashboard |

## 📝 Observações

- O sistema utiliza banco de dados em memória, então os dados são perdidos ao reiniciar o backend
- O frontend faz proxy para `/api/*` automaticamente tanto em desenvolvimento quanto em produção
- O dashboard atualiza automaticamente a cada 30 segundos

---

Desenvolvido para o desafio técnico da [Monitori](https://monitorimob.com.br)

