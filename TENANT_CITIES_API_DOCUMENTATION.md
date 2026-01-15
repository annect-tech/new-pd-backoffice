# Documentação: Tenant Cities API

## 📋 Índice
1. [Conceito de Tenant Cities](#conceito-de-tenant-cities)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Endpoints Admin](#endpoints-admin)
4. [Endpoints User](#endpoints-user)
5. [Estrutura de Dados](#estrutura-de-dados)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Boas Práticas para Frontend](#boas-práticas-para-frontend)
8. [Tratamento de Erros](#tratamento-de-erros)

---

## 🏙️ Conceito de Tenant Cities

### O que são Tenant Cities?

**Tenant Cities** são entidades que representam cidades/tenants no sistema de **multi-tenancy**. Cada tenant city funciona como um **isolamento lógico** de dados e usuários, permitindo que o sistema suporte múltiplas cidades de forma independente.

### Características Principais

1. **Multi-tenancy**: O sistema suporta múltiplas cidades, cada uma com:
   - Seus próprios usuários
   - Seus próprios dados (endereços, exames, resultados ENEM, etc.)
   - Suas próprias configurações

2. **Isolamento de Dados**: 
   - Usuários de uma tenant city **não podem** acessar dados de outras tenant cities
   - Admins e Masters podem acessar todas as tenant cities

3. **Estrutura de Dados**:
   - Cada `tenant_city` possui:
     - `id`: UUID único (gerado automaticamente)
     - `domain`: Domínio opcional e único (ex: "cidade-a.com.br", máximo 100 caracteres)
     - `createdAt`: Data de criação
     - `updatedAt`: Data da última atualização

4. **Relacionamentos**:
   - Cada usuário (`auth_user`) pertence a uma `tenant_city` (campo `tenant_city_id`)
   - Cada cidade permitida (`seletivo_allowedcity`) pode estar vinculada a uma `tenant_city`
   - Todos os dados do sistema são filtrados pelo `tenant_city_id` do usuário

---

## 🔐 Autenticação e Autorização

### JWT Token

O JWT token contém o `tenant_city_id` do usuário logado:

```json
{
  "sub": 123,  // user_id
  "roles": ["ADMIN"],
  "tenant_city_id": "abc-123-def-456"
}
```

### Permissões por Role

| Role | Acesso às Tenant Cities |
|------|------------------------|
| `ADMIN_MASTER` | Acesso total (pode ver/gerenciar todas) |
| `ADMIN` | Acesso total (pode ver/gerenciar todas) |
| Outros roles | Apenas leitura da própria tenant city |

### Tenant Guard

O sistema possui um **Tenant Guard** que:
- Valida que usuários comuns só acessam dados da sua própria tenant city
- Permite que Admins/Masters acessem todas as tenant cities (bypass)
- Bloqueia acesso se o `tenant_city_id` não corresponder ao do usuário

---

## 🔧 Endpoints Admin

**Base URL**: `/admin/tenant-cities`

**Requer autenticação**: ✅ Bearer Token  
**Roles permitidas**: `ADMIN`, `ADMIN_MASTER`

### 1. Criar Tenant City

**POST** `/admin/tenant-cities`

Cria uma nova Tenant City no sistema.

#### Request Body

```typescript
{
  domain?: string;  // Opcional, máximo 100 caracteres
}
```

#### Response (201 Created)

```typescript
{
  id: string;           // UUID da tenant city criada
  message: string;      // Mensagem de sucesso
}
```

#### Exemplo de Requisição

```bash
POST /admin/tenant-cities
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "cidade-exemplo.com.br"
}
```

#### Exemplo de Resposta

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Tenant City criada com sucesso"
}
```

---

### 2. Listar Tenant Cities

**GET** `/admin/tenant-cities`

Lista todas as Tenant Cities com paginação e busca.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Número da página (padrão: 1) |
| `size` | number | Não | Itens por página (padrão: 10) |
| `search` | string | Não | Termo de busca (busca no domain) |

#### Response (200 OK)

```typescript
{
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  data: Array<{
    id: string;
    domain: string | null;
    createdAt: string;  // ISO 8601
    updatedAt: string;  // ISO 8601
  }>;
}
```

#### Exemplo de Requisição

```bash
GET /admin/tenant-cities?page=1&size=10&search=cidade
Authorization: Bearer <token>
```

#### Exemplo de Resposta

```json
{
  "currentPage": 1,
  "itemsPerPage": 10,
  "totalItems": 25,
  "totalPages": 3,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "domain": "cidade-exemplo.com.br",
      "createdAt": "2026-01-14T14:58:38.865Z",
      "updatedAt": "2026-01-14T14:58:38.865Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "domain": null,
      "createdAt": "2026-01-13T10:30:00.000Z",
      "updatedAt": "2026-01-13T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Atualizar Tenant City

**PATCH** `/admin/tenant-cities/{id}`

Atualiza o domínio de uma Tenant City existente.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | string (UUID) | Sim | ID da tenant city a ser atualizada |

#### Request Body

```typescript
{
  domain?: string;  // Opcional, máximo 100 caracteres
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // Mensagem de sucesso
}
```

#### Exemplo de Requisição

```bash
PATCH /admin/tenant-cities/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "novo-dominio.com.br"
}
```

#### Exemplo de Resposta

```json
{
  "message": "Tenant City atualizada com sucesso"
}
```

---

### 4. Deletar Tenant City

**DELETE** `/admin/tenant-cities/{id}`

Remove uma Tenant City permanentemente do sistema.

⚠️ **ATENÇÃO**: Esta operação é **irreversível** e pode afetar todos os usuários e dados vinculados a esta tenant city.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | string (UUID) | Sim | ID da tenant city a ser removida |

#### Response (200 OK)

```typescript
{
  message: string;  // Mensagem de sucesso
}
```

#### Exemplo de Requisição

```bash
DELETE /admin/tenant-cities/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

#### Exemplo de Resposta

```json
{
  "message": "Tenant City removida com sucesso"
}
```

---

## 👤 Endpoints User

**Base URL**: `/user/tenant-cities`

**Requer autenticação**: ✅ Bearer Token  
**Roles permitidas**: Qualquer usuário autenticado

> **Nota**: Os endpoints user têm a mesma estrutura dos endpoints admin, mas são acessíveis para qualquer usuário autenticado. No entanto, o comportamento pode variar baseado no `tenant_city_id` do usuário.

### 1. Criar Tenant City

**POST** `/user/tenant-cities`

### 2. Listar Tenant Cities

**GET** `/user/tenant-cities`

### 3. Atualizar Tenant City

**PATCH** `/user/tenant-cities/{id}`

### 4. Deletar Tenant City

**DELETE** `/user/tenant-cities/{id}`

> **Observação**: A implementação dos endpoints user é idêntica aos endpoints admin. A diferença está apenas nas permissões de acesso.

---

## 📊 Estrutura de Dados

### Tenant City Entity

```typescript
interface TenantCity {
  id: string;                    // UUID único
  domain: string | null;         // Domínio opcional (máx. 100 caracteres)
  createdAt: Date;              // Data de criação
  updatedAt: Date;              // Data da última atualização
}
```

### Relacionamentos no Banco de Dados

```
tenant_city (1) ──< (N) auth_user
  └─ tenant_city_id

tenant_city (1) ──< (1) seletivo_allowedcity
  └─ tenant_city_id
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Criar e Listar Tenant Cities

```typescript
// 1. Criar uma nova tenant city
const createResponse = await fetch('/admin/tenant-cities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: 'minha-cidade.com.br'
  })
});

const { id } = await createResponse.json();
console.log('Tenant City criada:', id);

// 2. Listar todas as tenant cities
const listResponse = await fetch('/admin/tenant-cities?page=1&size=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data, totalItems } = await listResponse.json();
console.log(`Total de tenant cities: ${totalItems}`);
```

### Exemplo 2: Atualizar Domain

```typescript
const tenantCityId = '550e8400-e29b-41d4-a716-446655440000';

const updateResponse = await fetch(`/admin/tenant-cities/${tenantCityId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: 'novo-dominio.com.br'
  })
});

const { message } = await updateResponse.json();
console.log(message); // "Tenant City atualizada com sucesso"
```

### Exemplo 3: Buscar Tenant City do Usuário Logado

```typescript
// Decodificar JWT para obter tenant_city_id
function decodeJWT(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

const payload = decodeJWT(token);
const userTenantCityId = payload.tenant_city_id;

// Listar tenant cities e filtrar pela do usuário
const response = await fetch('/admin/tenant-cities', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
const userTenantCity = data.find(tc => tc.id === userTenantCityId);
console.log('Tenant City do usuário:', userTenantCity);
```

---

## 🎯 Boas Práticas para Frontend

### 1. Armazenar tenant_city_id do JWT

```typescript
// Ao fazer login, extrair e armazenar o tenant_city_id
const payload = decodeJWT(accessToken);
localStorage.setItem('tenantCityId', payload.tenant_city_id);
```

### 2. Usar tenant_city_id em Requisições

```typescript
// Ao criar recursos, incluir o tenant_city_id quando necessário
const createResource = async (data: any) => {
  const tenantCityId = localStorage.getItem('tenantCityId');
  
  return fetch('/admin/resource', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...data,
      tenant_city_id: tenantCityId  // Se o endpoint exigir
    })
  });
};
```

### 3. Validação de Permissões

```typescript
// Verificar se o usuário é admin antes de permitir ações
function canManageTenantCities(userRoles: string[]): boolean {
  return userRoles.some(role => 
    ['ADMIN', 'ADMIN_MASTER'].includes(role.toUpperCase())
  );
}

