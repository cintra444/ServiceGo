# Plano de Revisao e Correcao Arquitetural - ServiceGo

## Objetivo
Reestruturar a API para separar responsabilidades por camadas, reduzir acoplamento entre controller e persistencia, centralizar regras de negocio, padronizar contratos e validacoes, e adotar convencao de nomes em portugues para variaveis/campos de dominio e DTOs.

Este documento deve ser atualizado ao final de cada etapa com:
- status (`[ ]` pendente, `[x]` concluida)
- decisoes tomadas
- desvios de escopo
- riscos descobertos

---

## 1. Diagnostico da arquitetura atual

### 1.1 Organizacao atual de pacotes
- `com.ServiceGo.api.controller`
  - Controllers REST com logica de negocio, validacao de regra e mapeamento DTO <-> entidade.
- `com.ServiceGo.api.dto`
  - `auth`, `customer`, `trip`, `expense`, `payment` com records de entrada/saida.
- `com.ServiceGo.domain.entity`
  - Entidades JPA: `AppUser`, `Customer`, `Trip`, `Expense`, `Payment`.
- `com.ServiceGo.domain.repository`
  - Repositorios Spring Data JPA.
- `com.ServiceGo.domain.enums`
  - Enums de negocio.
- `com.ServiceGo.security`
  - JWT service/filter + `UserDetailsService`.
- `com.ServiceGo.config`
  - `SecurityConfig`, `OpenApiConfig`, `AppUserSeeder`.

### 1.2 Camadas hoje (de fato)
- API e aplicacao estao misturadas: controller acessa repositorio diretamente.
- Dominio e majoritariamente anemico: entidades com getters/setters, sem invariantes.
- Infraestrutura de persistencia exposta na borda HTTP.

### 1.3 Evidencias no codigo (referencias)
- CRUD com repositorio direto em controllers:
  - [CustomerController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/CustomerController.java:34)
  - [TripController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/TripController.java:38)
  - [ExpenseController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/ExpenseController.java:37)
  - [PaymentController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/PaymentController.java:45)
- Regra de negocio no controller de auth (`ultimo admin ativo`):
  - [AuthController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/AuthController.java:127)
- Tratamento de erro ad hoc com `ResponseStatusException` repetido:
  - [AuthController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/AuthController.java:68)
  - [TripController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/TripController.java:44)
- Cobertura de testes praticamente inexistente:
  - [ServiceGoApplicationTests.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/test/java/com/ServiceGo/ServiceGoApplicationTests.java:7)

---

## 2. Problemas arquiteturais identificados

### 2.1 Acoplamento alto
- Controllers dependem de varios repositorios e entidades JPA.
- API HTTP conhece detalhes de persistencia e relacionamento (`resolveCustomer`, `resolveTrip`).

### 2.2 Responsabilidades misturadas
- Controller faz:
  - orquestracao de caso de uso
  - validacao de regra de negocio
  - conversao DTO <-> entidade
  - persistencia
- Exemplo: [PaymentController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/PaymentController.java:80).

### 2.3 Duplicacao
- Padrao repetido em todos os CRUDs:
  - `findById + orElseThrow`
  - `create/update` com setters
  - `toResponse`
  - `delete` com `existsById`

### 2.4 Entidades anemicas
- Entidades sem comportamento de negocio e sem metodos que protejam invariantes.
- Exemplo: `Trip` permite qualquer combinacao de `status`, `startAt`, `endAt`, `actualAmount` sem regra encapsulada.

### 2.5 DTOs e contratos incompletos
- Nao ha DTOs de erro padronizados (problem details).
- Nao ha DTOs de filtro/paginacao para listagem.
- DTO de `CustomerRequest` aceita `email` sem `@Email`.

### 2.6 Validacoes faltando/insuficientes
- Faltam validacoes de consistencia temporal/negocio:
  - `endAt >= startAt`
  - `paidAt` coerente com `status`
  - exigencia de `customerId` em cenarios definidos
- Validacoes ficam espalhadas no controller, nao em camada de aplicacao/dominio.

### 2.7 Nomes e linguagem inconsistentes
- Codigo em ingles (`Customer`, `Trip`, `amount`) e regra pedida para portugues.
- Base SQL em snake_case ingles: `estimated_amount`, `distance_km`, etc.
  - [V1__create_core_tables.sql](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/resources/db/migration/V1__create_core_tables.sql:21)

