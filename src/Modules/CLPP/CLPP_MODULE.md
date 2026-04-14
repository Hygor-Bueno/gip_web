# Módulo CLPP — Chat Log Peg Pese

## Visão Geral

O CLPP é o módulo de **mensagens instantâneas entre funcionários**. Exibe um botão flutuante no canto inferior direito da tela que abre um chat em tempo real via WebSocket, com suporte a texto, arquivos e notificações desktop.

---

## Estrutura de Pastas

```
src/Modules/CLPP/
├── Clpp.tsx                  ← Entry point do módulo (botão flutuante + controle de abertura)
├── Clpp.css                  ← Estilos do módulo
├── Chat/
│   ├── ChatWindow.tsx        ← Container do chat (organiza os sub-componentes)
│   ├── ChatHeader.tsx        ← Cabeçalho com info do contato + botão voltar
│   ├── ChatMessages.tsx      ← Lista de mensagens (texto + arquivos)
│   ├── ChatControls.tsx      ← Input de texto + envio + anexo
│   └── ChatLoading.tsx       ← Overlay de carregamento
├── Components/
│   ├── Contacts.tsx          ← Lista de contatos com busca
│   └── CardUser.tsx          ← Card de usuário reutilizável
└── Class/
    ├── ContactList.ts        ← Gerencia carregamento e status de contatos
    └── SendMessage.ts        ← Objeto de dados para envio de mensagem
```

---

## Fluxo de Dados

```
Clpp.tsx (botão flutuante)
  │
  ├── Contacts.tsx            ← lista contatos do WsContext
  │     └── CardUser.tsx
  │
  └── ChatWindow.tsx          ← abre ao selecionar contato
        ├── ChatHeader.tsx
        ├── ChatLoading.tsx
        ├── ChatMessages.tsx  ← consome listMessage do WsContext
        └── ChatControls.tsx  ← envia via WebSocketCLPP
```

O estado central está no `WsContext` (`src/Context/WsContext.tsx`), não dentro do módulo. O CLPP apenas consome e dispara ações desse contexto.

---

## Tipos de Mensagem (message.type)

| Tipo | Conteúdo |
|------|----------|
| 1 | Texto simples |
| 2 | Imagem |
| 3 | PDF |
| 4 | XML |
| 5 | CSV |
| 6 | DOCX (Word) |
| 7 | XLSX (Excel) |
| 8 | PPTX (PowerPoint) |
| 9 | ZIP |
| 10+ | Arquivo genérico |

Arquivos são transmitidos em **base64**. O tipo é determinado em `ChatControls.tsx` pela extensão e pelo prefixo do base64 (`data:image/...`, `data:application/pdf`, etc.).

---

## Endpoints HTTP Utilizados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `CLPP/Message.php` | GET | Carregar histórico de mensagens |
| `CLPP/Message.php` | POST | Enviar mensagem |
| `CLPP/ChatLog.php` | GET | Carregar lista de contatos |
| `GIPP/LoginGipp.php` | GET | Download de arquivos enviados |

---

## Lógica de Contatos

Contatos são classificados por `yourContact`:

| Valor | Significado |
|-------|-------------|
| `1` | Contato pessoal (aparece no topo da lista) |
| `undefined` | Funcionário da empresa (aparece abaixo) |

A lista é ordenada por `notification` (mensagens não lidas) e depois por status de contato pessoal. A busca em `Contacts.tsx` filtra por nome em tempo real no frontend, sem nova requisição.

---

## WebSocket

O CLPP usa o **WebSocket principal** (`WebSocketCLPP` em `src/Services/Websocket.ts`), gerenciado pelo `WsContext` — diferente do GTPP que tem seu próprio singleton.

Eventos relevantes recebidos:
- **Nova mensagem** → adiciona à `listMessage`, incrementa badge no contato
- **Preview de leitura** → informa ao remetente que a mensagem foi visualizada

Comportamento de reconexão: tenta reconectar a cada **1 segundo** automaticamente ao perder conexão.

---

## Paginação de Mensagens

O histórico é paginado. Ao fazer scroll para o topo da janela de chat:
1. `page` incrementa
2. Nova requisição GET traz mensagens mais antigas
3. `previousScrollHeight` é salvo antes do fetch e restaurado depois, mantendo a posição de scroll

---

## Notificações

- Solicita permissão de notificação desktop no mount do `Clpp.tsx`
- Badge numérico no botão flutuante reflete `contNotify` (total de contatos com mensagens não lidas)
- Ícone do botão pisca (`blink`) quando há nova mensagem com o chat fechado

## Dependências Externas ao Módulo

| Origem | O que usa |
|--------|-----------|
| `src/Context/WsContext.tsx` | Estado central: mensagens, contatos, WebSocket |
| `src/Context/MainContext.tsx` | `userLog` (usuário logado) |
| `src/Context/ConnContext.tsx` | `fetchData` para requisições HTTP |
| `src/Class/User.ts` | Entidade de usuário |
| `src/Components/AttachmentFile` | Componente de upload de arquivo |
| `src/Services/Websocket.ts` | Cliente WebSocket principal |
