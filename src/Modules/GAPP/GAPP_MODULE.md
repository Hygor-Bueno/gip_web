# GAPP — Gestão de Ativos e Patrimônio

Módulo responsável pelo cadastro, edição e visualização de ativos da empresa.
Um ativo pode ser qualquer bem tangível: veículo, equipamento, máquina, etc.

---

## Estrutura de pastas

```
GAPP/
├── Active/
│   ├── Active.tsx                        # Entry point do módulo de ativos
│   ├── Adapters/
│   │   └── Adapters.tsx                  # Todas as chamadas HTTP (GET/PUT/POST)
│   ├── Component/
│   │   ├── ActiveTable.tsx               # Tabela principal + seleção + modal
│   │   ├── BuildFunction/
│   │   │   └── BuildFunction.ts          # Monta options dos selects
│   │   ├── FormActive/
│   │   │   ├── FormActive.tsx            # Formulário de edição (modal)
│   │   │   ├── FormActive.css            # Estilos do modal
│   │   │   └── FormSchema/
│   │   │       ├── FormActive.schema.ts  # Campos do ativo
│   │   │       ├── FormAddress.schema.ts # Campos do endereço de compra
│   │   │       ├── FormVehicle.schema.ts # Campos do veículo
│   │   │       └── FormInsurance.schema.ts # Campos do seguro
│   │   ├── ListAddItem/
│   │   │   ├── ListAdd.tsx               # Lista de itens adicionais do ativo
│   │   │   ├── ListAddFranchise.tsx      # Lista de franquias do seguro
│   │   │   └── ListAddFranchise.css
│   │   ├── PayloadMapper/
│   │   │   ├── PayloadMapper.ts          # Transforma form → payload Active/Vehicle
│   │   │   └── PayloadMapperInsurance.ts # Transforma form → payload Insurance
│   │   └── ServicesBox/
│   │       └── ServicesBox.tsx
│   ├── ConfigurationTable/
│   │   └── ConfigurationTable.ts         # Colunas, tags e formatadores da tabela
│   └── Interfaces/
│       └── Interfaces.ts                 # Todos os tipos do módulo
├── Business/                             # Sub-módulo de cadastro de empresas
├── ExpensesRegister/                     # Sub-módulo de despesas
├── Infraction/                           # Sub-módulo de infrações
├── Gapp.tsx                              # Roteador principal do GAPP
├── ConfigGapp.ts                         # Configurações gerais
└── __tests__/                            # Suite de testes
    └── *.test.ts / *.test.tsx
```

---

## Fluxo principal

```
ActiveTable
    │
    ├── [montagem] → Promise.all([ActiveData, DriverData, UnitData, CompanyData, TypeData, FuelData, DeptData])
    │                    ↓
    │               setData(ativos) + setModalData(listas de apoio)
    │
    ├── [seleção de linha] → Promise.all([ActiveByIdData, ActiveVehicleData])
    │                            ↓
    │                       ActiveInsuranceData(vehicle_id)
    │                            ↓
    │                       setModalData({ active, vehicle, insurance })
    │
    └── [abre modal] → FormActive(apiData, openModal, onSave)
                            │
                            ├── [salvar] → dirty-check por seção
                            │                   ↓
                            │             Promise.all([ PUTs das seções alteradas ])
                            │                   ↓
                            │             onSave({ active?, vehicle?, insurance? })
                            │                   ↓
                            │             ActiveTable atualiza em memória (sem GET)
                            │
                            └── [cancelar] → fecha modal sem alterar nada
```

---

## Endpoints

| Função | Método | Endpoint | Quando é chamado |
|--------|--------|----------|-----------------|
| `ActiveData` | GET | `GAPP/Active.php?all=1` | Carga inicial da tabela |
| `ActiveByIdData` | GET | `GAPP/Active.php?active_id=X` | Ao selecionar uma linha |
| `ActiveVehicleData` | GET | `GAPP/Vehicle.php?active_id_fk=X` | Ao selecionar uma linha |
| `ActiveInsuranceData` | GET | `GAPP/Insurance.php?all=1&status_insurance=1&vehicle_id_fk=X` | Após buscar veículo |
| `ActiveDriverData` | GET | `GAPP/Driver.php?all=1` | Carga inicial |
| `ActiveUnitsData` | GET | `GAPP/Units.php?all=1` | Carga inicial |
| `ActiveCompanyData` | GET | `GAPP/Company.php?all=1` | Carga inicial |
| `ActiveTypeData` | GET | `GAPP/ActiveType.php?all=1` | Carga inicial |
| `ActiveTypeFuelData` | GET | `GAPP/TypeFuel.php?all=1` | Carga inicial |
| `ActiveDepartamentData` | GET | `GAPP/Departament.php?all=1` | Carga inicial |
| `ActivePutData` | PUT | `GAPP/Active.php?v2=1&smart=ON` | Ao salvar dados do ativo |
| `VehiclePutData` | PUT | `GAPP/Vehicle.php?v2=1&smart=ON` | Ao salvar dados do veículo |
| `InsurancePutData` | PUT | `GAPP/Insurance.php?v2=1&smart=ON` | Ao salvar dados do seguro |

---

## Formulário — seções e campos obrigatórios

