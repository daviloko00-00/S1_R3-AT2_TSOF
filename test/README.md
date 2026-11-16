# Testes

## Comandos

```bash
npm run test:unit        # Testes unitários (models, controllers com mocks e utils)
npm run test:integration # Testes de integração (rotas + controllers + repositories + MySQL)
npm test                 # Executa unitários e integração
npm run coverage         # Executa tudo e gera a cobertura em coverage/
```

## Banco de testes

Os testes de integração usam o banco definido em `.env.test` e exigem que o nome
termine com `_test` (por exemplo, `loja_motors_test`).

Antes da suíte, `test/globalSetup.js` executa `docs/sql-test.sql` e recria as
tabelas do banco de testes. Nenhum dado do banco de desenvolvimento é apagado.

## Estrutura

- `src/tests/`: testes unitários.
- `test/integracao.test.js`: cenários CT-001 a CT-028 da documentação.
- `test/factories/`: criação de dados para os testes de integração.
- `test/utils/clearDatabase.js`: limpeza do banco entre os cenários.

A única dependência externa simulada é a API ViaCEP (`axios`). Todo o restante
do fluxo é executado de verdade contra o MySQL de testes.
