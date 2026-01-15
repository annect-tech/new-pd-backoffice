# 🚀 Resumo Rápido - Endpoints da API

> **Referência rápida de todos os endpoints, organizados por módulo**

## 📌 Base URL

```
http://186.248.135.172:31535
```

## 🔑 Autenticação

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/auth/login` | POST | ❌ | Login (retorna accessToken e refreshToken) |
| `/auth/refresh-token` | POST | ❌ | Renovar token |
| `/auth/forgot-password` | POST | ❌ | Recuperar senha |
| `/auth/reset-password` | POST | ❌ | Resetar senha |

### Request Login

```json
{
  "credential": "email/cpf/username",
  "password": "senha123"
}
```

### Response Login

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "uuid-v4..."
}
```

---

## 👤 User Data (Dados do Candidato)

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/user-data` | GET | ✅ | Listar dados de usuários |
| `/user/user-data` | POST | ✅ | Criar dados do usuário |
| `/user/user-data/:id` | GET | ✅ | Buscar por ID |
| `/user/user-data/:id` | PATCH | ✅ | Atualizar dados |
| `/user/user-data/:id` | DELETE | ✅ | Deletar dados |

### Request Criar

```json
{
  "cpf": "12345678900",
  "birth_date": "2000-01-15",
  "celphone": "11999999999",
  "user_id": 123,
  "social_name": "Nome Social",
  "allowed_city_id": 1
}
```

---

## 📍 Endereços

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/addresses` | GET | ✅ | Listar endereços |
| `/user/addresses` | POST | ✅ | Criar endereço |
| `/user/addresses/:id` | GET | ✅ | Buscar por ID |
| `/user/addresses/:id` | PATCH | ✅ | Atualizar |
| `/user/addresses/:id` | DELETE | ✅ | Deletar |

### Request Criar

```json
{
  "user_id": 123,
  "cep": "30130100",
  "logradouro": "Rua Exemplo",
  "numero": "100",
  "complemento": "Apto 201",
  "bairro": "Centro",
  "cidade": "Belo Horizonte",
  "uf": "MG"
}
```

---

## 👥 Guardian (Responsável)

| Endpoint | Método | Auth | Roles |
|----------|--------|------|-------|
| `/admin/guardians` | GET | ✅ | ADMIN |
| `/admin/guardians` | POST | ✅ | ADMIN |
| `/admin/guardians/:id` | PATCH | ✅ | ADMIN |
| `/admin/guardians/:id` | DELETE | ✅ | ADMIN |

### Request Criar

```json
{
  "user_id": 123,
  "relationship": "Pai",
  "name": "João Silva",
  "cpf": "12345678900",
  "nationality": "Brasileiro",
  "cellphone": "11999999999",
  "email": "joao@email.com"
}
```

---

## 🎭 Persona (Perfil)

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/persona` | GET | ✅ | Listar personas |
| `/user/persona` | POST | ✅ | Criar persona |
| `/user/persona/:id` | GET | ✅ | Buscar por ID |
| `/user/persona/:id` | PUT | ✅ | Atualizar |
| `/user/persona/:id` | DELETE | ✅ | Deletar |

### Request Criar

```json
{
  "professional_status": "Trabalho e estudo",
  "experience": "Intermediário",
  "experience_duration": "1-2 anos",
  "programming_knowledge_level": "Básico",
  "motivation_level": "Muito",
  "project_priority": "Alta",
  "weekly_available_hours": "5-8h",
  "study_commitment": "Todos os dias",
  "frustration_handling": "Peço ajuda",
  "auth_user_id": 123
}
```

### Valores Aceitos

```typescript
professional_status: ["Nenhum", "Trabalho", "Estudo", "Trabalho e estudo"]
experience: ["Nenhuma", "Básico", "Intermediário", "Avançado"]
experience_duration: ["Nenhuma", "<1 ano", "1-2 anos", "3-4 anos", ">5 anos"]
programming_knowledge_level: ["Nenhum", "Básico", "Intermediário", "Avançado"]
motivation_level: ["Pouco", "Curioso", "Motivado", "Muito"]
project_priority: ["Baixa", "Média", "Alta"]
weekly_available_hours: ["1-2h", "3-4h", "5-8h", "8-12h", ">12h"]
study_commitment: ["Algumas vezes", "Fins de semana", "Todos os dias"]
frustration_handling: ["Desânimo", "Resolvo sozinho", "Peço ajuda"]
```

---

## 📊 Resultado ENEM

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/enem-results` | GET | ✅ | Listar resultados |
| `/user/enem-results` | POST | ✅ | Criar resultado |
| `/user/enem-results/:id` | GET | ✅ | Buscar por ID |
| `/user/enem-results/:id` | PATCH | ✅ | Atualizar notas |
| `/user/enem-results/:id` | DELETE | ✅ | Deletar |

