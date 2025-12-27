# Documento de Integração Backend - Sistema Backoffice

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Sistema de Autenticação](#sistema-de-autenticação)
3. [Modal de Criação de Perfil](#modal-de-criação-de-perfil)
4. [Integração das Páginas Internas](#integração-das-páginas-internas)
5. [Logout](#logout)
6. [Estrutura de Dados](#estrutura-de-dados)

---

## 🎯 Visão Geral

Este documento descreve os passos necessários para integrar o front-end do sistema backoffice com as APIs do backend. O sistema está atualmente utilizando **dados mockados** para facilitar a visualização e desenvolvimento dos componentes internos.

### ⚠️ Importante: Sistema de Login Comentado

O sistema de login está **comentado/desabilitado** para facilitar a visualização dos componentes internos do sistema sem necessidade de autenticação. **É altamente recomendável que a integração comece pelo sistema de autenticação**, pois ele é a base para todas as outras funcionalidades.

---

## 🔐 Sistema de Autenticação

### Localização dos Arquivos
- **Página de Login**: `src/pages/authPages/login/Login.tsx`
- **Hook de Autenticação**: `src/hooks/useAuth.ts`
- **Serviço de Autenticação**: `src/core/http/services/authService.ts`
- **Provider de Autenticação**: `src/app/providers/AuthProvider.tsx`

### Endpoint Esperado

**POST** `/auth/login`

**Request Body:**
```json
{
  "credential": "12345678901",  // CPF sem máscara (11 dígitos)
  "password": "senha123"
}
```

**Response Esperada:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "username": "joao.silva",
    "role": "admin" // ou "monitor"
  }
}
```

### Passos para Integração

1. **Descomentar/Ativar o sistema de login**:
   - Verificar se há rotas protegidas que precisam ser ajustadas
   - Garantir que o `AuthProvider` está envolvendo a aplicação

2. **Atualizar `authService.ts`**:
   - O arquivo já está preparado para fazer a chamada à API
   - Verificar se a URL base da API está configurada corretamente
   - Ajustar o endpoint se necessário

3. **Implementar tratamento de erros**:
   - Credenciais inválidas
   - Usuário inativo
   - Erros de rede

4. **Implementar refresh token**:
   - O sistema já possui estrutura para refresh token
   - Implementar lógica de renovação automática quando o access token expirar

### Validações no Front-end
- CPF deve ter 11 dígitos (sem máscara)
- Senha é obrigatória
- Formato de CPF é validado antes do envio

---

## 👤 Modal de Criação de Perfil (Primeiro Login)

### Localização dos Arquivos
- **Modal**: `src/components/modals/CreateProfileModal.tsx`
- **Integração**: `src/components/layout/AppLayout.tsx` (linhas 30-67)

### Fluxo de Funcionamento

1. Após o login bem-sucedido, o sistema verifica se o usuário possui perfil completo
2. Se não possuir, o modal de criação de perfil é exibido automaticamente
3. O usuário preenche os dados em etapas (com os dados pessoais que serão usados para a criação do perfil)
4. Após completar, o perfil é criado e o modal é fechado

### Endpoint Esperado

**POST** `/user-profiles/`

**Request Body:**
```json
{
  "cpf": "12345678901",
  "personal_email": "email.pessoal@example.com",
  "bio": "Biografia do usuário",
  "birth_date": "1990-01-15",
  "hire_date": "2024-01-01",
  "occupation": "Agente de Sucesso",
  "department": "Sucesso do Aluno",
  "equipment_patrimony": "12345",
  "work_location": "Rua Tome de Souza 810 - 5º andar",
  "manager": "Mariana"
}
```

**Response Esperada:**
```json
{
  "id": 1,
  "cpf": "12345678901",
  "personal_email": "email.pessoal@example.com",
  "bio": "Biografia do usuário",
  "birth_date": "1990-01-15",
  "hire_date": "2024-01-01",
  "occupation": "Agente de Sucesso",
  "department": "Sucesso do Aluno",
  "equipment_patrimony": "12345",
  "work_location": "Rua Tome de Souza 810 - 5º andar",
  "manager": "Mariana",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### Endpoint para Upload de Foto (se estiver liberado o armazenamento de imagens)

**POST** `/user-profiles/{id}/upload-photo`

**Request:**
- Content-Type: `multipart/form-data`
- Body: arquivo de imagem (máximo 1MB)

**Response Esperada:**
```json
{
  "id": 1,
  "profile_photo": "https://api.example.com/media/profiles/photo_123.jpg",
  "updated_at": "2024-01-01T10:05:00Z"
}
```

### Endpoint para Verificar se Usuário Tem Perfil

**GET** `/user-profiles/me/`

**Response (se tiver perfil):**
```json
{
  "id": 1,
  "cpf": "12345678901",
  // ... outros campos
}
```

**Response (se não tiver perfil):**
```json
{
  "detail": "Not found."
}
```
ou status `404`

### Passos para Integração

1. **Atualizar `AppLayout.tsx`**:
   - Substituir a verificação mockada (linha 39) por uma chamada real à API
   - Implementar `handleCreateProfile` para chamar o endpoint de criação
   - Implementar `handleUploadPhoto` para fazer upload da foto

2. **Validações**:
   - CPF deve ser único
   - E-mail pessoal deve ser válido
   - Datas devem estar no formato ISO (YYYY-MM-DD)
   - Patrimônio deve ter entre 4 e 6 dígitos (se informado)

3. **Tratamento de Erros**:
   - CPF já cadastrado
   - Campos obrigatórios faltando
   - Erros de validação

---

## 📄 Integração das Páginas Internas

### Cards Gerais

#### 1. Seletivo
**Arquivo**: `src/pages/seletivo/Seletivo.tsx`  
**Hook**: `src/hooks/useSelective.ts`

**Endpoint Esperado:**
- **GET** `/selective/` - Listar processos seletivos

**Dados Mockados Atuais:**
- Lista de processos seletivos com status, datas, etc.

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Processo Seletivo 2024",
      "status": "active",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "city": {
        "id": 1,
        "name": "São Paulo",
        "uf": "SP"
      }
    }
  ],
  "count": 10
}
```

---

#### 2. Lista de Presença
**Arquivo**: `src/pages/listaPresenca/ListaPresenca.tsx`  
**Hook**: `src/hooks/useExamsScheduled.ts`

**Endpoint Esperado:**
- **GET** `/exams-scheduled/` - Listar provas agendadas

**Dados Mockados Atuais:**
- Lista de provas com datas, horários, locais

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "exam_date": "2024-02-15",
      "exam_time": "14:00",
      "location": "Escola Municipal",
      "city": {
        "id": 1,
        "name": "São Paulo"
      },
      "status": "scheduled"
    }
  ]
}
```

---

#### 3. Aprovação Mérito
**Arquivo**: `src/pages/aprovacaoMerito/AprovacaoMerito.tsx`  
**Hook**: `src/hooks/useAcademicMerit.ts`

**Endpoint Esperado:**
- **GET** `/academic-merit/` - Listar aprovações de mérito
- **PATCH** `/academic-merit/{id}/` - Atualizar status de aprovação

**Dados Mockados Atuais:**
- Lista de candidatos com status de mérito

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "candidate": {
        "id": 1,
        "name": "João Silva",
        "cpf": "12345678901"
      },
      "status": "pending",
      "score": 850.5,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

#### 4. Resultado das Provas
**Arquivo**: `src/pages/resultadoProvas/ResultadoProvas.tsx`  
**Hook**: `src/hooks/useExams.ts`

**Endpoint Esperado:**
- **GET** `/exams/` - Listar resultados de provas

**Dados Mockados Atuais:**
- Lista de resultados com notas, status

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "name": "João Silva",
        "registration": "2024001"
      },
      "exam": {
        "id": 1,
        "name": "Prova de Matemática"
      },
      "score": 85.5,
      "status": "approved",
      "exam_date": "2024-02-15"
    }
  ]
}
```

---

#### 5. Resultados Mérito
**Arquivo**: `src/pages/resultadosMerito/ResultadosMerito.tsx`  
**Hook**: `src/hooks/useAcademicMerit.ts`

**Endpoint Esperado:**
- **GET** `/academic-merit/results/` - Listar resultados de mérito

**Dados Mockados Atuais:**
- Lista de resultados de mérito aprovados

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "candidate": {
        "id": 1,
        "name": "João Silva"
      },
      "score": 850.5,
      "status": "approved",
      "approved_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### 6. Resultados ENEM
**Arquivo**: `src/pages/resultadosEnem/ResultadosEnem.tsx`

**Endpoint Esperado:**
- **GET** `/enem-results/` - Listar resultados do ENEM
- **PATCH** `/enem-results/{id}/` - Atualizar status

**Dados Mockados Atuais:**
- Lista de resultados ENEM com status

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "candidate": {
        "id": 1,
        "name": "João Silva",
        "cpf": "12345678901"
      },
      "enem_score": 750.5,
      "status": "pending",
      "year": 2023
    }
  ]
}
```

