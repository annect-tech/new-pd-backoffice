# Plano de Integração - Backend API

## 📋 Índice

1. [Análise da Situação Atual](#análise-da-situação-atual)
2. [Discrepâncias Identificadas](#discrepâncias-identificadas)
3. [Plano de Correções](#plano-de-correções)
4. [Ordem de Implementação](#ordem-de-implementação)
5. [Checklist de Implementação](#checklist-de-implementação)

---

## 🔍 Análise da Situação Atual

### Backend API (Online)
- **URL Base:** `http://186.248.135.172:31535`
- **Swagger:** `http://186.248.135.172:31535/swagger`
- **Status:** ✅ Online e funcional
- **Contrato:** Documentado em `api-documentation.json` e `CORRECOES_CONTRATO_API.md`

### Frontend (Atual)
- **Framework:** React + TypeScript + Vite
- **State Management:** Redux Toolkit + Redux Persist
- **HTTP Client:** Vanilla Fetch API (customizado)
- **Autenticação:** JWT (access + refresh tokens)
- **Storage:** localStorage com criptografia
- **Status dos Dados:** 🔴 **TODOS MOCKADOS**

---

## ⚠️ Discrepâncias Identificadas

### 1. **Formato de Resposta do Login**

#### Frontend Espera:
```typescript
interface LoginResponse {
  access: string;
  refresh: string;
  user: User;  // ❌ Backend NÃO retorna user
}
```

#### Backend Retorna:
```typescript
{
  accessToken: string;  // ⚠️ Nome diferente
  refreshToken: string; // ⚠️ Nome diferente
  // ❌ NÃO retorna objeto user
}
```

**Impacto:** 🔴 CRÍTICO - Login não funcionará

---

### 2. **Campo de Login**

#### Frontend Usa:
```typescript
// authService.ts - linha ~12
login: (payload: { email: string, password: string })
```

#### Backend Espera:
```typescript
{
  credential: string, // ⚠️ Aceita email, CPF ou username
  password: string
}
```

**Impacto:** 🟡 MODERADO - Pode funcionar se backend aceitar "email", mas não está seguindo contrato

---

### 3. **Endpoints de Autenticação**

#### Frontend Implementa:
```typescript
POST /auth/login/      // ⚠️ Barra final
POST /auth/register/   // ❌ Não existe no backend
POST /auth/refresh/    // ⚠️ Nome diferente
```

#### Backend Possui:
```typescript
POST /auth/login              // Sem barra final
POST /auth/refresh-token      // ⚠️ Nome diferente
// ❌ Registro não existe - apenas admin pode criar usuários
```

**Impacto:** 🔴 CRÍTICO - Nenhuma chamada funcionará

---

### 4. **Refresh Token**

#### Frontend Envia:
```typescript
{
  refresh: string  // ⚠️ Nome do campo
}
```

#### Backend Espera:
```typescript
{
  refreshToken: string  // ⚠️ Nome diferente
}
```

**Impacto:** 🔴 CRÍTICO - Refresh não funcionará

---

### 5. **Perfil do Usuário**

#### Frontend Implementa:
- Armazena perfil em `localStorage` (mock)
- Cria perfil em modal ao primeiro login
- Edita perfil em `/meu-perfil`

#### Backend:
- ❌ **NÃO existe** `GET /user/user-profiles/me`
- ✅ Existe `GET /admin/user-profiles` (requer role ADMIN)
- ✅ Existe `POST /admin/user-profiles` (requer role ADMIN)
- ✅ Existe `POST /admin/user-profiles/upload-photo` (requer role ADMIN)

**Impacto:** 🔴 CRÍTICO - Usuários comuns não podem criar/editar perfil

---

### 6. **Logout**

#### Frontend Implementa:
```typescript
// useAuth.ts - Apenas limpa localStorage e Redux
logout()
```

#### Backend:
- ❌ **NÃO existe endpoint de logout**
- ✅ Implementação do frontend está correta

**Impacto:** ✅ OK - Nenhuma mudança necessária

---

### 7. **Estrutura do JWT**

#### Frontend Espera (User interface):
```typescript
{
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;  // ⚠️ String simples
}
```

#### Backend Retorna (JWT payload):
```typescript
{
  sub: number;              // user_id
  roles: string[];          // ⚠️ Array de roles
  tenant_city_id: string;
}
```

**Impacto:** 🟡 MODERADO - Estrutura incompatível, precisa adaptar

---

### 8. **Proteção de Rotas**

#### Frontend:
- ✅ `AuthMiddleware` existe
- ❌ **NÃO está sendo usado** nas rotas
- ❌ Todas as rotas estão desprotegidas

#### Backend:
- ✅ Endpoints protegidos requerem Bearer token
- ✅ Alguns endpoints requerem roles específicas

**Impacto:** 🔴 CRÍTICO - Aplicação está insegura

---

### 9. **Variável de Ambiente**

#### Frontend Configurado:
```env
VITE_API_URL=http://186.248.135.172:31535
```

#### Usado no Código:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

**Impacto:** ✅ OK - Já configurado corretamente

---

## 🔧 Plano de Correções

### **Fase 1: Correções Críticas de Autenticação** (Prioridade: 🔴 ALTA)

#### 1.1. Atualizar Interfaces de Autenticação

**Arquivo:** `src/interfaces/authInterfaces.ts`

**Mudanças:**
```typescript
// ❌ REMOVER User da resposta de login
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;  // REMOVER
}

// ✅ NOVA interface
export interface LoginResponse {
  accessToken: string;  // Renomeado
  refreshToken: string; // Renomeado
}

// ✅ ATUALIZAR User interface para JWT payload
export interface User {
  id: number;           // Mapeado de sub
  roles: string[];      // Array agora
  tenant_city_id: string;
  // Dados adicionais virão do perfil
  first_name?: string;
  last_name?: string;
  email?: string;
}

// ✅ ATUALIZAR LoginPayload
export interface LoginPayload {
  credential: string;  // Renomeado de email
  password: string;
}

// ✅ ATUALIZAR RefreshTokenPayload
export interface RefreshTokenPayload {
  refreshToken: string;  // Renomeado de refresh
}

// ✅ ATUALIZAR RefreshTokenResponse
export interface RefreshTokenResponse {
  accessToken: string;   // Renomeado de access
  refreshToken: string;  // Renomeado de refresh
}
```

---

#### 1.2. Atualizar authService

**Arquivo:** `src/core/http/services/authService.ts`

**Mudanças:**
```typescript
export const authService = {
  // ✅ Atualizar endpoint (remover barra final)
  login: (payload: LoginPayload) =>
    httpClient.post<LoginResponse>(
      API_URL,
      "/auth/login",  // SEM barra final
      payload
    ),

  // ❌ REMOVER registro (não existe no backend)
  // register: (payload: RegisterPayload) => ...

  // ✅ Atualizar endpoint e nome do campo
  refreshToken: (payload: RefreshTokenPayload) =>
    httpClient.post<RefreshTokenResponse>(
      API_URL,
      "/auth/refresh-token",  // Nome correto
      payload
    )
};
```

---

#### 1.3. Atualizar useAuth Hook

**Arquivo:** `src/hooks/useAuth.ts`

**Mudanças:**
```typescript
const login = async (credential: string, password: string) => {
  setIsLoading(true);
  setError("");

  try {
    // ✅ Usar campo 'credential'
    const res = await authService.login({ credential, password });

    if (res.status === 200 && res.data) {
      const { accessToken, refreshToken } = res.data;

      // ✅ Decodificar JWT para obter user
      const user = decodeJWT(accessToken);

      // ✅ Armazenar credenciais
      dispatch(
        setCredentials({
          accessToken,
          refreshToken,
          user: {
            id: user.sub,
            roles: user.roles,
            tenant_city_id: user.tenant_city_id,
          },
        })
      );

      // ✅ Configurar token no httpClient
      httpClient.setAuthToken(accessToken);

      return { success: true };
    }
  } catch (err: any) {
    // Tratamento de erros...
  }
};

// ✅ Adicionar função para decodificar JWT
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

// ❌ REMOVER register (não existe no backend)
```

---

#### 1.4. Atualizar Refresh Token no Store

**Arquivo:** `src/core/store/index.ts`

**Mudanças:**
```typescript
httpClient.setOnUnauthorized(async () => {
  const { refreshToken } = store.getState().auth;

  if (!refreshToken) {
    return store.dispatch(clearCredentials());
  }

  try {
    // ✅ Usar novo formato
    const res = await authService.refreshToken({ refreshToken });

    if (res.status === 200 && res.data) {
      // ✅ Usar accessToken (não access)
      store.dispatch(setAccessToken(res.data.accessToken));
    } else {
      store.dispatch(clearCredentials());
    }
  } catch (err) {
    store.dispatch(clearCredentials());
  }
});
```

---

#### 1.5. Atualizar Login Component

**Arquivo:** `src/pages/authPages/Login.tsx`

**Mudanças:**
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);

  // ✅ Pode ser email, CPF ou username
  const credential = data.get("email") as string;
  const password = data.get("password") as string;

  // ✅ Usar novo método
  const result = await login(credential, password);

  if (result?.success) {
    navigate(APP_ROUTES.DASHBOARD);
  }
};

// ✅ Atualizar label do campo
<TextField
  label="Email, CPF ou Username"  // Texto atualizado
  name="email"
  // ...
/>
```

---

#### 1.6. Remover Página de Registro

**Arquivos a modificar:**
- `src/pages/authPages/Register.tsx` - ❌ REMOVER ou DESABILITAR
- `src/app/routes/routes.tsx` - ❌ REMOVER rota de registro
- `src/util/constants.ts` - ❌ REMOVER `APP_ROUTES.REGISTER`

**Razão:** Backend não possui endpoint público de registro

---

### **Fase 2: Proteção de Rotas** (Prioridade: 🔴 ALTA)

#### 2.1. Ativar AuthMiddleware

**Arquivo:** `src/app/routes/routes.tsx`

**Mudanças:**
```typescript
import { AuthMiddleware } from "@/core/middleware/AuthMiddleware";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path={APP_ROUTES.LOGIN} element={<Login />} />

      {/* ✅ Envolver rotas protegidas com AuthMiddleware */}
      <Route
        element={
          <AuthMiddleware>
            <AppLayout />
          </AuthMiddleware>
        }
      >
        <Route path={APP_ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={APP_ROUTES.SELETIVO} element={<Seletivo />} />
        {/* ... todas as outras rotas internas */}
      </Route>
    </Routes>
  );
}
```

---

#### 2.2. Criar RoleGuard para Proteção por Roles

**Novo arquivo:** `src/core/middleware/RoleGuard.tsx`

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../store/hooks";
import { APP_ROUTES } from "@/util/constants";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(APP_ROUTES.LOGIN);
      return;
    }

    // Verificar se usuário tem alguma das roles permitidas
    const hasPermission = user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      // Redirecionar para página de acesso negado
      navigate(APP_ROUTES.UNAUTHORIZED);
    }
  }, [user, allowedRoles, navigate]);

  return <>{children}</>;
};
```

---

#### 2.3. Adicionar Rota de Não Autorizado

**Arquivo:** `src/util/constants.ts`

```typescript
export const APP_ROUTES = {
  // ... rotas existentes
  UNAUTHORIZED: "/nao-autorizado",
};
```

**Novo arquivo:** `src/pages/Unauthorized.tsx`

```typescript
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/util/constants";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Acesso Negado
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(APP_ROUTES.DASHBOARD)}
      >
        Voltar ao Dashboard
      </Button>
    </Container>
  );
}
```

---

#### 2.4. Proteger Rotas Administrativas

**Arquivo:** `src/app/routes/routes.tsx`

```typescript
import { RoleGuard } from "@/core/middleware/RoleGuard";

// Dentro das rotas protegidas
<Route
  path="/admin/*"
  element={
    <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
      {/* Rotas administrativas */}
    </RoleGuard>
  }
/>
```

---

### **Fase 3: Gestão de Perfil** (Prioridade: 🟡 MÉDIA)

#### 3.1. Criar userProfileService

**Novo arquivo:** `src/core/http/services/userProfileService.ts`

```typescript
import httpClient from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  id: string;
  user_id: number;
  cpf: string;
  personal_email: string;
  bio: string;
  occupation: string;
  department: string;
  equipment_patrimony: string;
  work_location: string;
  manager: string;
  profile_photo?: string;
  birth_date?: string;
  hire_date?: string;
}

export interface CreateUserProfilePayload {
  user_id: number;
  cpf: string;
  personal_email: string;
  bio: string;
  occupation: string;
  department: string;
  equipment_patrimony: string;
  work_location: string;
  manager: string;
  profile_photo?: string;
  birth_date?: string;
  hire_date?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export const userProfileService = {
  // Listar perfis (ADMIN apenas)
  list: (page: number = 1, size: number = 10) =>
    httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/admin/user-profiles?page=${page}&size=${size}`
    ),

  // Criar perfil (ADMIN apenas)
  create: (payload: CreateUserProfilePayload) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/admin/user-profiles",
      payload
    ),

  // Upload foto (ADMIN apenas)
  uploadPhoto: async (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", profileId);

    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_URL}/admin/user-profiles/upload-photo`,
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da foto");
    }

    return response.json();
  },

  // WORKAROUND: Obter perfil do usuário atual
  getMyProfile: async (userId: number) => {
    const response = await httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/admin/user-profiles?page=1&size=1000`
    );

    if (response.status === 200 && response.data) {
      const profile = response.data.data.find((p) => p.user_id === userId);
      return profile;
    }

    return null;
  },
};
```

---

#### 3.2. Atualizar CreateProfileModal

**Arquivo:** `src/components/layout/AppLayout.tsx`

**Mudanças:**
```typescript
import { userProfileService } from "@/core/http/services/userProfileService";
import { useAppSelector } from "@/core/store/hooks";