### Request Criar

```json
{
  "user_id": 123
}
```

### Request Atualizar

```json
{
  "languages_score": 750.5,
  "math_score": 680.0,
  "natural_sciences_score": 720.3,
  "human_sciences_score": 690.8,
  "essay_score": 900.0
}
```

---

## 📄 Documentos do Candidato

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/candidate-documents` | GET | ✅ | Listar documentos |
| `/user/candidate-documents/upload` | POST | ✅ | Upload documento |
| `/user/candidate-documents/:userDataId` | GET | ✅ | Buscar por user data |
| `/user/candidate-documents/:userDataId` | PATCH | ✅ | Atualizar status |
| `/user/candidate-documents/:userDataId` | DELETE | ✅ | Deletar |

### Request Upload (FormData)

```typescript
{
  file: File,
  user_data_id: "123",
  type: "id_doc" | "address_doc" | "school_history_doc" | "contract_doc"
}
```

---

## 🏆 Mérito Acadêmico

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/academic-merit-documents` | POST | ✅ | Criar declaração |
| `/user/academic-merit-documents/:id` | GET | ✅ | Buscar por ID |
| `/user/academic-merit-documents/:id` | PUT | ✅ | Atualizar |
| `/user/academic-merit-documents/:id` | DELETE | ✅ | Deletar |
| `/user/academic-merit-documents/upload` | POST | ✅ | Upload documento |

### Request Criar

```json
{
  "auth_user_data_id": 123,
  "student_name": "Maria Silva",
  "average_grade": "8.5",
  "director_name": "José Diretor",
  "school_name": "Escola Exemplo",
  "school_zip_code": "30130100",
  "school_street": "Rua da Escola",
  "school_neighborhood": "Centro",
  "school_number": "200",
  "school_complement": "Bloco A",
  "city": "Belo Horizonte",
  "issue_date": "2026-01-15"
}
```

---

## 🏫 Locais de Prova

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/user/exam` | GET | ✅ | - | Listar locais |
| `/admin/exam` | POST | ✅ | ADMIN | Criar local |
| `/user/exam/:id` | GET | ✅ | - | Buscar por ID |
| `/admin/exam/:id` | PATCH | ✅ | ADMIN | Atualizar |
| `/admin/exam/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar (Admin)

```json
{
  "name": "Campus Centro",
  "full_address": "Rua Exemplo, 100 - Centro - BH/MG",
  "allowed_city_id": 1
}
```

---

## 📅 Datas de Prova

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/user/exam/dates/:localId` | GET | ✅ | - | Listar datas por local |
| `/admin/exam/dates` | POST | ✅ | ADMIN | Criar datas com horários |
| `/user/exam/date-by-id/:id` | GET | ✅ | - | Buscar por ID |
| `/admin/exam/dates/:id` | PATCH | ✅ | ADMIN | Atualizar |
| `/admin/exam/dates/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar (Admin)

```json
{
  "local_id": 1,
  "schedules": [
    {
      "date": "25/01/2026",
      "hours": ["08:00", "14:00", "18:00"]
    },
    {
      "date": "26/01/2026",
      "hours": ["09:00", "15:00"]
    }
  ]
}
```

---

