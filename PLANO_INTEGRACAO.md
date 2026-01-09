# Plano de Integração Backend - Status Atual

## 📊 Estado Atual do Projeto

- ✅ **Sprint 1 CONCLUÍDA** - Autenticação funcional e compatível com backend
- 🔒 **Sprint 2 PENDENTE** - Proteção de rotas e autorização
- 👤 **Sprint 3 PENDENTE** - Gestão de perfil de usuário
- 📊 **Sprint 4 PENDENTE** - Integração de dados (substituir mocks)
- 🧪 **Sprint 5 PENDENTE** - Robustez e tratamento de erros

---

## ✅ Sprint 1 — Autenticação Funcional (CONCLUÍDA)

### Resultado

O frontend agora está **100% compatível com o backend de autenticação**, sem dependência de mocks.

### O que foi entregue

- ✅ Login funcional via `credential` (aceita email, CPF ou username)
- ✅ Tokens alinhados ao contrato (`accessToken` / `refreshToken`)
- ✅ Usuário derivado do JWT (`sub`, `roles[]`, `tenant_city_id`)
- ✅ Refresh token automático no interceptor
- ✅ Registro desabilitado (não existe no backend)
- ✅ Tipagem consistente em todas as interfaces
- ✅ UX ajustada (labels, erros, redirecionamento)

### Status

🟢 **Estável**
🟢 **Testado manualmente**
🟢 **Pronto para produção** (do ponto de vista de autenticação)

⛔ **Nenhuma pendência nesta sprint**

---

## 🔴 Sprint 2 — Proteção de Rotas (PRÓXIMA)

### Objetivo

Garantir **segurança real da aplicação**, bloqueando acesso não autenticado e acesso sem permissão.

---

### Entregas Planejadas

#### 1. Ativar AuthMiddleware

**Arquivo:** [`src/app/routes/routes.tsx`](src/app/routes/routes.tsx)

- Envolver todas as rotas privadas com `<AuthMiddleware>`
- Bloquear acesso direto por URL
- Redirecionar para `/login` quando não autenticado

**Implementação:**
```typescript
<Route
  element={
    <AuthMiddleware>
      <AppLayout />
    </AuthMiddleware>
  }
>
  {/* Todas as rotas internas aqui */}
</Route>
```

---

#### 2. Criar RoleGuard

**Novo arquivo:** [`src/core/middleware/RoleGuard.tsx`](src/core/middleware/RoleGuard.tsx)

- Proteção baseada em `roles[]` do JWT
- Suporte a múltiplas roles (ex: `['ADMIN', 'ADMIN_MASTER']`)
- Redirecionamento para rota de erro quando sem permissão

**Exemplo de uso:**
```typescript
<Route
  path="/admin/*"
  element={
    <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
      <AdminPanel />
    </RoleGuard>
  }
/>
```

---

#### 3. Página de Não Autorizado

**Novo arquivo:** [`src/pages/Unauthorized.tsx`](src/pages/Unauthorized.tsx)

- Rota: `/nao-autorizado`
- Feedback claro ao usuário
- CTA de retorno ao dashboard

---

#### 4. Proteger Rotas Administrativas

Exemplos:
- `/admin/*` → Requer `ADMIN` ou `ADMIN_MASTER`
- `/gestao-usuarios` → Requer `ADMIN_MASTER`
- Baseado em `roles` do token JWT

---

### Checklist — Sprint 2

- [ ] Criar `RoleGuard.tsx`
- [ ] Criar `Unauthorized.tsx`
- [ ] Adicionar constante `APP_ROUTES.UNAUTHORIZED`
- [ ] Ativar `AuthMiddleware` nas rotas internas
- [ ] Separar rotas públicas (login) de privadas
- [ ] Proteger rotas admin com `RoleGuard`
- [ ] Testar:
  - [ ] Usuário não logado (deve redirecionar para login)
  - [ ] Usuário logado sem role (deve mostrar "não autorizado")
  - [ ] Usuário admin (deve acessar rotas admin)
  - [ ] Usuário comum (não deve acessar rotas admin)

---

## 🟡 Sprint 3 — Gestão de Perfil

### Objetivo

Integrar **perfil real do usuário** com o backend, eliminando mocks e `localStorage`.

---

### Contexto Atual

- ❌ **Não existe** endpoint `/user/user-profiles/me`
- ✅ Apenas endpoints **admin** disponíveis:
  - `GET /admin/user-profiles`
  - `POST /admin/user-profiles`
  - `POST /admin/user-profiles/upload-photo`

