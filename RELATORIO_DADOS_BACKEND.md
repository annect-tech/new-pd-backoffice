# Relatório de Análise - Dados do Backend para Tabelas

**Data:** Janeiro 2025  
**Objetivo:** Verificar quais páginas estão recebendo dados corretos e completos do backend para exibição em tabelas

---

## ✅ Páginas com Dados Completos e Corretos

### 1. **Contratos**
- **Status:** ✅ OK
- **Dados recebidos:** ID, email do estudante, nome do estudante, status
- **Observações:** Todos os campos necessários para a tabela estão presentes

### 2. **Endereços**
- **Status:** ✅ OK
- **Dados recebidos:** ID, CEP, logradouro, número, bairro, cidade, UF, status
- **Observações:** Dados completos e corretos

### 3. **Usuários**
- **Status:** ✅ OK
- **Dados recebidos:** ID, nome, email, username, status ativo/inativo, foto de perfil
- **Observações:** Dados completos, incluindo informações de perfil quando disponíveis

### 4. **Cidades Permitidas (Allowed Cities)**
- **Status:** ✅ OK
- **Dados recebidos:** ID, nome da cidade, tenant_city_id, data de criação
- **Observações:** Dados completos

### 5. **Tenant Cities**
- **Status:** ✅ OK
- **Dados recebidos:** ID, domínio, data de criação
- **Observações:** Dados completos

### 6. **Documentos**
- **Status:** ✅ OK
- **Dados recebidos:** ID, user_data_id, nome do estudante, documentos (ID, endereço, histórico escolar, contrato), status de cada documento, data de criação
- **Observações:** Dados completos

---

## ⚠️ Páginas com Dados Parciais ou Requerendo Ajustes

### 7. **Seletivo**
- **Status:** ⚠️ PARCIAL
- **Problema:** Endereços (cidade/UF) não vêm no objeto principal da listagem
- **Solução atual:** Frontend faz requisições adicionais para buscar endereços de cada usuário
- **Recomendação Backend:** Incluir `addresses` ou `allowed_city` no objeto retornado pela listagem de usuários do seletivo
- **Dados atuais:** ID, CPF, nome, data nascimento, celular, email
- **Dados faltando na listagem:** Cidade e UF (precisam ser buscados separadamente)

### 8. **Lista de Presença**
- **Status:** ⚠️ PARCIAL
- **Problema:** Dados de usuário (nome, CPF, celular) não vêm no objeto do exame agendado
- **Solução atual:** Frontend busca usuários individualmente usando `user_data_id`
- **Recomendação Backend:** Incluir dados do usuário (`user_data`) com JOIN na resposta da listagem de exames agendados
- **Dados atuais:** ID do exame, status, local, data, hora
- **Dados faltando na listagem:** Nome completo, CPF, celular do usuário

### 9. **Resultado das Provas**
- **Status:** ⚠️ PARCIAL
- **Problema:** Nome e CPF do usuário nem sempre vêm no objeto `user_data` aninhado
- **Solução atual:** Frontend busca todos os usuários e faz merge manual
- **Recomendação Backend:** Garantir que `user_data.user` sempre contenha `first_name`, `last_name` e `cpf` na resposta
- **Dados atuais:** ID, score, status, local, data, hora
- **Dados faltando/inconsistentes:** Nome e CPF do usuário (às vezes vêm, às vezes não)

### 10. **Resultados Mérito**
- **Status:** ⚠️ PARCIAL
- **Problema:** Nome do aluno nem sempre está disponível em `user_data_display.user`
- **Solução atual:** Frontend busca nomes individualmente quando não disponíveis
- **Recomendação Backend:** Garantir que `user_data_display.user` sempre contenha `first_name` e `last_name`
- **Dados atuais:** ID, documento, status, datas
- **Dados faltando/inconsistentes:** Nome do aluno (às vezes disponível, às vezes precisa busca adicional)

### 11. **Resultados ENEM**
- **Status:** ✅ OK
- **Dados recebidos:** ID, número de inscrição, nome, CPF, idioma, status, PDF, data de criação
- **Observações:** Dados completos