### 2.8 Ausencia de camada de aplicacao
- Nao existe pacote `service/application/usecase` para concentrar casos de uso.

### 2.9 Tratamento de excecoes nao centralizado
- Nao existe `@ControllerAdvice` para padronizar respostas e codigos.

### 2.10 Baixa testabilidade
- Sem testes de unidade de regra.
- Sem testes de controller com contratos de erro/sucesso.

---

## 3. Arquitetura alvo proposta

## 3.1 Diretriz
Arquitetura em camadas com dependencias unidirecionais:
- `api -> aplicacao -> dominio`
- `infraestrutura` implementa portas de `aplicacao/dominio`

### 3.2 Estrutura de pacotes alvo

```text
com.servicego
  api
    controlador
    dto
      requisicao
      resposta
    erro
  aplicacao
    casoDeUso
    servico
    porta
      entrada
      saida
    mapeador
  dominio
    modelo
    enumeracao
    excecao
    regra
  infraestrutura
    persistencia
      entidade
      repositorioJpa
      adaptador
    seguranca
      jwt
      autenticacao
    configuracao
  compartilhado
    validacao
    util
```

### 3.3 Responsabilidades por camada
- `api.controlador`
  - Apenas HTTP: recebe requisicao, valida formato, delega caso de uso, retorna DTO.
- `aplicacao.casoDeUso/servico`
  - Regras de negocio da aplicacao, transacao, orchestration.
- `aplicacao.porta.saida`
  - Interfaces para persistencia e servicos externos.
- `dominio.modelo`
  - Entidades/agregados com comportamento e invariantes.
- `infraestrutura.persistencia`
  - JPA entities e repositories/adapters.
- `api.erro`
  - Padronizacao de erro com `ProblemDetail`.

### 3.4 Convencao de nomenclatura (portugues)
Aplicar em variaveis, campos de DTO, comandos, respostas e parametros internos:
- `clienteId`, `dataHoraAgendada`, `taxaPlataforma`, `valorBruto`, `valorLiquido`, `kmRodados`, `despesas`, `lucro`.

Observacao de compatibilidade:
- Entidades/tabelas atuais estao em ingles. A migracao de nomenclatura sera por etapas com adaptacao de API para nao quebrar clientes imediatamente.

---

## 4. Plano de execucao por etapas (checklist)

## Etapa 0 - Baseline e seguranca de mudanca
- [x] Criar cobertura minima de seguranca para refactor (testes de comportamento atual).

Arquivos a criar/alterar:
- Criar testes de API atual:
  - `src/test/java/com/ServiceGo/api/controller/*ControllerIT.java`
  - `src/test/java/com/ServiceGo/api/controller/AuthControllerIT.java`

Impacto:
- Congelar comportamento atual para reduzir risco de regressao.

---

## Etapa 1 - Introduzir camada de aplicacao (sem quebrar endpoints)
- [x] Criar servicos de caso de uso para cada contexto: cliente, viagem, despesa, pagamento, usuario.
- [x] Controllers passam a depender de servicos, nao de repositorios.

Arquivos a criar:
- `src/main/java/com/ServiceGo/aplicacao/servico/ClienteServico.java`
- `src/main/java/com/ServiceGo/aplicacao/servico/ViagemServico.java`
- `src/main/java/com/ServiceGo/aplicacao/servico/DespesaServico.java`
- `src/main/java/com/ServiceGo/aplicacao/servico/PagamentoServico.java`
- `src/main/java/com/ServiceGo/aplicacao/servico/UsuarioServico.java`

Arquivos a alterar:
- [CustomerController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/CustomerController.java)
- [TripController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/TripController.java)
- [ExpenseController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/ExpenseController.java)
- [PaymentController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/PaymentController.java)
- [AuthController.java](/C:/Users/organ/Downloads/PROGRAMACAO/ServiceGO/ServiceGo/src/main/java/com/ServiceGo/api/controller/AuthController.java)

Impacto:
- Reduz acoplamento HTTP-persistencia.
- Isola regra de negocio para evolucao e testes unitarios.

