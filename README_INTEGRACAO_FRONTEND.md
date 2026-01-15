# 📚 Documentação Completa - Integração Frontend com API

> **Conjunto completo de documentação para integração do frontend com a API pd-backoffice**

---

## 🎯 Visão Geral

Esta pasta contém toda a documentação necessária para integrar o frontend com a API do sistema pd-backoffice. A documentação está organizada em múltiplos arquivos para facilitar a consulta e o aprendizado.

---

## 📖 Documentos Disponíveis

### 1. 📘 [GUIA_COMPLETO_INTEGRACAO_FRONTEND.md](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md)

**Descrição**: Guia detalhado e completo com todos os endpoints, formatos de dados e exemplos de código.

**Conteúdo**:
- ✅ Informações gerais da API
- ✅ Configuração inicial (cliente HTTP, interceptors)
- ✅ Ordem de implementação recomendada
- ✅ Todos os endpoints organizados por fase
- ✅ Request e Response detalhados
- ✅ Exemplos de código TypeScript/JavaScript
- ✅ Tratamento de erros
- ✅ Boas práticas
- ✅ Troubleshooting

**Quando usar**: 
- Ao iniciar a integração
- Para entender formatos de dados
- Para copiar exemplos de código
- Como referência completa

---

### 2. 🚀 [RESUMO_RAPIDO_ENDPOINTS.md](./RESUMO_RAPIDO_ENDPOINTS.md)

**Descrição**: Referência rápida (cheat sheet) com todos os endpoints em formato de tabela.

**Conteúdo**:
- ✅ Todos os endpoints em formato compacto
- ✅ Request e Response resumidos
- ✅ Exemplos curtos e práticos
- ✅ Valores aceitos (enums)
- ✅ Query parameters comuns

**Quando usar**:
- Como consulta rápida durante o desenvolvimento
- Para lembrar formatos de request
- Para verificar endpoints disponíveis
- Como cola durante codificação

---

### 3. 🎯 [FLUXOS_E_DIAGRAMAS_INTEGRACAO.md](./FLUXOS_E_DIAGRAMAS_INTEGRACAO.md)

**Descrição**: Visualizações e diagramas dos fluxos principais de integração.

**Conteúdo**:
- ✅ Fluxo de autenticação (login, refresh)
- ✅ Fluxo completo de cadastro do candidato
- ✅ Fluxo de agendamento de prova
- ✅ Fluxo de upload de documentos
- ✅ Fluxo de aprovação (admin)
- ✅ Arquitetura multi-tenant
- ✅ Relacionamento entre entidades
- ✅ Máquina de estados do candidato

**Quando usar**:
- Para entender a lógica geral do sistema
- Para visualizar dependências entre entidades
- Para planejar a implementação
- Como documentação visual para a equipe

---

### 4. 📋 [ALL_ROUTES_API_DOCUMENTATION.md](./ALL_ROUTES_API_DOCUMENTATION.md)

**Descrição**: Inventário completo de todas as rotas da API gerado automaticamente.

**Conteúdo**:
- ✅ Lista de todas as rotas por módulo
- ✅ Métodos HTTP
- ✅ Caminhos dos controllers
- ✅ Índice organizado

**Quando usar**:
- Para verificar se uma rota existe
- Para encontrar o controller de uma rota
- Como índice geral da API

---

### 5. 📖 [ROTEIRO_INTEGRACAO_FRONTEND.md](./ROTEIRO_INTEGRACAO_FRONTEND.md)

**Descrição**: Roteiro original de integração com informações essenciais.

**Conteúdo**:
- ✅ Informações gerais
- ✅ Autenticação detalhada
- ✅ Paginação
- ✅ Tratamento de erros
- ✅ Endpoints principais
- ✅ Upload de arquivos (multipart)
- ✅ Exemplos de código
- ✅ Boas práticas

**Quando usar**:
- Como complemento ao guia completo
- Para detalhes sobre autenticação
- Para referência sobre uploads

---

### 6. ⚠️ [CORRECOES_CONTRATO_API.md](./CORRECOES_CONTRATO_API.md)

**Descrição**: Correções importantes sobre o contrato da API.

