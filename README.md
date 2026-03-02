# ServiceGo
Sistema Inteligente de Gestao de Motorista Profissional.

## API
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Alias Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Perfis de configuracao
- Perfil padrao: `local` (definido em `application.properties`).
- Config local do PostgreSQL: `src/main/resources/application-local.properties`.
- Config de producao por variavel de ambiente: `src/main/resources/application-prod.properties`.
- Para trocar perfil sem editar arquivo:
  - PowerShell: `$env:SPRING_PROFILES_ACTIVE='prod'`
  - Execucao: `.\mvnw.cmd spring-boot:run`

## Variaveis obrigatorias em producao
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `BOOTSTRAP_ADMIN_PASSWORD`

## Autenticacao
1. `POST /api/auth/login` com:
```json
{
  "email": "admin@servicego.local",
  "password": "admin123"
}
```
2. Use o token retornado em `Authorization: Bearer <token>`.
3. `POST /api/auth/register` exige perfil `ADMIN`.
4. `PUT /api/auth/users/{id}/status` exige perfil `ADMIN`.
5. `POST /api/auth/change-password` exige usuario autenticado.

## Regras de usuario
- Nao e permitido desativar o ultimo usuario `ADMIN` ativo.
- Troca de senha exige `currentPassword` correta e `newPassword` diferente da atual.

## Usuario inicial (bootstrap)
- Email: `admin@servicego.local`
- Senha: `admin123`