### 12. **Aprovação Mérito** ⚠️ CRÍTICO
- **Status:** ❌ PROBLEMAS CRÍTICOS
- **Tipo:** Visualizador de documentos (não é tabela)
- **Problemas Identificados:**
  
  1. **Nome do Candidato Não Disponível:**
     - O backend retorna apenas `user_data_id` na listagem
     - O frontend tenta acessar `user_data_display.user.first_name` e `last_name`, mas esse campo **NÃO EXISTE** na resposta da API
     - Resultado: Nome aparece como "Nome não disponível" na interface
     - **Código afetado:** `AprovacaoMerito.tsx` linha 497-499
  
  2. **Estrutura de Dados Inconsistente:**
     - Backend retorna: `{ id, document, status, user_data_id, created_at, updated_at }`
     - Frontend espera: `{ id, document, status, user_data_id, user_data_display: { user: { first_name, last_name } } }`
     - **DTO atual:** `ListAcademicMeritOutputDto` não inclui dados do usuário
  
  3. **Documento PDF Pode Não Carregar:**
     - Frontend verifica se o documento existe via HEAD request
     - Problemas de CORS ou URL inválida podem impedir visualização
     - **Código afetado:** `AprovacaoMerito.tsx` linhas 44-85
  
  4. **Filtro de Status no Frontend:**
     - Backend não aplica filtro de status na query
     - Frontend faz filtro manual após receber todos os dados
     - **Código afetado:** `useAcademicMerit.ts` linhas 62-66
     - Impacto: Busca 100 registros mas filtra apenas pendentes localmente
  
- **Dados Recebidos do Backend:**
  - ✅ ID do documento
  - ✅ URL do documento PDF
  - ✅ Status (PENDING, APPROVED, REJECTED)
  - ✅ user_data_id
  - ✅ Datas (created_at, updated_at)
  - ❌ **FALTA:** Nome do candidato (first_name, last_name)
  - ❌ **FALTA:** Dados do usuário relacionados
  
- **Solução Atual no Frontend:**
  - Tenta usar `currentMerit?.user_data_display?.user?.first_name` (que não existe)
  - Mostra "Nome não disponível" quando campo não existe
  - Valida `user_data_id` antes de aprovar/reprovar (correto)
  
- **Recomendações Backend (URGENTE):**
  1. **Incluir dados do usuário na listagem:**
     - Modificar `ListAcademicMeritOutputDto` para incluir `user_data_display` com dados do usuário
     - Fazer JOIN com tabela `auth_user_data` ou `seletivo_user_data` para buscar `first_name` e `last_name`
     - Exemplo de estrutura esperada:
     ```typescript
     {
       id: string,
       document: string,
       status: string,
       user_data_id: string,
       user_data_display: {
         user: {
           first_name: string,
           last_name: string
         }
       },
       created_at: Date,
       updated_at: Date
     }
     ```
  
  2. **Aplicar filtro de status no backend:**
     - Aceitar parâmetro `status` na query e filtrar no banco de dados
     - Evitar retornar todos os registros para filtrar no frontend
  
  3. **Validar URL do documento:**
     - Garantir que o campo `document` sempre contenha URL válida e acessível
     - Considerar retornar URL completa se necessário
  
- **Impacto:**
  - ❌ Usuário não consegue identificar o candidato na interface
  - ❌ Experiência do usuário comprometida
  - ⚠️ Funcionalidade de aprovação/reprovação funciona, mas sem contexto visual adequado

### 13. **Dados de Alunos**
- **Status:** ⚠️ PARCIAL
- **Problema:** Precisa fazer merge de duas fontes: `user_data` (dados pessoais) e `student_data` (dados acadêmicos)
- **Solução atual:** Frontend busca ambas as fontes e faz merge manual
- **Recomendação Backend:** Criar endpoint que retorne dados completos do aluno (user_data + student_data) ou incluir student_data no objeto user_data
- **Dados atuais:** Nome, CPF, data nascimento, email, username (de user_data)
- **Dados faltando na listagem:** Matrícula, email corporativo, monitor, status acadêmico (precisam vir de student_data)

### 14. **Cadastro de Alunos**
- **Status:** ℹ️ N/A (página de formulário, não tabela)
- **Observações:** Não aplicável

### 15. **Retenção**
- **Status:** ⚠️ NÃO IMPLEMENTADA
- **Observações:** Página ainda não implementada

---

## 📊 Resumo Geral

| Status | Quantidade | Páginas |
|--------|-----------|---------|
| ✅ OK | 6 | Contratos, Endereços, Usuários, Cidades Permitidas, Tenant Cities, Documentos, Resultados ENEM |
| ⚠️ PARCIAL | 5 | Seletivo, Lista de Presença, Resultado das Provas, Resultados Mérito, Dados de Alunos |
| ❌ CRÍTICO | 1 | Aprovação Mérito |
| ⚠️ NÃO IMPLEMENTADA | 1 | Retenção |
| ℹ️ N/A | 1 | Cadastro de Alunos (formulário) |

---

## 🔧 Recomendações Prioritárias para Backend

### Prioridade CRÍTICA (URGENTE)