**Conteúdo**:
- ✅ Formato correto de resposta do login
- ✅ Endpoints de perfil do usuário
- ✅ Upload de foto (formato correto)
- ✅ Logout (não existe endpoint)
- ✅ Problemas identificados
- ✅ Ajustes necessários no frontend

**Quando usar**:
- ⚠️ **LEIA PRIMEIRO** antes de implementar autenticação
- Para evitar erros comuns
- Para entender limitações da API

---

### 7. 🏙️ [TENANT_CITIES_API_DOCUMENTATION.md](./TENANT_CITIES_API_DOCUMENTATION.md)

**Descrição**: Documentação específica do sistema multi-tenant.

**Conteúdo**:
- ✅ Conceito de Tenant Cities
- ✅ Endpoints de tenant cities
- ✅ Isolamento de dados
- ✅ Validação de permissões
- ✅ Boas práticas para multi-tenancy

**Quando usar**:
- Para entender o conceito de tenant
- Ao implementar funcionalidades de admin
- Para gerenciar múltiplas cidades

---

## 🚦 Por Onde Começar?

### Para Desenvolvedores Frontend (Primeira Vez)

```
1. Leia: CORRECOES_CONTRATO_API.md
   ⚠️ Entenda as correções importantes

2. Leia: FLUXOS_E_DIAGRAMAS_INTEGRACAO.md
   🎯 Visualize os fluxos principais

3. Siga: GUIA_COMPLETO_INTEGRACAO_FRONTEND.md
   📘 Implemente seguindo a ordem recomendada

4. Use: RESUMO_RAPIDO_ENDPOINTS.md
   🚀 Como referência rápida durante o desenvolvimento
```

### Para Desenvolvedores Experientes

```
1. Consulte: RESUMO_RAPIDO_ENDPOINTS.md
   🚀 Referência rápida dos endpoints

2. Consulte: FLUXOS_E_DIAGRAMAS_INTEGRACAO.md
   🎯 Quando precisar visualizar fluxos

3. Consulte: GUIA_COMPLETO_INTEGRACAO_FRONTEND.md
   📘 Para detalhes e exemplos específicos
```

### Para Gerentes de Projeto / Tech Leads

```
1. Leia: FLUXOS_E_DIAGRAMAS_INTEGRACAO.md
   🎯 Entenda a arquitetura geral

2. Leia: GUIA_COMPLETO_INTEGRACAO_FRONTEND.md (seção 3)
   📘 Ordem de implementação recomendada

3. Distribua: Documentos conforme necessidade da equipe
```

---

## 📊 Estrutura da Documentação

```
pd-backoffice-api/
│
├── README_INTEGRACAO_FRONTEND.md  ← VOCÊ ESTÁ AQUI
│   (Índice principal)
│
├── GUIA_COMPLETO_INTEGRACAO_FRONTEND.md
│   (📘 Guia completo com todos os detalhes)
│
├── RESUMO_RAPIDO_ENDPOINTS.md
│   (🚀 Cheat sheet para consulta rápida)
│
├── FLUXOS_E_DIAGRAMAS_INTEGRACAO.md
│   (🎯 Diagramas e fluxos visuais)
│
├── ALL_ROUTES_API_DOCUMENTATION.md
│   (📋 Inventário de todas as rotas)
│
├── ROTEIRO_INTEGRACAO_FRONTEND.md
│   (📖 Roteiro original)
│
├── CORRECOES_CONTRATO_API.md
│   (⚠️ Correções importantes - LEIA PRIMEIRO)
│
└── TENANT_CITIES_API_DOCUMENTATION.md
    (🏙️ Documentação do sistema multi-tenant)
```

---

## 🎯 Ordem de Implementação Recomendada

### Fase 1: Autenticação ⚡ (Essencial)
```
✅ Login
✅ Refresh Token
✅ Logout (local)
✅ Verificação de Email (opcional)
```

### Fase 2: Configuração de Tenant Cities 🏙️ (Admin)
```
✅ Listar Tenant Cities
✅ Criar Tenant City
✅ Atualizar Tenant City
✅ Deletar Tenant City
```