---

#### 7. Dados de Alunos
**Arquivo**: `src/pages/dadosAlunos/DadosAlunos.tsx`

**Endpoints Esperados:**
- **GET** `/students/` - Listar alunos novos
- **GET** `https://form.pdinfinita.com.br/enrolled` - Listar alunos antigos (API externa)
  - Header: `api-key: Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=`
- **PATCH** `/students/{id}/` - Atualizar dados do aluno

**Dados Mockados Atuais:**
- Lista de alunos com dados completos
- Integração parcial com API externa para dados antigos

**Estrutura de Dados Esperada (Alunos Novos):**
```json
{
  "results": [
    {
      "id": 1,
      "registration": "2024001",
      "corp_email": "aluno@example.com",
      "status": "active",
      "user_data": {
        "id": 1,
        "user": {
          "id": 1,
          "first_name": "João",
          "last_name": "Silva",
          "username": "joao.silva"
        },
        "cpf": "12345678901",
        "birth_date": "2000-01-15"
      }
    }
  ]
}
```

**Estrutura de Dados Esperada (Alunos Antigos - API Externa):**
```json
[
  {
    "id": "1",
    "nomeCompleto": "João Silva",
    "registrationCode": "2023001",
    "emailPd": "aluno@example.com",
    "cpf": "12345678901",
    "dataNasc": "15/01/2000",
    "status": "Ativo",
    "agenteDoSucesso": "maria.santos"
  }
]
```