## ⏰ Horários de Prova

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/user/exam/hours/:dateId` | GET | ✅ | - | Listar horários por data |
| `/admin/exam/hours` | POST | ✅ | ADMIN | Criar horário |
| `/user/exam/hour-by-id/:id` | GET | ✅ | - | Buscar por ID |
| `/admin/exam/hours/:id` | PATCH | ✅ | ADMIN | Atualizar |
| `/admin/exam/hours/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar (Admin)

```json
{
  "exam_date_id": 1,
  "hour": "14:00"
}
```

---

## 🎓 Inscrição na Prova

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/student-exams` | GET | ✅ | Listar inscrições |
| `/user/student-exams` | POST | ✅ | Criar inscrição |
| `/user/student-exams/:id` | PATCH | ✅ | Atualizar |
| `/user/student-exams/:id` | DELETE | ✅ | Deletar |
| `/admin/student-exams/schedule/:localId/:dateId` | GET | ✅ (ADMIN) | Listar por horário |

### Request Criar

```json
{
  "user_data_id": 123,
  "status": "Confirmado",
  "exam_scheduled_hour_id": 5
}
```

---

## 📝 Contrato

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/user/contract` | GET | ✅ | Listar contratos |
| `/user/contract` | POST | ✅ | Criar contrato |
| `/user/contract/:id` | GET | ✅ | Buscar por ID |
| `/user/contract/:id` | PATCH | ✅ | Atualizar |
| `/user/contract/:id` | DELETE | ✅ | Deletar |

### Request Criar

```json
{
  "user_data_id": 123
}
```

---

## ❓ FAQs

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/user/faqs` | GET | ✅ | - | Listar FAQs |
| `/admin/faqs` | GET | ✅ | ADMIN | Listar (admin) |
| `/admin/faqs` | POST | ✅ | ADMIN | Criar FAQ |
| `/admin/faqs/:id` | PUT | ✅ | ADMIN | Atualizar |
| `/admin/faqs/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar (Admin)

```json
{
  "question": "Como me inscrevo?",
  "answer": "Acesse o portal e clique em...",
  "order": 1
}
```

---

## 📤 Upload de Arquivos

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/upload-file/single` | POST | ✅ | Upload único |
| `/upload-file/array` | POST | ✅ | Upload múltiplo |

### Request Upload Único (FormData)

```typescript
{
  file: File
}
```

### Response

```json
{
  "url": "https://s3.../arquivo.pdf",
  "message": "Arquivo enviado com sucesso"
}
```

---

## 🏙️ Tenant Cities

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/admin/tenant-cities` | GET | ✅ | ADMIN | Listar |
| `/admin/tenant-cities` | POST | ✅ | ADMIN | Criar |
| `/admin/tenant-cities/:id` | PATCH | ✅ | ADMIN | Atualizar |
| `/admin/tenant-cities/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar

```json
{
  "domain": "cidade-exemplo.com.br"
}
```

---

## 🌆 Cidades Permitidas

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/admin/allowed-cities` | GET | ✅ | ADMIN | Listar |
| `/admin/allowed-cities` | POST | ✅ | ADMIN | Criar |
| `/admin/allowed-cities/:id` | GET | ✅ | ADMIN | Buscar por ID |
| `/admin/allowed-cities/:id` | PATCH | ✅ | ADMIN | Atualizar |
| `/admin/allowed-cities/:id` | DELETE | ✅ | ADMIN | Deletar |

### Request Criar

```json
{
  "name": "Belo Horizonte",
  "state": "MG",
  "tenant_city_id": "uuid-da-tenant"
}
```

---

## 👥 Usuários (Admin)

| Endpoint | Método | Auth | Roles | Descrição |
|----------|--------|------|-------|-----------|
| `/admin/users` | GET | ✅ | ADMIN | Listar usuários |
| `/admin/users` | POST | ✅ | ADMIN | Criar usuário |
| `/admin/users/:id` | DELETE | ✅ | ADMIN | Deletar |
| `/admin/users/active/:email` | PUT | ✅ | ADMIN | Ativar/Desativar |
| `/admin/users/admin-master` | GET | ✅ | ADMIN | Listar admin masters |

