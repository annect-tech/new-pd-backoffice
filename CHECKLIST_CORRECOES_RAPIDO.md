# ⚡ CHECKLIST RÁPIDO DE CORREÇÕES

## 🎯 ORDEM DE EXECUÇÃO

Execute nesta ordem exata para resolver todos os problemas:

---

## 1️⃣ DADOS DE ALUNOS (CRÍTICO - 15 min)

**Arquivo:** `src/pages/dadosAlunos/DadosAlunos.tsx`

### ✅ Linha 106-116: Adicionar definição de agents e psychologists

```typescript
// Dados mockados para agentes e psicólogos
const agents = MOCK_AGENTS;
const psychologists = MOCK_PSYCHOLOGISTS;
```

### ✅ Linha 119-146: Adicionar logs detalhados

Substituir o `useEffect` de `fetchStudentData` completo pelo código do guia principal (seção 5).

### ✅ Linha 154-182: Adicionar logs no merge

Substituir o `useEffect` de merge completo pelo código do guia principal (seção 5).

### 🧪 Teste:
```bash
# Abrir página
# Abrir console (F12)
# Verificar logs:
# - [DadosAlunos] Buscando student_data...
# - [DadosAlunos] X student_data carregados
# - [DadosAlunos] Fazendo merge...
# Se aparecer lista de alunos = ✅ OK
```

---

## 2️⃣ CIDADES (CRÍTICO - 10 min)

**Arquivo:** `src/hooks/useCities.ts`

### ✅ Linha 47-81: Adicionar logging completo

```typescript
const fetchCities = useCallback(
  async (page: number = 1, size: number = 10, search?: string) => {
    setLoading(true);
    console.log("[useCities] Buscando cidades:", { page, size, search });
    
    try {
      const response = await citiesService.list(page, size, search);
      console.log("[useCities] Resposta:", response);
      
      // ... resto do código igual, apenas adicionar logs
    }
  },
  [showSnackbar]
);
```

### 🧪 Teste:
```bash
# Abrir página Cidades
# Verificar se lista aparece
# Tentar criar uma cidade nova
# Se funcionar = ✅ OK
```

---

## 3️⃣ CONTRATOS (CRÍTICO - 10 min)

**Arquivo:** `src/hooks/useContracts.ts`

### ✅ Linha 48-81: Melhorar fetchContracts

Copiar código completo da seção 7 do guia principal.

**Pontos principais:**
- Adicionar logs
- Tratar diferentes formatos de resposta
- Melhorar mensagens de erro

### 🧪 Teste:
```bash
# Abrir página Contratos
# Verificar se lista aparece
# Se aparecer dados = ✅ OK
```

---

## 4️⃣ RESULTADO DAS PROVAS (IMPORTANTE - 15 min)

**Arquivo:** `src/pages/resultadoProvas/ResultadoProvas.tsx`

### ✅ Linha 78-122: Corrigir lógica de CPF e dados de exame

**Mudança principal:**

```typescript
// ❌ ANTES (ERRADO):
const cpf =
  (userIdKey && userInfoMap[userIdKey]?.cpf) ||
  userData?.cpf ||
  (userDataId ? String(userDataId) : "N/A"); // <-- ERRADO: usa ID como CPF

// ✅ DEPOIS (CORRETO):
const cpf =
  (userIdKey && userInfoMap[userIdKey]?.cpf) ||
  userData?.cpf ||
  "CPF não disponível"; // <-- CORRETO: nunca usa ID como CPF
```

### ✅ Linha 117-122: Adicionar extração de local/data/hora

Copiar código completo da seção 3 do guia principal.

### 🧪 Teste:
```bash
# Abrir página Resultado das Provas
# Verificar coluna CPF - deve mostrar CPF real ou "CPF não disponível"
# Verificar colunas Local, Data, Hora - devem mostrar dados reais
# Se não mostrar ID como CPF = ✅ OK
```

---

## 5️⃣ LISTA DE PRESENÇA (VISUAL - 10 min)

**Arquivo:** `src/pages/listaPresenca/ListaPresenca.tsx`

### ✅ Linha 416: Remover tableLayout: "fixed"

```typescript
// ❌ ANTES:
<Table stickyHeader size="small" sx={{ tableLayout: "fixed", width: "100%" }}>

// ✅ DEPOIS:
<Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
```

### ✅ Linha 459-487: Adicionar overflow nas células

```typescript
<TableCell sx={{ 
  color: designSystem.colors.text.secondary, 
  fontSize: "0.875rem", 
  py: 1.5,
  overflow: "hidden",        // <-- ADICIONAR
  textOverflow: "ellipsis",  // <-- ADICIONAR
  whiteSpace: "nowrap"       // <-- ADICIONAR
}}>
```

Aplicar em TODAS as células do TableBody.

### 🧪 Teste:
```bash
# Abrir página Lista de Presença
# Verificar se colunas estão alinhadas
# Verificar se nomes longos têm "..."
# Se alinhado = ✅ OK
```

