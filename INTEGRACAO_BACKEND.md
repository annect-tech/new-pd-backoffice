# Roteiro de Integração - Frontend

## ⚠️ ATENÇÃO: Leia Primeiro

**IMPORTANTE:** Antes de começar a integração, leia o documento **[CORRECOES_CONTRATO_API.md](./CORRECOES_CONTRATO_API.md)** que contém correções importantes sobre o contrato da API, especialmente:

- Formato correto das respostas (`accessToken`/`refreshToken` vs `access`/`refresh`)
- Endpoints de perfil de usuário (não existe `/user/user-profiles/me`)
- Upload de foto (formato multipart correto)
- Logout (não existe endpoint no backend)

---

## 📋 Índice

1. [Informações Gerais](#informações-gerais)
2. [Configuração Inicial](#configuração-inicial)
3. [Autenticação](#autenticação)
4. [Estrutura de Respostas](#estrutura-de-respostas)
5. [Paginação](#paginação)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Endpoints Principais](#endpoints-principais)
8. [Exemplos de Código](#exemplos-de-código)
9. [Boas Práticas](#boas-práticas)
10. [Troubleshooting](#troubleshooting)

---

## 📌 Informações Gerais

### URL Base da API
```
http://186.248.135.172:31535
```

### Documentação Swagger
A API possui documentação Swagger disponível em:
```
http://186.248.135.172:31535/swagger
```

### Formato de Dados
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- Todas as requisições devem enviar dados em formato JSON
- Todas as respostas retornam dados em formato JSON

### CORS
A API está configurada para aceitar requisições de qualquer origem (`enableCors()`).

---

## ⚙️ Configuração Inicial

### Variáveis de Ambiente Recomendadas

```env
VITE_API_BASE_URL=http://186.248.135.172:31535
# ou
REACT_APP_API_BASE_URL=http://186.248.135.172:31535
# ou
NEXT_PUBLIC_API_BASE_URL=http://186.248.135.172:31535
```

### Configuração do Cliente HTTP

**Exemplo com Axios:**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://186.248.135.172:31535',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se receber 401 e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Redirecionar para login
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
        // Refresh token inválido, fazer logout
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

## 🔐 Autenticação

### 1. Login

**Endpoint:** `POST /auth/login`

**Payload:**
```typescript
{
  credential: string; // Email, CPF ou username
  password: string;
}
```

**⚠️ IMPORTANTE:** 
- Use sempre o campo `credential` ao invés de `email`
- O campo `credential` aceita: email, CPF (com ou sem formatação) ou username
- O backend busca automaticamente em todos esses campos usando OR
- O campo é automaticamente trimado pelo backend

**Resposta de Sucesso (200):**
```typescript
{
  accessToken: string; // JWT token
  refreshToken: string; // UUID v4 token
}
```

**Exemplo de Requisição:**
```typescript
const response = await api.post('/auth/login', {
  credential: 'luke@pectecbh.com.br', // ou CPF ou username
  password: 'qweasd32'
});

const { accessToken, refreshToken } = response.data;

// Armazenar tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

**Possíveis Erros:**

| Status | Mensagem | Significado |
|--------|----------|-------------|
| 400 | `credential é obrigatório` | Campo credential não foi enviado ou está vazio |
| 400 | `credential deve ser uma string` | Campo credential não é uma string válida |
| 400 | `password é obrigatório` | Campo password não foi enviado ou está vazio |
| 400 | `Credenciais inválidas.` | Usuário não encontrado ou senha incorreta |
| 403 | `A sua conta foi suspensa. Entre em contato com a administração para mais detalhes.` | Conta inativa (is_active = false) |
| 403 | `Acesso negado.` | Usuário não possui roles associadas |

### 2. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Payload:**
```typescript
{
  refreshToken: string;
}
```

**Resposta de Sucesso (200):**
```typescript
{
  accessToken: string; // Novo JWT token
  refreshToken: string; // Novo refresh token
}
```

**⚠️ IMPORTANTE:**
- Após usar um refresh token, ele é automaticamente removido e um novo é gerado
- O token antigo não pode ser reutilizado
- Sempre atualize ambos os tokens no storage após refresh

**Possíveis Erros:**

| Status | Mensagem | Significado |
|--------|----------|-------------|
| 400 | `refreshToken é obrigatório` | Campo refreshToken não foi enviado |
| 400 | `Refresh token inválido.` | Refresh token não existe no banco |
| 400 | `Refresh token expirado.` | Refresh token expirou (expiresAt < data atual) |
| 404 | `Usuário não encontrado.` | Usuário associado ao refresh token não existe mais |

### 3. Logout

**⚠️ IMPORTANTE:**
- Não existe endpoint explícito de logout no backend
- O logout deve ser feito no frontend removendo os tokens do storage
- Para invalidar o refresh token no backend, seria necessário deletá-lo manualmente (não há endpoint público)

**Exemplo de Logout:**
```typescript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirecionar para página de login
  window.location.href = '/login';
};
```

### 4. Estrutura do JWT Token

O payload do JWT contém:

```typescript
{
  sub: number; // user_id do auth_user
  roles: string[]; // Array de nomes de roles, ex: ['ADMIN', 'USER']
  tenant_city_id: string; // ID da cidade/tenant do usuário
}
```

**Exemplo de decodificação (sem validação):**
```typescript
const decodeJWT = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

const token = localStorage.getItem('accessToken');
if (token) {
  const payload = decodeJWT(token);
  console.log('User ID:', payload.sub);
  console.log('Roles:', payload.roles);
  console.log('Tenant City ID:', payload.tenant_city_id);
}
```

### 5. Header de Autenticação

Todas as requisições autenticadas devem incluir:

```
Authorization: Bearer {accessToken}
```

**Exemplo:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Estrutura de Respostas

### Resposta de Sucesso Simples

```typescript
{
  // Dados da resposta
  id: string;
  name: string;
  // ... outros campos
}
```

### Resposta de Erro

```typescript
{
  message: string; // Mensagem de erro descritiva
  statusCode: number; // Código HTTP do erro
}
```

**Exemplo:**
```typescript
{
  message: "credential é obrigatório",
  statusCode: 400
}
```

---

## 📄 Paginação

### Query Parameters

Todos os endpoints que retornam listas aceitam os seguintes query parameters:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Número da página (padrão: 1) |
| `size` | número | Não | Itens por página (padrão: total de itens) |
| `search` | string | Não | Termo de busca (opcional, dependendo do endpoint) |

**Validações:**
- `page` e `size` devem ser números inteiros positivos
- `search` é automaticamente trimado pelo backend

### Estrutura de Resposta Paginada

```typescript
{
  data: T[]; // Array de itens da página atual
  currentPage: number; // Página atual
  itemsPerPage: number; // Itens por página
  totalItems: number; // Total de itens
  totalPages: number; // Total de páginas
}
```

**Exemplo:**
```typescript
{
  data: [
    {
      id: "1",
      name: "Item 1",
      // ... outros campos
    },
    {
      id: "2",
      name: "Item 2",
      // ... outros campos
    }
  ],
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 25,
  totalPages: 3
}
```

**Exemplo de Requisição:**
```typescript
const response = await api.get('/admin/users', {
  params: {
    page: 1,
    size: 10,
    search: 'luke' // opcional
  }
});

const { data, currentPage, itemsPerPage, totalItems, totalPages } = response.data;
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP Comuns

| Status | Significado | Ação Recomendada |
|--------|-------------|------------------|
| 200 | Sucesso | Processar dados normalmente |
| 201 | Criado | Recurso criado com sucesso |
| 400 | Bad Request | Erro de validação - verificar mensagem |
| 401 | Unauthorized | Token inválido ou expirado - tentar refresh |
| 403 | Forbidden | Sem permissão - verificar roles do usuário |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro do servidor - tentar novamente mais tarde |

### Mensagens de Erro Comuns

```typescript
// Erros de validação (400)
"credential é obrigatório"
"credential deve ser uma string"
"password é obrigatório"
"{campo} é obrigatório"
"{campo} deve ser uma string" // ou outro tipo conforme validação

// Erros de autenticação (400, 403)
"Credenciais inválidas."
"A sua conta foi suspensa. Entre em contato com a administração para mais detalhes."
"Acesso negado."

// Erros de refresh token (400, 404)
"refreshToken é obrigatório"
"Refresh token inválido."
"Refresh token expirado."
"Usuário não encontrado."

// Erros de recursos (404)
"FAQ não encontrada na base de dados."
"Documento de merito não encontrado na base de dados."
"Persona não encontrada na base de dados."
"Usuário não encontrado."

// Erros de permissão (403)
"Sem permissão para acessar este recurso."
```

### Exemplo de Tratamento de Erros

```typescript
try {
  const response = await api.get('/admin/users');
  return response.data;
} catch (error) {
  if (error.response) {
    // Erro com resposta do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Erro de validação
        console.error('Erro de validação:', data.message);
        // Mostrar mensagem para o usuário
        break;
      case 401:
        // Não autenticado
        console.error('Não autenticado');
        // Redirecionar para login
        break;
      case 403:
        // Sem permissão
        console.error('Sem permissão:', data.message);
        // Mostrar mensagem de acesso negado
        break;
      case 404:
        // Recurso não encontrado
        console.error('Recurso não encontrado:', data.message);
        break;
      case 500:
        // Erro do servidor
        console.error('Erro do servidor:', data.message);
        // Mostrar mensagem genérica
        break;
      default:
        console.error('Erro desconhecido:', data.message);
    }
  } else if (error.request) {
    // Erro de rede
    console.error('Erro de rede:', error.message);
  } else {
    // Erro ao configurar requisição
    console.error('Erro:', error.message);
  }
  
  throw error;
}
```

---

## 🛣️ Endpoints Principais

### Autenticação

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/auth/login` | Não | Login com credential e password |
| POST | `/auth/refresh-token` | Não | Renovar access token |

### Usuários

| Método | Endpoint | Autenticação | Roles | Descrição |
|--------|----------|--------------|-------|-----------|
| GET | `/admin/users` | Sim | ADMIN, ADMIN_MASTER | Listar usuários (admin) |
| GET | `/user/users` | Sim | Qualquer | Listar usuários (usuário) |

### Perfis de Usuário

| Método | Endpoint | Autenticação | Roles | Descrição |
|--------|----------|--------------|-------|-----------|
| GET | `/admin/user-profiles` | Sim | ADMIN, ADMIN_MASTER | Listar perfis de usuários |

**⚠️ IMPORTANTE:** Não existe endpoint específico para obter o perfil do usuário atual (`/user/user-profiles/me`). Opções:
1. Extrair o `user_id` do payload do JWT (campo `sub`)
2. Buscar o perfil através de `GET /admin/user-profiles` filtrando pelo `user_id` no frontend
3. Criar um novo endpoint no backend `GET /user/user-profiles/me` (recomendado)

### Outros Endpoints

A API possui muitos outros endpoints organizados por módulos. Consulte a documentação Swagger em `/swagger` para ver todos os endpoints disponíveis.

**Principais módulos:**
- `/admin/*` - Endpoints administrativos (requerem roles ADMIN ou ADMIN_MASTER)
- `/user/*` - Endpoints de usuário (requerem autenticação)
- `/auth/*` - Endpoints de autenticação (públicos)

---

## 📤 Uploads de Arquivos (Multipart)

### Endpoints que Suportam Upload

A API possui vários endpoints que aceitam upload de arquivos usando `multipart/form-data`:

| Endpoint | Método | Campo do Arquivo | Outros Campos | Roles |
|----------|--------|------------------|---------------|-------|
| `/admin/user-profiles/upload-photo` | POST | `file` | `id` (string) | ADMIN, ADMIN_MASTER |
| `/upload-file/single` | POST | `file` | - | Autenticação |
| `/upload-file/array` | POST | `files` (array) | - | Autenticação |
| `/user/candidate-documents/upload` | POST | `file` | Vários (ver Swagger) | Autenticação |
| `/user/academic-merit-documents/upload` | POST | `file` | Vários (ver Swagger) | Autenticação |

### Formato de Requisição

**⚠️ IMPORTANTE:** Para uploads multipart, você **NÃO deve** definir `Content-Type: application/json`. O navegador/biblioteca HTTP deve definir automaticamente `Content-Type: multipart/form-data` com o boundary correto.

**Exemplo com Axios:**
```typescript
const formData = new FormData();
formData.append('file', file); // Arquivo File/Blob
formData.append('id', profileId); // Outros campos se necessário

const response = await api.post('/admin/user-profiles/upload-photo', formData, {
  headers: {
    // NÃO definir Content-Type manualmente!
    // Axios/Fetch definem automaticamente com boundary
  },
});
```

**Exemplo com Fetch:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('id', profileId);

const response = await fetch(`${API_BASE_URL}/admin/user-profiles/upload-photo`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    // NÃO definir Content-Type - o navegador define automaticamente
  },
  body: formData,
});
```

### Upload de Foto de Perfil

**Endpoint:** `POST /admin/user-profiles/upload-photo`

**Payload:**
- `file`: Arquivo de imagem (File/Blob)
- `id`: ID do perfil (string) - **não é user_id!**

**Resposta:**
```typescript
{
  url: string; // URL da foto no S3
  message: string; // "Foto de perfil atualizada com sucesso."
}
```

**Exemplo Completo:**
```typescript
const uploadProfilePhoto = async (profileId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', profileId);
  
  try {
    const response = await api.post('/admin/user-profiles/upload-photo', formData);
    return response.data.url; // URL da foto
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Erro ao fazer upload');
    }
    throw error;
  }
};
```

### Validações de Arquivo

A API valida:
- **Tipo de arquivo:** Apenas tipos permitidos (imagens para foto de perfil)
- **Tamanho:** Máximo 10MB (verificar mensagem de erro específica)
- **Presença:** Arquivo é obrigatório

**Tratamento de Erros:**
```typescript
try {
  await uploadProfilePhoto(profileId, file);
} catch (error: any) {
  if (error.response?.status === 400) {
    const message = error.response.data.message;
    if (message.includes('Tamanho')) {
      alert('Arquivo muito grande. Máximo 10MB.');
    } else if (message.includes('Tipo')) {
      alert('Tipo de arquivo inválido. Use apenas imagens.');
    } else {
      alert(message);
    }
  }
}
```

### Helper para Cliente HTTP

**Implementação recomendada no httpClient:**

```typescript
// httpClient.ts
class HttpClient {
  // ... outros métodos ...
  
  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // NÃO definir Content-Type - navegador define automaticamente
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Erro desconhecido',
        statusCode: response.status,
      }));
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }
}
```

---

## 💻 Exemplos de Código

### Exemplo Completo de Login

```typescript
import api from './api'; // Seu cliente HTTP configurado

interface LoginCredentials {
  credential: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const login = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    const { accessToken, refreshToken } = response.data;
    
    // Armazenar tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Decodificar JWT para obter informações do usuário
    const payload = decodeJWT(accessToken);
    
    // Armazenar informações do usuário (opcional)
    localStorage.setItem('userId', payload.sub.toString());
    localStorage.setItem('userRoles', JSON.stringify(payload.roles));
    localStorage.setItem('tenantCityId', payload.tenant_city_id);
    
    // Redirecionar para página inicial
    window.location.href = '/dashboard';
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          if (data.message === 'Credenciais inválidas.') {
            alert('Email/CPF/Username ou senha incorretos');
          } else {
            alert(data.message);
          }
          break;
        case 403:
          alert(data.message);
          break;
        default:
          alert('Erro ao fazer login. Tente novamente.');
      }
    } else {
      alert('Erro de conexão. Verifique sua internet.');
    }
    throw error;
  }
};

// Uso
login({
  credential: 'luke@pectecbh.com.br',
  password: 'qweasd32'
});
```

### Exemplo de Listagem com Paginação

```typescript
interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

const listUsers = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<PaginatedResponse<User>> => {
  try {
    const params: any = { page, size };
    if (search) {
      params.search = search;
    }
    
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expirado, o interceptor deve tratar
      throw error;
    }
    if (error.response?.status === 403) {
      alert('Você não tem permissão para acessar esta página');
      throw error;
    }
    throw error;
  }
};

// Uso
const users = await listUsers(1, 10, 'luke');
console.log(`Mostrando ${users.data.length} de ${users.totalItems} usuários`);
console.log(`Página ${users.currentPage} de ${users.totalPages}`);
```

### Exemplo de Hook React para Autenticação

```typescript
import { useState, useEffect } from 'react';
import api from './api';

interface User {
  id: number;
  roles: string[];
  tenantCityId: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = decodeJWT(token);
        setUser({
          id: payload.sub,
          roles: payload.roles,
          tenantCityId: payload.tenant_city_id,
        });
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);
  
  const login = async (credential: string, password: string) => {
    const response = await api.post('/auth/login', {
      credential,
      password,
    });
    
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    const payload = decodeJWT(accessToken);
    setUser({
      id: payload.sub,
      roles: payload.roles,
      tenantCityId: payload.tenant_city_id,
    });
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };
  
  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };
  
  const isAdmin = (): boolean => {
    return hasRole('ADMIN') || hasRole('ADMIN_MASTER');
  };
  
  return {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isAuthenticated: !!user,
  };
};
```

### Exemplo de Componente de Proteção de Rota

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && !requiredRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Uso
<ProtectedRoute requiredRoles={['ADMIN', 'ADMIN_MASTER']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## ✅ Boas Práticas

### 1. Armazenamento de Tokens

- **Use `localStorage`** para desenvolvimento e testes
- **Considere `httpOnly cookies`** para produção (mais seguro)
- **Nunca** armazene tokens em variáveis globais ou estado não persistente
- **Sempre** limpe os tokens ao fazer logout

### 2. Renovação Automática de Token

- Implemente interceptor para renovar token automaticamente quando receber 401
- Use o refresh token antes de redirecionar para login
- Atualize ambos os tokens após refresh bem-sucedido

### 3. Tratamento de Erros

- Sempre trate erros de forma adequada
- Mostre mensagens amigáveis para o usuário
- Faça log de erros para debugging
- Não exponha informações sensíveis em mensagens de erro

### 4. Validação no Frontend

- Valide dados antes de enviar para a API
- Use bibliotecas como `yup` ou `zod` para validação
- Mostre erros de validação antes de fazer requisição

### 5. Loading States

- Mostre indicadores de carregamento durante requisições
- Desabilite botões durante requisições para evitar duplo submit
- Use estados de loading para melhorar UX

### 6. Paginação

- Implemente paginação no frontend para listas grandes
- Mostre informações de paginação (página atual, total de páginas)
- Permita navegação entre páginas
- Considere implementar busca/filtros

### 7. Roles e Permissões

- Verifique roles no frontend para mostrar/ocultar elementos
- **Sempre** valide permissões no backend também
- Use guards/proteção de rotas baseada em roles

### 8. TypeScript

- Defina interfaces/tipos para todas as respostas da API
- Use tipos para payloads de requisição
- Mantenha tipos sincronizados com o backend quando possível

---

## 🔧 Troubleshooting

### Problema: "Credenciais inválidas" mesmo com credenciais corretas

**Possíveis causas:**
1. Usuário não existe no banco de dados
2. Senha está incorreta
3. Usuário está inativo (`is_active = false`)
4. Usuário não possui roles associadas

**Solução:**
- Verificar se o usuário existe e está ativo
- Verificar se o usuário possui roles
- Verificar se a senha está correta
- Verificar se está usando o campo `credential` corretamente

### Problema: Token expira muito rápido

**Solução:**
- Implementar renovação automática usando refresh token
- Verificar configuração de `tokenExpireTime` no backend
- Armazenar refresh token corretamente

### Problema: "Refresh token inválido" ou "Refresh token expirado"

**Possíveis causas:**
1. Refresh token foi usado mais de uma vez (não é permitido)
2. Refresh token expirou
3. Refresh token não existe no banco

**Solução:**
- Após usar refresh token, sempre atualize ambos os tokens
- Implemente logout automático quando refresh falhar
- Verifique se o refresh token está sendo armazenado corretamente

### Problema: CORS errors

**Solução:**
- Verificar se a API está configurada para aceitar requisições da origem do frontend
- Verificar se o backend está rodando e acessível
- Verificar configuração de CORS no backend

### Problema: "Sem permissão para acessar este recurso"

**Possíveis causas:**
1. Usuário não possui a role necessária
2. Usuário está tentando acessar recurso de outro tenant
3. Usuário não é o dono do recurso (quando aplicável)

**Solução:**
- Verificar roles do usuário no payload do JWT
- Verificar se o endpoint requer role específica
- Verificar políticas de acesso do recurso

### Problema: Paginação não funciona

**Possíveis causas:**
1. Parâmetros `page` ou `size` não são números inteiros positivos
2. Parâmetros não estão sendo enviados corretamente

**Solução:**
- Verificar se `page` e `size` são números inteiros positivos
- Verificar se os parâmetros estão sendo enviados como query params
- Verificar formato da resposta paginada

---

## 📚 Recursos Adicionais

### Documentação Swagger
Acesse `http://186.248.135.172:31535/swagger` para ver a documentação completa e interativa da API.

### Usuário de Teste
- **Credential:** `luke@pectecbh.com.br`
- **Password:** `qweasd32`

**⚠️ IMPORTANTE:** Este é um usuário de teste. Em produção, use credenciais reais.

### Estrutura de Roles

| Role | Descrição |
|------|-----------|
| `ADMIN` | Administrador padrão |
| `ADMIN_MASTER` | Administrador master com todos os privilégios |
| `LEADER` | Líder responsável por gerenciar equipes |
| `AGENT_SUCCESS` | Agente de sucesso responsável pelo acompanhamento |
| `MONITOR` | Monitor que auxilia no suporte e operação |
| `STUDENT` | Usuário estudante |

### Endpoints por Prefixo

- `/auth/*` - Autenticação (público)
- `/admin/*` - Endpoints administrativos (requerem ADMIN ou ADMIN_MASTER)
- `/user/*` - Endpoints de usuário (requerem autenticação)
- `/health` - Health check (público)

---

## 📝 Checklist de Integração

- [ ] Configurar variável de ambiente com URL da API
- [ ] Configurar cliente HTTP (Axios/Fetch) com baseURL
- [ ] Implementar interceptor para adicionar token automaticamente
- [ ] Implementar interceptor para renovar token automaticamente
- [ ] Implementar função de login
- [ ] Implementar função de logout
- [ ] Implementar armazenamento seguro de tokens
- [ ] Implementar decodificação de JWT para obter informações do usuário
- [ ] Implementar tratamento de erros adequado
- [ ] Implementar proteção de rotas baseada em autenticação
- [ ] Implementar proteção de rotas baseada em roles
- [ ] Implementar paginação em listas
- [ ] Implementar loading states
- [ ] Testar fluxo completo de autenticação
- [ ] Testar renovação automática de token
- [ ] Testar tratamento de erros
- [ ] Testar acesso negado (403)
- [ ] Testar token expirado (401)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação Swagger em `/swagger`
2. Verifique os logs do backend
3. Verifique os logs do frontend (console do navegador)
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** 2024

