# API Explorer - Guia de Uso 🚀

## 📍 Como Acessar

Acesse diretamente no navegador:
```
http://localhost:5100/api-explorer
```

Ou adicione um link no menu lateral do sistema.

## 🎯 O Que é?

Uma página de **teste e visualização** de todos os endpoints da API, permitindo:
- ✅ Testar endpoints sem usar Postman/Insomnia
- ✅ Ver dados do banco em formato JSON ou Tabela
- ✅ Configurar parâmetros de paginação
- ✅ Ver estatísticas (total de itens, páginas, etc.)

## 📋 Endpoints Disponíveis (COMPLETO!)

### 🏥 Health
- **Health Check**: Status de todos os serviços

### 👥 Users
- **Listar Usuários (Tenant)**: Usuários do tenant atual
- **Listar TODOS Usuários**: Todos os usuários sem filtro de tenant
- **Listar Usuários (User)**: Endpoint de usuário comum

### 📋 User Data (Seletivo)
- **Listar User Data (Admin)**: Dados do seletivo (seletivo_userdata)
- **Buscar User Data (Admin)**: Busca por CPF/Data
- **Listar User Data (User)**: Versão user
- **Buscar User Data (User)**: Busca versão user

### 🎓 Student Data
- **Listar Student Data (Admin)**: Dados acadêmicos dos alunos
- **Listar Student Data (User)**: Versão user

### 📝 Student Exams
- **Listar Student Exams (Admin)**: Exames/Provas dos alunos
- **Listar Student Exams (User)**: Versão user

### 📊 ENEM Results
- **Listar ENEM Results (Admin)**: Resultados do ENEM
- **Listar ENEM Results (User)**: Versão user

### 🏆 Academic Merit
- **Listar Academic Merit (Admin)**: Documentos de mérito acadêmico
- **Listar Academic Merit (User)**: Versão user

### 📍 Addresses
- **Listar Addresses (Admin)**: Endereços dos usuários
- **Listar Addresses (User)**: Versão user

### 👨‍👩‍👧 Guardians
- **Listar Guardians (Admin)**: Responsáveis/Guardiões
- **Listar Guardians (User)**: Versão user

### 🎭 Personas
- **Listar Personas (Admin)**: Dados de persona dos usuários
- **Listar Personas (User)**: Versão user

### 🏫 Exam Management
- **Listar Exam Locais (Admin)**: Locais de prova
- **Listar Exam Locais (User)**: Versão user

### 📅 Exam Dates
- **Listar Exam Dates (Admin)**: Datas de um local específico
- **Listar Exam Dates (User)**: Versão user

### 🕐 Exam Hours
- **Listar Exam Hours (Admin)**: Horários de uma data específica
- **Listar Exam Hours (User)**: Versão user

### 📄 Candidate Documents
- **Listar Candidate Documents (Admin)**: Documentos dos candidatos
- **Listar Candidate Documents (User)**: Versão user

### 📜 Contracts
- **Listar Contracts (Admin)**: Todos os contratos gerados
- **Listar Contracts (User)**: Versão user

### 🏙️ Tenant Cities
- **Listar Tenant Cities (Admin)**: Todas as Tenant Cities
- **Listar Tenant Cities (User)**: Versão user

### 🗺️ Allowed Cities
- **Listar Allowed Cities (Admin)**: Cidades permitidas
- **Listar Allowed Cities (User)**: Versão user

### 👤 User Profiles
- **Listar User Profiles (Admin)**: Perfis de usuários
- **Listar User Profiles (User)**: Versão user

### 📝 Registration Data
- **Listar Registration Data (Admin)**: Dados cadastrais
- **Listar Registration Data (User)**: Versão user

**TOTAL: 45+ endpoints disponíveis!**

## 🎨 Interface

### Sidebar Esquerda
Lista de todos os endpoints organizados por categoria. Clique em um para selecioná-lo.

### Painel Principal
- **Informações do Endpoint**: Nome, descrição, método HTTP, path
- **Parâmetros**: Configure page, size, etc.
- **Botão Executar**: Clique para fazer a requisição
- **Resultado**: Visualize em JSON ou Tabela

## 🔍 Como Usar

### 1. Selecionar Endpoint
Clique em qualquer endpoint na sidebar esquerda.

### 2. Configurar Parâmetros
Exemplo:
```
page: 1
size: 100
```

### 3. Executar
Clique no botão **"Executar Requisição"**

### 4. Visualizar Resultado

**Modo JSON** (para desenvolvedores):
```json
{
  "currentPage": 1,
  "itemsPerPage": 100,
  "totalItems": 3964,
  "totalPages": 40,
  "data": [...]
}
```

