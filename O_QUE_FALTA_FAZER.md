# 📋 O Que Falta Ser Feito - Análise Completa do Projeto

## 📊 Status Geral do Projeto

### ✅ Sprint 1 - Autenticação (CONCLUÍDA)
- Login funcional via `credential` (email, CPF ou username)
- Tokens alinhados ao contrato (`accessToken` / `refreshToken`)
- Usuário derivado do JWT (`sub`, `roles[]`, `tenant_city_id`)
- Refresh token automático no interceptor
- Registro desabilitado (não existe no backend)
- Tipagem consistente em todas as interfaces

---

## 🔴 Sprint 2 - Proteção de Rotas e Autorização (PENDENTE)

### O que JÁ existe:
- ✅ `AuthMiddleware` criado e implementado em `routes.tsx`
- ✅ Rotas protegidas com `AuthMiddleware`

### O que FALTA:

#### 1. Criar RoleGuard Component
**Arquivo:** `src/core/middleware/RoleGuard.tsx` ❌ NÃO EXISTE

**Funcionalidades necessárias:**
- Proteção baseada em `roles[]` do JWT
- Suporte a múltiplas roles (ex: `['ADMIN', 'ADMIN_MASTER']`)
- Redirecionamento para rota de erro quando sem permissão
- Decodificar JWT para verificar roles do usuário

**Exemplo de uso esperado:**
```typescript
<Route
  path="/cidades"
  element={
    <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
      <Cidades />
    </RoleGuard>
  }
/>
```

#### 2. Criar Página de Não Autorizado
**Arquivo:** `src/pages/Unauthorized.tsx` ❌ NÃO EXISTE

**Requisitos:**
- Rota: `/nao-autorizado` (adicionar em `APP_ROUTES`)
- Feedback claro ao usuário sobre falta de permissão
- Botão para retornar ao dashboard
- Design consistente com o restante da aplicação

#### 3. Adicionar Rota UNAUTHORIZED nas Constantes
**Arquivo:** `src/util/constants.ts`

Adicionar:
```typescript
UNAUTHORIZED: "/nao-autorizado",
```

#### 4. Proteger Rotas Administrativas com RoleGuard

Rotas que PRECISAM de proteção por role:
- `/cidades` → Requer `ADMIN` ou `ADMIN_MASTER`
- `/contratos` → Requer `ADMIN` ou `ADMIN_MASTER`
- `/documentos` → Requer `ADMIN` ou `ADMIN_MASTER`
- `/usuarios` → Requer `ADMIN` ou `ADMIN_MASTER`

**Arquivo a modificar:** `src/app/routes/routes.tsx`

---

## 🟡 Sprint 3 - Gestão de Perfil de Usuário (PENDENTE)

### O que JÁ existe:
- ❌ Nada - tudo está mockado

### O que FALTA:

#### 1. Criar userProfileService
**Arquivo:** `src/core/http/services/userProfileService.ts` ❌ NÃO EXISTE

**Métodos necessários:**
- `list(page, size)` - Listar perfis (admin) - Endpoint: `GET /admin/user-profiles`
- `create(payload)` - Criar perfil (admin) - Endpoint: `POST /admin/user-profiles`
- `update(id, payload)` - Atualizar perfil - Endpoint: `PATCH /admin/user-profiles/:id`
- `uploadPhoto(profileId, file)` - Upload de foto (admin) - Endpoint: `POST /admin/user-profiles/upload-photo`
- `getMyProfile(userId)` - **Workaround:** busca via `/admin/user-profiles` e filtra por `user_id` no frontend

**⚠️ IMPORTANTE:** Backend não tem endpoint `/user/user-profiles/me`, então precisa usar workaround

#### 2. Criar Hook useUserProfile
**Arquivo:** `src/hooks/useUserProfile.ts` ❌ NÃO EXISTE

**Funcionalidades necessárias:**
- `profile` - Perfil atual do usuário
- `loading` - Estado de carregamento
- `error` - Mensagem de erro
- `createProfile(data)` - Criar perfil
- `updateProfile(id, data)` - Atualizar perfil
- `uploadPhoto(file)` - Upload de foto
- `refetch()` - Recarregar perfil

