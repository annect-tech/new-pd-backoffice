# Teste de Integração Sprint 4 - Integração de Dados

## Objetivo
Validar se os hooks foram corretamente integrados com os serviços da API e se estão retornando dados reais em vez de dados mockados.

---

## Pré-requisitos

1. **API Backend rodando** em `http://186.248.135.172:31535` (ou conforme `VITE_API_URL` no `.env`)
2. **Token de autenticação válido** (se necessário)
3. **Variáveis de ambiente configuradas**:
   ```bash
   VITE_API_URL=http://186.248.135.172:31535
   ```

---

## Método 1: Teste via Console do Browser (Mais Rápido)

### Passo 1: Iniciar a aplicação
```bash
npm run dev
```

### Passo 2: Abrir DevTools
- Pressione `F12` ou `Cmd+Option+I` (Mac)
- Vá para a aba **Console**

### Passo 3: Testar cada hook

#### Teste 1: Cities
```javascript
// Importar o httpClient e o citiesService
import { httpClient } from './src/core/http/httpClient';
import { citiesService } from './src/core/http/services/citiesService';

// Chamar o serviço
citiesService.list(1, 10).then(response => {
  console.log('Cities Response:', response);
  console.log('Status:', response.status);
  console.log('Dados:', response.data);
});
```

#### Teste 2: Exams
```javascript
import { examsService } from './src/core/http/services/examsService';

examsService.list(1, 10).then(response => {
  console.log('Exams Response:', response);
  console.log('Total de exames:', response.data?.totalItems);
});
```

#### Teste 3: ENEM Results
```javascript
import { enemResultsService } from './src/core/http/services/enemResultsService';

enemResultsService.list(1, 10).then(response => {
  console.log('ENEM Results Response:', response);
  console.log('Total de resultados:', response.data?.totalItems);
});
```

#### Teste 4: Exams Scheduled
```javascript
import { examsScheduledService } from './src/core/http/services/examsScheduledService';

examsScheduledService.list(1, 10).then(response => {
  console.log('Exams Scheduled Response:', response);
});
```

#### Teste 5: Contracts
```javascript
import { contractsService } from './src/core/http/services/contractsService';

contractsService.list(1, 10).then(response => {
  console.log('Contracts Response:', response);
});
```

#### Teste 6: Selective
```javascript
import { selectiveService } from './src/core/http/services/selectiveService';

selectiveService.list(1, 10).then(response => {
  console.log('Selective Response:', response);
});
```

#### Teste 7: Academic Merit
```javascript
import { academicMeritService } from './src/core/http/services/academicMeritService';

academicMeritService.list(1, 10).then(response => {
  console.log('Academic Merit Response:', response);
});
```

---

## Método 2: Teste via Pages (Recomendado para UI)

### Passo 1: Navegar para as páginas
1. **Cidades** → `/cidades`
2. **Exames** → `/exames` (ou o route correto)
3. **Resultados ENEM** → `/resultados-enem`
4. **Lista de Presença** → `/lista-presenca`
5. **Contratos** → `/contratos`
6. **Seletivo** → `/seletivo`
7. **Mérito Acadêmico** → `/merito-academico`

### Passo 2: Verificar no DevTools
- Abra a aba **Network** (F12 → Network)
- Clique no botão "Atualizar lista" ou aguarde o carregamento automático
- Procure por requisições para:
  - `GET /admin/cities`
  - `GET /admin/exams`
  - `GET /admin/enem-results`
  - `GET /admin/exams-scheduled`
  - `GET /admin/contracts`
  - `GET /admin/selective/users`
  - `GET /admin/academic-merit`

### Passo 3: Validar a resposta
Para cada requisição, clique e verifique:

**Aba "Response":**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "data": [...],
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

**Aba "Headers":**
- Status: `200 OK` ✅
- Content-Type: `application/json`

---

## Método 3: Teste Unitário (Opcional)

Criar um arquivo de teste:

