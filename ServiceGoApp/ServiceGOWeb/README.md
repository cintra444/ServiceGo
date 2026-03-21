# ServiceGO Web

Projeto web separado do app Expo para uso no navegador.

## Rodando localmente

1. Instale as dependências:
   `npm install`
2. Configure a API se necessário:
   `VITE_API_URL=http://localhost:8080`
   Se não definir nada, o Vite usa proxy local de `/api` para `http://localhost:8080`.
3. Suba o ambiente web:
   `npm run dev`

## Build

`npm run build`

## Observações

- Usa a mesma API do app mobile.
- Mantém sessão no `localStorage`.
- Entrega uma versão web com login, painel, corridas, clientes, veículos, financeiro, agenda e ajustes.