#### 3. Remover Mocks e Integrar API

**Arquivos que precisam ser atualizados:**

##### a) `src/components/layout/AppLayout.tsx`
**Status:** ❌ Usa mocks
- Linha 62-81: Criação de perfil mockada com `localStorage`
- Linha 89-105: Upload de foto mockado
- **Ação:** Substituir por chamadas ao `userProfileService`

##### b) `src/pages/meuPerfil/MeuPerfil.tsx`
**Status:** ❌ Usa `MOCK_MY_PROFILE`
- Linha 49-70: Dados mockados
- Linha 111-128: Carregamento simulado com `setTimeout`
- **Ação:** Usar hook `useUserProfile` para buscar dados reais

##### c) `src/components/modals/CreateProfileModal.tsx`
**Status:** ❌ Usa mocks e `localStorage`
- Linha 235-248: Criação mockada salvando em `localStorage`
- Linha 297-301: Upload mockado
- **Ação:** Integrar com `userProfileService`

##### d) `src/pages/usuarios/Usuarios.tsx`
**Status:** ❌ Usa `MOCK_USERS`
- Linha 36-98: Dados mockados
- Linha 106-114: Carregamento simulado
- **Ação:** Criar service/hook para buscar lista de perfis via API

---

## 🟢 Sprint 4 - Integração de Dados (PARCIALMENTE PENDENTE)

### Status Atual dos Services:

| Service | Status | Endpoint Correto | Observações |
|---------|--------|------------------|-------------|
| `citiesService` | ✅ Criado | `/admin/allowed-cities` ✅ | Funcionando |
| `examsService` | ✅ Criado | `/admin/exam` ✅ | Funcionando |
| `enemResultsService` | ✅ Criado | `/admin/enem-results` ✅ | Funcionando |
| `examsScheduledService` | ✅ Criado | `/admin/student-exams` ✅ | Funcionando |
| `contractsService` | ✅ Criado | `/admin/contract` ✅ | Funcionando |
| `selectiveService` | ✅ Criado | `/admin/user-data` ✅ | Funcionando |
| `academicMeritService` | ✅ Criado | `/admin/academic-merit-documents` ✅ | Funcionando |

### Status Atual dos Hooks:

| Hook | Service Integrado? | Mock Removido? | Status |
|------|-------------------|----------------|--------|
| `useCities` | ✅ Sim | ✅ Sim | ✅ COMPLETO |
| `useExams` | ⚠️ Parcial | ❌ Não verificado | ⚠️ VERIFICAR |
| `useEnemResults` | ⚠️ Parcial | ❌ Não verificado | ⚠️ VERIFICAR |
| `useExamsScheduled` | ✅ Sim | ✅ Sim | ✅ COMPLETO |
| `useContracts` | ⚠️ Parcial | ❌ Não verificado | ⚠️ VERIFICAR |
| `useSelective` | ✅ Sim | ✅ Sim | ✅ COMPLETO |
| `useAcademicMerit` | ⚠️ Parcial | ❌ Não verificado | ⚠️ VERIFICAR |

### O que FALTA:

#### 1. Verificar e Completar Hooks Restantes

##### a) `src/hooks/useExams.ts`
- Verificar se está usando `examsService` corretamente
- Remover qualquer dado mockado
- Testar listagem e paginação

##### b) `src/hooks/useEnemResults.ts`
- Verificar se está usando `enemResultsService` corretamente
- Remover qualquer dado mockado
- Testar listagem

##### c) `src/hooks/useContracts.ts`
- Verificar se está usando `contractsService` corretamente
- Remover qualquer dado mockado
- Testar listagem

##### d) `src/hooks/useAcademicMerit.ts`
- Verificar se está usando `academicMeritService` corretamente
- Remover qualquer dado mockado
- Testar listagem

#### 2. Remover TODOS os Mocks de Páginas