**Modo Tabela** (visual):
| id | username | email |
|----|----------|-------|
| 4254 | novo_teste | novoteste@example.com |
| 4253 | admin.master | daniel@gmail.com |

## 📊 Estatísticas

Abaixo do resultado, você verá chips com:
- **Total de itens** no banco
- **Itens retornados** nesta página
- **Página atual** / Total de páginas

## 💡 Exemplos de Uso

### Exemplo 1: Ver Todos os Usuários

1. Selecione **"Listar TODOS Usuários"**
2. Configure `size: 100`
3. Clique **Executar**
4. Alterne para **Modo Tabela**
5. Veja todos os usuários em formato visual

### Exemplo 2: Buscar Dados de Alunos

1. Selecione **"Listar Student Data"**
2. Configure `page: 1`, `size: 50`
3. Clique **Executar**
4. Veja matrícula, email corporativo, monitor, status

### Exemplo 3: Verificar Exames

1. Selecione **"Listar Student Exams"**
2. Execute
3. Veja user_data_id, status, score, exam_scheduled_hour_id

### Exemplo 4: Comparar Dados

1. Execute **"Listar User Data"**
2. Veja os IDs retornados
3. Execute **"Listar TODOS Usuários"**
4. Compare os IDs para entender relacionamentos

## 🔧 Funcionalidades

### ✅ Já Funcionando:
- Todos os endpoints GET
- Paginação configurável
- Visualização JSON
- Visualização em Tabela
- Estatísticas
- Loading states
- Error handling

### 📝 Futuras Melhorias:
- [ ] Suporte a POST/PATCH/DELETE
- [ ] Busca/filtro nos resultados
- [ ] Export para CSV/JSON
- [ ] Histórico de requisições
- [ ] Favoritar endpoints
- [ ] Comparar resultados de diferentes endpoints

## 🐛 Troubleshooting

### Erro 401 - Unauthorized
**Solução**: Faça login no sistema primeiro

### Erro 403 - Forbidden
**Solução**: Você precisa ser ADMIN ou ADMIN_MASTER

### Endpoint retorna vazio
**Possíveis causas**:
- Não há dados no banco
- Filtro de tenant (use "Listar TODOS Usuários")
- Página além do total de páginas

### Tabela não aparece
**Solução**: Alterne para modo JSON primeiro, verifique se há dados

## 🎓 Entendendo os Dados

### auth_user
- Tabela principal de usuários
- Contém: username, email, cpf (às vezes vazio)
- ID usado em student_exams.user_data_id

### seletivo_userdata
- Dados do processo seletivo
- Contém: cpf, celphone, birth_date
- Relacionado com auth_user

### student_data_studentdata
- Dados acadêmicos
- Contém: registration, corp_email, monitor, status
- Relacionado com seletivo_userdata

### seletivo_exam (student_exams)
- Provas/Exames
- Contém: score, status, exam_scheduled_hour_id
- user_data_id aponta para auth_user.id

## 🔗 Relacionamentos

```
auth_user (IDs: 4254, 4253, ...)
  ├─ seletivo_userdata (relacionamento 1:1)
  │    └─ student_data_studentdata
  └─ seletivo_exam (relacionamento 1:N)
       └─ seletivo_examhour
            └─ seletivo_examdate
                 └─ seletivo_examlocal
```

## 📌 Dicas

1. **Use size: 100** para ver mais dados de uma vez
2. **Modo Tabela** é melhor para visualização rápida
3. **Modo JSON** é melhor para ver estrutura completa
4. **Compare IDs** entre diferentes endpoints para entender relacionamentos
5. **Console do navegador** (F12) mostra logs detalhados

## 🎯 Casos de Uso

### Para Desenvolvedores:
- Entender estrutura de dados
- Debugar problemas de dados
- Verificar relacionamentos
- Testar integrações

### Para Testers:
- Validar dados do banco
- Verificar paginação
- Testar diferentes cenários
- Reportar inconsistências

### Para Product Owners:
- Ver dados reais do sistema
- Validar regras de negócio
- Verificar status de registros
- Análise de dados

## 📸 Screenshots

(A interface tem):
- Sidebar com categorias expansíveis
- Cards de endpoints com método HTTP colorido
- Formulário de parâmetros
- Botão grande de execução
- Toggle JSON/Tabela
- Chips de estatísticas

## 🚀 Acesso Rápido

Navegue para: `http://localhost:5100/api-explorer`

**Pronto para usar!** 🎉