---

### Estratégia

**Workaround temporário:**
- Buscar lista de perfis via admin e filtrar por `user_id`
- Funciona, mas não é ideal (requer role ADMIN)

**Solução ideal (solicitar ao backend):**
```
GET    /user/user-profiles/me
POST   /user/user-profiles
PATCH  /user/user-profiles/me
POST   /user/user-profiles/me/upload-photo
```

---

### Entregas Planejadas

#### 1. Criar userProfileService

**Novo arquivo:** [`src/core/http/services/userProfileService.ts`](src/core/http/services/userProfileService.ts)

Métodos:
- `list(page, size)` - Listar perfis (admin)
- `create(payload)` - Criar perfil (admin)
- `uploadPhoto(profileId, file)` - Upload de foto (admin)
- `getMyProfile(userId)` - **Workaround:** busca e filtra por user_id

---

#### 2. Criar Hook useUserProfile

**Novo arquivo:** [`src/hooks/useUserProfile.ts`](src/hooks/useUserProfile.ts)

Funcionalidades:
- `profile` - Perfil atual
- `loading` - Estado de carregamento
- `error` - Mensagem de erro
- `createProfile(data)` - Criar perfil
- `uploadPhoto(file)` - Upload de foto
- `refetch()` - Recarregar perfil

---

#### 3. Atualizar UI

**Arquivos a modificar:**
- `src/components/layout/AppLayout.tsx` - Modal de criação → API real
- `src/pages/meuPerfil/MeuPerfil.tsx` - Página Meu Perfil → API real
- Remover todos os mocks e uso de `localStorage`

---

### Checklist — Sprint 3

- [ ] Criar `userProfileService.ts`
- [ ] Criar `useUserProfile.ts`
- [ ] Atualizar `CreateProfileModal` para usar API
- [ ] Atualizar `MeuPerfil` para buscar dados da API
- [ ] Implementar upload de foto com `FormData`
- [ ] Remover mocks de perfil
- [ ] Remover armazenamento em `localStorage`
- [ ] Testar:
  - [ ] Criação de perfil
  - [ ] Edição de perfil
  - [ ] Upload de foto
  - [ ] Visualização de perfil

---

## 🟢 Sprint 4 — Integração de Dados

### Objetivo

Substituir **todos os hooks mockados** por dados reais da API.

---

### Escopo

Criar services e integrar hooks para:

| Hook | Service | Endpoint Base | Status |
|------|---------|---------------|--------|
| `useCities` | `citiesService` | `/admin/cities` | 🔴 Mock |
| `useExams` | `examsService` | `/admin/exams` | 🔴 Mock |
| `useEnemResults` | `enemResultsService` | `/admin/enem-results` | 🔴 Mock |
| `useExamsScheduled` | `examsScheduledService` | `/admin/exams-scheduled` | 🔴 Mock |
| `useContracts` | `contractsService` | `/admin/contracts` | 🔴 Mock |
| `useSelective` | `selectiveService` | `/admin/selective` | 🔴 Mock |
| `useAcademicMerit` | `academicMeritService` | `/admin/academic-merit` | 🔴 Mock |