**Payload para Atualizar Aluno:**
```json
{
  "registration": "2024001",
  "corp_email": "novoemail@example.com",
  "status": "active"
}
```
⚠️ **Importante**: O campo `monitor` não deve ser enviado no payload de atualização.

---

#### 8. Cadastro de Alunos
**Arquivo**: `src/pages/cadastroAlunos/CadastroAlunos.tsx`

**Endpoints Esperados:**
- **GET** `/users/` - Buscar usuário por CPF (para auto-preenchimento)
- **POST** `/students/` - Criar novo aluno
- **GET** `/user-profiles/` - Listar monitores/agentes de sucesso

**Dados Mockados Atuais:**
- Formulário de cadastro com validação
- Auto-preenchimento baseado em CPF

**Payload para Criar Aluno:**
```json
{
  "user_data": 1,  // ID do usuário encontrado pelo CPF
  "registration": "2024001",
  "corp_email": "aluno@example.com",
  "status": "active"
}
```

**Response Esperada:**
```json
{
  "id": 1,
  "registration": "2024001",
  "corp_email": "aluno@example.com",
  "status": "active",
  "user_data": {
    "id": 1,
    "user": {
      "id": 1,
      "first_name": "João",
      "last_name": "Silva"
    }
  },
  "created_at": "2024-01-01T10:00:00Z"
}
```