---

## 6️⃣ APROVAÇÃO MÉRITO (PDF - 15 min)

**Arquivo:** `src/pages/aprovacaoMerito/AprovacaoMerito.tsx`

### ✅ Linha 10: Adicionar Alert aos imports

```typescript
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Alert,  // <-- ADICIONAR
  Fade,
  Snackbar,
} from "@mui/material";
```

### ✅ Linha 263-274: Melhorar iframe com validação

Copiar código completo da seção 2 do guia principal.

### 🧪 Teste:
```bash
# Abrir página Aprovação Mérito
# Navegar entre documentos
# Se aparecer "Documento não disponível" em docs sem URL = ✅ OK
# Verificar logs no console
```

---

## 7️⃣ RESULTADOS MÉRITO (PDF - 15 min)

**Arquivo:** `src/pages/resultadosMerito/ResultadosMerito.tsx`

### ✅ Linha 234-268: Melhorar buildPdfUrl e handleView

Copiar código completo da seção 4 do guia principal.

**Pontos principais:**
- Adicionar validação de URL
- Adicionar teste de HEAD antes de abrir
- Melhorar mensagens de erro

### 🧪 Teste:
```bash
# Abrir página Resultados Mérito
# Clicar em "Ver PDF"
# Se mostrar erro claro em PDFs que não existem = ✅ OK
```

---

## 8️⃣ VISUALIZAÇÃO DE DOCUMENTOS (PDF - 10 min)

**Arquivo:** `src/pages/documentos/Documentos.tsx`

### ✅ Linha 104-124: Melhorar buildPdfUrl e openViewer

Copiar código completo da seção 8 do guia principal.

### 🧪 Teste:
```bash
# Abrir página Documentos
# Clicar para ver documentos
# Verificar logs no console
# Se mostrar erros claros = ✅ OK
```

---

## 🎯 VERIFICAÇÃO FINAL (5 min)

Após todas as correções, testar cada página na ordem:

### Checklist Final:

- [ ] **Dados de Alunos** - Lista carrega, detalhes aparecem
- [ ] **Cidades** - Lista carrega, criar/editar funciona
- [ ] **Contratos** - Lista carrega com CPF e nome
- [ ] **Resultado das Provas** - CPF correto, local/data/hora corretos
- [ ] **Lista de Presença** - Campos alinhados
- [ ] **Aprovação Mérito** - PDFs carregam ou mostram erro claro
- [ ] **Resultados Mérito** - PDFs carregam ou mostram erro claro
- [ ] **Documentos** - PDFs carregam ou mostram erro claro

---

## 🚨 SE ALGO NÃO FUNCIONAR

### 1. Verificar Console (F12 → Console)
```
Procurar por:
- ❌ Erros em vermelho
- 📝 Logs [NomeDaPagina]
- ⚠️ Warnings
```

### 2. Verificar Network (F12 → Network → XHR)
```
Verificar:
- Status Code (deve ser 200, não 500 ou 404)
- Response (JSON retornado pela API)
- Request URL (endpoint correto?)
```

### 3. Verificar Backend
```bash
# Backend está rodando?
curl http://186.248.135.172:31535/health

# Endpoint específico funciona?
curl http://186.248.135.172:31535/admin/allowed-cities?page=1&size=10
```

---

## ⏱️ TEMPO ESTIMADO TOTAL

| Tarefa | Tempo | Prioridade |
|--------|-------|-----------|
| Dados de Alunos | 15 min | 🔴 CRÍTICO |
| Cidades | 10 min | 🔴 CRÍTICO |
| Contratos | 10 min | 🔴 CRÍTICO |
| Resultado Provas | 15 min | 🟡 IMPORTANTE |
| Lista Presença | 10 min | 🟡 IMPORTANTE |
| Aprovação Mérito | 15 min | 🟡 IMPORTANTE |
| Resultados Mérito | 15 min | 🟢 MELHORIA |
| Documentos | 10 min | 🟢 MELHORIA |
| **TOTAL** | **~100 min** | |

---

## 📌 ATALHOS ÚTEIS

```typescript
// Ver todos os logs de uma página específica
// No console do navegador, filtrar por: [NomeDaPagina]

// Exemplo: ver apenas logs de DadosAlunos
Ctrl+F → [DadosAlunos]

// Limpar console
console.clear()

// Ver últimos erros
console.error('❌ Últimos erros aparecerão aqui')
```

---

## 🎉 CONCLUSÃO

Após seguir este checklist:

✅ Todas as páginas devem carregar
✅ PDFs devem abrir ou mostrar erro claro
✅ CPF deve mostrar CPF real (não ID)
✅ Campos devem estar alinhados
✅ Logs devem ajudar no debugging

**Se ainda houver problemas, consultar o GUIA_COMPLETO_CORRECAO_ERROS.md**
