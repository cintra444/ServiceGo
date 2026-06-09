# Teste Android do Smart Driver

## APK gerado

- Caminho: `android/app/build/outputs/apk/debug/app-debug.apk`

## Fluxo de teste em aparelho

1. Instale o APK no Android.
2. Abra o app `ServiceGo Smart Driver`.
3. Toque em `Abrir acessibilidade` e habilite o servico do app.
4. Toque em `Abrir permissao de overlay` e autorize desenhar sobre outros apps.
5. Cadastre um ou mais bairros bloqueados.
6. Abra Uber Driver ou 99 Motorista.
7. Quando aparecer uma oferta, volte ao Smart Driver e confira:
   - ultimo texto capturado
   - bairros interpretados
   - se a regra marcou `BLOQUEAR` ou `LIBERAR`
8. Se o bairro estiver bloqueado, confirme se o overlay vermelho apareceu.

## Fluxo sem aparelho conectado

Use a secao `Teste manual` na tela inicial:

1. Cole um texto visivel da corrida.
2. Exemplo:

```text
UberX
Destino: Jardim Ana Paula
Viagem de 7 km
R$ 18,50
```

3. Toque em `Rodar analise manual`.
4. Confira o resultado em `Ultima analise` e nos logs.

## Comandos uteis

```powershell
npm run typecheck
npm run lint
cd android
.\gradlew.bat assembleDebug
adb devices
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

## Observacoes

- Sem dispositivo listado em `adb devices`, nao ha como instalar nem validar a captura real.
- O modo manual valida a heuristica do lado TypeScript, mas nao substitui o teste do `AccessibilityService`.