##### a) `src/pages/dadosAlunos/DadosAlunos.tsx`
**Status:** ❌ Usa `MOCK_NEW_STUDENTS`, `MOCK_AGENTS`, `MOCK_PSYCHOLOGISTS`
- Linha 65-103: Estudantes mockados
- Linha 133-142: Agentes e psicólogos mockados
- **Ação:** Criar service/hook para buscar alunos, agentes e psicólogos da API
- **Endpoint necessário:** Verificar no Swagger endpoint para listar alunos/estudantes

##### b) `src/pages/cadastroAlunos/CadastroAlunos.tsx`
**Status:** ❌ Usa `MOCK_MONITORS`, `MOCK_USERS`
- Linha 51-67: Monitores mockados
- Linha 58-67: Usuários mockados
- Linha 177-178: Busca de usuário mockada
- Linha 250-256: Criação de aluno mockada
- **Ação:** Integrar com API para:
  - Buscar monitores
  - Buscar usuários por CPF
  - Criar aluno (verificar endpoint no Swagger)

##### c) `src/pages/documentos/useDocuments.ts`
**Status:** ❌ Completamente mockado
- Linha 18-90: Todos os documentos são mocks
- Linha 97-103: Carregamento simulado
- Linha 105-151: Uploads simulados (não fazem requisição real)
- **Ação:** 
  - Criar `documentsService.ts` com métodos para listar e fazer upload
  - Verificar endpoints no Swagger para documentos de candidatos
  - Integrar uploads reais com FormData

##### d) Páginas que podem ter mocks (verificar):
- `src/pages/resultadoProvas/ResultadoProvas.tsx` - Verificar se usa mocks
- `src/pages/resultadosMerito/ResultadosMerito.tsx` - Verificar se usa mocks
- `src/pages/resultadosEnem/ResultadosEnem.tsx` - Verificar se usa mocks
- `src/pages/retencao/Retencao.tsx` - Verificar se existe e usa mocks

#### 3. Implementar Funcionalidades de Exportação Pendentes

##### a) Exportação XLSX
**Status:** ❌ Não implementada

**Arquivos com TODO:**
- `src/hooks/useSelective.ts` - Linha 115-118: TODO implementar XLSX
- `src/hooks/useExamsScheduled.ts` - Linha 111-114: TODO implementar XLSX

**Ação:**
- Instalar biblioteca `xlsx` ou `exceljs`
- Implementar função de exportação XLSX
- Adicionar nos hooks que têm export CSV/JSON

#### 4. Funcionalidades de Atualização Pendentes

##### a) `src/components/modals/ScheduledStatusUpdaterModal.tsx`
**Status:** ❌ TODO na linha 40
- **Ação:** Implementar chamada à API para atualizar status do exame agendado

##### b) `src/components/modals/NoteUpdaterModal.tsx`
**Status:** ❌ TODO na linha 47
- **Ação:** Implementar chamada à API para atualizar nota

##### c) `src/hooks/useExams.ts`
**Status:** ❌ TODO na linha 91
- **Ação:** Implementar navegação para detalhes do exame

#### 5. Funcionalidades de Upload Pendentes

##### a) `src/pages/cidades/Cidades.tsx`
**Status:** ❌ Uploads mockados
- Linha 190-198: Upload de logo e edital mockados
- **Ação:** Implementar upload real de arquivos usando FormData

---

## 🧪 Sprint 5 - Robustez e Tratamento de Erros (PARCIALMENTE PENDENTE)

### O que JÁ existe:
- ✅ `ErrorBoundary` criado e implementado em `main.tsx`

### O que FALTA:

#### 1. Hook useApiError
**Arquivo:** `src/hooks/useApiError.ts` ❌ NÃO EXISTE

**Funcionalidades necessárias:**
- Padronizar tratamento de erros HTTP
- Mapear status codes para mensagens amigáveis em português:
  - 400: "Erro de validação"
  - 401: "Sessão expirada. Por favor, faça login novamente."
  - 403: "Você não tem permissão para realizar esta ação."
  - 404: "Recurso não encontrado."
  - 500: "Erro no servidor. Tente novamente mais tarde."
- Integrar com sistema de notificações (Snackbar)
- Log de erros para debugging

#### 2. Melhorar ErrorBoundary
**Arquivo:** `src/components/ErrorBoundary.tsx`