### Fase 3: Cadastro de Candidato 👤 (Fluxo Principal)
```
✅ User Data (Dados Básicos)
✅ Endereço
✅ Guardian (se menor de idade)
✅ Persona (Perfil)
✅ Resultado ENEM
✅ Upload de Documentos
✅ Mérito Acadêmico (opcional)
```

### Fase 4: Agendamento de Prova 📅
```
✅ Locais de Prova
✅ Datas de Prova
✅ Horários de Prova
✅ Inscrição do Estudante
```

### Fase 5: Contrato 📝
```
✅ Criar Contrato
✅ Listar Contratos
✅ Visualizar Contrato
```

### Fase 6: Módulos Complementares 🔧
```
✅ FAQs
✅ Upload de Arquivos
✅ Cidades Permitidas
```

---

## 🔗 Links Úteis

### Recursos da API

- **Swagger (Documentação Interativa)**: http://186.248.135.172:31535/swagger
- **Health Check**: http://186.248.135.172:31535/health
- **Base URL Produção**: http://186.248.135.172:31535
- **Base URL Local**: http://localhost:3000

### Credenciais de Teste

```
Email: luke@pectecbh.com.br
Senha: qweasd32
```

⚠️ **Nota**: Apenas para testes. Use credenciais reais em produção.

---

## 📝 Checklist de Integração

Use este checklist para acompanhar o progresso da integração:

### Configuração Inicial
- [ ] Configurar cliente HTTP (Axios/Fetch)
- [ ] Implementar interceptor de autenticação
- [ ] Implementar interceptor de refresh automático
- [ ] Configurar variáveis de ambiente

### Autenticação
- [ ] Implementar função de login
- [ ] Implementar função de logout
- [ ] Implementar decodificação de JWT
- [ ] Implementar verificação de roles
- [ ] Testar fluxo completo de autenticação
- [ ] Testar renovação automática de token

### Cadastro de Candidato
- [ ] Integrar endpoints de User Data
- [ ] Integrar endpoints de Endereço
- [ ] Integrar endpoints de Guardian
- [ ] Integrar endpoints de Persona
- [ ] Integrar endpoints de ENEM
- [ ] Integrar upload de documentos
- [ ] Integrar Mérito Acadêmico
- [ ] Testar fluxo completo de cadastro

### Agendamento de Prova
- [ ] Integrar endpoints de Locais
- [ ] Integrar endpoints de Datas
- [ ] Integrar endpoints de Horários
- [ ] Integrar inscrição de estudante
- [ ] Testar fluxo de agendamento

### Contrato
- [ ] Integrar criação de contrato
- [ ] Integrar listagem de contratos
- [ ] Integrar visualização de contrato
- [ ] Testar geração de PDF

### Geral
- [ ] Implementar tratamento global de erros
- [ ] Implementar loading states
- [ ] Implementar mensagens de erro amigáveis
- [ ] Implementar paginação
- [ ] Testar em diferentes cenários
- [ ] Documentar código
- [ ] Code review

---

## 💡 Dicas de Implementação

### 1. Armazenamento de Tokens
```typescript
// Sempre armazene ambos os tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Extraia informações do JWT
const payload = decodeJWT(accessToken);
localStorage.setItem('userId', payload.sub);
localStorage.setItem('userRoles', JSON.stringify(payload.roles));
localStorage.setItem('tenantCityId', payload.tenant_city_id);
```

### 2. Renovação Automática
```typescript
// Use interceptor no cliente HTTP
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Tentar renovar token
      // Ver GUIA_COMPLETO para implementação completa
    }
    return Promise.reject(error);
  }
);
```

### 3. Tratamento de Erros
```typescript
// Sempre trate erros de forma amigável
try {
  await api.post('/user/user-data', data);
} catch (error) {
  const message = handleApiError(error);
  showToast(message, 'error');
}
```

### 4. Upload de Arquivos
```typescript
// Use FormData para uploads
const formData = new FormData();
formData.append('file', file);
formData.append('user_data_id', userId);
formData.append('type', 'id_doc');

// NÃO defina Content-Type manualmente
await api.post('/user/candidate-documents/upload', formData);
```