---

## Etapa 2 - Padronizar tratamento de erros
- [x] Criar excecoes de dominio/aplicacao.
- [x] Criar `@RestControllerAdvice` com payload padrao de erro.

Arquivos a criar:
- `src/main/java/com/ServiceGo/api/erro/ApiExceptionHandler.java`
- `src/main/java/com/ServiceGo/api/erro/ErroPadraoResponse.java`
- `src/main/java/com/ServiceGo/dominio/excecao/RecursoNaoEncontradoException.java`
- `src/main/java/com/ServiceGo/dominio/excecao/RegraNegocioException.java`
- `src/main/java/com/ServiceGo/dominio/excecao/ConflitoNegocioException.java`

Impacto:
- Remove `ResponseStatusException` espalhado.
- Contrato de erro consistente para frontend.

---

## Etapa 3 - Extrair mapeamento DTO <-> dominio
- [x] Criar mapeadores por contexto.
- [x] Remover `toResponse` e `applyRequest` dos controllers.

Arquivos a criar:
- `src/main/java/com/ServiceGo/aplicacao/mapeador/ClienteApiMapeador.java`
- `src/main/java/com/ServiceGo/aplicacao/mapeador/ViagemApiMapeador.java`
- `src/main/java/com/ServiceGo/aplicacao/mapeador/DespesaApiMapeador.java`
- `src/main/java/com/ServiceGo/aplicacao/mapeador/PagamentoApiMapeador.java`

Arquivos a alterar:
- Controllers e DTOs existentes.

Impacto:
- Reduz duplicacao e melhora legibilidade.

---

## Etapa 4 - Regras de negocio no dominio/aplicacao
- [x] Encapsular invariantes em metodos de dominio/servico.
- [x] Validar regras temporais e financeiras.

Arquivos a criar:
- `src/main/java/com/ServiceGo/dominio/regra/ValidadorRegraViagem.java`
- `src/main/java/com/ServiceGo/dominio/regra/ValidadorRegraPagamento.java`
- `src/main/java/com/ServiceGo/dominio/regra/ValidadorRegraUsuario.java`

Arquivos a alterar:
- Entidades de dominio (`Trip`, `Payment`, `AppUser`) para expor operacoes intencionais.

Impacto:
- Remove anemismo do dominio e previne estado invalido.

---

## Etapa 5 - Introduzir portas de saida e adaptadores
- [x] Definir interfaces de repositorio na aplicacao/dominio.
- [x] Implementar adaptadores com Spring Data JPA.

Arquivos a criar:
- `src/main/java/com/ServiceGo/aplicacao/porta/saida/ClientePortaSaida.java`
- `src/main/java/com/ServiceGo/aplicacao/porta/saida/ViagemPortaSaida.java`
- `src/main/java/com/ServiceGo/aplicacao/porta/saida/DespesaPortaSaida.java`
- `src/main/java/com/ServiceGo/aplicacao/porta/saida/PagamentoPortaSaida.java`
- `src/main/java/com/ServiceGo/aplicacao/porta/saida/UsuarioPortaSaida.java`
- `src/main/java/com/ServiceGo/infraestrutura/persistencia/adaptador/*Adaptador.java`

Arquivos a alterar:
- Repositorios atuais em `domain.repository` (gradualmente descontinuados).

Impacto:
- Inversao de dependencia real, facilitando teste e troca de tecnologia.

---

## Etapa 6 - Padronizar nomes em portugues na API
- [x] Criar nova versao de DTOs com nomes em portugues.
- [x] Manter compatibilidade transitoria com nomes antigos quando necessario.
- [x] Adotar termos: `clienteId`, `dataHoraAgendada`, `taxaPlataforma`, `valorBruto`, `valorLiquido`, `kmRodados`, `despesas`, `lucro`.

Arquivos a criar:
- `src/main/java/com/ServiceGo/api/dto/requisicao/*`
- `src/main/java/com/ServiceGo/api/dto/resposta/*`

Arquivos a alterar:
- Todos os controllers para expor contratos novos.
- OpenAPI annotations/documentacao.

Impacto:
- Padronizacao semantica para equipe de negocio.
- Possivel quebra de contrato, mitigada com estrategia de versao.

---

