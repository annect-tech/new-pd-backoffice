# Correções e Esclarecimentos - Contrato da API

## ⚠️ Correções Importantes

### 1. Formato de Resposta do Login

**❌ INCORRETO (o que o frontend mencionou):**
```typescript
{
  access: string,
  refresh: string,
  user: User
}
```

**✅ CORRETO (formato real da API):**
```typescript
{
  accessToken: string,
  refreshToken: string
}
```

**Observações:**
- O backend **NÃO retorna** o objeto `user` na resposta do login
- Os campos são `accessToken` e `refreshToken` (não `access` e `refresh`)
- Para obter dados do usuário, você precisa:
  1. Decodificar o JWT para obter o `user_id` (campo `sub`)
  2. Fazer uma requisição adicional para buscar o usuário/perfil

---

### 2. Endpoint de Perfil do Usuário

**❌ INCORRETO (o que o frontend mencionou):**
- `GET /user-profiles/me/` - **NÃO EXISTE**
- `POST /user-profiles/` - **NÃO EXISTE** (existe apenas em `/admin/user-profiles`)
- `POST /user-profiles/{id}/upload-photo/` - **NÃO EXISTE**

**✅ CORRETO (endpoints reais):**

#### Endpoints Disponíveis (todos requerem role ADMIN ou ADMIN_MASTER):

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/admin/user-profiles` | Criar perfil de usuário |
| GET | `/admin/user-profiles` | Listar perfis (paginação) |
| POST | `/admin/user-profiles/upload-photo` | Upload de foto de perfil |
| PATCH | `/admin/user-profiles/:id` | Atualizar perfil |
| DELETE | `/admin/user-profiles/:id` | Deletar perfil |

**⚠️ PROBLEMA CRÍTICO:**
- **NÃO existe endpoint `/user/user-profiles/*`** para usuários comuns
- Todos os endpoints de perfil estão em `/admin/user-profiles` e requerem roles ADMIN ou ADMIN_MASTER
- Isso significa que usuários comuns (STUDENT, MONITOR, etc.) **NÃO podem criar/atualizar seus próprios perfis** através da API atual

**Soluções Possíveis:**

**Opção 1: Criar endpoints no backend (RECOMENDADO)**
Criar novos endpoints em `UserProfileUserController`:
- `GET /user/user-profiles/me` - Obter perfil do usuário logado
- `POST /user/user-profiles` - Criar perfil do usuário logado
- `POST /user/user-profiles/me/upload-photo` - Upload de foto do próprio perfil

**Opção 2: Usar endpoint admin com filtro (WORKAROUND temporário)**
- Extrair `user_id` do JWT (campo `sub`)
- Chamar `GET /admin/user-profiles` com filtro no frontend
- Para criar/atualizar, usar `POST /admin/user-profiles` passando o `user_id` extraído do JWT

**Opção 3: Usuários comuns não podem gerenciar perfil**
- Apenas admins podem criar/atualizar perfis
- Usuários comuns precisam solicitar a um admin

---

### 3. Upload de Foto de Perfil

**Endpoint:** `POST /admin/user-profiles/upload-photo`

**Formato:**
- **Content-Type:** `multipart/form-data`
- **Campo do arquivo:** `file` (Express.Multer.File)
- **Body (form-data):**
  ```typescript
  {
    id: string; // ID do perfil (não user_id!)
  }
  ```

**Resposta de Sucesso:**
```typescript
{
  url: string; // URL da foto no S3
  message: string; // "Foto de perfil atualizada com sucesso."
}
```

**Exemplo de Requisição:**
```typescript
const formData = new FormData();
formData.append('file', file); // Arquivo de imagem
formData.append('id', profileId); // ID do perfil (string)

const response = await api.post('/admin/user-profiles/upload-photo', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**⚠️ IMPORTANTE:**
- O campo `id` deve ser o **ID do perfil** (não o `user_id`)
- Você precisa ter o perfil criado antes de fazer upload da foto
- O endpoint requer role ADMIN ou ADMIN_MASTER

---

### 4. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**❌ INCORRETO (o que o frontend mencionou):**
```typescript
Input: { refresh: string }
```

**✅ CORRETO:**
```typescript
Input: { refreshToken: string }
Output: { accessToken: string, refreshToken: string }
```

**Observações:**
- O campo de input é `refreshToken` (não `refresh`)
- A resposta retorna ambos os tokens novamente
- Após usar o refresh token, ele é invalidado e um novo é gerado

---

### 5. Logout

**❌ INCORRETO (o que o frontend mencionou):**
- Chamar `authService.logout()` que faz requisição ao backend

**✅ CORRETO:**
- **NÃO existe endpoint de logout no backend**
- Logout é apenas limpar tokens localmente no frontend
- Não há necessidade de chamar o backend

**Implementação Correta:**
```typescript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Limpar estado do Redux/store
  dispatch(clearCredentials());
  // Redirecionar para login
  navigate('/login');
};
```

---

### 6. Criar Perfil de Usuário

**Endpoint:** `POST /admin/user-profiles`

**Payload:**
```typescript
{
  user_id: number; // ID do usuário (extrair do JWT campo 'sub')
  cpf: string; // CPF (11-14 caracteres)
  personal_email: string; // Email válido
  bio: string; // Obrigatório
  occupation: string; // Obrigatório
  department: string; // Obrigatório
  equipment_patrimony: string; // Obrigatório
  work_location: string; // Obrigatório
  manager: string; // Obrigatório
  profile_photo?: string; // Opcional (URL)
  birth_date?: string; // Opcional (ISO date string)
  hire_date?: string; // Opcional (ISO date string)
}
```

**Resposta de Sucesso:**
```typescript
{
  id: string; // ID do perfil criado
  message: string; // "Perfil de usuário criado com sucesso."
}
```

**⚠️ IMPORTANTE:**
- Requer role ADMIN ou ADMIN_MASTER
- O `user_id` deve ser extraído do JWT (campo `sub`)
- Todos os campos exceto `profile_photo`, `birth_date` e `hire_date` são obrigatórios

---

## 📋 Resumo do Contrato Correto

### Login
```typescript
POST /auth/login
Input: { credential: string, password: string }
Output: { accessToken: string, refreshToken: string }
```

### Refresh Token
```typescript
POST /auth/refresh-token
Input: { refreshToken: string }
Output: { accessToken: string, refreshToken: string }
```

### Logout
```typescript
// Não existe endpoint - apenas limpar tokens localmente
```

### Obter Perfil do Usuário Atual
```typescript
// NÃO EXISTE endpoint direto
// Opções:
// 1. GET /admin/user-profiles e filtrar por user_id no frontend
// 2. Criar endpoint GET /user/user-profiles/me no backend (recomendado)
```

### Criar Perfil
```typescript
POST /admin/user-profiles
Input: { user_id: number, cpf: string, personal_email: string, ... }
Output: { id: string, message: string }
// Requer role ADMIN ou ADMIN_MASTER
```

### Upload Foto de Perfil
```typescript
POST /admin/user-profiles/upload-photo
Content-Type: multipart/form-data
Body: FormData com campo 'file' e campo 'id' (string)
Output: { url: string, message: string }
// Requer role ADMIN ou ADMIN_MASTER
```

---

## 🔧 Ajustes Necessários no Frontend

### 1. Ajustar Formato de Resposta do Login

```typescript
// authService.ts
const login = async (credential: string, password: string) => {
  const response = await httpClient.post('/auth/login', {
    credential,
    password,
  });
  
  // CORRETO: usar accessToken e refreshToken
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
  
  // INCORRETO: response.data.access ou response.data.refresh
};
```

### 2. Ajustar Refresh Token

```typescript
// authService.ts
const refreshToken = async (refreshToken: string) => {
  const response = await httpClient.post('/auth/refresh-token', {
    refreshToken, // CORRETO: campo é refreshToken
  });
  
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
};
```

### 3. Ajustar Logout

```typescript
// authService.ts ou AuthProvider.tsx
const logout = async () => {
  // NÃO fazer requisição ao backend
  // Apenas limpar tokens localmente
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  dispatch(clearCredentials());
  navigate('/login');
};
```

### 4. Criar Service de Perfil (se necessário)

```typescript
// userProfileService.ts
import httpClient from './httpClient';

export const userProfileService = {
  // Listar perfis (requer ADMIN)
  list: async (page?: number, size?: number) => {
    return httpClient.get('/admin/user-profiles', {
      params: { page, size },
    });
  },
  
  // Criar perfil (requer ADMIN)
  create: async (data: CreateUserProfileInput) => {
    return httpClient.post('/admin/user-profiles', data);
  },
  
  // Upload foto (requer ADMIN)
  uploadPhoto: async (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', profileId);
    
    return httpClient.post('/admin/user-profiles/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Obter perfil do usuário atual (WORKAROUND)
  getMyProfile: async (userId: number) => {
    const response = await httpClient.get('/admin/user-profiles', {
      params: { page: 1, size: 1000 }, // Buscar muitos para encontrar
    });
    
    // Filtrar no frontend
    const profiles = response.data.data;
    return profiles.find((p: any) => p.user_id === userId);
  },
};
```

---

## ⚠️ Problemas Identificados e Recomendações

### Problema 1: Usuários Comuns Não Podem Gerenciar Perfil

**Situação Atual:**
- Apenas admins podem criar/atualizar perfis
- Não existe endpoint `/user/user-profiles/*`

**Recomendação:**
Criar endpoints no backend para usuários comuns:
- `GET /user/user-profiles/me` - Obter próprio perfil
- `POST /user/user-profiles` - Criar próprio perfil
- `PATCH /user/user-profiles/me` - Atualizar próprio perfil
- `POST /user/user-profiles/me/upload-photo` - Upload de foto

### Problema 2: Login Não Retorna Dados do Usuário

**Situação Atual:**
- Login retorna apenas tokens
- Precisa fazer requisição adicional para obter dados do usuário

**Recomendação:**
- Decodificar JWT para obter `user_id`, `roles`, `tenant_city_id`
- Fazer requisição adicional se precisar de mais dados (nome, email, etc.)

### Problema 3: Upload Requer ID do Perfil

**Situação Atual:**
- Upload de foto requer o ID do perfil (não user_id)
- Precisa criar perfil primeiro para depois fazer upload

**Recomendação:**
- Criar perfil primeiro
- Usar o `id` retornado para fazer upload da foto
- Ou criar endpoint que aceite `user_id` ao invés de `id`

---

## ✅ Checklist de Correções

- [ ] Ajustar formato de resposta do login (`accessToken` e `refreshToken`)
- [ ] Ajustar campo de refresh token (`refreshToken` ao invés de `refresh`)
- [ ] Remover chamada de logout ao backend (apenas limpar local)
- [ ] Ajustar endpoints de perfil (usar `/admin/user-profiles` ou criar `/user/user-profiles/me`)
- [ ] Implementar upload multipart corretamente (campo `file` e `id`)
- [ ] Extrair `user_id` do JWT para criar perfil
- [ ] Implementar filtro no frontend para obter perfil do usuário atual (workaround)

---

**Última atualização:** 2024