📌 **Fonte única de verdade:** [Swagger](http://186.248.135.172:31535/swagger)

---

### Padrão de Implementação

**Para cada módulo:**

1. Criar service em `src/core/http/services/{nome}Service.ts`
2. Atualizar hook em `src/hooks/use{Nome}.ts`
3. Remover dados mockados
4. Adicionar:
   - Paginação (`page`, `size`)
   - Loading states
   - Error handling
   - Tipos/interfaces

---

### Checklist — Sprint 4

#### Cities
- [ ] Criar `citiesService.ts`
- [ ] Atualizar `useCities.ts`
- [ ] Remover mock data
- [ ] Testar listagem

#### Exams
- [ ] Criar `examsService.ts`
- [ ] Atualizar `useExams.ts`
- [ ] Remover mock data
- [ ] Testar listagem e paginação

#### ENEM Results
- [ ] Criar `enemResultsService.ts`
- [ ] Atualizar `useEnemResults.ts`
- [ ] Remover mock data
- [ ] Testar listagem

#### Exams Scheduled
- [ ] Criar `examsScheduledService.ts`
- [ ] Atualizar `useExamsScheduled.ts`
- [ ] Remover mock data
- [ ] Testar listagem

#### Contracts
- [ ] Criar `contractsService.ts`
- [ ] Atualizar `useContracts.ts`
- [ ] Remover mock data
- [ ] Testar listagem

#### Selective
- [ ] Criar `selectiveService.ts`
- [ ] Atualizar `useSelective.ts`
- [ ] Remover mock data
- [ ] Testar listagem

#### Academic Merit
- [ ] Criar `academicMeritService.ts`
- [ ] Atualizar `useAcademicMerit.ts`
- [ ] Remover mock data
- [ ] Testar listagem

---

## 🟢 Sprint 5 — Robustez & Polimento

### Objetivo

Melhorar **resiliência, UX e previsibilidade** da aplicação.

---

### Entregas Planejadas

#### 1. Hook useApiError

**Novo arquivo:** [`src/hooks/useApiError.ts`](src/hooks/useApiError.ts)

Funcionalidades:
- Padronizar tratamento de erros HTTP
- Mapear status codes para mensagens amigáveis
- Integrar com sistema de notificações

---

#### 2. ErrorBoundary Global

**Novo arquivo:** [`src/components/ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx)

- Capturar erros não tratados
- Exibir página de erro amigável
- Opção de recarregar aplicação

---

#### 3. Mensagens Padronizadas

- Erros de validação (400)
- Erros de autenticação (401)
- Erros de autorização (403)
- Erros de recurso não encontrado (404)
- Erros de servidor (500)

---

#### 4. Loadings Consistentes

- Skeleton loaders para listas
- Progress bars para uploads
- Spinners para ações
- Desabilitar botões durante requisições

---

#### 5. Feedback Visual

- Toast/Snackbar para sucesso/erro
- Confirmações para ações destrutivas
- Estados vazios (empty states)

---

### Checklist — Sprint 5

- [ ] Criar `useApiError.ts`
- [ ] Criar `ErrorBoundary.tsx`
- [ ] Adicionar ErrorBoundary na raiz (`App.tsx`)
- [ ] Padronizar mensagens de erro HTTP
- [ ] Adicionar toasts para ações
- [ ] Adicionar loadings em todos os hooks
- [ ] Adicionar confirmações para delete/update
- [ ] Criar empty states
- [ ] Testar:
  - [ ] Erro de rede (desligar internet)
  - [ ] Erro 401 (token expirado)
  - [ ] Erro 403 (sem permissão)
  - [ ] Erro 500 (erro de servidor)
  - [ ] Validações de formulário

---

## 🚨 Limitações Conhecidas

### 1. Perfil de Usuário

❌ Backend **não oferece endpoints para usuário comum**

**Endpoints ideais (solicitar ao backend):**
```
GET    /user/user-profiles/me
POST   /user/user-profiles
PATCH  /user/user-profiles/me
POST   /user/user-profiles/me/upload-photo
```

**Workaround atual:**
- Buscar via `/admin/user-profiles` e filtrar por `user_id`
- Requer que usuário tenha role `ADMIN`

---

### 2. Registro de Usuários

❌ Backend **não possui endpoint público de registro**

**Solução:**
- Apenas administradores podem criar usuários
- Via endpoint: `POST /admin/users`

---

### 3. Logout no Backend

❌ Backend **não possui endpoint de logout**

**Solução:**
- Logout apenas no frontend (limpar tokens)
- Refresh token fica "órfão" no banco até expirar

---

## 📌 Recursos

### Documentação
- **Swagger:** http://186.248.135.172:31535/swagger
- **API Base:** http://186.248.135.172:31535
- **Guia Técnico:** [INTEGRACAO_BACKEND.md](INTEGRACAO_BACKEND.md)

### Credenciais de Teste
- **Email:** `luke@pectecbh.com.br`
- **Senha:** `qweasd32`

### Roles Disponíveis
- `ADMIN_MASTER` - Administrador master
- `ADMIN` - Administrador
- `LEADER` - Líder
- `AGENT_SUCCESS` - Agente de sucesso
- `MONITOR` - Monitor
- `STUDENT` - Estudante

---

## 🎯 Próximos Passos Imediatos

1. **Iniciar Sprint 2** → Proteção de rotas
2. **Testar autenticação** em ambiente de produção
3. **Solicitar ao backend** endpoints de perfil para usuário comum
4. **Planejar Sprint 3** com equipe de backend

---

**Última atualização:** 2026-01-09