### 5. Validação de Permissões
```typescript
// Verifique roles antes de mostrar funcionalidades
const hasRole = (role: string) => {
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  return roles.includes(role);
};

if (hasRole('ADMIN') || hasRole('ADMIN_MASTER')) {
  // Mostrar funcionalidades de admin
}
```

---

## ❓ FAQ - Perguntas Frequentes

### 1. Qual documento devo ler primeiro?

**R**: Comece com [CORRECOES_CONTRATO_API.md](./CORRECOES_CONTRATO_API.md) para entender as correções importantes, depois leia [FLUXOS_E_DIAGRAMAS_INTEGRACAO.md](./FLUXOS_E_DIAGRAMAS_INTEGRACAO.md) para visualizar os fluxos, e finalmente use [GUIA_COMPLETO_INTEGRACAO_FRONTEND.md](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md) como guia de implementação.

---

### 2. Onde encontro exemplos de código?

**R**: O [GUIA_COMPLETO_INTEGRACAO_FRONTEND.md](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md) contém diversos exemplos de código TypeScript/JavaScript prontos para uso.

---

### 3. Como faço upload de arquivos?

**R**: Consulte a seção "Upload de Arquivos" no [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md#62-upload-de-arquivos) ou [ROTEIRO](./ROTEIRO_INTEGRACAO_FRONTEND.md) para exemplos detalhados.

---

### 4. O que é Tenant City?

**R**: Leia [TENANT_CITIES_API_DOCUMENTATION.md](./TENANT_CITIES_API_DOCUMENTATION.md) para entender o conceito de multi-tenancy e como funciona o isolamento de dados por cidade.

---

### 5. Qual é a ordem correta de implementação?

**R**: Siga a ordem recomendada na seção "Ordem de Implementação Recomendada" acima ou consulte a seção 3 do [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md#3-ordem-de-implementação-recomendada).

---

### 6. Como funciona a renovação automática de token?

**R**: Veja o diagrama no [FLUXOS_E_DIAGRAMAS](./FLUXOS_E_DIAGRAMAS_INTEGRACAO.md#12-renovação-automática-de-token) e a implementação no [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md#2-configuração-inicial).

---

### 7. Onde está a documentação Swagger?

**R**: Acesse http://186.248.135.172:31535/swagger para a documentação interativa da API.

---

### 8. Como tratar erros da API?

**R**: Consulte a seção "Tratamento de Erros" no [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md#tratamento-de-erros).

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

| Problema | Documento | Seção |
|----------|-----------|-------|
| Token expira muito rápido | [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md) | Troubleshooting |
| Upload de arquivo falha | [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md) | Upload de Arquivos |
| Erro de CORS | [GUIA_COMPLETO](./GUIA_COMPLETO_INTEGRACAO_FRONTEND.md) | Troubleshooting |
| Credenciais inválidas | [CORRECOES](./CORRECOES_CONTRATO_API.md) | Correções |
| Sem permissão | [TENANT_CITIES](./TENANT_CITIES_API_DOCUMENTATION.md) | Autenticação |

### Para Mais Ajuda

1. Consulte a documentação Swagger: http://186.248.135.172:31535/swagger
2. Verifique os logs do backend
3. Verifique os logs do console do navegador
4. Entre em contato com a equipe de desenvolvimento

---

## 📅 Histórico de Atualizações

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-01-15 | 1.0 | Documentação inicial completa |

---

## 👥 Contribuindo

Para melhorar esta documentação:

1. Identifique gaps ou erros
2. Proponha melhorias
3. Adicione exemplos práticos
4. Mantenha a consistência entre documentos

---

## 📄 Licença

Esta documentação é parte do projeto pd-backoffice e segue a mesma licença do projeto.

---

## 🎯 Objetivo Final

Esta documentação foi criada para:

✅ Facilitar a integração do frontend com a API
✅ Reduzir tempo de desenvolvimento
✅ Evitar erros comuns
✅ Servir como referência durante todo o projeto
✅ Facilitar onboarding de novos desenvolvedores

---

**📚 Boa integração! Se tiver dúvidas, consulte os documentos específicos ou a documentação Swagger.**

**Última atualização:** Janeiro 2026
