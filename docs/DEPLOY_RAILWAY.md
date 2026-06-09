# Deploy Railway - ServiceGo

Este guia prepara o primeiro deploy de validacao do ServiceGo na Railway usando Docker e variaveis de ambiente.

## Servicos Esperados

- `servicego-db`: PostgreSQL gerenciado pela Railway.
- `servicego-api`: backend Spring Boot.
- `servicego-web`: frontend React/Vite.

## 1. Criar o Projeto

1. Acesse o painel da Railway.
2. Crie um novo projeto.
3. Adicione um banco PostgreSQL.
4. Adicione um servico a partir do repositorio GitHub `cintra444/ServiceGo` para a API.
5. Adicione outro servico a partir do mesmo repositorio para o Web.

## 2. Configurar API

No servico da API:

- Root Directory: `/`
- Dockerfile Path: `Dockerfile`
- Healthcheck Path: `/actuator/health`

Variaveis obrigatorias:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=troque-por-uma-chave-com-pelo-menos-32-caracteres
JWT_EXPIRATION_HOURS=12
BOOTSTRAP_ADMIN_NAME=Administrador
BOOTSTRAP_ADMIN_EMAIL=admin@servicego.local
BOOTSTRAP_ADMIN_PASSWORD=troque-esta-senha
CORS_ALLOWED_ORIGINS=https://servicego.com.br,https://SEU-WEB.up.railway.app
FRONTEND_URL=https://servicego.com.br
```

Variaveis do PostgreSQL:

Use as variaveis geradas pelo proprio servico PostgreSQL da Railway. O backend aceita `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` e `PGPASSWORD`. Se preferir configurar manualmente, use:

```env
DB_URL=jdbc:postgresql://HOST:PORT/DATABASE
DB_USERNAME=USER
DB_PASSWORD=PASSWORD
```

## 3. Configurar Web

No servico Web:

- Root Directory: `/ServiceGoApp/ServiceGOWeb`
- Dockerfile Path: `Dockerfile`
- Healthcheck Path: `/healthz`

Variaveis:

```env
API_URL=https://SEU-BACKEND.up.railway.app
VITE_API_URL=https://SEU-BACKEND.up.railway.app
```

`API_URL` e usada em runtime pelo `/config.js`, entao a URL da API pode ser trocada no Railway sem rebuild do Vite.

## 4. Dominios

Ordem recomendada para validar:

1. Testar primeiro com os dominios temporarios da Railway.
2. Depois configurar `api.servicego.com.br` no servico da API.
3. Depois configurar `servicego.com.br` no servico Web.
4. Atualizar `CORS_ALLOWED_ORIGINS` na API com os dominios finais.
5. Atualizar `API_URL` no Web para `https://api.servicego.com.br`.
6. Atualizar `EXPO_PUBLIC_API_URL` no app mobile para `https://api.servicego.com.br` antes da build.

## 5. Validacao Rapida

API:

```text
GET /actuator/health
GET /swagger-ui.html
POST /api/auth/login
```

Web:

```text
GET /healthz
GET /config.js
```

Fluxos reais:

- Cadastro de usuario motorista.
- Login no web.
- Login no app Expo.
- Cadastro de cliente.
- Cadastro de veiculo.
- Cadastro de corrida.
- Cadastro de pagamento/despesa.
- Relatorio financeiro.
- Teste com dois usuarios para confirmar isolamento dos dados.

