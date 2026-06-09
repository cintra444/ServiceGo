# ServiceGo Smart Driver

App Android-first em React Native CLI + Kotlin para detectar ofertas de corrida via Accessibility Service, interpretar bairros visiveis e alertar o motorista com overlay.

## MVP da Sprint 1

- Detectar mudancas de tela da Uber/99.
- Ler textos expostos pela arvore de acessibilidade.
- Identificar candidatos de corrida.
- Extrair bairros de origem/destino.
- Comparar com bairros bloqueados.
- Exibir overlay vermelho com `NAO ACEITAR`.

## Estrutura

- `src/modules/smart-driver`: modulo principal do produto.
- `src/core`: logging, configuracao e helpers de permissao.
- `android/app/src/main/java/com/servicegosmartdriver`: Accessibility Service, overlay e bridge nativa.

## Proximos passos

1. Rodar `npm install`.
2. Gerar Gradle Wrapper ou abrir no Android Studio para sincronizar dependencias.
3. Executar `npm run android`.
4. Ativar permissao de acessibilidade e overlay no aparelho.