## Etapa 7 - Reorganizar seguranca por contexto
- [x] Mover classes de seguranca para `infraestrutura/seguranca`.
- [x] Extrair casos de uso de autenticacao para `aplicacao`.

Arquivos a mover/criar:
- Mover `JwtService`, `JwtAuthenticationFilter`, `AppUserDetailsService`.
- Criar `aplicacao/servico/AutenticacaoServico.java`.

Impacto:
- Limpa fronteira entre regra de autenticacao e mecanismo tecnico JWT.

---

## Etapa 8 - Fortalecer validacoes de entrada
- [x] Adicionar validacoes ausentes em DTOs/commands.
- [x] Criar validadores customizados para regras cruzadas.

Arquivos a criar:
- `src/main/java/com/ServiceGo/compartilhado/validacao/*`

Arquivos a alterar:
- `CustomerRequest`, `TripRequest`, `PaymentRequest`, `ExpenseRequest`, DTOs de auth.

Impacto:
- Melhora qualidade de dados e reduz erros em runtime.

---

## Etapa 9 - Estrategia de migracao de nomes de banco (opcional, fase 2)
- [x] Decidir se banco tambem migrara para portugues (`cliente_id`, `valor_bruto`, etc.).
- [x] Caso sim, criar migrations Flyway incrementais com compatibilidade.

Arquivos a criar:
- `src/main/resources/db/migration/V3__...sql` em diante.

Impacto:
- Maior custo e risco operacional; executar apenas apos estabilizar API/aplicacao.

---

## Etapa 10 - Suite de testes alvo
- [x] Unitarios da camada `aplicacao`.
- [x] Integracao de adaptadores de persistencia.
- [x] Testes de contrato HTTP (sucesso e erro padrao).

Arquivos a criar:
- `src/test/java/com/ServiceGo/aplicacao/...`
- `src/test/java/com/ServiceGo/infraestrutura/...`
- `src/test/java/com/ServiceGo/api/...`

Impacto:
- Garantia de regressao para continuidade da refatoracao.

---

## 5. Ordem recomendada de execucao
1. Etapa 0
2. Etapa 1
3. Etapa 2
4. Etapa 3
5. Etapa 4
6. Etapa 5
7. Etapa 8
8. Etapa 7
9. Etapa 6
10. Etapa 10
11. Etapa 9 (somente se aprovado)

---

## 6. Riscos e mitigacoes
- Risco: quebra de contrato para consumidores da API.
  - Mitigacao: versionamento de endpoint/DTO e janela de deprecacao.
- Risco: refactor amplo sem cobertura.
  - Mitigacao: implementar Etapa 0 antes de mover regras.
- Risco: migracao de nomenclatura no banco.
  - Mitigacao: adiar para fase 2 com migracoes incrementais.

---

## 7. Critérios de aceite da refatoracao
- Controllers sem acesso direto a `JpaRepository`.
- Regras de negocio fora da camada API.
- Erros padronizados por `ControllerAdvice`.
- DTOs/variaveis novos em portugues conforme convencao.
- Cobertura de testes ampliada para fluxos criticos.

---

## Log de atualizacao
- 2026-03-02: Documento inicial criado com diagnostico, arquitetura alvo e checklist de execucao.
---

# Plano de Endpoints v1 (foco funcional)

## 8. Inventario de endpoints existentes (estado atual)

## 8.1 Autenticacao
1. `POST /api/auth/login`
- Request DTO: `LoginRequest { email, password }`
- Validacoes: `email` obrigatorio + `@Email`, `password` obrigatorio
- Response DTO: `LoginResponse { token, tokenType, email, role }`
- Status: `200 OK`; `401` credenciais invalidas

2. `POST /api/auth/register`
- Request DTO: `RegisterRequest { name, email, password, role }`
- Validacoes: `name` obrigatorio max 120; `email` obrigatorio `@Email` max 160; `password` obrigatorio min 6 max 100; `role` opcional
- Response DTO: `RegisterResponse { id, name, email, role, active, createdAt }`
- Status: `201 Created`; `409` email em uso

3. `PUT /api/auth/users/{id}/status`
- Request DTO: `UserStatusUpdateRequest { active }`
- Validacoes: `active` obrigatorio
- Response DTO: `RegisterResponse`
- Status: `200 OK`; `404` usuario nao encontrado; `400` regra do ultimo admin

