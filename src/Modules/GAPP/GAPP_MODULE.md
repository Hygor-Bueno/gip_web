# GAPP — Gestão de Ativos e Patrimônio

Módulo responsável pelo cadastro, controle e rastreamento de ativos da empresa.
Um ativo pode ser qualquer bem tangível: veículo, equipamento, máquina, etc.

---

## Índice

1. [Estrutura de pastas](#estrutura-de-pastas)
2. [Rotas e navegação](#rotas-e-navegação)
3. [Sub-módulos](#sub-módulos)
   - [Active](#active--gestão-de-ativos)
   - [Movement](#movement--movimentações)
   - [Settings](#settings--configurações)
   - [ExpensesRegister](#expensesregister--despesas)
   - [Infraction](#infraction--infrações)
   - [Business](#business--lojas)
4. [Endpoints por sub-módulo](#endpoints-por-sub-módulo)
5. [Formulários — campos obrigatórios](#formulários--campos-obrigatórios)
6. [Tipos principais](#tipos-principais)
7. [Comportamentos importantes](#comportamentos-importantes)
8. [Testes](#testes)
9. [Dívida técnica conhecida](#dívida-técnica-conhecida)

---

## Estrutura de pastas

```
GAPP/
├── Gapp.tsx                              # Roteador principal + título da página
├── ConfigGapp.ts                         # Rotas e itens de navegação
│
├── Active/                               # Gestão de ativos (sub-módulo mais complexo)
│   ├── Active.tsx                        # Entry point
│   ├── Adapters/
│   │   └── Adapters.tsx                  # 19 funções GET/POST/PUT
│   ├── Component/
│   │   ├── ActiveTable.tsx               # Tabela principal + seleção + abertura de modais
│   │   ├── ActiveTable.css
│   │   ├── BuildFunction/
│   │   │   └── BuildFunction.ts          # Monta options dos selects
│   │   ├── FilterPanel/                  # Filtros com persistência em localStorage
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── CnpjFilterInput.tsx
│   │   │   └── brandNormalization.ts     # Normalização de marcas para busca
│   │   ├── FormActive/
│   │   │   ├── FormActive.tsx            # Formulário unificado (ativo + veículo + seguro)
│   │   │   ├── FormActive.css
│   │   │   └── FormSchema/
│   │   │       ├── FormActive.schema.ts  # Campos do ativo
│   │   │       ├── FormAddress.schema.ts # Campos do endereço de compra
│   │   │       ├── FormVehicle.schema.ts # Campos do veículo
│   │   │       └── FormInsurance.schema.ts # Campos do seguro
│   │   ├── Hooks/
│   │   │   ├── useActiveData.ts          # Carregamento e CRUD de ativos
│   │   │   └── useActiveFilters.ts       # Estado dos filtros + localStorage
│   │   ├── InfoActive/                   # Visualização somente-leitura (8 seções)
│   │   ├── ListAddItem/
│   │   │   ├── ListAdd.tsx               # Lista de itens adicionais do ativo
│   │   │   ├── ListAddFranchise.tsx      # Lista de franquias do seguro
│   │   │   └── ListAddFranchise.css
│   │   ├── PayloadMapper/
│   │   │   ├── PayloadMapper.ts          # Form → payload Active/Vehicle
│   │   │   └── PayloadMapperInsurance.ts # Form → payload Insurance
│   │   ├── Releases/                     # Despesas/lançamentos vinculados ao ativo
│   │   │   ├── Releases.tsx              # Container com 5 abas
│   │   │   ├── ReleasesAdapters.ts       # API calls de lançamentos
│   │   │   ├── ExpenseFields.tsx         # Campos reutilizáveis entre abas
│   │   │   ├── defaultValues.ts          # Valores padrão por tipo de despesa
│   │   │   └── tabs/
│   │   │       ├── FinesTab.tsx          # Multas de trânsito
│   │   │       ├── FuelTab.tsx           # Despesas de combustível
│   │   │       ├── InsuranceTab.tsx      # Sinistros de seguro
│   │   │       ├── MaintenanceTab.tsx    # Registros de manutenção
│   │   │       └── SinisterTab.tsx       # Acionamentos de seguro
│   │   └── ServicesBox/
│   │       └── ServicesBox.tsx
│   ├── ConfigurationTable/
│   │   └── ConfigurationTable.ts         # Colunas, tags e formatadores da tabela
│   └── Interfaces/
│       ├── Interfaces.ts                 # Barrel export
│       ├── ActiveInterfaces.ts           # Active, ActiveFormValues, PlaceAddress, etc.
│       ├── OrgInterfaces.ts              # Company, Unit, Departament, Driver, etc.
│       └── VehicleInterfaces.ts          # VehicleFormValues, Insurance, FranchiseItem
│
├── Movement/                             # Movimentações de ativos entre unidades
│   ├── Movement.tsx
│   ├── MovementPage.tsx                  # Entry point (2 abas: formulário + histórico)
│   ├── Adapters/
│   │   └── MovementAdapters.ts           # 7 funções GET/POST/PUT
│   ├── Components/
│   │   ├── MovementForm/                 # Formulário em 2 fases
│   │   │   ├── Phase0Selection.tsx       # Fase 0: seleção de ativos
│   │   │   ├── Phase1FormData.tsx        # Fase 1: dados do destino
│   │   │   └── useMovementForm.ts        # Hook de estado do formulário
│   │   └── MovementHistory/              # Tabela do histórico
│   ├── Hooks/
│   │   └── useMovementData.ts            # Carregamento inicial (ativos + veículos)
│   └── Interfaces/
│       └── MovementInterfaces.ts         # ActiveForMovement, Movimentation, etc.
│
├── Settings/                             # Dados de referência do módulo
│   ├── Settings.tsx
│   ├── SettingsPage.tsx                  # Entry point (2 páginas: ativos + org)
│   ├── ActiveConfig/
│   │   ├── ActiveConfigPage.tsx          # Tipos e classes de ativos
│   │   ├── ActiveTypeTab.tsx
│   │   └── ActiveClassTab.tsx
│   ├── OrgConfig/
│   │   ├── OrgConfigPage.tsx             # Estrutura organizacional
│   │   ├── CompanyTab.tsx
│   │   ├── UnitsTab.tsx
│   │   ├── DepartamentsTab.tsx
│   │   └── SubdepartamentsTab.tsx
│   ├── Adapters/
│   │   └── SettingsAdapters.ts           # 18 funções CRUD (6 entidades × GET/POST/PUT)
│   ├── Hooks/
│   │   └── useSettingsData.ts            # Carregamento paralelo de todas as entidades
│   └── Interfaces/
│       └── SettingsInterfaces.ts         # ActiveClass, Subdepartament, SettingsData
│
├── ExpensesRegister/                     # Relatório paginado de despesas
│   ├── ExpensesRegister.tsx              # Entry point (filtros + tabela + paginação)
│   ├── Configuration/
│   │   └── ConfigExpensesRegister.ts     # Campos do formulário e config da tabela
│   └── Interfaces/
│       └── InterfaceExpensesRegister.ts  # IExpensesItem
│
├── Infraction/                           # Infrações e multas de trânsito
│   ├── Infraction.tsx                    # Entry point + modais de criação/edição
│   ├── Component/
│   │   ├── CreateInfraction.tsx          # Modal de criação
│   │   ├── EditInfraction.tsx            # Modal de edição com navegação entre itens
│   │   └── InfractionModel.tsx
│   ├── hook/
│   │   └── useInfractionFields.tsx       # Estado dos campos do formulário
│   ├── Interfaces/
│   │   └── IFormGender.ts                # InfractionItem
│   └── mock/
│       └── configuration.ts
│
├── Business/                             # Lojas / unidades físicas
│   ├── Stores.tsx                        # Entry point + CRUD
│   ├── Component/Form/
│   │   └── Form.tsx                      # Formulário de loja
│   ├── Interfaces/
│   │   └── IFormGender.ts                # IFormData, IFormGender
│   ├── hook/
│   │   └── useWindowSize.tsx
│   └── mock/
│       └── configuration.ts
│
└── __tests__/                            # 21 arquivos — 416 testes no total
    ├── Active/                           # 14 arquivos — 323 testes
    ├── Movement/                         # 3 arquivos — 82 testes
    └── Settings/                         # 4 arquivos — 89 testes
```

---

## Rotas e navegação

Configuradas em `ConfigGapp.ts` e consumidas pelo componente `NavBar`:

|-------|-----------|-----------|
| Rota | Componente | Descrição |
|-------|-----------|-----------|
| `/GIPP` | — | Home do sistema |
| `/GIPP/GAPP` | `ExpensesRegister` | Relatório de despesas (landing padrão) |
| `/GIPP/GAPP/Active` | `Active` | Gestão de ativos |
| `/GIPP/GAPP/Movement` | `MovementPage` | Movimentações |
| `/GIPP/GAPP/Infraction` | `Infraction` | Infrações |
| `/GIPP/GAPP/Stores` | `Stores` | Lojas / Business |
| `/GIPP/GAPP/Settings` | `SettingsPage` | Configurações |

---

## Sub-módulos

### Active — Gestão de Ativos

Módulo central do GAPP. Gerencia o ciclo de vida completo dos ativos: criação, edição, visualização, e acompanhamento de despesas vinculadas.

**Fluxo principal:**

```
ActiveTable
    │
    ├── [montagem] → useActiveData carrega dados de apoio em paralelo
    │               (Active, Driver, Unit, Company, Type, Fuel, Departament)
    │
    ├── [seleção de linha] → lazy-load sob demanda:
    │   ├── ActiveVehicleData(active_id)
    │   └── ActiveInsuranceData(vehicle_id)  ← só se o ativo for veículo
    │
    └── [abre modal FormActive]
        ├── snapshot dos dados ao abrir (initialRef)
        │
        ├── [salvar] → dirty-check por seção
        │   ├── Nenhuma mudança      → fecha, 0 requisições
        │   ├── Só ativo mudou       → 1 POST/PUT (Active.php)
        │   ├── Só veículo mudou     → 1 POST/PUT (Vehicle.php)
        │   ├── Só seguro mudou      → 1 POST/PUT (Insurance.php)
        │   └── Tudo mudou           → até 3 POST/PUTs em paralelo
        │
        └── [onSave] → atualiza em memória (sem GET na lista)
```

**Aba Releases (Lançamentos):**

Acessível dentro do modal do ativo. Agrupa 5 abas de despesas vinculadas ao veículo:

| Aba | Endpoint | Descrição |
|------|---------|-----------|
| Combustível | `GAPP_V2/Fuel.php` | Abastecimentos |
| Manutenção | `GAPP_V2/Maintenance.php` | Revisões e reparos |
| Multas | `GAPP_V2/Fines.php` | Infrações vinculadas ao veículo |
| Seguro | `GAPP_V2/Insurance.php` | Acionamentos de seguro |
| Sinistro | `GAPP_V2/Sinister.php` | Registros de sinistros |

---

### Movement — Movimentações

Controla a transferência de ativos entre unidades, departamentos e subdepartamentos.

**Fluxo em 2 fases:**

```
MovementPage
    │
    ├── Aba "Nova Movimentação"
    │   │
    │   ├── Fase 0 — Seleção de Ativos
    │   │   ├── Carrega: Active.php?actplc=1 + Vehicle.php?all=1
    │   │   ├── Join client-side: vincula placa ao ativo pelo active_id
    │   │   ├── Filtros: texto livre (marca, modelo, classe, unidade) + placa
    │   │   └── Seleção múltipla (máx. 1 item se tipo = "externo")
    │   │
    │   └── Fase 1 — Dados do Destino
    │       ├── Tipo de movimentação: interno | externo
    │       ├── Unidade (required) → lazy-load departamentos
    │       ├── Departamento       → lazy-load subdepartamentos
    │       ├── Subdepartamento (opcional)
    │       ├── Observação (textarea)
    │       └── Submit → POST para cada ativo selecionado
    │                   → sucesso: recarrega dados + abre aba Histórico
    │
    └── Aba "Histórico"
        ├── Lista todas as movimentações (desc por data)
        ├── Campos denormalizados: marca, modelo, unidade, depto
        └── Toggle de status ativo/inativo (PUT)
```

---

### Settings — Configurações

Gerencia os dados de referência usados pelos demais sub-módulos. Dividido em duas páginas com abas:

**Página 1 — Configuração de Ativos:**

| Aba | Entidade | Campos |
|-----|----------|--------|
| Tipos de Ativo | `ActiveType` | descrição, status, grupo |
| Classes de Ativo | `ActiveClass` | descrição, tipo vinculado, status |

**Página 2 — Configuração Organizacional:**

| Aba | Entidade | Campos |
|-----|----------|--------|
| Empresas | `Company` | razão social, nome fantasia, status |
| Unidades | `Unit` | número, CNPJ, endereço, empresa vinculada |
| Departamentos | `Departament` | nome, unidade vinculada, status |
| Subdepartamentos | `Subdepartament` | nome, departamento vinculado, status |

Todas as entidades suportam criação, edição e toggle de status (sem exclusão física).

---

### ExpensesRegister — Despesas

Dashboard de visualização e exportação de despesas veiculares. Usa endpoint V2 com paginação.

**Funcionalidades:**
- Filtros: período (data início/fim), placa, unidade, tipo de despesa
- Paginação server-side via `page_number`
- Exportação CSV
- Modal de edição inline de registros individuais

---

### Infraction — Infrações

Cadastro de tipos de infração de trânsito com pontuação e gravidade.

**Comportamento especial:**
- Modal de edição suporta navegação entre múltiplos itens selecionados (botões anterior/próximo)

---

### Business — Lojas

Cadastro de unidades físicas/lojas da empresa com endereço completo.

**Comportamento especial:**
- Campo CEP com lookup automático de endereço
- Limpeza automática do CNPJ antes de enviar ao backend

---

## Endpoints por sub-módulo

### Active

| Função | Método | Endpoint | Quando |
|--------|--------|----------|--------|
| `ActiveData` | GET | `GAPP/Active.php?all=1` | Carga inicial |
| `ActiveCompanyData` | GET | `GAPP/Company.php?all=1` | Carga inicial |
| `ActiveTypeData` | GET | `GAPP/ActiveType.php?all=1` | Carga inicial |
| `ActiveUnitsData` | GET | `GAPP/Units.php?all=1` | Carga inicial |
| `ActiveDepartamentData` | GET | `GAPP/Departament.php?all=1` | Carga inicial |
| `ActiveDriverData` | GET | `GAPP/Driver.php?all=1` | Carga inicial |
| `ActiveTypeFuelData` | GET | `GAPP/TypeFuel.php?all=1` | Carga inicial |
| `ActiveVehicleData` | GET | `GAPP/Vehicle.php?active_id_fk={id}` | Ao selecionar ativo |
| `ActiveInsuranceData` | GET | `GAPP/Insurance.php?all=1&status_insurance=1&vehicle_id_fk={id}` | Após buscar veículo |
| `ActiveByIdData` | GET | `GAPP/Active.php?active_id={id}` | Ao selecionar linha |
| `SearchVehicleByPlate` | GET | `GAPP/Vehicle.php?license_plates={plate}` | Filtro por placa |
| `ActivePostData` | POST | `GAPP/Active.php?v2=1&smart=ON` | Criar ativo |
| `ActivePutData` | PUT | `GAPP/Active.php?v2=1&smart=ON` | Editar ativo |
| `VehiclePostData` | POST | `GAPP/Vehicle.php?v2=1&smart=ON` | Criar veículo |
| `VehiclePutData` | PUT | `GAPP/Vehicle.php?v2=1&smart=ON` | Editar veículo |
| `InsurancePostData` | POST | `GAPP/Insurance.php?v2=1&smart=ON` | Criar seguro |
| `InsurancePutData` | PUT | `GAPP/Insurance.php?v2=1&smart=ON` | Editar seguro |
| `GetGappUser` | GET | `GAPP/Users.php?access_code={code}` | Validar usuário |

### Movement

| Função | Método | Endpoint | Quando |
|--------|--------|----------|--------|
| `getActives` | GET | `GAPP/Active.php?actplc=1` | Fase 0: lista de ativos |
| `getVehicles` | GET | `GAPP/Vehicle.php?all=1` | Fase 0: join de placas |
| `getMovimentations` | GET | `GAPP/Movimentation.php?all=1` | Histórico |
| `getDepartamentsByUnit` | GET | `GAPP/Departament.php?unit_id_fk={id}` | Lazy-load ao selecionar unidade |
| `getSubdepartamentsByDep` | GET | `GAPP/Subdepartament.php?dep_id_fk={id}` | Lazy-load ao selecionar departamento |
| `postMovimentation` | POST | `GAPP/Movimentation.php?v2=1&smart=ON` | Registrar movimentação |
| `putMovimentation` | PUT | `GAPP/Movimentation.php?v2=1&smart=ON` | Atualizar status |

### Settings

| Entidade | GET | POST | PUT |
|----------|-----|------|-----|
| ActiveType | `GAPP/ActiveType.php?all=1` | `GAPP/ActiveType.php?v2=1&smart=ON` | mesmo |
| ActiveClass | `GAPP/ActiveClass.php?all=1` | `GAPP/ActiveClass.php?v2=1&smart=ON` | mesmo |
| Company | `GAPP/Company.php?all=1` | `GAPP/Company.php?v2=1&smart=ON` | mesmo |
| Units | `GAPP/Units.php?all=1` | `GAPP/Units.php?v2=1&smart=ON` | mesmo |
| Departament | `GAPP/Departament.php?all=1` | `GAPP/Departament.php?v2=1&smart=ON` | mesmo |
| Subdepartament | `GAPP/Subdepartament.php?all=1` | `GAPP/Subdepartament.php?v2=1&smart=ON` | mesmo |

### ExpensesRegister

| Função | Método | Endpoint | Quando |
|--------|--------|----------|--------|
| Busca filtrada | GET | `GAPP_V2/FiltredExpenses.php?dashGAPP=1&page_number={n}[&filtros...]` | Toda mudança de filtro/página |
| Tipos de despesa | GET | `GAPP_V2/ExpensesType.php?dashGAPP=1` | Carga inicial |
| Unidades | GET | `GAPP/Units.php?all=1` | Carga inicial |

### Infraction

| Método | Endpoint | Quando |
|--------|----------|--------|
| GET | `GAPP/Infraction.php?status_infractions={0\|1}` | Carga por status |
| POST | `GAPP/Infraction.php` | Criar infração |
| PUT | `GAPP/Infraction.php` | Editar ou toggle de status |

### Business (Stores)

| Método | Endpoint | Quando |
|--------|----------|--------|
| GET | `GAPP/Store.php?status_store={0\|1}` | Carga por status |
| POST | `GAPP/Store.php` | Criar loja |
| PUT | `GAPP/Store.php` | Editar ou toggle de status |

---

## Formulários — campos obrigatórios

### Active — Dados do Ativo

| Campo | Obrigatório |
|-------|-------------|
| Marca | ✅ |
| Modelo | ✅ |
| Nº NF | ✅ |
| Preço | ✅ |
| Data de aquisição | ✅ |
| Unidade (comprado por) | ✅ |
| Classe do ativo | ✅ |
| Status do ativo | ✅ |
| Foto | ❌ |
| É um veículo? | ❌ |
| Itens adicionais | ❌ |
| Responsável / Motorista | ❌ |

### Active — Local da Compra

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Estabelecimento | ✅ |
| Logradouro | ✅ |
| Bairro | ✅ |
| Cidade | ✅ |
| Estado | ✅ |
| CEP | ✅ |
| Nº | ✅ |
| Complemento | ❌ |

### Active — Veículo (somente se `is_vehicle = true`)

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Placa | ✅ |
| Ano de fabricação | ✅ |
| Ano do modelo | ✅ |
| Chassi | ✅ |
| Cor | ✅ |
| RENAVAM | ✅ |
| Combustível | ✅ |
| Potência (cv) | ✅ |
| Blindagem | ✅ |
| Cilindrada | ❌ |
| Capacidade | ❌ |
| Tabela FIPE | ❌ |
| Última/próxima revisão (data + km) | ❌ |
| Motorista responsável | ❌ |

### Active — Seguro (somente se `is_vehicle = true`)

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Seguradora | ✅ |
| Corretora | ✅ |
| Nº da Apólice | ✅ |
| Nº da Proposta | ✅ |
| Data de início | ✅ |
| Data de término | ✅ |
| Valor do seguro | ✅ |
| Forma de pagamento | ✅ |
| Utilização | ✅ |
| Cobertura | ✅ |
| Status do seguro | ✅ |
| CEP de risco | ✅ |
| Danos materiais | ✅ |
| Danos morais | ✅ |
| Cobertura de vidros | ✅ |
| Assistência 24h | ✅ |
| KM de reboque | ✅ |
| Tipo de franquia | ❌ |
| Valor da franquia | ❌ |
| Fator de ajuste | ❌ |
| IOF | ❌ |
| Lista de franquias | ❌ |
| Danos corporais | ❌ |
| 28+ campos de cobertura booleanos | ❌ |

### Movement — Fase 1

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Tipo de movimentação (interno / externo) | ✅ |
| Unidade de destino | ✅ |
| Departamento de destino | ❌ |
| Subdepartamento de destino | ❌ |
| Observação | ❌ |

### Infraction

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Descrição da infração | ✅ |
| Gravidade | ✅ |
| Pontos | ✅ |
| Status | ✅ |

### Business (Stores)

|-------|-------------|
| Campo | Obrigatório |
|-------|-------------|
| Nome | ✅ |
| Cidade | ✅ |
| Estado | ✅ |
| CNPJ | ❌ |
| CEP | ❌ |
| Logradouro | ❌ |
| Bairro | ❌ |
| Número | ❌ |
| Complemento | ❌ |

---

## Tipos principais

### Active (`Active/Interfaces/`)

|------|---------|-----------|
| Tipo | Arquivo | Descrição |
|------|---------|-----------|
| `Active` | `ActiveInterfaces.ts` | Registro completo do ativo vindo da API |
| `ActiveFormValues` | `ActiveInterfaces.ts` | Dados do ativo no formulário (parcial/editável) |
| `PlaceAddress` | `ActiveInterfaces.ts` | Endereço de compra (campos opcionais) |
| `PlacePurchaseParsed` | `ActiveInterfaces.ts` | Endereço de compra normalizado (campos obrigatórios) |
| `ActiveTableData` | `ActiveInterfaces.ts` | Pacote completo de dados para o modal |
| `FormActiveProps` | `ActiveInterfaces.ts` | Props do `FormActive` (modos add/edit) |
| `IListAdd` | `ActiveInterfaces.ts` | Gerenciamento da lista de itens adicionais |
| `IListAddFranchise` | `ActiveInterfaces.ts` | Gerenciamento da lista de franquias |
| `VehicleFormValues` | `VehicleInterfaces.ts` | Campos específicos do veículo |
| `Insurance` | `VehicleInterfaces.ts` | Registro completo do seguro (100+ campos) |
| `FranchiseItem` | `VehicleInterfaces.ts` | Item de franquia `{ value, description }` |
| `Company` | `OrgInterfaces.ts` | Empresa (comp_id, razão social, fantasia, status) |
| `Unit` | `OrgInterfaces.ts` | Unidade (unit_id, número, endereço, CNPJ, empresa) |
| `Departament` | `OrgInterfaces.ts` | Departamento com campos denormalizados de unidade |
| `Driver` | `OrgInterfaces.ts` | Motorista (RG, CPF, CNH, categoria, validade) |
| `ActiveType` | `OrgInterfaces.ts` | Tipo de ativo (id, descrição, data, status, grupo) |
| `FuelType` | `OrgInterfaces.ts` | Tipo de combustível |
| `Schema` | `OrgInterfaces.ts` | Option genérico `{ label, value }` para selects |

### Movement (`Movement/Interfaces/MovementInterfaces.ts`)

|------|-----------|
| Tipo | Descrição |
|------|-----------|
| `ActiveForMovement` | Ativo enriquecido com placa (join client-side) |
| `Movimentation` | Registro de movimentação com campos denormalizados |
| `MovementFormState` | Estado do formulário fase 1 |
| `LazyDepartament` | Departamento carregado sob demanda |
| `LazySubdepartament` | Subdepartamento carregado sob demanda |

### Settings (`Settings/Interfaces/SettingsInterfaces.ts`)

|------|-----------|
| Tipo | Descrição |
|------|-----------|
| `ActiveClass` | Classe de ativo com tipo vinculado |
| `Subdepartament` | Subdepartamento com departamento denormalizado |
| `SettingsData` | Coleção de todas as entidades de configuração |
| `SettingsSetters` | Funções setter de estado para todas as entidades |

---

## Comportamentos importantes

### Dirty-check — só envia o que mudou

O `FormActive` compara o estado atual com o snapshot tirado no momento da abertura do modal (`initialRef`). Apenas as seções alteradas disparam requisições.

```
Nenhuma mudança        → fecha modal, zero requisições
Só ativo mudou         → 1 POST/PUT (Active.php)
Só veículo mudou       → 1 POST/PUT (Vehicle.php)
Só seguro mudou        → 1 POST/PUT (Insurance.php)
Ativo + veículo mudou  → 2 POST/PUTs em paralelo
Tudo mudou             → 3 POST/PUTs em paralelo (Promise.all)
```

### Update em memória — sem recarregar a lista

Após um PUT/POST bem-sucedido, `onSave` atualiza os dados localmente:
- **Active** → substitui o item na lista da tabela pelo `active_id`
- **Vehicle / Insurance** → atualiza o `modalData` para a próxima abertura do form

Isso evita um GET desnecessário na lista completa.

### Campos serializados — `list_items` e `place_purchase`

O backend armazena esses campos como `TEXT` (JSON serializado como string).

```
GET  →  "{ \"list\": [\"Extintor\"] }"  →  JSON.parse  →  { list: ["Extintor"] }
PUT  →  { list: ["Extintor"] }          →  JSON.stringify  →  "{ \"list\": [\"Extintor\"] }"
```

O `PayloadMapper` aplica `JSON.stringify` automaticamente no envio.

### Lazy-loading de departamentos e subdepartamentos

Tanto no formulário de Movement quanto no de Active, departamentos e subdepartamentos são carregados sob demanda:

```
Seleciona Unidade      → GET Departament.php?unit_id_fk={id}  → popula select de depto
Seleciona Departamento → GET Subdepartament.php?dep_id_fk={id} → popula select de subdepto
```

### Persistência de filtros em localStorage

Os filtros do módulo Active são salvos automaticamente em `localStorage` (chave: `gapp_active_filters`) e restaurados no próximo acesso. Suportam: status, marca (com normalização), unidade, faixa de valor e placa.

### Join client-side no Movement

O módulo Movement busca `Active.php?actplc=1` e `Vehicle.php?all=1` separadamente e faz o join pela chave `active_id` / `active_id_fk` no cliente, para exibir a placa ao lado do ativo sem alterar o backend.

---

## Testes

```bash
# Rodar todos os testes do GAPP
npm test -- --testPathPattern="GAPP" --watchAll=false
```
|------------------|-----------|--------|
| Arquivo de teste | Cobertura | Testes |
|------------------|-----------|--------|
| `Active.Adapters` | GET/POST/PUT de ativos, veículos e seguros | 21 |
| `Active.BrandNormalization` | Normalização de nomes de marca | 47 |
| `Active.BuildFunction` | Montagem de options dos selects | 10 |
| `Active.ConfigurationTable` | Formatadores da tabela (moeda, status, endereço) | 17 |
| `Active.FilterPanel` | Lógica dos filtros com localStorage | 49 |
| `Active.FormSchemas` | Campos obrigatórios dos 4 formulários | 38 |
| `Active.ListAdd` | Componente de itens adicionais | 10 |
| `Active.ListAddFranchise` | Componente de franquias do seguro | 12 |
| `Active.PayloadMapper` | Serialização de payload Active/Vehicle | 10 |
| `Active.PayloadMapperInsurance` | Serialização de payload Insurance | 6 |
| `Active.Releases` | Formulários de lançamentos (abas) | 45 |
| `Active.ReleasesPost` | Lógica de POST dos lançamentos | 52 |
| `Active.handleSave` | Update em memória após PUT | 11 |
| `Active.hasChanged` | Dirty-check por seção | 12 |
| `Movement.Adapters` | GET/POST/PUT de movimentações | 43 |
| `Movement.FilterLogic` | Filtragem client-side de ativos | 22 |
| `Movement.NormPlate` | Normalização de placas | 17 |
| `Settings.Adapters` | CRUD completo de todas as entidades | 46 |
| `Settings.AdaptersGet` | Funções GET de configurações | 6 |
| `Settings.AdaptersPost` | Funções POST de configurações | 8 |
| `Settings.TableValues` | Renderização das tabelas de config | 29 |
| **Total** | | **536** |

> Business e Infraction não possuem cobertura de testes.

---

## Dívida técnica conhecida
|------|------------|-----------|
| Item | Prioridade | Descrição |
|------|------------|-----------|
| Testes do `Infraction/` | Alta | Sub-módulo sem nenhuma cobertura |
| Testes do `Business/` | Alta | Sub-módulo sem nenhuma cobertura |
| `parseActiveItem` no Adapter | Alta | Parse automático de `list_items` e `place_purchase` deve ser garantido no Adapter ao receber da API, não deixado para os componentes |
| `gravitity` rename | Baixa | Campo interno `gravity` pode divergir do nome no banco (`gravitity`) — verificar contrato da API |
| Testes do `ExpensesRegister/` | Baixa | Sub-módulo sem cobertura de testes |