```bash
cat > src/__tests__/hooks.test.ts << 'EOF'
import { citiesService } from '../core/http/services/citiesService';
import { examsService } from '../core/http/services/examsService';
import { enemResultsService } from '../core/http/services/enemResultsService';

describe('API Integration', () => {
  test('citiesService.list should call the API', async () => {
    const response = await citiesService.list(1, 10);
    console.log('Cities Response:', response);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
  });

  test('examsService.list should call the API', async () => {
    const response = await examsService.list(1, 10);
    console.log('Exams Response:', response);
    expect(response.status).toBe(200);
  });

  test('enemResultsService.list should call the API', async () => {
    const response = await enemResultsService.list(1, 10);
    console.log('ENEM Results Response:', response);
    expect(response.status).toBe(200);
  });
});
EOF
```

Executar:
```bash
npm test
```

---

## Checklist de Validação

- [ ] **Serviços retornam respostas da API** (não mockadas)
- [ ] **Status HTTP é 200 ou próximo de 2xx**
- [ ] **Dados contêm paginação** (currentPage, totalItems, totalPages)
- [ ] **Loading state funciona** (vê "carregando..." durante requisição)
- [ ] **Componentes renderizam dados reais** (não mais dados mockados)
- [ ] **Paginação funciona** (pode navegar entre páginas)
- [ ] **Busca/filtro funciona** (se implementado)
- [ ] **Ações (aprovar, rejeitar, etc) funcionam** (onde aplicável)

---

## Verificação Rápida: Comparar Mock vs Real

### Antes (dados mockados):
```javascript
// Em useExams.ts
const mockExams = [
  { id: 1, score: 85, status: "aprovado", ... },
  { id: 2, score: 90, status: "aprovado", ... },
];
setExams(mockExams);
```

### Depois (dados reais da API):
```javascript
// Em useExams.ts
const response = await examsService.list(page, size);
if (response.status >= 200 && response.status < 300) {
  setExams(response.data.data); // ✅ Dados reais da API
}
```

---

## Se Encontrar Erro

### 1. Status não é 200
**Problema:** API está retornando erro
```
Status: 401 (Não autorizado)
Status: 404 (Endpoint não existe)
Status: 500 (Erro no servidor)
```

**Solução:**
- Verificar se `VITE_API_URL` está correto
- Verificar se o token de autenticação é válido
- Verificar se o endpoint existe na API Swagger
- Verificar logs da API backend

### 2. CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução:**
- Configurar CORS no backend
- Ou usar um proxy CORS (desenvolvimento)

### 3. Resposta vazia ou null
**Problema:** `response.data` é null/undefined

**Solução:**
- Verificar estrutura da resposta no Network tab
- Garantir que a resposta segue o padrão esperado
- Ajustar o parsing em `httpClient.ts`

### 4. Hook não está usando o serviço
**Verificação:**
```javascript
// Abrir DevTools → Sources → Debugger
// Adicionar breakpoint em useCities.ts
// Executar fetchCities()
// Verificar se passa pelo citiesService.list()
```

---

## Endpoints Esperados (conforme Swagger)

| Recurso | Endpoint | Método | Esperado |
|---------|----------|--------|----------|
| Cities | `/admin/cities` | GET | Paginado |
| Exams | `/admin/exams` | GET | Paginado |
| ENEM Results | `/admin/enem-results` | GET | Paginado |
| Exams Scheduled | `/admin/exams-scheduled` | GET | Paginado |
| Contracts | `/admin/contracts` | GET | Paginado |
| Selective | `/admin/selective/users` | GET | Paginado |
| Academic Merit | `/admin/academic-merit` | GET | Paginado |

---

## Resultado Esperado ✅

Quando tudo estiver funcionando:

1. ✅ Serviços retornam dados reais da API
2. ✅ Hooks utilizam os dados da API
3. ✅ UI renderiza os dados corretamente
4. ✅ Paginação funciona
5. ✅ Loading state funciona
6. ✅ Sem erros de console

---

## Próximas Etapas

Após confirmar a integração:

1. **Testar com dados reais** do banco de dados
2. **Validar performance** (tempo de requisição)
3. **Implementar tratamento de erros** mais robusto
4. **Adicionar cache** (se necessário)
5. **Documentar** os endpoints usados
6. **Deploy** para staging