### Request Criar

```json
{
  "username": "usuario123",
  "email": "usuario@email.com",
  "cpf": "12345678900",
  "password": "senha123",
  "tenant_city_id": "uuid-tenant",
  "roles": ["STUDENT"]
}
```

---

## 📧 Verificação de Email

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/email-verification/send-code` | POST | ❌ | Enviar código |
| `/email-verification/verify` | PATCH | ❌ | Verificar código |
| `/email-verification/resend` | POST | ❌ | Reenviar código |

### Request Enviar Código

```json
{
  "email": "usuario@email.com"
}
```

### Request Verificar

```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

---

## 🔄 Query Parameters Comuns

Todos os endpoints de listagem aceitam:

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | number | Número da página | 1 |
| `size` | number | Itens por página | 10 |
| `search` | string | Termo de busca | - |

### Exemplo

```
GET /user/user-data?page=1&size=20&search=maria
```

---

## 📊 Estrutura de Resposta Paginada

```json
{
  "data": [...],
  "currentPage": 1,
  "itemsPerPage": 10,
  "totalItems": 50,
  "totalPages": 5
}
```

---

## ⚠️ Códigos de Status HTTP

| Status | Significado | Ação |
|--------|-------------|------|
| 200 | OK | Sucesso |
| 201 | Created | Recurso criado |
| 400 | Bad Request | Erro de validação |
| 401 | Unauthorized | Token inválido |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Erro no servidor |

---

## 🔑 Roles e Permissões

| Role | Descrição | Acesso |
|------|-----------|--------|
| `ADMIN_MASTER` | Admin master | Acesso total |
| `ADMIN` | Admin padrão | Endpoints /admin/* |
| `LEADER` | Líder | Endpoints /user/* |
| `AGENT_SUCCESS` | Agente | Endpoints /user/* |
| `MONITOR` | Monitor | Endpoints /user/* |
| `STUDENT` | Estudante | Endpoints /user/* |

---

## 💡 Exemplos Rápidos

### Login e Armazenamento de Token

```typescript
const response = await fetch('http://186.248.135.172:31535/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    credential: 'usuario@email.com',
    password: 'senha123'
  })
});

const { accessToken, refreshToken } = await response.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### Requisição Autenticada

```typescript
const token = localStorage.getItem('accessToken');

const response = await fetch('http://186.248.135.172:31535/user/user-data', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Upload de Arquivo

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('user_data_id', '123');
formData.append('type', 'id_doc');

const token = localStorage.getItem('accessToken');

const response = await fetch('http://186.248.135.172:31535/user/candidate-documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NÃO definir Content-Type para multipart/form-data
  },
  body: formData
});

const result = await response.json();
console.log('URL do arquivo:', result.url);
```

---

## 📖 Fluxo Completo de Cadastro

```
1. Login
   POST /auth/login

2. Criar User Data
   POST /user/user-data

3. Criar Endereço
   POST /user/addresses

4. Criar Persona
   POST /user/persona

5. Criar Resultado ENEM
   POST /user/enem-results
   
6. Atualizar Notas ENEM
   PATCH /user/enem-results/:id

7. Upload de Documentos
   POST /user/candidate-documents/upload
   (repetir para cada documento)

8. Inscrever na Prova
   POST /user/student-exams

9. Criar Contrato
   POST /user/contract
```

---

## 🛠️ Utilitários

### Decodificar JWT

```typescript
const decodeJWT = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

const payload = decodeJWT(accessToken);
console.log('User ID:', payload.sub);
console.log('Roles:', payload.roles);
console.log('Tenant:', payload.tenant_city_id);
```

---

## 📚 Links Úteis

- **Swagger**: http://186.248.135.172:31535/swagger
- **Health Check**: http://186.248.135.172:31535/health
- **Guia Completo**: [GUIA_COMPLETO_INTEGRACAO_FRONTEND.md](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md)

---

**Última atualização:** Janeiro 2026