if (!canManageTenantCities(user.roles)) {
  // Ocultar botões de criar/editar/deletar tenant cities
  hideAdminActions();
}
```

### 4. Tratamento de Erros de Tenant

```typescript
try {
  const response = await fetch('/admin/tenant-cities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 403) {
    // Usuário não tem permissão ou tentou acessar tenant diferente
    showError('Acesso negado: você não tem permissão para acessar esta tenant city');
  }
} catch (error) {
  console.error('Erro ao buscar tenant cities:', error);
}
```

### 5. Cache e Atualização

```typescript
// Cachear lista de tenant cities para evitar requisições desnecessárias
let tenantCitiesCache: TenantCity[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getTenantCities(forceRefresh = false): Promise<TenantCity[]> {
  const now = Date.now();
  
  if (!forceRefresh && tenantCitiesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return tenantCitiesCache;
  }
  
  const response = await fetch('/admin/tenant-cities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  tenantCitiesCache = data;
  cacheTimestamp = now;
  
  return data;
}
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| `200` | OK | Operação bem-sucedida |
| `201` | Created | Tenant city criada com sucesso |
| `400` | Bad Request | Dados inválidos no request body |
| `401` | Unauthorized | Token ausente ou inválido |
| `403` | Forbidden | Usuário não tem permissão ou tentou acessar tenant diferente |
| `404` | Not Found | Tenant city não encontrada |
| `500` | Internal Server Error | Erro interno do servidor |

### Estrutura de Erro

```typescript
// 400 Bad Request
{
  message: string[];      // Array de mensagens de validação
  error: string;          // Tipo do erro
  statusCode: number;     // Código HTTP
}

// 401, 403, 404, 500
{
  message: string;        // Mensagem de erro
  error: string;          // Tipo do erro
  statusCode: number;     // Código HTTP
}
```

### Exemplos de Respostas de Erro

#### 400 Bad Request

```json
{
  "message": [
    "domain deve ter no máximo 100 caracteres",
    "domain deve ser uma string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### 401 Unauthorized

```json
{
  "message": "Usuário não autenticado.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### 403 Forbidden

```json
{
  "message": "Acesso negado: tenant não corresponde ao do usuário.",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### 404 Not Found

```json
{
  "message": "Tenant City não encontrada",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 📝 Resumo das Rotas

### Admin Routes

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/admin/tenant-cities` | Criar tenant city | ✅ Admin |
| `GET` | `/admin/tenant-cities` | Listar tenant cities | ✅ Admin |
| `PATCH` | `/admin/tenant-cities/{id}` | Atualizar tenant city | ✅ Admin |
| `DELETE` | `/admin/tenant-cities/{id}` | Deletar tenant city | ✅ Admin |

### User Routes

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/user/tenant-cities` | Criar tenant city | ✅ User |
| `GET` | `/user/tenant-cities` | Listar tenant cities | ✅ User |
| `PATCH` | `/user/tenant-cities/{id}` | Atualizar tenant city | ✅ User |
| `DELETE` | `/user/tenant-cities/{id}` | Deletar tenant city | ✅ User |

---

## 🔗 Relacionamento com Outros Módulos

### Como Tenant Cities Afetam Outros Recursos

1. **Usuários (`auth_user`)**:
   - Cada usuário possui `tenant_city_id`
   - Usuários só veem dados da sua própria tenant city

2. **Cidades Permitidas (`seletivo_allowedcity`)**:
   - Podem estar vinculadas a uma tenant city
   - Filtram dados por tenant city

3. **Endereços, Exames, Resultados ENEM**:
   - Todos são filtrados automaticamente pelo `tenant_city_id` do usuário
   - Admins podem ver todos os dados

---

## 📚 Referências Adicionais

- **JWT Payload**: Contém `tenant_city_id` do usuário logado
- **Tenant Guard**: Valida acesso baseado em tenant city
- **Access Control Policy**: Políticas de acesso baseadas em tenant city

---

**Última atualização**: Janeiro 2026