4. `POST /api/auth/change-password`
- Request DTO: `ChangePasswordRequest { currentPassword, newPassword }`
- Validacoes: ambos obrigatorios; `newPassword` min 6 max 100
- Response: sem body
- Status: `204 No Content`; `400` senha atual invalida/mesma senha; `404` usuario nao encontrado

## 8.2 Clientes
5. `GET /api/customers`
- Request DTO: nenhum
- Validacoes: nenhuma
- Response DTO: `List<CustomerResponse>`
- Status: `200 OK`

6. `GET /api/customers/{id}`
- Request DTO: nenhum
- Validacoes: nenhuma (path sem validacao de faixa)
- Response DTO: `CustomerResponse`
- Status: `200 OK`; `404` nao encontrado

7. `POST /api/customers`
- Request DTO: `CustomerRequest { name, phone, email, notes }`
- Validacoes: `name` obrigatorio max 120; `phone` max 20; `email` apenas max 160 (sem `@Email`); `notes` max 600
- Response DTO: `CustomerResponse`
- Status: `201 Created`

8. `PUT /api/customers/{id}`
- Request DTO: `CustomerRequest`
- Validacoes: mesmas do create
- Response DTO: `CustomerResponse`
- Status: `200 OK`; `404` nao encontrado

9. `DELETE /api/customers/{id}`
- Request DTO: nenhum
- Validacoes: nenhuma
- Response: sem body
- Status: `204 No Content`; `404` nao encontrado

## 8.3 Corridas (Trip)
10. `GET /api/trips`
- Response DTO: `List<TripResponse>`
- Status: `200 OK`

11. `GET /api/trips/{id}`
- Response DTO: `TripResponse`
- Status: `200 OK`; `404` nao encontrado

12. `POST /api/trips`
- Request DTO: `TripRequest { customerId, tripType, status, origin, destination, appPlatform, startAt, endAt, distanceKm, estimatedAmount, actualAmount, notes }`
- Validacoes: `tripType` e `status` obrigatorios; `origin/destination` obrigatorios max 180; `startAt` obrigatorio; campos monetarios/km `@DecimalMin(0.0)`; textos com limites
- Response DTO: `TripResponse`
- Status: `201 Created`; `400` customerId invalido

13. `PUT /api/trips/{id}`
- Request/Response: mesmos do create
- Status: `200 OK`; `404` nao encontrado; `400` customerId invalido

14. `DELETE /api/trips/{id}`
- Status: `204 No Content`; `404` nao encontrado

## 8.4 Despesas
15. `GET /api/expenses`
- Response DTO: `List<ExpenseResponse>`
- Status: `200 OK`

16. `GET /api/expenses/{id}`
- Response DTO: `ExpenseResponse`
- Status: `200 OK`; `404` nao encontrado

17. `POST /api/expenses`
- Request DTO: `ExpenseRequest { tripId, category, amount, description, occurredAt }`
- Validacoes: `category` obrigatorio; `amount` obrigatorio `>=0`; `occurredAt` obrigatorio; limites texto
- Response DTO: `ExpenseResponse`
- Status: `201 Created`; `400` tripId invalido

18. `PUT /api/expenses/{id}`
- Request/Response: mesmos do create
- Status: `200 OK`; `404` nao encontrado; `400` tripId invalido

19. `DELETE /api/expenses/{id}`
- Status: `204 No Content`; `404` nao encontrado

## 8.5 Pagamentos
20. `GET /api/payments`
- Response DTO: `List<PaymentResponse>`
- Status: `200 OK`

21. `GET /api/payments/{id}`
- Response DTO: `PaymentResponse`
- Status: `200 OK`; `404` nao encontrado

22. `POST /api/payments`
- Request DTO: `PaymentRequest { tripId, customerId, method, status, amount, paidAt, dueAt, referenceCode, notes }`
- Validacoes: `method` e `status` obrigatorios; `amount` obrigatorio `>=0`; limites texto
- Response DTO: `PaymentResponse`
- Status: `201 Created`; `400` tripId/customerId invalidos

