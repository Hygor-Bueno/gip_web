# Módulo GTPP — Gerenciador de Tarefas Peg Pese

## Visão Geral

O GTPP é o módulo de gerenciamento de tarefas do GIP Web. Ele exibe tarefas em um quadro kanban por estado, permite abrir um card de detalhes para cada tarefa e se comunica em tempo real via WebSocket.

---

## Estrutura de Pastas

```
src/Modules/GTPP/
├── Context/
│   ├── GtppWsContext.tsx         ← Provider principal (orquestrador)
│   ├── GtppWebSocket.tsx         ← Singleton de conexão WebSocket
│   ├── NotificationWs.tsx        ← Helpers WS (não usado ativamente)
│   ├── hooks/
│   │   ├── useGtppStates.ts      ← Estados e temas
│   │   ├── useGtppNotifications.ts ← Notificações + sons
│   │   ├── useGtppTasks.ts       ← Lista e detalhes de tarefas
│   │   ├── useGtppComments.ts    ← CRUD de comentários
│   │   └── useGtppTaskItems.ts   ← Operações nos itens de tarefa
│   ├── helpers/
│   │   └── taskPageHelpers.ts    ← Funções utilitárias puras
│   └── types/
│       └── gtppTypes.ts          ← Todas as interfaces do módulo
├── ComponentsCard/
│   ├── FlowBoard/                ← Quadro kanban principal
│   ├── ColumnTask/               ← Coluna por estado
│   ├── Modal/                    ← Card de detalhes da tarefa aberta
│   │   ├── Modal.tsx             ← Body do card
│   │   ├── Header.tsx            ← Cabeçalho do card
│   │   ├── SubtaskWithCheckbox.tsx ← Lista de itens da tarefa
│   │   └── SelectTaskItem.tsx    ← Seletor Empresa/Loja/Dep
│   └── CardRegister/             ← Formulário de criação de tarefa
├── CreateTheme/                  ← Gestão de temas
├── Class/
│   ├── NotificationGTPP.ts       ← Monta notificações a partir de msgs WS
│   └── InformSending.ts          ← Monta payloads para envio WS
├── Interfaces/
│   └── IGtppMainProps.tsx        ← Props do FlowBoard
└── Gtpp.tsx                      ← Entry point do módulo
```

---

## Fluxo de Dados

```
GtppWsProvider
  │
  ├── useGtppStates        → estados (kanban columns) + temas
  ├── useGtppNotifications → lista de notificações + permissão de som
  ├── useGtppTasks         → lista de tarefas, tarefa aberta, detalhes
  ├── useGtppComments      → comentários do item de tarefa selecionado
  └── useGtppTaskItems     → ações sobre itens (check, add, move, delete)
        │
        └── GtppWebSocket (singleton)
              │
              └── callbackOnMessage → reage a eventos do WS
```

O contexto é consumido via `useWebSocket()` em qualquer componente dentro do `GtppWsProvider`.

---

## Estados de Tarefa (state_id)

| ID | Descrição | Ação disponível no card | Modal exigido |
|----|-----------|------------------------|---------------|
| 1 | Em andamento | Parar tarefa | Sim — motivo (texto) |
| 2 | Em andamento (variante) | Parar tarefa | Sim — motivo (texto) |
| 3 | Finalizada | Finalizar tarefa | Não — confirmação simples |
| 4 | Reaberta / Retomada | Retomar tarefa | Sim — motivo (texto) |
| 5 | Pausada (aguardando prazo) | Solicitar mais dias | Sim — número de dias |
| 6 | Retomada | Retomar tarefa | Não — confirmação simples |
| 7 | Cancelada | — | Acionado pelo botão de cancelar no Header |

> **Nota:** Os IDs vêm do endpoint `GTPP/TaskState.php` e são armazenados em localStorage (`gtppStates`) para evitar requisição a cada acesso.

---

## Tipos de Mensagem WebSocket (IWsMessage.type)

| Tipo | Significado | Ação no cliente |
|------|-------------|-----------------|
| -3 | Tarefa cancelada/removida | Fecha o card aberto, recarrega lista |
| -1 | Login/logout de usuário | Ignora notificação de alerta |
| 2 | Alteração em item de tarefa | Atualiza item na lista (add/edit/delete/reorder) |
| 3 | Atualização da descrição completa | Atualiza `full_description` no card aberto |
| 5 | Vínculo/remoção de usuário na tarefa | Recarrega lista de tarefas |
| 6 | Mudança de estado da tarefa | Atualiza `state_id` + `percent` no card, recarrega lista |
| 7 | Novo comentário | Atualiza contador de comentários + recarrega comentários |
| 8 | Atualização geral da tarefa | Recarrega lista e detalhes |
| 9 | Remoção de comentário | Atualiza contador + recarrega comentários |

