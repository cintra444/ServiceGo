# ServiceGo

Sistema de gestao para motoristas profissionais, com foco em organizacao de corridas, clientes, veiculos, pagamentos, gastos e relatorios financeiros.

Este projeto foi desenvolvido como uma API backend em Java com Spring Boot. A proposta do ServiceGo e centralizar, em um unico sistema, informacoes que ajudam o motorista a controlar melhor sua rotina de trabalho e tomar decisoes com base nos numeros do negocio.

## Visao Geral

De forma simples, o ServiceGo ajuda o usuario a:

- cadastrar clientes;
- registrar viagens;
- controlar recebimentos e despesas;
- organizar veiculos e configuracoes do usuario;
- acompanhar relatorios financeiros;
- manter acesso protegido com login e senha.

Mesmo para quem nao e da area tecnica, a ideia do sistema e parecida com um "painel de controle" do motorista, reunindo dados importantes do dia a dia em um unico lugar.

## Principais Funcionalidades

- Autenticacao com login seguro via JWT.
- Cadastro e gerenciamento de usuarios.
- Cadastro de clientes.
- Cadastro e acompanhamento de viagens.
- Controle de pagamentos recebidos.
- Controle de despesas operacionais.
- Cadastro de veiculos.
- Agendamento de viagens.
- Configuracoes por usuario.
- Relatorio financeiro.
- Documentacao interativa da API com Swagger.
- Colecao Postman para testes rapidos.

## Tecnologias Utilizadas

- Java 17
- Spring Boot 4
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Swagger / OpenAPI
- Maven

## Estrutura do Projeto

O projeto esta organizado como uma API backend. Em termos praticos:

- `src/main/java`: codigo-fonte principal da aplicacao.
- `src/main/resources`: arquivos de configuracao e migracoes do banco.
- `docs/postman`: colecao Postman para testar os endpoints.
- `pom.xml`: configuracao de dependencias do projeto Maven.

## Como Rodar o Projeto

### Requisitos

Antes de iniciar, voce precisa ter instalado:

- Java 17
- Maven Wrapper do projeto (ja incluido via `mvnw` e `mvnw.cmd`)
- PostgreSQL

### 1. Configurar o banco de dados

O projeto usa PostgreSQL. No ambiente local, a configuracao padrao aponta para:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/servicego
spring.datasource.username=postgres
spring.datasource.password=123456
```

Se necessario, ajuste esses dados em [application.properties](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/application.properties) ou em [application-local.properties](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/application-local.properties).

### 2. Iniciar a aplicacao

No Windows, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

Se tudo estiver correto, a API sera iniciada localmente em:

```text
http://localhost:8080
```

## Como Rodar com Docker

Se voce quiser subir o backend e o PostgreSQL no Docker Desktop, o projeto agora ja vem preparado com `Dockerfile` e `docker-compose.yml`.

### Portas usadas no Docker

- Backend: `http://localhost:8080`
- PostgreSQL do container: `localhost:5433`

O banco foi exposto na `5433` para nao conflitar com um PostgreSQL local na `5432`.

### Subir os containers

Antes de subir, se houver um backend local rodando na `8080`, finalize esse processo.

Depois execute:

```powershell
docker compose up -d --build
```

### Acompanhar os logs

```powershell
docker compose logs -f backend
```

### Parar os containers

```powershell
docker compose down
```

Se quiser parar e remover tambem o volume do banco criado pelo Docker:

```powershell
docker compose down -v
```

### Credenciais iniciais no ambiente Docker

- Email: `admin@servicego.local`
- Senha: `admin123`

## Documentacao da API

Depois de iniciar o sistema, voce pode acessar a documentacao interativa nos links abaixo:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Alias Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Essa interface facilita muito os testes, inclusive para quem nao quer usar ferramentas mais tecnicas logo no inicio.

## Como Fazer Login

O sistema cria um usuario administrador inicial para facilitar o primeiro acesso.

### Usuario inicial

- Email: `admin@servicego.local`
- Senha: `admin123`

### Endpoint de login

`POST /api/auth/login`

Exemplo de corpo da requisicao:

```json
{
  "email": "admin@servicego.local",
  "password": "admin123"
}
```

Ao fazer login, a API retorna um token. Esse token deve ser enviado nas proximas requisicoes no cabecalho:

```text
Authorization: Bearer SEU_TOKEN
```

## Endpoints Principais

Os principais grupos de recursos da API sao:

- `/api/auth` - autenticacao, cadastro de usuarios e alteracao de senha.
- `/api/customers` - clientes.
- `/api/trips` - viagens.
- `/api/payments` - pagamentos.
- `/api/expenses` - despesas.
- `/api/veiculos` - veiculos.
- `/api/agendamentos` - agendamentos de viagem.
- `/api/configuracoes-usuario` - configuracoes do usuario.
- `/api/relatorios/financeiro` - relatorio financeiro.

## Perfis de Configuracao

O perfil padrao do projeto e `local`.

- Arquivo principal: [application.properties](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/application.properties)
- Configuracao local: [application-local.properties](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/application-local.properties)
- Configuracao de producao: [application-prod.properties](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/application-prod.properties)

Para executar com perfil de producao no PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE='prod'
.\mvnw.cmd spring-boot:run
```

## Variaveis de Ambiente em Producao

Para rodar em producao, e necessario definir:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `BOOTSTRAP_ADMIN_PASSWORD`

Opcionalmente, tambem podem ser definidos:

- `JWT_EXPIRATION_HOURS`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_EMAIL`

## Regras Importantes do Sistema

- Nao e permitido desativar o ultimo usuario administrador ativo.
- A troca de senha exige a senha atual correta.
- A nova senha deve ser diferente da senha anterior.

## Testes e Apoio ao Desenvolvimento

Para facilitar a validacao da API, o projeto oferece:

- Swagger para testes no navegador;
- colecao Postman em [docs/postman/ServiceGo.postman_collection.json](C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/docs/postman/ServiceGo.postman_collection.json).

## Objetivo do Projeto

O ServiceGo foi pensado para organizar a rotina operacional e financeira de motoristas profissionais. Alem do aspecto tecnico, o projeto demonstra conceitos importantes de desenvolvimento backend, como autenticacao, seguranca, persistencia de dados, organizacao em camadas e documentacao de API.