// Dentro do componente
const user = useAppSelector((state) => state.auth.user);

const handleCreateProfile = async (profileData: any) => {
  try {
    // ✅ Usar API real
    const result = await userProfileService.create({
      user_id: user!.id,
      ...profileData,
    });

    if (result.status === 201) {
      // Sucesso
      setOpenProfileModal(false);
      // Mostrar mensagem de sucesso
    }
  } catch (err) {
    // Tratar erro
    console.error("Erro ao criar perfil:", err);
  }
};

// ❌ REMOVER armazenamento em localStorage
```

---

#### 3.3. Atualizar MeuPerfil Page

**Arquivo:** `src/pages/meuPerfil/MeuPerfil.tsx`

**Mudanças:**
```typescript
import { userProfileService } from "@/core/http/services/userProfileService";
import { useAppSelector } from "@/core/store/hooks";

const MeuPerfil = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ Buscar perfil da API
        const profileData = await userProfileService.getMyProfile(user!.id);
        setProfile(profileData);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // ❌ REMOVER mock data e localStorage
};
```

---

#### 3.4. Adicionar Hook useUserProfile

**Novo arquivo:** `src/hooks/useUserProfile.ts`

```typescript
import { useState, useEffect } from "react";
import { userProfileService, UserProfile } from "@/core/http/services/userProfileService";
import { useAppSelector } from "@/core/store/hooks";

