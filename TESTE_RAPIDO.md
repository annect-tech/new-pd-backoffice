# 🚀 VERIFICAÇÃO RÁPIDA - Integração Sprint 4

## 5 Passos para Validar se Funcionou

### 1️⃣ Iniciar a App
```bash
npm run dev
```

### 2️⃣ Abrir DevTools (F12 → Console)

### 3️⃣ Copiar e colar uma destas linhas:

#### Teste Cities:
```javascript
import { citiesService } from './src/core/http/services/citiesService';
citiesService.list(1, 10).then(r => console.log('Status:', r.status, 'Dados:', r.data?.data?.length, 'cidades'));
```

#### Teste Exams:
```javascript
import { examsService } from './src/core/http/services/examsService';
examsService.list(1, 10).then(r => console.log('Status:', r.status, 'Dados:', r.data?.data?.length, 'exames'));
```

#### Teste ENEM:
```javascript
import { enemResultsService } from './src/core/http/services/enemResultsService';
enemResultsService.list(1, 10).then(r => console.log('Status:', r.status, 'Dados:', r.data?.data?.length, 'resultados'));
```

### 4️⃣ Verificar a saída

**✅ Sucesso:**
```
Status: 200 Dados: 10 cidades
```

**❌ Erro:**
```
Status: 0 (sem conexão)
Status: 401 (não autorizado)
Status: 404 (endpoint não existe)
```

### 5️⃣ Verificar no Network Tab (F12 → Network)

- Clique no botão "Atualizar" em qualquer página
- Procure por requisições `GET /admin/...`
- Verifique o Status (deve ser 200)
- Verifique a Response (deve ter dados)

---

## 📋 Checklist Rápido

- [ ] App inicia sem erros
- [ ] Console não mostra erros de hooks
- [ ] Requisições para `/admin/cities` retornam 200
- [ ] Requisições para `/admin/exams` retornam 200
- [ ] Dados da API aparecem na UI
- [ ] Loading state funciona (mostra "carregando...")
- [ ] Paginação funciona

---

## 🔧 Se Não Funcionar

1. **Verificar .env**
   ```bash
   cat .env | grep VITE_API_URL
   ```
   Deve retornar: `VITE_API_URL=http://186.248.135.172:31535` (ou seu servidor)

2. **Verificar se API está rodando**
   ```bash
   curl http://186.248.135.172:31535/admin/cities
   ```
   Deve retornar JSON (não erro)

3. **Verificar se há token de autenticação**
   - Se API retorna 401, adicione o token no header
   - Veja em `src/core/http/httpClient.ts`

4. **Ver logs da aplicação**
   ```bash
   npm run dev
   # Procure por erros no terminal
   ```

---

## ✨ Arquivo Completo de Testes

Também há um arquivo de testes automáticos em:
```
src/__tests__/test-integration.js
```

Copie o conteúdo dele no Console para testes mais detalhados.

---

## 📊 Resultado Esperado

Quando tudo estiver correto, verá algo assim no Network tab:

```
GET /admin/cities?page=1&size=10  →  200 OK
Response: {
  "status": 200,
  "message": "Success",
  "data": {
    "data": [
      { "id": 1, "localidade": "São Paulo", "uf": "SP", ... },
      { "id": 2, "localidade": "Rio de Janeiro", "uf": "RJ", ... },
      ...
    ],
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

✅ Pronto! A integração funcionou!