> O cliente ignora mensagens onde `send_user_id === myId` (evita ecos do próprio usuário).

---

## Campo `yes_no` nos Itens de Tarefa

| Valor | Significado |
|-------|-------------|
| 0 | Item comum (checkbox simples) |
| -1 | Item marcado como questão (pergunta) |
| 1, 2, 3 | Item do tipo questão com resposta registrada |

---

## Hooks — Responsabilidades

### `useGtppStates`
- Busca estados do kanban via `GTPP/TaskState.php`
- Cacheia em `localStorage("gtppStates")` para evitar requisições repetidas
- Busca lista de temas via `GTPP/Theme.php`

### `useGtppNotifications`
- Carrega notificações iniciais via `GTPP/Notify.php`
- Ao receber msg WS, instancia `NotificationGTPP` para montar a notificação e exibi-la
- Controla permissão de som do browser e `onSounds`

### `useGtppTasks`
- `loadTasks / reqTasks` — busca lista de tarefas (`GTPP/Task.php`)
  - `isAdm = true` adiciona `&administrator=1` à query
- `getTaskInformations` — busca detalhes da tarefa aberta pelo `task.id`
- `updateCommentCount` — atualiza contador de comentários localmente sem refetch
- Funções `reloadPage*` — atualizam `taskDetails` em memória sem nova requisição

### `useGtppComments`
- `getComment(taskItemId)` — busca comentários de um item específico
- `sendComment` — POST + notifica WS + incrementa contador
- `deleteComment / editComment` — PUT + atualiza lista local

### `useGtppTaskItems`
- `checkedItem` — marca/desmarca item, atualiza percent, verifica mudança de estado
- `handleAddTask` — cria novo item de tarefa, atualiza lista local + WS
- `stopAndToBackTask` — transição de estado com lógica por `state_id` (ver tabela acima)
- `changeDescription` — atualiza descrição completa + notifica WS
- `updatedAddUserTaskItem` — vincula usuário a um item de tarefa
- `deleteItemTaskWS` — notifica remoção via WS

---

## GtppWebSocket (Singleton)

A conexão WebSocket é gerenciada por uma instância única (`GtppWebSocket.getInstance()`).

- Conecta ao endpoint `REACT_APP_API_GIPP_BASE_WS:REACT_APP_API_GIPP_PORT_SOCKET_SECONDARY`
- Autentica via `localStorage.tokenGIPP` no `onopen`
- Mantém conexão viva com ping a cada 10s / timeout de 5s
- Callbacks registrados por chave (`"MAIN_TASK"`) — o `GtppWsContext` é o único consumidor atual

---

## Débitos Técnicos Conhecidos

| Localização | Problema | Impacto |
|---|---|---|
| `FileGenerator.tsx` | `Task.state_id: string` mas a API retorna `number` | Força `as unknown as Task[]` no FlowBoard |
| `NotificationGTPP.ts` | Parâmetros `any[]` | Sem tipagem nas mensagens recebidas |
| `Header.tsx`, `Modal.tsx` | `any` em `taskParam`, `req`, `error` | Sem checagem nos callbacks |
| `useGtppTaskItems.ts` | `?? 0` em `task.id` | Se `task.id` for undefined em runtime, envia `id=0` para API |
| `GtppWebSocket` | Singleton compartilhado globalmente | Dificulta testes unitários e múltiplas instâncias |
| Estados 1 e 2 | Comportamento idêntico | Provavelmente legado — pode ser unificado |
| `yes_no` | Sem enum/constante — magic numbers espalhados | Dificulta manutenção |

---

## Variáveis de Ambiente Utilizadas

```
REACT_APP_API_GIPP_BASE_WS         ← URL base do WebSocket
REACT_APP_API_GIPP_PORT_SOCKET_SECONDARY ← Porta do WebSocket
```

---

## Como Usar o Contexto

```tsx
// Em qualquer componente dentro de GtppWsProvider:
const { task, taskDetails, loadTasks, handleAddTask } = useWebSocket();
```

O `GtppWsProvider` deve envolver apenas a árvore do módulo GTPP, não o app inteiro.