### Dados do Ativo
| Campo | Obrigatório |
|-------|-------------|
| Marca | ✅ |
| Modelo | ✅ |
| Nº NF | ✅ |
| Preço | ✅ |
| Data de aquisição | ✅ |
| Comprado por (unidade) | ✅ |
| Disponibilizado para (depto) | ✅ |
| Status do ativo | ✅ |
| Classe do ativo | ✅ |
| Foto | ❌ |
| É um veículo? | ❌ |

### Local da Compra
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

### Dados do Veículo (apenas se `is_vehicle = true`)
| Campo | Obrigatório |
|-------|-------------|
| Placa | ✅ |
| Ano | ✅ |
| Modelo | ✅ |
| Chassi | ✅ |
| Cor | ✅ |
| RENAVAM | ✅ |
| Potência | ✅ |
| Combustível | ✅ |
| Blindagem | ✅ |
| Cilindrada | ❌ |
| Capacidade | ❌ |
| Tabela FIPE | ❌ |

### Dados do Seguro (apenas se `is_vehicle = true`)
| Campo | Obrigatório |
|-------|-------------|
| CEP de risco | ✅ |
| Valor do seguro | ✅ |
| Danos materiais | ✅ |
| Danos morais | ✅ |
| Cobertura de vidros | ✅ |
| Assistência 24h | ✅ |
| KM de reboque | ✅ |
| Utilização | ✅ |
| Seguradora | ✅ |
| Cobertura | ✅ |
| Status do seguro | ✅ |
| Danos corporais | ❌ |

---

## Comportamentos importantes

### Dirty-check — só envia o que mudou
O formulário compara o estado atual com o snapshot salvo no momento em que os dados foram carregados.
Só dispara PUT para as seções que tiveram alteração.

```
Nenhuma mudança  → fecha modal, zero requisições
Só ativo mudou   → 1 PUT (Active.php)
Só seguro mudou  → 1 PUT (Insurance.php)
Tudo mudou       → 3 PUTs em paralelo (Promise.all)
```

### Update em memória — sem recarregar a lista
Após um PUT bem-sucedido, o `onSave` atualiza os dados localmente:
- **Active** → atualiza o item na lista da tabela pelo `active_id`
- **Vehicle / Insurance** → atualiza o `modalData` para a próxima abertura do form

Isso evita um GET desnecessário na lista completa.

### Campos serializados — list_items e place_purchase
O backend armazena esses campos como `TEXT` (JSON serializado como string).
Ao receber da API: precisa de `JSON.parse` antes de usar.
Ao enviar para a API: o `PayloadMapper` aplica `JSON.stringify` automaticamente.

```
GET  → "{ \"list\": [\"Extintor\"] }"  →  JSON.parse  →  { list: ["Extintor"] }
PUT  → { list: ["Extintor"] }          →  JSON.stringify  →  "{ \"list\": [\"Extintor\"] }"
```

---

## Tipos principais

| Tipo | Onde | Descrição |
|------|------|-----------|
| `Active` | `Interfaces.ts` | Registro completo do ativo vindo da API |
| `ActiveFormValues` | `Interfaces.ts` | Dados do ativo no formulário (editável) |
| `VehicleFormValues` | `Interfaces.ts` | Dados do veículo no formulário |
| `Insurance` | `Interfaces.ts` | Dados completos do seguro |
| `ActiveTableData` | `Interfaces.ts` | Pacote completo de dados para o modal |
| `FormActiveProps` | `Interfaces.ts` | Props do componente FormActive |
| `PlaceAddress` | `Interfaces.ts` | Endereço do local de compra |
| `FranchiseItem` | `Interfaces.ts` | Item da lista de franquias `{ description, value }` |

---

## Testes

```bash
# Rodar todos os testes do GAPP
npm test -- --testPathPattern="GAPP" --watchAll=false
```

| Arquivo de teste | O que cobre | Testes |
|-----------------|-------------|--------|
| `Active.PayloadMapper` | Serialização de payload para Active e Vehicle | 8 |
| `Active.PayloadMapperInsurance` | Payload flat do seguro | 6 |
| `Active.BuildFunction` | Montagem de options dos selects | 11 |
| `Active.ConfigurationTable` | Formatadores da tabela (moeda, status, endereço) | 18 |
| `Active.hasChanged` | Dirty-check — detecta mudanças por seção | 12 |
| `Active.handleSave` | Update em memória após PUT | 11 |
| `Active.FormSchemas` | Campos obrigatórios dos 4 formulários | 31 |
| `Active.ListAdd` | Componente de itens adicionais do ativo | 10 |
| `Active.ListAddFranchise` | Componente de franquias do seguro | 9 |
| `Active.Adapters` | Endpoints, métodos HTTP e tratamento de erro | 36 |
| **Total** | | **152** |

---

## Dívida técnica conhecida

| Item | Prioridade | Descrição |
|------|-----------|-----------|
| `parseActiveItem` | Alta | Precisa ser re-adicionado ao Adapter para garantir parse automático de `list_items` e `place_purchase` ao receber da API |
| Testes do `Infraction/` | Média | Sub-módulo sem cobertura de testes |
| Testes do `Business/` | Média | Sub-módulo sem cobertura de testes |
| Testes do `ExpensesRegister/` | Baixa | Sub-módulo sem cobertura de testes |
| `gravitity` rename | Baixa | Variável interna `gravity` deveria ser `gravitity` para bater com o banco |