**Melhorias necessárias:**
- ⚠️ UI básica atual - precisa melhorar design
- Adicionar opção de reportar erro
- Adicionar mais contexto sobre o erro
- Melhorar botão de recarregar (usar Material-UI)

#### 3. Padronizar Mensagens de Erro

**Arquivos a padronizar:**
- Todos os hooks (`useCities`, `useSelective`, etc.) devem usar `useApiError`
- Todas as páginas devem usar mensagens padronizadas
- Remover mensagens hardcoded

#### 4. Implementar Loading States Consistentes

**O que falta:**
- Skeleton loaders para listas (usar Material-UI Skeleton)
- Progress bars para uploads
- Spinners consistentes em todas as ações
- Desabilitar botões durante requisições (padronizar)

**Arquivos a atualizar:**
- Todas as páginas que fazem requisições
- Todos os modais que fazem uploads

#### 5. Feedback Visual Padronizado

**O que falta:**
- Toast/Snackbar padronizado para sucesso/erro
- Confirmações para ações destrutivas (delete, etc.)
- Estados vazios (empty states) quando não há dados
- Mensagens de "Nenhum resultado encontrado"

#### 6. Validações de Formulário

**O que falta:**
- Validação consistente em todos os formulários
- Mensagens de erro claras
- Validação antes de enviar para API

---

## 📝 Outras Pendências Identificadas

### 1. Endpoints que Precisam ser Verificados no Swagger

Alguns endpoints podem não existir ou ter nomes diferentes. Verificar no Swagger:
- Endpoint para listar alunos/estudantes
- Endpoint para criar aluno
- Endpoint para buscar monitores/agentes
- Endpoint para buscar psicólogos
- Endpoint para documentos de candidatos
- Endpoint para upload de documentos
- Endpoint para atualizar status de exame agendado
- Endpoint para atualizar nota de exame
- Endpoint para retenção de alunos

### 2. Tipos/Interfaces Faltantes

Verificar se todas as interfaces estão definidas:
- Interface para documentos
- Interface para alunos/estudantes
- Interface para monitores
- Interface para psicólogos
- Interface para retenção

### 3. Testes

- ❌ Não há testes automatizados implementados
- Criar testes unitários para hooks
- Criar testes de integração para services
- Criar testes E2E para fluxos principais

### 4. Documentação

- Atualizar README.md com informações atualizadas
- Documentar novos endpoints integrados
- Documentar padrões de código

### 5. Performance

- Implementar cache para dados que não mudam frequentemente
- Otimizar re-renderizações
- Lazy loading de rotas/páginas

### 6. Acessibilidade

- Adicionar labels ARIA
- Melhorar navegação por teclado
- Verificar contraste de cores

---

## 🎯 Prioridades Recomendadas

### 🔴 ALTA PRIORIDADE (Fazer primeiro)
1. **Sprint 2**: Criar RoleGuard e página Unauthorized (segurança)
2. **Sprint 3**: Implementar gestão de perfil (usado em várias páginas)
3. **Sprint 4**: Remover mocks de páginas principais (DadosAlunos, Documentos, CadastroAlunos)

### 🟡 MÉDIA PRIORIDADE
4. **Sprint 4**: Completar integração de hooks restantes
5. **Sprint 5**: Implementar useApiError e padronizar erros
6. **Sprint 5**: Melhorar loading states e feedback visual

### 🟢 BAIXA PRIORIDADE
7. Implementar exportação XLSX
8. Melhorar ErrorBoundary UI
9. Adicionar testes
10. Otimizações de performance

---

## 📊 Resumo Quantitativo

- **Services criados:** 7/8 (87.5%) ✅
- **Hooks integrados completamente:** ~4/8 (50%) ⚠️
- **Páginas com mocks:** ~8+ páginas ❌
- **Componentes de segurança:** 1/2 (AuthMiddleware ✅, RoleGuard ❌)
- **Hooks de utilidade faltantes:** 2 (useApiError, useUserProfile)
- **Páginas faltantes:** 1 (Unauthorized)
- **TODOs no código:** ~5-7

---

**Última atualização:** 2025-01-09
**Baseado em:** Análise completa do código-fonte