---

#### 9. Retenção
**Arquivo**: `src/pages/retencao/Retencao.tsx`

**Endpoint Esperado:**
- **GET** `/retention/` - Listar alunos em retenção

**Dados Mockados Atuais:**
- Lista de alunos com status de retenção

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "name": "João Silva",
        "registration": "2024001"
      },
      "retention_reason": "Baixa frequência",
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### Cards de Admin

#### 10. Cidades
**Arquivo**: `src/pages/cidades/Cidades.tsx`  
**Hook**: `src/hooks/useCities.ts`

**Endpoints Esperados:**
- **GET** `/cities/` - Listar cidades
- **POST** `/cities/` - Criar cidade
- **PATCH** `/cities/{id}/` - Atualizar cidade

**Dados Mockados Atuais:**
- CRUD completo de cidades

**Payload para Criar/Atualizar Cidade:**
```json
{
  "localidade": "São Paulo",
  "uf": "SP",
  "active": true,
  "logo": "<File>",  // multipart/form-data
  "edital": "<File>" // multipart/form-data (PDF)
}
```

**Response Esperada:**
```json
{
  "id": 1,
  "localidade": "São Paulo",
  "uf": "SP",
  "active": true,
  "logo": "https://api.example.com/media/cities/logo_sp.jpg",
  "edital": "https://api.example.com/media/cities/edital_sp.pdf",
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Validações:**
- Logo: apenas imagens (jpg, png, etc.)
- Edital: apenas PDFs

---

#### 11. Contratos
**Arquivo**: `src/pages/contratos/Contratos.tsx`  
**Hook**: `src/hooks/useContracts.ts`

**Endpoint Esperado:**
- **GET** `/contracts/` - Listar contratos

**Dados Mockados Atuais:**
- Lista de contratos com status

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "user_data": {
        "id": 1,
        "cpf": "12345678901",
        "user": {
          "id": 1,
          "first_name": "João",
          "last_name": "Silva"
        }
      },
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

#### 12. Visualização de Documentos
**Arquivo**: `src/pages/documentos/Documentos.tsx`  
**Hook**: `src/pages/documentos/useDocuments.ts`

**Endpoints Esperados:**
- **GET** `/documents/` - Listar documentos
- **POST** `/documents/{id}/upload-id/` - Upload de identidade
- **POST** `/documents/{id}/upload-address/` - Upload de comprovante de endereço
- **POST** `/documents/{id}/upload-school-history/` - Upload de histórico escolar

**Dados Mockados Atuais:**
- Lista de documentos com status de upload

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "João Silva",
        "username": "joao.silva"
      },
      "identity_document": "https://api.example.com/media/documents/id_123.pdf",
      "address_document": null,
      "school_history": null,
      "contract_document": "https://api.example.com/media/documents/contract_123.pdf",
      "submitted_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Upload de Documentos:**
- Content-Type: `multipart/form-data`
- Body: arquivo (PDF ou imagem)

---

#### 13. Usuários
**Arquivo**: `src/pages/usuarios/Usuarios.tsx`

**Endpoint Esperado:**
- **GET** `/user-profiles/` - Listar perfis de usuários

**Dados Mockados Atuais:**
- Lista de usuários com fotos de perfil

**Estrutura de Dados Esperada:**
```json
{
  "results": [
    {
      "id": 1,
      "user_display": {
        "id": 1,
        "first_name": "João",
        "last_name": "Silva",
        "email": "joao@example.com",
        "username": "joao.silva"
      },
      "profile_photo": "https://api.example.com/media/profiles/photo_123.jpg",
      "cpf": "12345678901",
      "occupation": "Agente de Sucesso"
    }
  ]
}
```

---

#### 14. Meu Perfil
**Arquivo**: `src/pages/meuPerfil/MeuPerfil.tsx`

**Endpoints Esperados:**
- **GET** `/user-profiles/me/` - Obter perfil do usuário logado
- **PATCH** `/user-profiles/me/` - Atualizar perfil do usuário logado
- **POST** `/user-profiles/me/upload-photo/` - Upload de foto de perfil

**Dados Mockados Atuais:**
- Visualização e edição do próprio perfil

**Estrutura de Dados Esperada:**
```json
{
  "id": 1,
  "cpf": "12345678901",
  "personal_email": "email@example.com",
  "bio": "Biografia",
  "birth_date": "1990-01-15",
  "hire_date": "2024-01-01",
  "occupation": "Agente de Sucesso",
  "department": "Sucesso do Aluno",
  "equipment_patrimony": "12345",
  "work_location": "Rua Tome de Souza 810 - 5º andar",
  "manager": "Mariana",
  "profile_photo": "https://api.example.com/media/profiles/photo_123.jpg",
  "user_display": {
    "id": 1,
    "first_name": "João",
    "last_name": "Silva",
    "email": "joao@example.com",
    "username": "joao.silva"
  },
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Payload para Atualizar Perfil:**
```json
{
  "personal_email": "novoemail@example.com",
  "bio": "Nova biografia",
  "birth_date": "1990-01-15",
  "hire_date": "2024-01-01",
  "occupation": "Gestor",
  "department": "Administrativo",
  "equipment_patrimony": "12345",
  "work_location": "Remoto",
  "manager": "Maycon"
}
```

---

## 🚪 Logout

### Localização
- **Componente**: `src/components/ui/header/Header.tsx` (linha 131)
- **Provider**: `src/app/providers/AuthProvider.tsx` (método `logout`)
- **Hook**: `src/hooks/useAuth.ts` (método `logout`)

### Funcionalidade Atual
O botão "Sair" no menu do header atualmente apenas fecha o menu (`handleMenuClose`), mas não realiza logout. É necessário implementar a funcionalidade completa de logout.

### Endpoint Esperado (Opcional)
**POST** `/auth/logout/`

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Response Esperada:**
```json
{
  "detail": "Logout realizado com sucesso"
}
```

**Nota**: Se o backend não implementar endpoint de logout, ainda é possível fazer logout apenas limpando os dados localmente.

### Passos para Integração

1. **Adicionar método de logout no `authService.ts`**:
```typescript
// src/core/http/services/authService.ts
export const authService = {
  // ... outros métodos
  logout: () =>
    httpClient.post(API_URL, '/auth/logout/', {}),
};
```

2. **Atualizar `Header.tsx`**:
   - Importar `useAuth` e `useNavigate`
   - Adicionar função `handleLogout` que:
     - Chama o endpoint de logout (se implementado)
     - Chama `logout()` do `AuthProvider` para limpar dados localmente
     - Redireciona para página de login
   - Conectar o botão "Sair" à função `handleLogout`

**Código sugerido para `Header.tsx`**:
```typescript
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router';
import { APP_ROUTES } from '../../../util/constants';

// Dentro do componente:
const { logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  handleMenuClose(); // Fecha o menu primeiro
  try {
    // Tentar fazer logout na API (opcional)
    await authService.logout();
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error);
    // Continuar mesmo se falhar
  } finally {
    // Sempre limpar dados localmente
    logout();
    navigate(APP_ROUTES.LOGIN);
  }
};

// No MenuItem:
<MenuItem onClick={handleLogout}>Sair</MenuItem>
```

3. **Verificar `AuthProvider.tsx`**:
   - O método `logout` já deve estar implementado e limpar:
     - Access token
     - Refresh token
     - Dados do usuário
     - Estado de autenticação

4. **Tratamento de Erros**:
   - Se o logout falhar na API, ainda assim limpar os dados localmente
   - Redirecionar para login mesmo em caso de erro
   - Não bloquear o logout se a API estiver indisponível

### Comportamento Esperado
Após clicar em "Sair":
1. Menu fecha
2. Requisição de logout é enviada (se endpoint existir)
3. Tokens são removidos do estado/localStorage
4. Dados do usuário são limpos
5. Usuário é redirecionado para `/login`

---

## 📊 Estrutura de Dados

### Autenticação
- **Access Token**: JWT com informações do usuário
- **Refresh Token**: Token para renovação do access token
- **User**: Objeto com dados básicos do usuário (id, email, nome, role)

### Perfil de Usuário
- Campos obrigatórios: `cpf`, `personal_email`
- Campos opcionais: `bio`, `birth_date`, `hire_date`, `occupation`, `department`, `equipment_patrimony`, `work_location`, `manager`

### Paginação
A maioria dos endpoints deve suportar paginação usando o padrão:
```json
{
  "results": [...],
  "count": 100,
  "next": "https://api.example.com/endpoint/?page=2",
  "previous": null
}
```

### Filtros e Busca
- Muitas páginas possuem funcionalidade de busca/filtro
- Implementar query parameters para filtros (ex: `?search=termo&status=active`)

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente
Certifique-se de configurar:
- `VITE_API_URL`: URL base da API
- `VITE_API_KEY`: Chave da API (se necessário)

### Headers Padrão
Todas as requisições autenticadas devem incluir:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

Para uploads de arquivo:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

---

## ✅ Checklist de Integração

### Fase 1: Autenticação
- [ ] Descomentar/ativar sistema de login
- [ ] Implementar endpoint de login
- [ ] Implementar refresh token
- [ ] Testar fluxo completo de autenticação

### Fase 2: Perfil
- [ ] Implementar verificação de perfil existente
- [ ] Implementar criação de perfil
- [ ] Implementar upload de foto de perfil
- [ ] Testar modal de criação de perfil

### Fase 3: Páginas Internas
- [ ] Seletivo
- [ ] Lista de Presença
- [ ] Aprovação Mérito
- [ ] Resultado das Provas
- [ ] Resultados Mérito
- [ ] Resultados ENEM
- [ ] Dados de Alunos
- [ ] Cadastro de Alunos
- [ ] Retenção
- [ ] Cidades
- [ ] Contratos
- [ ] Visualização de Documentos
- [ ] Usuários
- [ ] Meu Perfil

### Fase 4: Logout
- [ ] Implementar endpoint de logout (opcional)
- [ ] Implementar função de logout no front-end
- [ ] Testar logout completo

---

## 📝 Notas Importantes

1. **Dados Mockados**: Todos os dados atuais são mockados. Substitua gradualmente pelas chamadas reais à API.

2. **Tratamento de Erros**: Implemente tratamento adequado de erros em todas as chamadas à API, exibindo mensagens amigáveis ao usuário.

3. **Loading States**: Mantenha os estados de loading já implementados no front-end durante as chamadas à API.

4. **Validações**: O front-end já possui validações básicas. O backend deve validar todos os dados antes de processar.

5. **Segurança**: Sempre valide tokens e permissões no backend. Não confie apenas nas validações do front-end.

6. **Performance**: Considere implementar cache onde apropriado e paginação para listas grandes.

---

## 📞 Suporte

Em caso de dúvidas sobre a integração, consulte:
- Código-fonte dos hooks em `src/hooks/`
- Serviços HTTP em `src/core/http/services/`
- Interfaces de dados em `src/interfaces/`

---

## 🧪 Testes e Validação

### Ordem Recomendada de Testes

1. **Teste de Autenticação**:
   - Login com credenciais válidas
   - Login com credenciais inválidas
   - Verificação de tokens no localStorage
   - Refresh token automático

2. **Teste de Perfil**:
   - Primeiro login (deve mostrar modal)
   - Preenchimento completo do perfil
   - Upload de foto
   - Segundo login (não deve mostrar modal)

3. **Teste de Páginas**:
   - Acessar cada página após login
   - Verificar carregamento de dados
   - Testar funcionalidades CRUD
   - Testar filtros e buscas

4. **Teste de Logout**:
   - Clicar em "Sair"
   - Verificar limpeza de dados
   - Verificar redirecionamento

### Ferramentas Úteis

- **Postman/Insomnia**: Para testar endpoints antes da integração
- **DevTools do Navegador**: Para verificar requisições e respostas
- **React DevTools**: Para debugar estado dos componentes

---

## 💡 Dicas e Boas Práticas

### 1. Tratamento de Erros
- Sempre exiba mensagens de erro amigáveis ao usuário
- Use Snackbars/Alerts do Material-UI para feedback
- Log erros no console para debug (apenas em desenvolvimento)

### 2. Estados de Loading
- Mantenha os estados de loading já implementados
- Use `CircularProgress` durante carregamentos
- Desabilite botões durante requisições

### 3. Validações
- Valide dados no front-end para melhor UX
- Mas sempre valide também no back-end para segurança
- Use os padrões de validação já implementados

### 4. Paginação
- Implemente paginação para listas grandes
- Use os componentes de paginação do DataGrid quando aplicável

### 5. Cache
- Considere cache para dados que não mudam frequentemente
- Use React Query ou similar se necessário

### 6. Segurança
- Nunca exponha tokens ou dados sensíveis no código
- Use variáveis de ambiente para URLs e chaves
- Valide permissões no backend

---

## 📚 Recursos Adicionais

### Estrutura de Pastas
```
src/
├── components/        # Componentes reutilizáveis
├── pages/            # Páginas do sistema
├── hooks/            # Custom hooks (lógica de dados)
├── core/
│   └── http/
│       └── services/ # Serviços de API
├── interfaces/        # Interfaces TypeScript
└── util/             # Utilitários e constantes
```

### Padrões de Código
- Hooks customizados para lógica de dados (ex: `useAuth`, `useCities`)
- Serviços HTTP separados por domínio
- Interfaces TypeScript para tipagem
- Componentes funcionais com hooks

### Convenções
- Nomes de arquivos em PascalCase para componentes
- Nomes de arquivos em camelCase para utilitários
- Rotas definidas em `APP_ROUTES` em `constants.ts`
- Endpoints definidos em `ENDPOINTS` em `constants.ts`

---

## 🔄 Fluxo Completo do Sistema

### 1. Primeiro Acesso
```
Usuário → Login → Verificação de Perfil → Modal de Criação → Dashboard
```

### 2. Acessos Subsequentes
```
Usuário → Login → Dashboard (ou página anterior)
```

### 3. Navegação Interna
```
Dashboard → Páginas Internas → Ações (CRUD) → Feedback → Atualização
```

### 4. Logout
```
Usuário → Clicar "Sair" → Limpar Dados → Redirecionar para Login
```

---

## ⚠️ Pontos de Atenção

1. **API Externa de Alunos Antigos**: 
   - A API `https://form.pdinfinita.com.br/enrolled` é externa
   - Requer API key específica
   - Pode ter estrutura de dados diferente

2. **Upload de Arquivos**:
   - Sempre validar tipo e tamanho no front-end
   - Backend deve validar novamente
   - Limite de 1MB para fotos de perfil

3. **Tokens**:
   - Access tokens têm tempo de expiração
   - Implementar renovação automática com refresh token
   - Tratar erros 401 (não autorizado)

4. **Permissões**:
   - Algumas páginas são apenas para admin
   - Verificar permissões antes de exibir conteúdo
   - Backend deve validar permissões em todas as requisições

---

## 📞 Contato e Suporte

Para dúvidas sobre:
- **Front-end**: Consulte o código-fonte e comentários
- **Estrutura de dados**: Veja os arquivos em `src/interfaces/`
- **Endpoints**: Verifique `src/util/constants.ts` e `src/core/http/services/`

---