export const useUserProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const profileData = await userProfileService.getMyProfile(user.id);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const createProfile = async (data: any) => {
    try {
      const result = await userProfileService.create({
        user_id: user!.id,
        ...data,
      });

      if (result.status === 201) {
        await fetchProfile(); // Recarregar perfil
        return { success: true };
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar perfil");
      return { success: false, error: err.message };
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    try {
      const result = await userProfileService.uploadPhoto(profile.id, file);
      await fetchProfile(); // Recarregar perfil com nova foto
      return result;
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da foto");
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    uploadPhoto,
    refetch: fetchProfile,
  };
};
```

---

### **Fase 4: Substituir Hooks Mockados** (Prioridade: 🟢 BAIXA)

#### 4.1. Atualizar useCities

**Arquivo:** `src/hooks/useCities.ts`

**Mudanças:**
```typescript
// ❌ REMOVER mock data
const mockCities = [...];

// ✅ ADICIONAR service
import { citiesService } from "@/core/http/services/citiesService";

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await citiesService.list();
        if (response.status === 200 && response.data) {
          setCities(response.data.data);
        }
      } catch (err) {
        console.error("Erro ao buscar cidades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading };
};
```

---

#### 4.2. Criar citiesService

**Novo arquivo:** `src/core/http/services/citiesService.ts`

```typescript
import httpClient from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL;

export interface City {
  id: string;
  name: string;
  state: string;
  // Adicionar outros campos conforme API
}

export const citiesService = {
  list: (page: number = 1, size: number = 100) =>
    httpClient.get<{ data: City[] }>(
      API_URL,
      `/admin/cities?page=${page}&size=${size}`
    ),

  // Adicionar outros métodos conforme necessário
};
```

---

#### 4.3. Outros Hooks

**Aplicar o mesmo padrão para:**
- `useExams` → criar `examsService`
- `useEnemResults` → criar `enemResultsService`
- `useExamsScheduled` → criar `examsScheduledService`
- `useContracts` → criar `contractsService`
- `useSelective` → criar `selectiveService`
- `useAcademicMerit` → criar `academicMeritService`

**Nota:** Consultar Swagger em `http://186.248.135.172:31535/swagger` para endpoints exatos

---

### **Fase 5: Tratamento de Erros Aprimorado** (Prioridade: 🟢 BAIXA)

#### 5.1. Criar Hook useApiError

**Novo arquivo:** `src/hooks/useApiError.ts`

```typescript
import { useState } from "react";

interface ApiError {
  message: string;
  statusCode: number;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = (err: any) => {
    if (err.response) {
      setError({
        message: err.response.data?.message || "Erro desconhecido",
        statusCode: err.response.status,
      });
    } else {
      setError({
        message: "Erro de conexão",
        statusCode: 0,
      });
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};
```

---

#### 5.2. Adicionar ErrorBoundary

**Novo arquivo:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Container, Typography, Button } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Algo deu errado
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {this.state.error?.message || "Erro desconhecido"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
```

---

## 📅 Ordem de Implementação

### Sprint 1: Autenticação Funcional (1-2 dias)
1. ✅ Atualizar interfaces (`authInterfaces.ts`)
2. ✅ Atualizar `authService.ts`
3. ✅ Atualizar `useAuth.ts` hook
4. ✅ Adicionar função `decodeJWT`
5. ✅ Atualizar refresh token no store
6. ✅ Atualizar componente Login
7. ✅ Remover/desabilitar registro
8. ✅ **TESTAR LOGIN COMPLETO**

### Sprint 2: Segurança (1 dia)
1. ✅ Ativar `AuthMiddleware` nas rotas
2. ✅ Criar `RoleGuard`
3. ✅ Criar página Unauthorized
4. ✅ Proteger rotas administrativas
5. ✅ **TESTAR PROTEÇÃO DE ROTAS**

### Sprint 3: Gestão de Perfil (2-3 dias)
1. ✅ Criar `userProfileService`
2. ✅ Criar hook `useUserProfile`
3. ✅ Atualizar `CreateProfileModal`
4. ✅ Atualizar página `MeuPerfil`
5. ✅ Implementar upload de foto
6. ✅ **TESTAR CRIAÇÃO/EDIÇÃO DE PERFIL**

### Sprint 4: Integração de Dados (3-5 dias)
1. ✅ Criar services para cada módulo
2. ✅ Atualizar hooks mockados
3. ✅ Integrar componentes com APIs reais
4. ✅ **TESTAR CADA MÓDULO**

### Sprint 5: Tratamento de Erros e Polimento (1-2 dias)
1. ✅ Implementar `useApiError`
2. ✅ Adicionar `ErrorBoundary`
3. ✅ Melhorar mensagens de erro
4. ✅ Adicionar loading states
5. ✅ **TESTAR FLUXOS DE ERRO**

---

## ✅ Checklist de Implementação

### Autenticação
- [ ] Atualizar `LoginPayload` para usar `credential`
- [ ] Atualizar `LoginResponse` para usar `accessToken` e `refreshToken`
- [ ] Remover `user` da resposta de login
- [ ] Adicionar função `decodeJWT` para extrair dados do usuário
- [ ] Atualizar endpoint de login (remover barra final)
- [ ] Atualizar endpoint de refresh token (`/auth/refresh-token`)
- [ ] Atualizar campo de refresh token (`refreshToken`)
- [ ] Atualizar interface `User` para incluir `roles` como array
- [ ] Remover/desabilitar página de registro
- [ ] Remover rota de registro
- [ ] Testar login com usuário de teste (`luke@pectecbh.com.br` / `qweasd32`)
- [ ] Testar refresh token automático
- [ ] Testar logout

### Proteção de Rotas
- [ ] Envolver rotas protegidas com `AuthMiddleware`
- [ ] Criar componente `RoleGuard`
- [ ] Criar página Unauthorized
- [ ] Adicionar rota `/nao-autorizado`
- [ ] Proteger rotas administrativas com roles
- [ ] Testar acesso sem autenticação (deve redirecionar para login)
- [ ] Testar acesso sem permissão (deve redirecionar para Unauthorized)

### Gestão de Perfil
- [ ] Criar `userProfileService` com métodos:
  - [ ] `list()`
  - [ ] `create()`
  - [ ] `uploadPhoto()`
  - [ ] `getMyProfile()` (workaround)
- [ ] Criar hook `useUserProfile`
- [ ] Atualizar `CreateProfileModal` para usar API
- [ ] Atualizar `MeuPerfil` para buscar dados da API
- [ ] Implementar upload de foto com FormData
- [ ] Remover armazenamento em localStorage
- [ ] Testar criação de perfil
- [ ] Testar edição de perfil
- [ ] Testar upload de foto

### Outros Módulos
- [ ] Criar `citiesService` e atualizar `useCities`
- [ ] Criar `examsService` e atualizar `useExams`
- [ ] Criar `enemResultsService` e atualizar `useEnemResults`
- [ ] Criar `examsScheduledService` e atualizar `useExamsScheduled`
- [ ] Criar `contractsService` e atualizar `useContracts`
- [ ] Criar `selectiveService` e atualizar `useSelective`
- [ ] Criar `academicMeritService` e atualizar `useAcademicMerit`

### Tratamento de Erros
- [ ] Criar hook `useApiError`
- [ ] Adicionar `ErrorBoundary` na raiz da aplicação
- [ ] Melhorar mensagens de erro em formulários
- [ ] Adicionar loading states em todas as requisições
- [ ] Adicionar toasts/snackbars para feedback de ações

### Testes
- [ ] Testar login com credenciais válidas
- [ ] Testar login com credenciais inválidas
- [ ] Testar conta suspensa
- [ ] Testar conta sem roles
- [ ] Testar refresh token automático (deixar token expirar)
- [ ] Testar logout
- [ ] Testar acesso a rotas protegidas sem autenticação
- [ ] Testar acesso a rotas administrativas sem permissão
- [ ] Testar criação de perfil
- [ ] Testar edição de perfil
- [ ] Testar upload de foto
- [ ] Testar listagem de dados (cidades, exames, etc.)
- [ ] Testar paginação
- [ ] Testar busca/filtros
- [ ] Testar tratamento de erros de rede

---

## 🚨 Problemas Conhecidos e Limitações

### 1. Perfil de Usuário
**Problema:** Backend não possui endpoint `/user/user-profiles/me` para usuários comuns obterem seu próprio perfil.

**Soluções:**
- **Temporária:** Usar workaround com `getMyProfile()` que busca todos os perfis e filtra pelo `user_id`
- **Ideal:** Solicitar ao backend a criação de endpoints:
  - `GET /user/user-profiles/me`
  - `POST /user/user-profiles`
  - `PATCH /user/user-profiles/me`
  - `POST /user/user-profiles/me/upload-photo`

### 2. Registro de Usuários
**Problema:** Backend não possui endpoint público de registro.

**Solução:** Apenas administradores podem criar usuários através de `POST /admin/users`

### 3. Multipart Upload
**Problema:** Upload de foto requer `multipart/form-data` e não pode usar JSON.

**Solução:** Usar `FormData` e **NÃO definir** `Content-Type` manualmente (navegador define automaticamente)

### 4. Paginação
**Observação:** Backend retorna estrutura de paginação diferente em alguns endpoints:
```typescript
// Alguns endpoints
{ data: [], meta: { page, size, total, totalPages } }

// Outros endpoints
{ data: [], currentPage, itemsPerPage, totalItems, totalPages }
```

**Solução:** Adaptar cada service conforme a estrutura retornada

---

## 📚 Recursos Adicionais

### Documentação
- **Swagger:** http://186.248.135.172:31535/swagger
- **API Base URL:** http://186.248.135.172:31535
- **Contrato API:** `api-documentation.json`
- **Correções:** `CORRECOES_CONTRATO_API.md`
- **Guia de Integração:** `INTEGRACAO_BACKEND.md`

### Usuário de Teste
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

## 🎯 Próximos Passos

1. **Revisar este plano** com a equipe
2. **Priorizar sprints** conforme necessidade do negócio
3. **Começar pela Sprint 1** (Autenticação Funcional)
4. **Testar cada fase** antes de prosseguir
5. **Documentar problemas** encontrados durante a implementação
6. **Solicitar ajustes no backend** se necessário (especialmente endpoints de perfil)

---

**Última atualização:** 2026-01-08