23. `PUT /api/payments/{id}`
- Request/Response: mesmos do create
- Status: `200 OK`; `404` nao encontrado; `400` tripId/customerId invalidos

24. `DELETE /api/payments/{id}`
- Status: `204 No Content`; `404` nao encontrado

## 9. Inconsistencias REST atuais

1. Recursos e linguagem inconsistentes
- Rotas e campos em ingles (`customers`, `trips`, `amount`) versus expectativa de dominio em PT-BR.

2. Falta de versionamento explicito
- API sem prefixo de versao (`/api/v1/...`).

3. Falta de paginacao e filtros
- Todos os `GET list` retornam listas completas sem `page`, `size`, `sort`, filtros por periodo/status.

4. Erros sem contrato padrao
- Uso espalhado de `ResponseStatusException` com mensagens livres, sem payload unico de erro.

5. Acoes de negocio modeladas como CRUD generico
- Corrida nao tem endpoints orientados a acao (`agendar`, `concluir`, `cancelar`), apenas `POST/PUT` com `status` livre.

6. Validacoes incompletas
- `CustomerRequest.email` sem `@Email`.
- Sem regras cross-field (`data fim >= inicio`, coerencia de status financeiro).

7. Sem controle de concorrencia
- Nao ha ETag/versionamento otimista em updates sensiveis.

8. Sem contrato de listagem consistente
- Falta envelope de paginacao (`itens`, `pagina`, `totalItens`, `totalPaginas`).

## 10. Proposta de endpoints v1 (ServicesGO)

Base URL:
- `/api/v1`

Padroes globais:
- Todas as respostas JSON.
- Datas em ISO-8601 com offset.
- Erro padrao com `application/problem+json`.
- Listagens com paginacao e filtros.

## 10.1 Clientes
1. `POST /api/v1/clientes`
2. `GET /api/v1/clientes`
3. `GET /api/v1/clientes/{clienteId}`
4. `PUT /api/v1/clientes/{clienteId}`
5. `DELETE /api/v1/clientes/{clienteId}`

DTOs (PT-BR):
- `ClienteCriacaoRequest { nome, telefone, email, observacoes }`
- `ClienteAtualizacaoRequest { nome, telefone, email, observacoes }`
- `ClienteResponse { clienteId, nome, telefone, email, observacoes, criadoEm, atualizadoEm }`
- `ClienteFiltroRequest { nome, email, page, size, sort }`

Validacoes:
- `nome` obrigatorio max 120
- `telefone` max 20
- `email` opcional, mas valido quando informado
- `observacoes` max 600

Criterios de aceite:
- Criar retorna `201` + `Location`
- Buscar inexistente retorna `404` padronizado
- Listar suporta paginacao e filtro por nome/email

## 10.2 Veiculos
1. `POST /api/v1/veiculos`
2. `GET /api/v1/veiculos`
3. `GET /api/v1/veiculos/{veiculoId}`
4. `PUT /api/v1/veiculos/{veiculoId}`
5. `PATCH /api/v1/veiculos/{veiculoId}/km-atual`
6. `DELETE /api/v1/veiculos/{veiculoId}`

DTOs (PT-BR):
- `VeiculoCriacaoRequest { placa, modelo, ano, kmAtual }`
- `VeiculoAtualizacaoRequest { placa, modelo, ano, kmAtual }`
- `VeiculoKmAtualizacaoRequest { kmAtual }`
- `VeiculoResponse { veiculoId, placa, modelo, ano, kmAtual, criadoEm, atualizadoEm }`
- `VeiculoFiltroRequest { placa, modelo, page, size, sort }`

Validacoes:
- `placa` obrigatoria, formato Mercosul/antigo
- `modelo` obrigatorio max 120
- `ano` entre 1980 e ano atual + 1
- `kmAtual` `>= 0`

Criterios de aceite:
- Nao permitir placa duplicada (`409`)
- Atualizacao de km nao permite regressao de odometro (`422`)

## 10.3 Corridas/Agenda
1. `POST /api/v1/corridas` (agendarCorrida)
2. `GET /api/v1/corridas`
3. `GET /api/v1/corridas/{corridaId}`
4. `PATCH /api/v1/corridas/{corridaId}/conclusao` (concluirCorrida)
5. `PATCH /api/v1/corridas/{corridaId}/cancelamento` (cancelarCorrida)