1. **Aprovação Mérito** 🔴
   - **Problema:** Nome do candidato não aparece na interface
   - **Solução:** Modificar `ListAcademicMeritOutputDto` para incluir `user_data_display` com dados do usuário (first_name, last_name)
   - **Ação:** Fazer JOIN com tabela de usuários na query de listagem
   - **Impacto:** Interface inutilizável sem identificação do candidato

### Prioridade ALTA

2. **Lista de Presença**
   - Incluir `user_data` completo (com `user.first_name`, `user.last_name`, `user.cpf`, `user.celphone`) na resposta da listagem de exames agendados
   - Fazer JOIN com tabela de usuários

3. **Dados de Alunos**
   - Criar endpoint que retorne dados completos (user_data + student_data) ou incluir student_data no objeto user_data
   - Evitar necessidade de duas requisições separadas

4. **Seletivo**
   - Incluir `addresses` ou `allowed_city` no objeto retornado pela listagem
   - Evitar requisições adicionais para cada usuário

### Prioridade MÉDIA

5. **Resultado das Provas**
   - Garantir que `user_data.user` sempre contenha `first_name`, `last_name` e `cpf`
   - Validar consistência dos dados aninhados

6. **Resultados Mérito**
   - Garantir que `user_data_display.user` sempre contenha `first_name` e `last_name`
   - Validar estrutura de dados retornada

7. **Aprovação Mérito - Filtro de Status**
   - Aplicar filtro de status no backend (query parameter)
   - Evitar retornar todos os registros para filtrar no frontend

---

## 📝 Observações Técnicas

- A maioria das páginas que têm problemas fazem requisições adicionais no frontend para completar os dados
- Isso impacta performance e aumenta a carga no servidor
- A solução ideal é incluir os dados relacionados via JOINs nas queries do backend
- Algumas páginas fazem merge manual de dados de múltiplas fontes, o que pode ser simplificado com endpoints mais completos

---

## 🔍 Análise Técnica Detalhada - Aprovação Mérito

### Problema Principal: Dados do Usuário Ausentes

**Arquivo Backend:** `pd-backoffice-api/src/modules/academic-merit-document/usecases/list-academic-merit/dtos/list-academic-merit.dto.ts`

**Estrutura Atual do DTO:**
```typescript
export class ListAcademicMeritOutputDto {
  id: string;
  document: string;
  status: string;
  user_data_id: string;  // ❌ Apenas o ID, sem dados do usuário
  created_at: Date;
  updated_at: Date;
}
```

**Estrutura Esperada pelo Frontend:**
```typescript
interface AcademicMerit {
  id: string | number;
  document?: string;
  status?: string;
  user_data_id?: string;
  user_data_display?: {  // ❌ Campo não existe no backend
    user?: {
      first_name?: string;
      last_name?: string;
    };
  };
}
```

**Código Frontend Afetado:**
- `AprovacaoMerito.tsx` linha 497-499:
  ```typescript
  {currentMerit?.user_data_display?.user?.first_name || currentMerit?.user_data_display?.user?.last_name
    ? `${currentMerit.user_data_display.user.first_name || ""} ${currentMerit.user_data_display.user.last_name || ""}`.trim()
    : "Nome não disponível"}
  ```

**Solução Proposta para Backend:**

1. **Modificar o Repository** (`academic-merit-prisma.repository.ts`):
   ```typescript
   // Adicionar JOIN com auth_user_data ou seletivo_user_data
   this.prisma.seletivo_academicmeritdocument.findMany({
     include: {
       auth_user_data: {
         include: {
           user: {
             select: {
               first_name: true,
               last_name: true
             }
           }
         }
       }
     }
   })
   ```

2. **Modificar o DTO** (`list-academic-merit.dto.ts`):
   ```typescript
   export class ListAcademicMeritOutputDto {
     id: string;
     document: string;
     status: string;
     user_data_id: string;
     user_data_display?: {  // ✅ Adicionar este campo
       user?: {
         first_name?: string;
         last_name?: string;
       };
     };
     created_at: Date;
     updated_at: Date;
   }
   ```

3. **Aplicar Filtro de Status no Backend:**
   - Modificar `ListAcademicMeritDocuments.execute()` para aceitar e aplicar filtro de status
   - Evitar retornar todos os registros para filtrar no frontend

### Impacto no Frontend

**Antes da Correção:**
- ❌ Nome do candidato sempre aparece como "Nome não disponível"
- ❌ Usuário não consegue identificar qual candidato está revisando
- ⚠️ Funcionalidade de aprovação/reprovação funciona, mas sem contexto

**Após a Correção:**
- ✅ Nome do candidato será exibido corretamente
- ✅ Interface ficará mais informativa e utilizável
- ✅ Melhor experiência do usuário

---

**Gerado por:** Análise automática do código frontend  
**Última atualização:** Janeiro 2025
