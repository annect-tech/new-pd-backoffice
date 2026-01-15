# Guia de Integração Frontend-Backend
**Backoffice PD | Status: Em Desenvolvimento**

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Status das Integrações](#status-das-integrações)
4. [Páginas Implementadas](#páginas-implementadas)
5. [Pendências Conhecidas](#pendências-conhecidas)
6. [Como Integrar Nova Rota](#como-integrar-nova-rota)
7. [Solicitações ao Backend](#solicitações-ao-backend)

---

## 🎯 Visão Geral

**Backend API**: `http://186.248.135.172:31535`  
**Documentação de Rotas**: Ver `ALL_ROUTES_API_DOCUMENTATION.md`  
**Autenticação**: JWT via header `Authorization: Bearer {token}`

### Camadas da Arquitetura
```
pages/          → Componentes de página (UI)
hooks/          → Lógica de negócio e estado
services/       → Comunicação HTTP com backend
interfaces/     → TypeScript types/interfaces
```

---

## 📁 Estrutura do Projeto

```
src/
├── pages/                    # Páginas da aplicação
│   ├── dashboard/
│   ├── seletivo/            # ✅ Lista candidatos
│   ├── cidades/             # ✅ Gerenciamento de cidades
│   ├── documentos/          # ✅ Documentos de candidatos
│   ├── resultadoProvas/     # ⚠️ Resultado de provas (parcial)
│   ├── resultadosMerito/    # ✅ Resultados de mérito acadêmico
│   ├── aprovacaoMerito/     # ✅ Aprovação de mérito
│   └── meuPerfil/           # ✅ Perfil do usuário
│
├── hooks/                    # Custom hooks
│   ├── useSelective.ts      # ✅ Seletivo/candidatos
│   ├── useCities.ts         # ✅ Cidades
│   ├── useDocuments.ts      # ✅ Documentos
│   ├── useExams.ts          # ⚠️ Provas (ajustado recentemente)
│   ├── useAcademicMerit.ts  # ✅ Mérito acadêmico
│   ├── useContracts.ts      # ✅ Contratos
│   ├── useEnemResults.ts    # ✅ Resultados ENEM
│   └── useUserProfile.ts    # ✅ Perfil de usuário
│
├── core/http/
│   ├── httpClient.ts        # ✅ Cliente HTTP centralizado
│   └── services/            # ✅ Serviços por domínio
│       ├── selectiveService.ts
│       ├── citiesService.ts
│       ├── candidateDocumentsService.ts
│       ├── examsService.ts
│       ├── academicMeritService.ts
│       ├── contractsService.ts
│       ├── enemResultsService.ts
│       └── userProfileService.ts
│
└── interfaces/              # TypeScript interfaces
    ├── userProfile.ts
    ├── exam.ts
    ├── academicMerit.ts
    └── ...
```

---

## ✅ Status das Integrações

### 🟢 Totalmente Integrado
| Página/Funcionalidade | Rota Backend | Observações |
|---|---|---|
| **Dashboard** | `/admin/users` | Estatísticas básicas |
| **Seletivo** | `/admin/user-data` | Lista candidatos com paginação e busca |
| **Cidades** | `/admin/tenant-cities` | CRUD completo |
| **Documentos** | `/admin/candidate-documents` | Lista, upload, update, delete |
| **Resultados Mérito** | `/admin/academic-merit-documents` | Lista com busca de nomes via `/admin/user-data/:id` |
| **Aprovação Mérito** | `/admin/academic-merit-documents` | Aprovação/rejeição + filtro por status |
| **Meu Perfil** | `/admin/user-profiles` | Atualização e upload de foto |
| **Contratos** | `/admin/contract` | Hooks completos (list, getById, update, create, delete) |
| **Resultados ENEM** | `/admin/enem-results` | Hooks completos (list, getById, create, delete) |

### 🟡 Parcialmente Integrado
| Página/Funcionalidade | Rota Backend | Status | Problema |
|---|---|---|---|
| **Resultados de Provas** | `/admin/student-exams` | ⚠️ | Backend retorna apenas `{id, user_data_id, score, status, exam_scheduled_hour_id}`. Sem dados de usuário (nome/CPF) nem horário/local expandidos. |

### 🔴 Não Integrado
- **FAQs** (rota existe: `/admin/faqs`)
- **Guardians** (rota existe: `/admin/guardians`)
- **Addresses** (rota existe: `/admin/addresses`)
- **Persona** (rota existe: `/admin/persona`)
- **Registration Data** (rota existe: `/admin/registration-data`)
- **Allowed Cities** (rota existe: `/admin/allowed-cities`)

---

## 📄 Páginas Implementadas

### 1. Seletivo (`/seletivo`)
- **Rota**: `GET /admin/user-data?page=X&size=Y&search=Z`
- **Features**: 
  - Listagem paginada
  - Busca por CPF/nome/email
  - Filtro por status (ativo/inativo)
  - Modais para visualizar persona, endereços, responsáveis, dados de registro
  - Export CSV/JSON
- **Hook**: `useSelective()`
- **Status**: ✅ Funcionando

### 2. Cidades (`/cidades`)
- **Rota**: `GET /admin/tenant-cities?page=X&size=Y`
- **Features**:
  - CRUD completo
  - Ativar/desativar cidades
  - Paginação e busca
- **Hook**: `useCities()`
- **Status**: ✅ Funcionando

### 3. Documentos (`/documentos`)
- **Rota**: `GET /admin/candidate-documents?page=X&size=Y`
- **Features**:
  - Lista documentos (RG, comprovante de endereço, histórico escolar)
  - Upload de documentos
  - Atualização de status
  - Exclusão
- **Hook**: `useDocuments()`
- **Status**: ✅ Funcionando

### 4. Resultados de Provas (`/resultado-provas`)
- **Rota**: `GET /admin/student-exams?page=X&size=Y`
- **Features**:
  - Lista registros de prova
  - Atualização de nota via modal
  - Busca e filtro
- **Hook**: `useExams()`
- **Status**: ⚠️ **Parcial** - Backend não retorna nome/CPF/horário/local expandidos
- **Workaround Atual**: Exibe `user_data_id` no CPF e "Usuário {id}" no nome. Local/Data/Hora ficam como "N/A".

### 5. Resultados Mérito (`/resultados-merito`)
- **Rota**: `GET /admin/academic-merit-documents?page=X&size=Y`
- **Features**:
  - Lista todos os documentos de mérito
  - Busca por nome/ID
  - Filtro por status
  - Visualização de PDF
  - Export CSV
- **Hook**: `useAcademicMerit()`
- **Status**: ✅ Funcionando (busca nomes via `/admin/user-data/:id` em paralelo)

### 6. Aprovação Mérito (`/aprovacao-merito`)
- **Rota**: `GET /admin/academic-merit-documents?page=X&size=Y&status=pending`
- **Features**:
  - Lista documentos pendentes
  - Aprovar/rejeitar individualmente
  - Visualização de PDF
- **Hook**: `useAcademicMerit()`
- **Status**: ✅ Funcionando

### 7. Meu Perfil (`/meu-perfil`)
- **Rota**: `GET /admin/user-profiles`, `PATCH /admin/user-profiles/:id`, `POST /admin/user-profiles/upload-photo`
- **Features**:
  - Atualização de dados pessoais
  - Upload de foto de perfil
- **Hook**: `useUserProfile()`
- **Status**: ✅ Funcionando

---

## ⚠️ Pendências Conhecidas

### 1. Resultado de Provas - Dados Incompletos
**Problema**: `/admin/student-exams` retorna:
```json
{
  "id": "1114",
  "user_data_id": 4254,
  "score": 0,
  "status": "pendente",
  "exam_scheduled_hour_id": "2104"
}
```

**Faltam**:
- Nome e CPF do candidato
- Horário da prova (apenas retorna `exam_scheduled_hour_id`)
- Data da prova
- Local da prova

**Workaround Atual**:
- Exibe `user_data_id` como CPF
- Exibe "Usuário {user_data_id}" como nome
- Local/Data/Hora = "N/A"

**Solução Ideal** (precisa backend):
```json
{
  "id": "1114",
  "user_data_id": 4254,
  "score": 0,
  "status": "pendente",
  "exam_scheduled_hour_id": "2104",
  "user_data": {
    "cpf": "12345678900",
    "user": { "first_name": "Fulano", "last_name": "Silva" }
  },
  "exam_scheduled_hour": {
    "hour": "09:00",
    "exam_date": {
      "date": "2026-01-20",
      "local": { "name": "Auditório Central" }
    }
  }
}
```

### 2. Páginas sem Integração
- FAQs, Guardians, Addresses, Persona, Registration Data, Allowed Cities
- Rotas existem no backend mas páginas não foram criadas

### 3. Exportação XLSX
- Atualmente não implementado (apenas CSV e JSON)
- Requer biblioteca externa (ex: `xlsx`)

---

## 🔧 Como Integrar Nova Rota

### Passo 1: Criar Interface
```typescript
// src/interfaces/meuModulo.ts
export interface MeuTipo {
  id: string;
  nome: string;
  // ...
}
```

### Passo 2: Criar Service
```typescript
// src/core/http/services/meuService.ts
import { httpClient } from "../httpClient";
import type { MeuTipo } from "../../../interfaces/meuModulo";

const API_URL = import.meta.env.VITE_API_URL || "http://186.248.135.172:31535";

export const meuService = {
  list: (page: number = 1, size: number = 10) => 
    httpClient.get<{ data: MeuTipo[] }>(
      API_URL,
      "/admin/meu-endpoint",
      { queryParams: { page, size } }
    ),
  
  getById: (id: string | number) =>
    httpClient.get<MeuTipo>(API_URL, `/admin/meu-endpoint/${id}`),
  
  create: (payload: Partial<MeuTipo>) =>
    httpClient.post<{ message: string }>(API_URL, "/admin/meu-endpoint", payload),
  
  update: (id: string | number, payload: Partial<MeuTipo>) =>
    httpClient.patch<{ message: string }>(API_URL, "/admin/meu-endpoint", id, payload),
  
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(API_URL, "/admin/meu-endpoint", id),
};
```

### Passo 3: Criar Hook
```typescript
// src/hooks/useMeuHook.ts
import { useState, useCallback } from "react";
import { meuService } from "../core/http/services/meuService";
import type { MeuTipo } from "../interfaces/meuModulo";

export const useMeuHook = () => {
  const [items, setItems] = useState<MeuTipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (page: number = 1, size: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await meuService.list(page, size);
      if (response.status >= 200 && response.status < 300 && response.data) {
        setItems(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, fetchItems };
};
```

### Passo 4: Criar Página
```tsx
// src/pages/minhaPagina/MinhaPagina.tsx
import React, { useEffect } from "react";
import { useMeuHook } from "../../hooks/useMeuHook";

const MinhaPagina: React.FC = () => {
  const { items, loading, error, fetchItems } = useMeuHook();

  useEffect(() => {
    fetchItems(1, 10);
  }, [fetchItems]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.nome}</div>
      ))}
    </div>
  );
};

export default MinhaPagina;
```

---

## 📨 Solicitações ao Backend

### Alta Prioridade

#### 1. Expandir `/admin/student-exams`
**Endpoint**: `GET /admin/student-exams`  
**Payload Atual**:
```json
{
  "id": "1114",
  "user_data_id": 4254,
  "score": 0,
  "status": "pendente",
  "exam_scheduled_hour_id": "2104"
}
```

**Payload Desejado**:
```json
{
  "id": "1114",
  "user_data_id": 4254,
  "score": 0,
  "status": "pendente",
  "exam_scheduled_hour_id": "2104",
  "user_data": {
    "cpf": "12345678900",
    "user": {
      "first_name": "Fulano",
      "last_name": "Silva"
    }
  },
  "exam_scheduled_hour": {
    "hour": "09:00",
    "exam_date": {
      "date": "2026-01-20",
      "local": {
        "name": "Auditório Central"
      }
    }
  }
}
```

**Razão**: Front precisa exibir nome, CPF, data, hora e local da prova. Atualmente retorna apenas IDs.

---

#### 2. Corrigir `/admin/user-data/:id`
**Problema**: Retorna 404 para todos os `user_data_id` existentes.  
**Mensagem**: `{"message": "Contrato não encontrado.", statusCode: 404}`

**Esperado**: Retornar 200 com:
```json
{
  "id": "4254",
  "name": "Fulano Silva",
  "cpf": "12345678900",
  "email": "fulano@example.com",
  "birth_date": "1990-01-01",
  "celphone": "11999999999"
}
```

**Razão**: Frontend usa esse endpoint para buscar nomes de candidatos em várias telas (Mérito, Provas, etc.).

---

### Média Prioridade

#### 3. Adicionar Filtros Avançados
- `/admin/user-data`: filtro por status de contrato, cidade permitida
- `/admin/student-exams`: filtro por local, data, status
- `/admin/academic-merit-documents`: filtro por data de criação

#### 4. Endpoints de Estatísticas
- Dashboard precisa de endpoints agregados:
  - Total de candidatos
  - Aprovados/reprovados por status
  - Documentos pendentes
  - Contratos por status

---

## 📝 Convenções

### Nomenclatura de Arquivos
- **Páginas**: PascalCase (`MeuPerfil.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useUserProfile.ts`)
- **Services**: camelCase com sufixo `Service` (`userProfileService.ts`)
- **Interfaces**: PascalCase (`UserProfile.ts`)

### Estrutura de Resposta Esperada
```typescript
{
  status: number;        // HTTP status code
  message?: string;      // Mensagem de erro/sucesso
  data?: T;              // Dados (pode ser array, objeto ou PaginatedResponse)
}
```

### Paginação
```typescript
interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

## 🔍 Debug e Logs

### Ambiente de Desenvolvimento
Logs importantes são exibidos no console com prefixos:
- `[httpClient]`: Requisições HTTP
- `[useNomeDoHook]`: Logs de hooks
- `[NomeDaPagina]`: Logs de páginas

### Ferramentas Úteis
- **Redux DevTools**: Estado global (auth, user)
- **Network Tab**: Verificar requisições e respostas
- **Console**: Logs de debug

---

## 📚 Referências
- **Rotas Backend**: `ALL_ROUTES_API_DOCUMENTATION.md`
- **Changelog**: `changelog.md`
- **README**: `README.md`

---

**Última Atualização**: 2026-01-14  
**Versão**: 1.0