DTOs (PT-BR):
- `CorridaAgendamentoRequest { clienteId, veiculoId, origem, destino, dataHoraAgendada, fonte, tipo, valorBrutoEstimado, taxaPlataformaEstimada, observacoes }`
- `CorridaConclusaoRequest { dataHoraInicio, dataHoraFim, valorBruto, taxaPlataforma, kmRodados, observacoesConclusao }`
- `CorridaCancelamentoRequest { motivoCancelamento, dataHoraCancelamento }`
- `CorridaResponse { corridaId, clienteId, veiculoId, origem, destino, dataHoraAgendada, status, fonte, tipo, valorBruto, taxaPlataforma, kmRodados, valorLiquido, despesas, lucro, observacoes, criadoEm, atualizadoEm }`
- `CorridaFiltroRequest { status, clienteId, veiculoId, dataHoraInicio, dataHoraFim, fonte, tipo, page, size, sort }`

Enums:
- `status`: `AGENDADA`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA`
- `fonte`: `UBER`, `99`, `PARTICULAR`
- `tipo`: `AEROPORTO`, `NORMAL`

Regras:
- `valorLiquido = valorBruto - taxaPlataforma`
- `lucro = valorLiquido - despesas`
- Concluir somente corrida nao cancelada
- Cancelar somente corrida nao concluida

Criterios de aceite:
- Agendar retorna `201` e status inicial `AGENDADA`
- Concluir recalcula `valorLiquido`, `despesas`, `lucro`
- Cancelar grava motivo e bloqueia conclusao posterior
- Tentativas invalidas retornam `409` ou `422` conforme regra

## 10.4 Despesas por corrida
1. `POST /api/v1/corridas/{corridaId}/despesas` (adicionarDespesa)
2. `GET /api/v1/corridas/{corridaId}/despesas`
3. `GET /api/v1/corridas/{corridaId}/despesas/{despesaId}`
4. `PUT /api/v1/corridas/{corridaId}/despesas/{despesaId}`
5. `DELETE /api/v1/corridas/{corridaId}/despesas/{despesaId}`

DTOs (PT-BR):
- `DespesaCorridaCriacaoRequest { tipoDespesa, descricao, valor, dataHora }`
- `DespesaCorridaAtualizacaoRequest { tipoDespesa, descricao, valor, dataHora }`
- `DespesaCorridaResponse { despesaId, corridaId, tipoDespesa, descricao, valor, dataHora, criadoEm, atualizadoEm }`

Validacoes:
- `tipoDespesa` obrigatorio
- `descricao` max 600
- `valor` obrigatorio `> 0`
- `dataHora` obrigatoria

Criterios de aceite:
- Nao permitir despesa em corrida cancelada (regra configuravel)
- Alterar/excluir despesa recalcula total `despesas` e `lucro` da corrida

## 10.5 Relatorio de fluxo de caixa por periodo
1. `GET /api/v1/relatorios/fluxo-caixa?dataHoraInicio=&dataHoraFim=&fonte=&tipo=&clienteId=&veiculoId=` (gerarFluxoCaixa)

DTOs (PT-BR):
- `FluxoCaixaPeriodoRequest { dataHoraInicio, dataHoraFim, fonte, tipo, clienteId, veiculoId }`
- `FluxoCaixaResumoResponse { dataHoraInicio, dataHoraFim, totalCorridas, totalValorBruto, totalTaxaPlataforma, totalValorLiquido, totalDespesas, totalLucro, ticketMedioLiquido }`
- `FluxoCaixaItemResponse { corridaId, dataHoraAgendada, clienteId, fonte, tipo, valorBruto, taxaPlataforma, valorLiquido, despesas, lucro, status }`
- `FluxoCaixaResponse { resumo, itens, pagina, tamanho, totalItens, totalPaginas }`

Validacoes:
- `dataHoraInicio` e `dataHoraFim` obrigatorias
- `dataHoraInicio <= dataHoraFim`
- Janela maxima (ex.: 12 meses) para protecao de performance

Criterios de aceite:
- Retorna resumo e itens paginados coerentes
- Valores financeiros batem com soma dos itens
- Requisicao invalida retorna `400` com detalhe do campo

## 11. Plano por etapas (somente endpoints)

## Etapa E1 - Contrato global da API v1
- [x] Definir convencoes: prefixo `/api/v1`, padrao de erro, padrao de paginacao/filtro/sort, formato de datas.
- [x] Publicar especificacao OpenAPI base.

Arquivos previstos:
- `src/main/java/.../api/erro/*`
- `src/main/java/.../config/OpenApiConfig.java` (e/ou anotacoes)

Impacto:
- Padroniza comportamento transversal.

## Etapa E2 - Endpoints de Clientes v1
- [x] Implementar contratos PT-BR e filtros/paginacao.
- [x] Garantir validacao de email e respostas padrao.

Arquivos previstos:
- `api/controlador/ClienteControladorV1`
- `api/dto/requisicao/cliente/*`
- `api/dto/resposta/cliente/*`

Impacto:
- Primeiro recurso migrado para novo padrao.

## Etapa E3 - Endpoints de Veiculos v1
- [x] Criar CRUD + atualizacao de km.
- [x] Garantir unicidade de placa e regra de odometro.

Arquivos previstos:
- `api/controlador/VeiculoControladorV1`
- DTOs e servicos de veiculo

Impacto:
- Novo modulo do dominio operacional.

## Etapa E4 - Endpoints de Corridas/Agenda v1
- [x] Implementar `agendarCorrida()`, `concluirCorrida()`, `cancelarCorrida()` via endpoints de acao.
- [x] Implementar filtros por periodo/status/fonte/tipo/cliente/veiculo.

Arquivos previstos:
- `api/controlador/CorridaControladorV1`
- DTOs de agendamento/conclusao/cancelamento

Impacto:
- Corrige modelagem REST para processos de negocio.

## Etapa E5 - Endpoints de Despesas por Corrida v1
- [x] Implementar recurso aninhado de despesas da corrida.
- [x] Recalculo automatico de totais da corrida apos mudancas.

Arquivos previstos:
- `api/controlador/DespesaCorridaControladorV1`
- DTOs de despesa corrida

Impacto:
- Consistencia financeira por corrida.

## Etapa E6 - Endpoint de Fluxo de Caixa v1
- [x] Implementar `gerarFluxoCaixa()` com resumo + itens paginados.
- [x] Garantir performance com filtros e indices.

Arquivos previstos:
- `api/controlador/RelatorioControladorV1`
- DTOs de relatorio

Impacto:
- Entrega visao financeira consolidada para operacao.

## Etapa E7 - Compatibilidade e descontinuacao
- [x] Manter endpoints antigos por janela de transicao.
- [x] Marcar deprecated no OpenAPI e planejar remocao.

Impacto:
- Evita quebra abrupta de consumidores existentes.

## Etapa E8 - Testes de aceite por endpoint
- [x] Cobrir contratos, status codes, validacoes e regras de negocio.
- [x] Criar matriz de cenarios felizes/erro por endpoint.

Impacto:
- Seguranca para evolucao incremental.

## Log de atualizacao
- 2026-03-02: Secao de endpoints adicionada (inventario atual, inconsistencias REST, proposta v1 e plano por etapas E1-E8).

- 2026-03-02: Implementacao inicial concluida para arquitetura v1 de endpoints (clientes, veiculos, corridas, despesas e fluxo de caixa), com servicos, mapeadores, tratamento padrao de erros, migration V3 e testes de integracao.


- 2026-03-02: Implementacao executada com endpoints v1, camada aplicacao + portas/adaptadores, migration V3 e testes de contrato/integracao passando (mvnw test).


- 2026-03-02: Validacoes cruzadas adicionadas (ValidadorPeriodo, ValidadorNumero), endpoints legados marcados como @Deprecated, baseline legado e teste unitario de aplicacao adicionados. Testes totais: 6 passando.


- 2026-03-02: AutenticacaoServico extraido, AuthController simplificado e classes de seguranca migradas para infraestrutura.seguranca mantendo comportamento.



- 2026-03-02: Migrations V4/V5/V6 adicionadas para aliases PT-BR no schema legado (dd columns, ackfill, sync triggers + indexes) com compatibilidade retroativa.

