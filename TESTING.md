# Guia de Testes — GIP Web

> **Regra do projeto:** sempre rode os testes antes de iniciar o servidor ou abrir um Pull Request.

---

## Por que rodar os testes primeiro?

Os testes garantem que nenhuma alteração recente quebrou uma regra de negócio existente.
Eles rodam em segundos, não acessam banco de dados e não fazem requisições reais à API.

---

## Pré-requisitos

- Node.js instalado
- Dependências instaladas (`npm install`)

---

## Comandos

### Rodar todos os testes
```bash
npm test -- --watchAll=false
```

### Rodar testes de um módulo específico
```bash
npm test -- --testPathPattern="GAPP" --watchAll=false
```

### Rodar um arquivo de teste específico
```bash
npm test -- --testPathPattern="Active.PayloadMapper" --watchAll=false
```

### Rodar em modo watch (reexecuta ao salvar)
```bash
npm test
```

---

## O que significa cada resultado

| Símbolo | Significado |
|---------|-------------|
| `PASS`  | Todos os testes do arquivo passaram |
| `FAIL`  | Pelo menos um teste falhou — **não suba o código** |
| `●`     | Detalhe do teste que falhou |

### Exemplo de saída saudável
```
PASS src/Modules/GAPP/__tests__/Active.PayloadMapper.test.ts
PASS src/Modules/GAPP/__tests__/Active.Adapters.test.ts

Tests: 152 passed, 152 total
```

### Exemplo de saída com falha
```
FAIL src/Modules/GAPP/__tests__/Active.PayloadMapper.test.ts
  ● mapActiveToApi › deve serializar list_items como string JSON

    Expected: "string"
    Received: "object"
```

---

## O que fazer quando um teste falha

1. **Leia a mensagem de erro** — ela mostra exatamente o que era esperado e o que veio
2. **Não altere o teste para forçar passar** — o teste está certo, o código é que mudou
3. **Corrija o código** e rode novamente
4. Se a regra de negócio realmente mudou, atualize o teste e documente o motivo

---

## Garantias dos testes

| Os testes garantem | Os testes NÃO garantem |
|--------------------|------------------------|
| Payloads corretos para a API | Que a API está no ar |
| Campos obrigatórios marcados | Comportamento visual no browser |
| Dirty-check (só PUT quando mudou) | Performance em produção |
| Update em memória após save | Integrações com sistemas externos |
| Formatação da tabela | |
| Endpoints corretos por função | |

---

## Fluxo recomendado antes do build

```
1. git pull origin main
       ↓
2. npm install
       ↓
3. npm test -- --watchAll=false     ← todos devem passar
       ↓
4. npm start                        ← só depois dos testes verdes
       ↓
5. npm run build                    ← só em branch limpa e testada
```

---

## Módulos com cobertura de testes

| Módulo | Testes | Arquivo |
|--------|--------|---------|
| GAPP | 152 testes | `src/Modules/GAPP/__tests__/` |

---

## Adicionando testes novos

Crie o arquivo dentro da pasta `__tests__` do módulo correspondente:

```
src/Modules/GAPP/__tests__/Active.SuaFuncao.test.ts
```

Siga o padrão existente:
- Um `describe` por função ou comportamento
- Um `it` por caso de uso
- Moque APIs com `jest.mock`
- Nunca dependa de dados reais do banco

---

## Dúvidas frequentes

**Os testes alteram o banco de dados?**
Não. Todas as chamadas HTTP são interceptadas por mocks do Jest.

**Preciso estar conectado à VPN para rodar os testes?**
Não. Os testes não fazem requisições reais.

**Um teste passou mas o sistema está com bug. Como?**
O teste cobre o que foi mapeado. Crie um novo teste que reproduza o bug antes de corrigir.

**Posso rodar só os testes do GAPP?**
Sim: `npm test -- --testPathPattern="GAPP" --watchAll=false`
