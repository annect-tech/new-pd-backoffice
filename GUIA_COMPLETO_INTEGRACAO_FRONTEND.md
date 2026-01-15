# 📘 Guia Completo de Integração - Frontend com API (pd-backoffice)

> **Documentação completa de todos os endpoints da API, formatos de dados (request/response) e ordem de implementação recomendada para integração com o frontend.**

---

## 📋 Índice

1. [Informações Gerais](#1-informações-gerais)
2. [Configuração Inicial](#2-configuração-inicial)
3. [Ordem de Implementação Recomendada](#3-ordem-de-implementação-recomendada)
4. [Fase 1: Autenticação](#fase-1-autenticação)
5. [Fase 2: Configuração de Tenant Cities](#fase-2-configuração-de-tenant-cities)
6. [Fase 3: Cadastro de Candidato](#fase-3-cadastro-de-candidato)
7. [Fase 4: Agendamento de Prova](#fase-4-agendamento-de-prova)
8. [Fase 5: Contrato](#fase-5-contrato)
9. [Fase 6: Módulos Complementares](#fase-6-módulos-complementares)
10. [Módulos Admin](#módulos-admin)
11. [Estruturas Comuns](#estruturas-comuns)
12. [Tratamento de Erros](#tratamento-de-erros)
13. [Boas Práticas](#boas-práticas)
14. [Troubleshooting](#troubleshooting)

---

## 1. Informações Gerais

### 🌐 URLs da API

- **Produção**: `http://186.248.135.172:31535`
- **Local**: `http://localhost:3000`
- **Swagger**: `http://186.248.135.172:31535/swagger`

### 🔑 Autenticação

Todas as requisições autenticadas devem incluir:

```
Authorization: Bearer {accessToken}
```

### 📦 Formatos

- **Content-Type**: `application/json`
- **Encoding**: UTF-8
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### 👥 Roles Disponíveis

| Role | Descrição |
|------|-----------|
| `ADMIN_MASTER` | Administrador master (acesso total) |
| `ADMIN` | Administrador padrão |
| `LEADER` | Líder de equipe |
| `AGENT_SUCCESS` | Agente de sucesso |
| `MONITOR` | Monitor |
| `STUDENT` | Estudante/Candidato |

### 🔒 Convenção de Prefixos de Rotas

- `/auth/*` - Endpoints públicos de autenticação
- `/admin/*` - Endpoints administrativos (requerem roles ADMIN ou ADMIN_MASTER)
- `/user/*` - Endpoints de usuário (requerem autenticação)
- `/health` - Health check (público)

---

## 2. Configuração Inicial

### Variáveis de Ambiente

```env
VITE_API_BASE_URL=http://186.248.135.172:31535
# ou
REACT_APP_API_BASE_URL=http://186.248.135.172:31535
```

### Cliente HTTP (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://186.248.135.172:31535',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Ordem de Implementação Recomendada

### 📝 Sequência Sugerida para Integração

```
FASE 1: Autenticação (Essencial)
  ├─ 1.1 Login
  ├─ 1.2 Refresh Token
  ├─ 1.3 Logout (local)
  └─ 1.4 Verificação de Email

FASE 2: Configuração de Tenant Cities (Admin)
  ├─ 2.1 Listar Tenant Cities
  ├─ 2.2 Criar Tenant City
  ├─ 2.3 Atualizar Tenant City
  └─ 2.4 Deletar Tenant City

FASE 3: Cadastro de Candidato (Fluxo Principal)
  ├─ 3.1 User Data (Dados Básicos do Candidato)
  ├─ 3.2 Endereço
  ├─ 3.3 Guardian (Responsável - se menor de idade)
  ├─ 3.4 Persona (Perfil do Candidato)
  ├─ 3.5 Resultado ENEM
  ├─ 3.6 Upload de Documentos do Candidato
  └─ 3.7 Mérito Acadêmico (opcional)

FASE 4: Agendamento de Prova
  ├─ 4.1 Locais de Prova
  ├─ 4.2 Datas de Prova
  ├─ 4.3 Horários de Prova
  └─ 4.4 Inscrição do Estudante na Prova

FASE 5: Contrato
  ├─ 5.1 Criar Contrato
  ├─ 5.2 Listar Contratos
  └─ 5.3 Visualizar Contrato

FASE 6: Módulos Complementares
  ├─ 6.1 FAQs
  ├─ 6.2 Upload de Arquivos
  └─ 6.3 Cidades Permitidas
```

---

## FASE 1: Autenticação

### 1.1 Login

**Endpoint**: `POST /auth/login`

**Descrição**: Autentica usuário usando credential (email, CPF ou username) e senha.

#### Request

```typescript
{
  credential: string;  // Email, CPF ou username
  password: string;
}
```

#### Response (200 OK)

```typescript
{
  accessToken: string;   // JWT token
  refreshToken: string;  // UUID v4 token
}
```

#### Payload do JWT

O `accessToken` é um JWT que contém:

```typescript
{
  sub: number;            // user_id
  roles: string[];        // Ex: ['ADMIN', 'STUDENT']
  tenant_city_id: string; // UUID da tenant city
  iat: number;           // Issued at
  exp: number;           // Expiration
}
```

#### Exemplo de Uso

```typescript
const login = async (credential: string, password: string) => {
  const response = await api.post('/auth/login', {
    credential,
    password,
  });
  
  const { accessToken, refreshToken } = response.data;
  
  // Armazenar tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Decodificar JWT para obter informações do usuário
  const payload = decodeJWT(accessToken);
  localStorage.setItem('userId', payload.sub.toString());
  localStorage.setItem('userRoles', JSON.stringify(payload.roles));
  localStorage.setItem('tenantCityId', payload.tenant_city_id);
  
  return { accessToken, refreshToken };
};
```

#### Possíveis Erros

| Status | Mensagem | Significado |
|--------|----------|-------------|
| 400 | `credential é obrigatório` | Campo não enviado |
| 400 | `password é obrigatório` | Campo não enviado |
| 400 | `Credenciais inválidas.` | Usuário não encontrado ou senha incorreta |
| 403 | `A sua conta foi suspensa...` | Conta inativa |
| 403 | `Acesso negado.` | Usuário sem roles |

---

### 1.2 Refresh Token

**Endpoint**: `POST /auth/refresh-token`

**Descrição**: Renova o access token usando o refresh token.

#### Request

```typescript
{
  refreshToken: string;  // Refresh token obtido no login
}
```

#### Response (200 OK)

```typescript
{
  accessToken: string;   // Novo JWT token
  refreshToken: string;  // Novo refresh token
}
```

⚠️ **IMPORTANTE**: Após usar um refresh token, ele é invalidado e um novo é gerado. Sempre atualize ambos os tokens no storage.

#### Exemplo de Uso

```typescript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await api.post('/auth/refresh-token', {
    refreshToken,
  });
  
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken);
  
  return { accessToken, refreshToken: newRefreshToken };
};
```

#### Possíveis Erros

| Status | Mensagem | Significado |
|--------|----------|-------------|
| 400 | `refreshToken é obrigatório` | Campo não enviado |
| 400 | `Refresh token inválido.` | Token não existe |
| 400 | `Refresh token expirado.` | Token expirou |
| 404 | `Usuário não encontrado.` | Usuário não existe mais |

---

### 1.3 Logout

**Endpoint**: ❌ **NÃO EXISTE**

**Descrição**: O logout é feito apenas no frontend, removendo tokens do storage.

#### Exemplo de Uso

```typescript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('tenantCityId');
  
  // Redirecionar para login
  window.location.href = '/login';
};
```

---

### 1.4 Verificação de Email

#### 1.4.1 Enviar Código

**Endpoint**: `POST /email-verification/send-code`

**Descrição**: Envia código de verificação para o email do usuário.

#### Request

```typescript
{
  email: string;  // Email do usuário
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // "Código enviado com sucesso"
}
```

---

#### 1.4.2 Verificar Código

**Endpoint**: `PATCH /email-verification/verify`

**Descrição**: Verifica o código enviado por email.

#### Request

```typescript
{
  email: string;  // Email do usuário
  code: string;   // Código de 6 dígitos
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // "Email verificado com sucesso"
}
```

---

#### 1.4.3 Reenviar Código

**Endpoint**: `POST /email-verification/resend`

**Descrição**: Reenvia código de verificação.

#### Request

```typescript
{
  email: string;  // Email do usuário
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // "Código reenviado com sucesso"
}
```

---

## FASE 2: Configuração de Tenant Cities

> **Nota**: Endpoints de Tenant Cities são essenciais para sistemas multi-tenant. Geralmente são usados apenas por administradores.

### 2.1 Listar Tenant Cities

**Endpoint**: `GET /admin/tenant-cities`

**Roles**: ADMIN, ADMIN_MASTER

**Descrição**: Lista todas as tenant cities com paginação.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página (padrão: 1) |
| `size` | number | Não | Itens por página (padrão: 10) |
| `search` | string | Não | Busca no campo domain |

#### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;              // UUID
    domain: string | null;   // Domínio (ex: "cidade.com.br")
    createdAt: string;       // ISO 8601
    updatedAt: string;       // ISO 8601
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

#### Exemplo de Uso

```typescript
const listTenantCities = async (page = 1, size = 10, search = '') => {
  const response = await api.get('/admin/tenant-cities', {
    params: { page, size, search },
  });
  
  return response.data;
};
```

---

### 2.2 Criar Tenant City

**Endpoint**: `POST /admin/tenant-cities`

**Roles**: ADMIN, ADMIN_MASTER

#### Request

```typescript
{
  domain?: string;  // Opcional, máximo 100 caracteres
}
```

#### Response (201 Created)

```typescript
{
  id: string;      // UUID da tenant city criada
  message: string; // "Tenant City criada com sucesso"
}
```

#### Exemplo de Uso

```typescript
const createTenantCity = async (domain?: string) => {
  const response = await api.post('/admin/tenant-cities', {
    domain,
  });
  
  return response.data;
};
```

---

### 2.3 Atualizar Tenant City

**Endpoint**: `PATCH /admin/tenant-cities/:id`

**Roles**: ADMIN, ADMIN_MASTER

#### Request

```typescript
{
  domain?: string;  // Opcional, máximo 100 caracteres
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // "Tenant City atualizada com sucesso"
}
```

---

### 2.4 Deletar Tenant City

**Endpoint**: `DELETE /admin/tenant-cities/:id`

**Roles**: ADMIN, ADMIN_MASTER

⚠️ **ATENÇÃO**: Operação irreversível!

#### Response (200 OK)

```typescript
{
  message: string;  // "Tenant City removida com sucesso"
}
```

---

## FASE 3: Cadastro de Candidato

### 3.1 User Data (Dados Básicos do Candidato)

#### 3.1.1 Criar User Data

**Endpoint**: `POST /user/user-data`

**Roles**: Usuário autenticado

**Descrição**: Cria os dados básicos do candidato.

##### Request

```typescript
{
  cpf: string;                 // CPF do candidato
  birth_date: string;          // Data de nascimento (ISO 8601)
  celphone: string;            // Celular
  user_id: number;             // ID do usuário (extrair do JWT)
  social_name?: string;        // Nome social (opcional)
  guardian_email?: string;     // Email do responsável (opcional)
  allowed_city_id?: number;    // ID da cidade permitida (opcional)
  old_enrolled_id?: string;    // ID de matrícula antiga (opcional)
  old_form_id?: string;        // ID de formulário antigo (opcional)
}
```

##### Response (201 Created)

```typescript
{
  id: number;      // ID do user data criado
  message: string; // "Dados do usuário criados com sucesso"
}
```

##### Exemplo de Uso

```typescript
const createUserData = async (data: CreateUserDataInput) => {
  // Obter user_id do JWT
  const token = localStorage.getItem('accessToken');
  const payload = decodeJWT(token);
  
  const response = await api.post('/user/user-data', {
    ...data,
    user_id: payload.sub,
  });
  
  return response.data;
};
```

---

#### 3.1.2 Listar User Data

**Endpoint**: `GET /user/user-data`

**Descrição**: Lista dados de usuários com paginação.

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página (padrão: 1) |
| `size` | number | Não | Itens por página |
| `search` | string | Não | Termo de busca |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: number;
    cpf: string;
    birth_date: string;
    celphone: string;
    user_id: number;
    social_name: string | null;
    guardian_email: string | null;
    allowed_city_id: number | null;
    old_enrolled_id: string | null;
    old_form_id: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.1.3 Buscar User Data por ID

**Endpoint**: `GET /user/user-data/:id`

##### Response (200 OK)

```typescript
{
  id: number;
  cpf: string;
  birth_date: string;
  celphone: string;
  user_id: number;
  social_name: string | null;
  guardian_email: string | null;
  allowed_city_id: number | null;
  old_enrolled_id: string | null;
  old_form_id: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.1.4 Atualizar User Data

**Endpoint**: `PATCH /user/user-data/:id`

##### Request

```typescript
{
  cpf?: string;
  birth_date?: string;
  celphone?: string;
  social_name?: string;
  guardian_email?: string;
  allowed_city_id?: number;
  old_enrolled_id?: string;
  old_form_id?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Dados atualizados com sucesso"
}
```

---

#### 3.1.5 Deletar User Data

**Endpoint**: `DELETE /user/user-data/:id`

##### Response (200 OK)

```typescript
{
  message: string;  // "Dados removidos com sucesso"
}
```

---

### 3.2 Endereço

#### 3.2.1 Criar Endereço

**Endpoint**: `POST /user/addresses`

**Descrição**: Cria endereço do candidato.

##### Request

```typescript
{
  user_id: number;     // ID do usuário
  cep: string;         // CEP (8-9 caracteres)
  logradouro: string;  // Rua/Avenida
  numero: string;      // Número
  complemento?: string;// Complemento (opcional)
  bairro: string;      // Bairro
  cidade: string;      // Cidade
  uf: string;          // UF (2 caracteres)
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID do endereço criado
  message: string; // "Endereço criado com sucesso"
}
```

##### Exemplo de Uso

```typescript
const createAddress = async (address: CreateAddressInput) => {
  const token = localStorage.getItem('accessToken');
  const payload = decodeJWT(token);
  
  const response = await api.post('/user/addresses', {
    ...address,
    user_id: payload.sub,
  });
  
  return response.data;
};
```

---

#### 3.2.2 Listar Endereços

**Endpoint**: `GET /user/addresses`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_id: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.2.3 Buscar Endereço por ID

**Endpoint**: `GET /user/addresses/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  user_id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.2.4 Atualizar Endereço

**Endpoint**: `PATCH /user/addresses/:id`

##### Request

```typescript
{
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Endereço atualizado com sucesso"
}
```

---

#### 3.2.5 Deletar Endereço

**Endpoint**: `DELETE /user/addresses/:id`

##### Response (200 OK)

```typescript
{
  message: string;  // "Endereço removido com sucesso"
}
```

---

### 3.3 Guardian (Responsável)

> **Nota**: Obrigatório para candidatos menores de idade.

#### 3.3.1 Criar Guardian

**Endpoint**: `POST /admin/guardians`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  user_id: number;        // ID do usuário
  relationship: string;   // Relação (ex: "Pai", "Mãe", "Tutor")
  name: string;           // Nome completo
  cpf: string;            // CPF (11-14 caracteres)
  nationality: string;    // Nacionalidade
  cellphone: string;      // Celular (1-20 caracteres)
  email: string;          // Email
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID do guardian criado
  message: string; // "Responsável criado com sucesso"
}
```

---

#### 3.3.2 Listar Guardians

**Endpoint**: `GET /admin/guardians`

**Roles**: ADMIN, ADMIN_MASTER

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_id: number;
    relationship: string;
    name: string;
    cpf: string;
    nationality: string;
    cellphone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.3.3 Atualizar Guardian

**Endpoint**: `PATCH /admin/guardians/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  relationship?: string;
  name?: string;
  cpf?: string;
  nationality?: string;
  cellphone?: string;
  email?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Responsável atualizado com sucesso"
}
```

---

#### 3.3.4 Deletar Guardian

**Endpoint**: `DELETE /admin/guardians/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Responsável removido com sucesso"
}
```

---

### 3.4 Persona (Perfil do Candidato)

#### 3.4.1 Criar Persona

**Endpoint**: `POST /user/persona`

**Descrição**: Cria perfil comportamental e educacional do candidato.

##### Request

```typescript
{
  professional_status: string;         // "Nenhum" | "Trabalho" | "Estudo" | "Trabalho e estudo"
  experience: string;                  // "Nenhuma" | "Básico" | "Intermediário" | "Avançado"
  experience_duration: string;         // "Nenhuma" | "<1 ano" | "1-2 anos" | "3-4 anos" | ">5 anos"
  programming_knowledge_level: string; // "Nenhum" | "Básico" | "Intermediário" | "Avançado"
  motivation_level: string;            // "Pouco" | "Curioso" | "Motivado" | "Muito"
  project_priority: string;            // "Baixa" | "Média" | "Alta"
  weekly_available_hours: string;      // "1-2h" | "3-4h" | "5-8h" | "8-12h" | ">12h"
  study_commitment: string;            // "Algumas vezes" | "Fins de semana" | "Todos os dias"
  frustration_handling: string;        // "Desânimo" | "Resolvo sozinho" | "Peço ajuda"
  auth_user_id: number;                // ID do usuário (extrair do JWT)
}
```

##### Valores Aceitos

```typescript
const PROFESSIONAL_STATUS = ["Nenhum", "Trabalho", "Estudo", "Trabalho e estudo"];
const EXPERIENCE_LEVELS = ["Nenhuma", "Básico", "Intermediário", "Avançado"];
const DURATIONS = ["Nenhuma", "<1 ano", "1-2 anos", "3-4 anos", ">5 anos"];
const PROG_LEVELS = ["Nenhum", "Básico", "Intermediário", "Avançado"];
const MOTIVATION = ["Pouco", "Curioso", "Motivado", "Muito"];
const PRIORITIES = ["Baixa", "Média", "Alta"];
const WEEKLY_HOURS = ["1-2h", "3-4h", "5-8h", "8-12h", ">12h"];
const COMMITMENTS = ["Algumas vezes", "Fins de semana", "Todos os dias"];
const FRUSTRATION = ["Desânimo", "Resolvo sozinho", "Peço ajuda"];
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID da persona criada
  message: string; // "Persona criada com sucesso"
}
```

##### Exemplo de Uso

```typescript
const createPersona = async (persona: CreatePersonaInput) => {
  const token = localStorage.getItem('accessToken');
  const payload = decodeJWT(token);
  
  const response = await api.post('/user/persona', {
    ...persona,
    auth_user_id: payload.sub,
  });
  
  return response.data;
};
```

---

#### 3.4.2 Listar Personas

**Endpoint**: `GET /user/persona`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    professional_status: string;
    experience: string;
    experience_duration: string;
    programming_knowledge_level: string;
    motivation_level: string;
    project_priority: string;
    weekly_available_hours: string;
    study_commitment: string;
    frustration_handling: string;
    auth_user_id: number;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.4.3 Buscar Persona por ID

**Endpoint**: `GET /user/persona/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  professional_status: string;
  experience: string;
  experience_duration: string;
  programming_knowledge_level: string;
  motivation_level: string;
  project_priority: string;
  weekly_available_hours: string;
  study_commitment: string;
  frustration_handling: string;
  auth_user_id: number;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.4.4 Atualizar Persona

**Endpoint**: `PUT /user/persona/:id`

##### Request

```typescript
{
  professional_status?: string;
  experience?: string;
  experience_duration?: string;
  programming_knowledge_level?: string;
  motivation_level?: string;
  project_priority?: string;
  weekly_available_hours?: string;
  study_commitment?: string;
  frustration_handling?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Persona atualizada com sucesso"
}
```

---

#### 3.4.5 Deletar Persona

**Endpoint**: `DELETE /user/persona/:id`

##### Response (200 OK)

```typescript
{
  message: string;  // "Persona removida com sucesso"
}
```

---

### 3.5 Resultado ENEM

#### 3.5.1 Criar Resultado ENEM

**Endpoint**: `POST /user/enem-results`

**Descrição**: Cria registro de resultado ENEM do candidato.

##### Request

```typescript
{
  user_id: number;  // ID do usuário
}
```

⚠️ **Nota**: As notas são inicialmente criadas com valor 0 e devem ser atualizadas posteriormente.

##### Response (201 Created)

```typescript
{
  id: string;                  // ID do resultado criado
  message: string;             // "Resultado ENEM criado com sucesso"
  languages_score: number;     // Nota de Linguagens (inicial: 0)
  math_score: number;          // Nota de Matemática (inicial: 0)
  natural_sciences_score: number;  // Nota de Ciências da Natureza (inicial: 0)
  human_sciences_score: number;    // Nota de Ciências Humanas (inicial: 0)
  essay_score: number;         // Nota da Redação (inicial: 0)
}
```

---

#### 3.5.2 Listar Resultados ENEM

**Endpoint**: `GET /user/enem-results`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_id: number;
    languages_score: number;
    math_score: number;
    natural_sciences_score: number;
    human_sciences_score: number;
    essay_score: number;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.5.3 Buscar Resultado ENEM por ID

**Endpoint**: `GET /user/enem-results/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  user_id: number;
  languages_score: number;
  math_score: number;
  natural_sciences_score: number;
  human_sciences_score: number;
  essay_score: number;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.5.4 Atualizar Resultado ENEM

**Endpoint**: `PATCH /user/enem-results/:id`

##### Request

```typescript
{
  languages_score?: number;        // Nota de Linguagens
  math_score?: number;             // Nota de Matemática
  natural_sciences_score?: number; // Nota de Ciências da Natureza
  human_sciences_score?: number;   // Nota de Ciências Humanas
  essay_score?: number;            // Nota da Redação
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Resultado ENEM atualizado com sucesso"
}
```

##### Exemplo de Uso

```typescript
const updateEnemResult = async (id: string, scores: EnemScores) => {
  const response = await api.patch(`/user/enem-results/${id}`, scores);
  return response.data;
};

// Uso
await updateEnemResult('abc-123', {
  languages_score: 750.5,
  math_score: 680.0,
  natural_sciences_score: 720.3,
  human_sciences_score: 690.8,
  essay_score: 900.0,
});
```

---

#### 3.5.5 Deletar Resultado ENEM

**Endpoint**: `DELETE /user/enem-results/:id`

##### Response (200 OK)

```typescript
{
  message: string;  // "Resultado ENEM removido com sucesso"
}
```

---

### 3.6 Upload de Documentos do Candidato

#### 3.6.1 Upload de Documento

**Endpoint**: `POST /user/candidate-documents/upload`

**Content-Type**: `multipart/form-data`

**Descrição**: Faz upload de documentos do candidato.

##### Request (FormData)

```typescript
{
  file: File;              // Arquivo (PDF, JPG, PNG)
  user_data_id: string;    // ID do user data (como string)
  type: DocTypeEnum;       // Tipo do documento
}
```

##### Tipos de Documento

```typescript
enum DocTypeEnum {
  ID_DOC = 'id_doc',                      // Documento de identidade
  ADDRESS_DOC = 'address_doc',            // Comprovante de endereço
  SCHOOL_HISTORY_DOC = 'school_history_doc', // Histórico escolar
  CONTRACT_DOC = 'contract_doc',          // Contrato assinado
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Documento enviado com sucesso"
  url: string;      // URL do arquivo no storage
}
```

##### Exemplo de Uso

```typescript
const uploadCandidateDocument = async (
  file: File,
  userDataId: string,
  type: DocTypeEnum
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_data_id', userDataId);
  formData.append('type', type);
  
  const response = await api.post('/user/candidate-documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Uso
const file = document.querySelector('input[type="file"]').files[0];
await uploadCandidateDocument(file, '123', 'id_doc');
```

---

#### 3.6.2 Listar Documentos do Candidato

**Endpoint**: `GET /user/candidate-documents`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_data_id: number;
    id_doc: string | null;               // URL do documento de identidade
    id_doc_status: string | null;        // Status (ex: "Pendente", "Aprovado", "Recusado")
    id_doc_refuse_reason: string | null; // Motivo de recusa
    address_doc: string | null;
    address_doc_status: string | null;
    address_doc_refuse_reason: string | null;
    school_history_doc: string | null;
    school_history_doc_status: string | null;
    school_history_doc_refuse_reason: string | null;
    contract_doc: string | null;
    contract_doc_status: string | null;
    contract_doc_refuse_reason: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 3.6.3 Buscar Documentos por User Data ID

**Endpoint**: `GET /user/candidate-documents/:userDataId`

##### Response (200 OK)

```typescript
{
  id: string;
  user_data_id: number;
  id_doc: string | null;
  id_doc_status: string | null;
  id_doc_refuse_reason: string | null;
  address_doc: string | null;
  address_doc_status: string | null;
  address_doc_refuse_reason: string | null;
  school_history_doc: string | null;
  school_history_doc_status: string | null;
  school_history_doc_refuse_reason: string | null;
  contract_doc: string | null;
  contract_doc_status: string | null;
  contract_doc_refuse_reason: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.6.4 Atualizar Status de Documento (Admin)

**Endpoint**: `PATCH /admin/candidate-documents/:userDataId`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  id_doc_status?: string;              // Status do documento de identidade
  id_doc_refuse_reason?: string;       // Motivo de recusa
  address_doc_status?: string;
  address_doc_refuse_reason?: string;
  school_history_doc_status?: string;
  school_history_doc_refuse_reason?: string;
  contract_doc_status?: string;
  contract_doc_refuse_reason?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Documentos atualizados com sucesso"
}
```

---

#### 3.6.5 Deletar Documentos

**Endpoint**: `DELETE /user/candidate-documents/:userDataId`

##### Response (200 OK)

```typescript
{
  message: string;  // "Documentos removidos com sucesso"
}
```

---

### 3.7 Mérito Acadêmico (Opcional)

#### 3.7.1 Criar Declaração de Mérito Acadêmico

**Endpoint**: `POST /user/academic-merit-documents`

**Descrição**: Cria dados para geração de declaração de mérito acadêmico.

##### Request

```typescript
{
  auth_user_data_id: number;  // ID do user data
  student_name: string;        // Nome completo do estudante
  average_grade: string;       // Nota média (ex: "8.5")
  director_name: string;       // Nome do diretor
  school_name: string;         // Nome da escola
  school_zip_code: string;     // CEP da escola
  school_street: string;       // Rua da escola
  school_neighborhood: string; // Bairro da escola
  school_number: string;       // Número da escola
  school_complement?: string;  // Complemento (opcional)
  city: string;                // Cidade
  issue_date: string;          // Data de emissão (ISO 8601)
}
```

##### Response (201 Created)

```typescript
{
  message: string;  // "Declaração de mérito criada com sucesso"
}
```

---

#### 3.7.2 Listar Declarações de Mérito

**Endpoint**: `GET /user/academic-merit-documents/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  auth_user_data_id: number;
  student_name: string;
  average_grade: string;
  director_name: string;
  school_name: string;
  school_zip_code: string;
  school_street: string;
  school_neighborhood: string;
  school_number: string;
  school_complement: string | null;
  city: string;
  issue_date: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 3.7.3 Atualizar Declaração de Mérito

**Endpoint**: `PUT /user/academic-merit-documents/:id`

##### Request

```typescript
{
  student_name?: string;
  average_grade?: string;
  director_name?: string;
  school_name?: string;
  school_zip_code?: string;
  school_street?: string;
  school_neighborhood?: string;
  school_number?: string;
  school_complement?: string;
  city?: string;
  issue_date?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Declaração atualizada com sucesso"
}
```

---

#### 3.7.4 Upload de Documento de Mérito

**Endpoint**: `POST /user/academic-merit-documents/upload`

**Content-Type**: `multipart/form-data`

##### Request (FormData)

```typescript
{
  file: File;                 // Arquivo (PDF, JPG, PNG)
  academic_merit_id: string;  // ID da declaração de mérito
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Documento de mérito enviado com sucesso"
  url: string;      // URL do arquivo
}
```

---

## FASE 4: Agendamento de Prova

### 4.1 Locais de Prova

#### 4.1.1 Criar Local de Prova

**Endpoint**: `POST /admin/exam`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  name: string;            // Nome do local (máx. 255 caracteres)
  full_address: string;    // Endereço completo (máx. 1000 caracteres)
  allowed_city_id: number; // ID da cidade permitida
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID do local criado
  message: string; // "Local de prova criado com sucesso"
}
```

---

#### 4.1.2 Listar Locais de Prova

**Endpoint**: `GET /user/exam`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    name: string;
    full_address: string;
    allowed_city_id: number;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 4.1.3 Buscar Local de Prova por ID

**Endpoint**: `GET /user/exam/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  name: string;
  full_address: string;
  allowed_city_id: number;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 4.1.4 Atualizar Local de Prova

**Endpoint**: `PATCH /admin/exam/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  name?: string;
  full_address?: string;
  allowed_city_id?: number;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Local atualizado com sucesso"
}
```

---

#### 4.1.5 Deletar Local de Prova

**Endpoint**: `DELETE /admin/exam/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Local removido com sucesso"
}
```

---

### 4.2 Datas de Prova

#### 4.2.1 Criar Datas de Prova (com Horários)

**Endpoint**: `POST /admin/exam/dates`

**Roles**: ADMIN, ADMIN_MASTER

**Descrição**: Cria múltiplas datas de prova com seus respectivos horários de uma vez.

##### Request

```typescript
{
  local_id: number;  // ID do local de prova
  schedules: Array<{
    date: string;      // Data da prova (formato: "DD/MM/YYYY")
    hours: string[];   // Array de horários (formato: "HH:MM")
  }>;
}
```

##### Validações

- **date**: Formato "DD/MM/YYYY" (ex: "25/01/2026")
- **hours**: Array de strings no formato "HH:MM" (ex: ["08:00", "14:00"])

##### Response (201 Created)

```typescript
{
  message: string;  // "Datas e horários criados com sucesso"
}
```

##### Exemplo de Uso

```typescript
const createExamSchedule = async (localId: number) => {
  const response = await api.post('/admin/exam/dates', {
    local_id: localId,
    schedules: [
      {
        date: "25/01/2026",
        hours: ["08:00", "14:00", "18:00"]
      },
      {
        date: "26/01/2026",
        hours: ["09:00", "15:00"]
      }
    ]
  });
  
  return response.data;
};
```

---

#### 4.2.2 Listar Datas de Prova por Local

**Endpoint**: `GET /user/exam/dates/:localId`

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    local_id: number;
    date: string;       // Data da prova
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

#### 4.2.3 Buscar Data de Prova por ID

**Endpoint**: `GET /user/exam/date-by-id/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  local_id: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 4.2.4 Atualizar Data de Prova

**Endpoint**: `PATCH /admin/exam/dates/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  date?: string;  // Nova data (formato: "DD/MM/YYYY")
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Data atualizada com sucesso"
}
```

---

#### 4.2.5 Deletar Data de Prova

**Endpoint**: `DELETE /admin/exam/dates/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Data removida com sucesso"
}
```

---

### 4.3 Horários de Prova

#### 4.3.1 Criar Horário de Prova

**Endpoint**: `POST /admin/exam/hours`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  exam_date_id: number;  // ID da data de prova
  hour: string;          // Horário (formato: "HH:MM")
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID do horário criado
  message: string; // "Horário criado com sucesso"
}
```

---

#### 4.3.2 Listar Horários por Data de Prova

**Endpoint**: `GET /user/exam/hours/:dateId`

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    exam_date_id: number;
    hour: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

#### 4.3.3 Buscar Horário por ID

**Endpoint**: `GET /user/exam/hour-by-id/:id`

##### Response (200 OK)

```typescript
{
  id: string;
  exam_date_id: number;
  hour: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 4.3.4 Atualizar Horário

**Endpoint**: `PATCH /admin/exam/hours/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  hour?: string;  // Novo horário (formato: "HH:MM")
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Horário atualizado com sucesso"
}
```

---

#### 4.3.5 Deletar Horário

**Endpoint**: `DELETE /admin/exam/hours/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Horário removido com sucesso"
}
```

---

### 4.4 Inscrição do Estudante na Prova

#### 4.4.1 Criar Inscrição

**Endpoint**: `POST /user/student-exams`

**Descrição**: Inscreve o candidato em uma prova.

##### Request

```typescript
{
  user_data_id: number;          // ID do user data
  status?: string;               // Status da inscrição (opcional)
  exam_scheduled_hour_id?: number; // ID do horário escolhido (opcional)
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID da inscrição criada
  message: string; // "Inscrição criada com sucesso"
}
```

---

#### 4.4.2 Listar Inscrições

**Endpoint**: `GET /user/student-exams`

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_data_id: number;
    status: string | null;
    exam_scheduled_hour_id: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 4.4.3 Atualizar Inscrição

**Endpoint**: `PATCH /user/student-exams/:id`

##### Request

```typescript
{
  status?: string;
  exam_scheduled_hour_id?: number;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Inscrição atualizada com sucesso"
}
```

---

#### 4.4.4 Deletar Inscrição

**Endpoint**: `DELETE /user/student-exams/:id`

##### Response (200 OK)

```typescript
{
  message: string;  // "Inscrição removida com sucesso"
}
```

---

#### 4.4.5 Listar Estudantes por Horário (Admin)

**Endpoint**: `GET /admin/student-exams/schedule/:localId/:dateId`

**Roles**: ADMIN, ADMIN_MASTER

**Descrição**: Lista todos os estudantes inscritos em um determinado local e data.

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_data_id: number;
    status: string;
    exam_scheduled_hour_id: number;
    hour: string;           // Horário da prova
    student_name: string;   // Nome do estudante
    student_email: string;  // Email do estudante
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

## FASE 5: Contrato

### 5.1 Criar Contrato

**Endpoint**: `POST /user/contract`

**Descrição**: Cria um contrato para o candidato. O sistema irá gerar automaticamente um PDF do contrato.

#### Request

```typescript
{
  user_data_id: number;  // ID do user data
}
```

#### Response (201 Created)

```typescript
{
  message: string;  // "Contrato criado com sucesso"
}
```

---

### 5.2 Listar Contratos

**Endpoint**: `GET /user/contract`

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |

#### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    user_data_id: number;
    contract_url: string | null;  // URL do PDF do contrato
    status: string;                // Status do contrato
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

### 5.3 Buscar Contrato por ID

**Endpoint**: `GET /user/contract/:id`

#### Response (200 OK)

```typescript
{
  id: string;
  user_data_id: number;
  contract_url: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 5.4 Atualizar Contrato

**Endpoint**: `PATCH /user/contract/:id`

#### Request

```typescript
{
  status?: string;  // Novo status do contrato
}
```

#### Response (200 OK)

```typescript
{
  message: string;  // "Contrato atualizado com sucesso"
}
```

---

### 5.5 Deletar Contrato

**Endpoint**: `DELETE /user/contract/:id`

#### Response (200 OK)

```typescript
{
  message: string;  // "Contrato removido com sucesso"
}
```

---

## FASE 6: Módulos Complementares

### 6.1 FAQs (Perguntas Frequentes)

#### 6.1.1 Listar FAQs (User)

**Endpoint**: `GET /user/faqs`

**Descrição**: Lista todas as FAQs disponíveis.

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: string;
    question: string;  // Pergunta
    answer: string;    // Resposta
    order: number;     // Ordem de exibição
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

#### 6.1.2 Criar FAQ (Admin)

**Endpoint**: `POST /admin/faqs`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  question: string;  // Pergunta
  answer: string;    // Resposta
  order?: number;    // Ordem de exibição (opcional)
}
```

##### Response (201 Created)

```typescript
{
  id: string;      // ID da FAQ criada
  message: string; // "FAQ criada com sucesso"
}
```

---

#### 6.1.3 Atualizar FAQ (Admin)

**Endpoint**: `PUT /admin/faqs/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  question?: string;
  answer?: string;
  order?: number;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "FAQ atualizada com sucesso"
}
```

---

#### 6.1.4 Deletar FAQ (Admin)

**Endpoint**: `DELETE /admin/faqs/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "FAQ removida com sucesso"
}
```

---

### 6.2 Upload de Arquivos

#### 6.2.1 Upload de Arquivo Único

**Endpoint**: `POST /upload-file/single`

**Content-Type**: `multipart/form-data`

**Descrição**: Faz upload de um único arquivo para o storage (S3).

##### Request (FormData)

```typescript
{
  file: File;  // Arquivo a ser enviado
}
```

##### Response (200 OK)

```typescript
{
  url: string;     // URL do arquivo no storage
  message: string; // "Arquivo enviado com sucesso"
}
```

##### Exemplo de Uso

```typescript
const uploadSingleFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload-file/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};
```

---

#### 6.2.2 Upload de Múltiplos Arquivos

**Endpoint**: `POST /upload-file/array`

**Content-Type**: `multipart/form-data`

**Descrição**: Faz upload de múltiplos arquivos de uma vez.

##### Request (FormData)

```typescript
{
  files: File[];  // Array de arquivos
}
```

##### Response (200 OK)

```typescript
{
  urls: string[];  // Array de URLs dos arquivos
  message: string; // "Arquivos enviados com sucesso"
}
```

##### Exemplo de Uso

```typescript
const uploadMultipleFiles = async (files: FileList) => {
  const formData = new FormData();
  
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });
  
  const response = await api.post('/upload-file/array', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.urls;
};
```

---

### 6.3 Cidades Permitidas

#### 6.3.1 Listar Cidades Permitidas

**Endpoint**: `GET /admin/allowed-cities`

**Roles**: ADMIN, ADMIN_MASTER

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |
| `search` | string | Não | Busca por nome |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: number;
    name: string;              // Nome da cidade
    state: string;             // Estado (UF)
    tenant_city_id: string;    // ID da tenant city
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### 6.3.2 Criar Cidade Permitida

**Endpoint**: `POST /admin/allowed-cities`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  name: string;              // Nome da cidade
  state: string;             // Estado (UF)
  tenant_city_id: string;    // ID da tenant city
}
```

##### Response (201 Created)

```typescript
{
  id: number;      // ID da cidade criada
  message: string; // "Cidade permitida criada com sucesso"
}
```

---

#### 6.3.3 Buscar Cidade Permitida por ID

**Endpoint**: `GET /admin/allowed-cities/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  id: number;
  name: string;
  state: string;
  tenant_city_id: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 6.3.4 Atualizar Cidade Permitida

**Endpoint**: `PATCH /admin/allowed-cities/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  name?: string;
  state?: string;
  tenant_city_id?: string;
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Cidade permitida atualizada com sucesso"
}
```

---

#### 6.3.5 Deletar Cidade Permitida

**Endpoint**: `DELETE /admin/allowed-cities/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Cidade permitida removida com sucesso"
}
```

---

## Módulos Admin

### Gestão de Usuários

#### Listar Usuários

**Endpoint**: `GET /admin/users`

**Roles**: ADMIN, ADMIN_MASTER

##### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página |
| `size` | number | Não | Itens por página |
| `search` | string | Não | Busca por email ou username |

##### Response (200 OK)

```typescript
{
  data: Array<{
    id: number;
    username: string;
    email: string;
    cpf: string;
    is_active: boolean;
    is_verified: boolean;
    tenant_city_id: string;
    roles: string[];           // Array de roles
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

#### Criar Usuário

**Endpoint**: `POST /admin/users`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  username: string;
  email: string;
  cpf: string;
  password: string;
  tenant_city_id: string;
  roles: string[];           // Array de roles (ex: ["STUDENT"])
}
```

##### Response (201 Created)

```typescript
{
  id: number;      // ID do usuário criado
  message: string; // "Usuário criado com sucesso"
}
```

---

#### Ativar/Desativar Usuário

**Endpoint**: `PUT /admin/users/active/:email`

**Roles**: ADMIN, ADMIN_MASTER

##### Request

```typescript
{
  is_active: boolean;  // true para ativar, false para desativar
}
```

##### Response (200 OK)

```typescript
{
  message: string;  // "Usuário ativado/desativado com sucesso"
}
```

---

#### Deletar Usuário

**Endpoint**: `DELETE /admin/users/:id`

**Roles**: ADMIN, ADMIN_MASTER

##### Response (200 OK)

```typescript
{
  message: string;  // "Usuário removido com sucesso"
}
```

---

## Estruturas Comuns

### Paginação

Todos os endpoints de listagem aceitam os seguintes query parameters:

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | number | Número da página | 1 |
| `size` | number | Itens por página | 10 |
| `search` | string | Termo de busca | - |

#### Estrutura de Resposta Paginada

```typescript
{
  data: T[];             // Array de itens
  currentPage: number;   // Página atual
  itemsPerPage: number;  // Itens por página
  totalItems: number;    // Total de itens
  totalPages: number;    // Total de páginas
}
```

---

### Headers Comuns

#### Requisições Autenticadas

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Requisições com Upload (Multipart)

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

---

### Formato de Datas

Todas as datas devem seguir o formato ISO 8601:

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

**Exemplos:**
- `2026-01-15T14:30:00.000Z`
- `2026-12-31T23:59:59.999Z`

Para datas específicas (sem hora):
```
YYYY-MM-DD
```

**Exemplo:**
- `2026-01-15`

---

## Tratamento de Erros

### Estrutura de Erro Padrão

```typescript
{
  message: string | string[];  // Mensagem(ns) de erro
  error: string;               // Tipo do erro
  statusCode: number;          // Código HTTP
}
```

### Códigos de Status Comuns

| Status | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Operação bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Erro de validação nos dados |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Usuário sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

### Exemplos de Respostas de Erro

#### 400 - Erro de Validação

```json
{
  "message": [
    "credential é obrigatório",
    "password deve ter no mínimo 6 caracteres"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### 401 - Não Autenticado

```json
{
  "message": "Token inválido ou expirado",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### 403 - Sem Permissão

```json
{
  "message": "Você não tem permissão para acessar este recurso",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### 404 - Não Encontrado

```json
{
  "message": "Usuário não encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Boas Práticas

### 1. Armazenamento de Tokens

```typescript
// Ao fazer login
const { accessToken, refreshToken } = await login(credential, password);
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Extrair informações do JWT
const payload = decodeJWT(accessToken);
localStorage.setItem('userId', payload.sub.toString());
localStorage.setItem('userRoles', JSON.stringify(payload.roles));
localStorage.setItem('tenantCityId', payload.tenant_city_id);
```

---

### 2. Renovação Automática de Token

Já implementado no interceptor do axios (ver seção [Configuração Inicial](#2-configuração-inicial)).

---

### 3. Verificação de Permissões

```typescript
const hasRole = (requiredRole: string): boolean => {
  const rolesStr = localStorage.getItem('userRoles');
  if (!rolesStr) return false;
  
  const roles: string[] = JSON.parse(rolesStr);
  return roles.includes(requiredRole);
};

const isAdmin = (): boolean => {
  return hasRole('ADMIN') || hasRole('ADMIN_MASTER');
};

// Uso
if (isAdmin()) {
  // Mostrar funcionalidades de admin
}
```

---

### 4. Tratamento de Erros Global

```typescript
const handleApiError = (error: any) => {
  if (!error.response) {
    // Erro de rede
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      if (Array.isArray(data.message)) {
        return data.message.join('\n');
      }
      return data.message || 'Dados inválidos';
    
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    
    case 404:
      return 'Recurso não encontrado.';
    
    case 500:
      return 'Erro no servidor. Tente novamente mais tarde.';
    
    default:
      return data.message || 'Erro desconhecido';
  }
};

// Uso
try {
  await api.get('/user/user-data');
} catch (error) {
  const errorMessage = handleApiError(error);
  alert(errorMessage);
}
```

---

### 5. Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await api.get('/user/user-data');
    // Processar dados
  } catch (err) {
    setError(handleApiError(err));
  } finally {
    setLoading(false);
  }
};
```

---

### 6. Upload de Arquivos

```typescript
const uploadFile = async (file: File, endpoint: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Adicionar outros campos conforme necessário
  // formData.append('user_data_id', '123');
  // formData.append('type', 'id_doc');
  
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
```

---

### 7. Decodificação de JWT

```typescript
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
};
```

---

### 8. Fluxo Completo de Cadastro

```typescript
const registerCandidate = async (candidateData: CandidateData) => {
  try {
    // 1. Criar User Data
    const userData = await api.post('/user/user-data', {
      cpf: candidateData.cpf,
      birth_date: candidateData.birthDate,
      celphone: candidateData.phone,
      user_id: getCurrentUserId(),
    });
    
    const userDataId = userData.data.id;
    
    // 2. Criar Endereço
    await api.post('/user/addresses', {
      user_id: getCurrentUserId(),
      cep: candidateData.address.cep,
      logradouro: candidateData.address.street,
      numero: candidateData.address.number,
      bairro: candidateData.address.neighborhood,
      cidade: candidateData.address.city,
      uf: candidateData.address.state,
    });
    
    // 3. Criar Persona
    await api.post('/user/persona', {
      ...candidateData.persona,
      auth_user_id: getCurrentUserId(),
    });
    
    // 4. Criar Resultado ENEM
    const enemResult = await api.post('/user/enem-results', {
      user_id: getCurrentUserId(),
    });
    
    // 5. Atualizar notas do ENEM
    await api.patch(`/user/enem-results/${enemResult.data.id}`, {
      languages_score: candidateData.enem.languages,
      math_score: candidateData.enem.math,
      natural_sciences_score: candidateData.enem.naturalSciences,
      human_sciences_score: candidateData.enem.humanSciences,
      essay_score: candidateData.enem.essay,
    });
    
    // 6. Upload de Documentos
    for (const doc of candidateData.documents) {
      await api.post('/user/candidate-documents/upload', createFormData(doc));
    }
    
    // 7. Inscrever na Prova
    await api.post('/user/student-exams', {
      user_data_id: userDataId,
      exam_scheduled_hour_id: candidateData.examHourId,
    });
    
    return { success: true, userDataId };
    
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};
```

---

## Troubleshooting

### Problema: "Credenciais inválidas" mesmo com credenciais corretas

**Possíveis Causas:**
1. Usuário não existe no banco
2. Senha incorreta
3. Conta inativa (`is_active = false`)
4. Usuário sem roles

**Solução:**
- Verificar se o usuário existe e está ativo
- Confirmar a senha
- Verificar se possui roles associadas

---

### Problema: Token expira muito rápido

**Solução:**
- Implementar renovação automática (já implementado no interceptor)
- Verificar se o refresh token está sendo armazenado corretamente

---

### Problema: Erro de CORS

**Solução:**
- Verificar se a API está rodando e acessível
- Confirmar que a URL base está correta
- Verificar configuração de CORS no backend

---

### Problema: Upload de arquivo falha

**Possíveis Causas:**
1. Content-Type incorreto
2. Campo do arquivo com nome errado
3. Arquivo muito grande
4. Formato de arquivo não permitido

**Solução:**
- Usar `Content-Type: multipart/form-data`
- Verificar nome do campo (geralmente `file`)
- Verificar tamanho e formato do arquivo

---

### Problema: "Sem permissão para acessar este recurso"

**Possíveis Causas:**
1. Usuário não possui a role necessária
2. Tentando acessar recurso de outro tenant
3. Token inválido ou expirado

**Solução:**
- Verificar roles no payload do JWT
- Confirmar que está acessando recursos do seu tenant
- Renovar token se necessário

---

### Problema: Paginação não funciona

**Solução:**
- Verificar se `page` e `size` são números inteiros positivos
- Confirmar que os parâmetros estão sendo enviados como query params
- Verificar formato da resposta

---

## 📚 Recursos Adicionais

### Documentação Swagger

Acesse a documentação interativa completa:
```
http://186.248.135.172:31535/swagger
```

### Usuário de Teste

- **Credential**: `luke@pectecbh.com.br`
- **Password**: `qweasd32`

⚠️ **Nota**: Usuário apenas para testes. Use credenciais reais em produção.

---

### Ordem de Implementação Visual

```
┌─────────────────────────────────────────────────┐
│ 1. AUTENTICAÇÃO                                  │
│    ✓ Login                                       │
│    ✓ Refresh Token                              │
│    ✓ Logout (local)                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. TENANT CITIES (Admin)                         │
│    ✓ Listar / Criar / Atualizar / Deletar      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. CADASTRO DE CANDIDATO                         │
│    ✓ User Data                                   │
│    ✓ Endereço                                   │
│    ✓ Guardian (se menor)                        │
│    ✓ Persona                                    │
│    ✓ Resultado ENEM                             │
│    ✓ Upload de Documentos                       │
│    ✓ Mérito Acadêmico (opcional)               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. AGENDAMENTO DE PROVA                          │
│    ✓ Locais de Prova                            │
│    ✓ Datas de Prova                             │
│    ✓ Horários de Prova                          │
│    ✓ Inscrição do Estudante                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. CONTRATO                                      │
│    ✓ Criar / Visualizar Contrato               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 6. COMPLEMENTOS                                  │
│    ✓ FAQs                                       │
│    ✓ Upload de Arquivos                         │
│    ✓ Cidades Permitidas                         │
└─────────────────────────────────────────────────┘
```

---

## 📝 Checklist de Integração

- [ ] Configurar cliente HTTP (Axios)
- [ ] Implementar interceptor de autenticação
- [ ] Implementar interceptor de refresh automático
- [ ] Criar função de login
- [ ] Criar função de logout
- [ ] Implementar decodificação de JWT
- [ ] Implementar tratamento global de erros
- [ ] Implementar verificação de roles
- [ ] Integrar endpoints de User Data
- [ ] Integrar endpoints de Endereço
- [ ] Integrar endpoints de Persona
- [ ] Integrar endpoints de ENEM
- [ ] Integrar upload de documentos
- [ ] Integrar endpoints de Prova
- [ ] Integrar endpoints de Contrato
- [ ] Integrar FAQs
- [ ] Testar fluxo completo de cadastro
- [ ] Testar renovação automática de token
- [ ] Testar upload de arquivos
- [ ] Implementar loading states
- [ ] Implementar mensagens de erro amigáveis

---

**Última atualização:** Janeiro 2026

**Versão da API:** 1.0

**Autor:** Documentação gerada automaticamente

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação Swagger: `/swagger`
2. Verifique os logs do backend
3. Verifique os logs do console do navegador
4. Entre em contato com a equipe de desenvolvimento

---

**🎯 Este guia cobre todos os endpoints essenciais para a integração completa do frontend com a API do pd-backoffice. Siga a ordem recomendada para uma implementação mais fluida e organizada.**
