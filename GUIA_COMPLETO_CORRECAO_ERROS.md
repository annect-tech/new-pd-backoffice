# GUIA COMPLETO DE CORREÇÃO DE ERROS - BACKOFFICE

## 📋 ÍNDICE DE PROBLEMAS

1. [Lista de Presença - Campos não alinhados](#1-lista-de-presença)
2. [Aprovação Mérito - Erros na visualização de documentos](#2-aprovação-mérito)
3. [Resultado das Provas - CPF mostrando ID, Local/Data/Hora N/A](#3-resultado-das-provas)
4. [Resultados Mérito - Documentos dando NOT FOUND](#4-resultados-mérito)
5. [Dados de Alunos - Não carrega](#5-dados-de-alunos)
6. [Cidades - Não está funcionando](#6-cidades)
7. [Contratos - Não carrega](#7-contratos)
8. [Visualização de Documentos - Alguns docs não carregam](#8-visualização-de-documentos)
9. [Resultados ENEM - Possível problema de integração](#9-resultados-enem)

---

## 1. LISTA DE PRESENÇA

### 🔍 Problema
Campos não alinhados com a tabela, causando overflow e desalinhamento visual.

### 🎯 Causa Raiz
- Tabela usando `tableLayout: "fixed"` com `minWidth` nas células
- Isso faz com que células longas (como nomes) quebrem o layout
- Falta de controle de overflow adequado

### ✅ Solução

**Arquivo:** `src/pages/listaPresenca/ListaPresenca.tsx`

**Linhas 416-440:** Substituir a definição da tabela:

```typescript
<TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
  <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
    <TableHead>
      <TableRow>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '15%', minWidth: 120 }}>
          CPF
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '20%', minWidth: 200 }}>
          Nome
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '15%', minWidth: 120 }}>
          Celular
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '15%', minWidth: 120 }}>
          Status
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '20%', minWidth: 180 }}>
          Local
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '15%', minWidth: 120 }}>
          Data
        </TableCell>
        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: '10%', minWidth: 100 }}>
          Hora
        </TableCell>
      </TableRow>
    </TableHead>
```

**Linhas 459-487:** Adicionar controle de overflow nas células:

```typescript
<TableCell sx={{ 
  color: designSystem.colors.text.secondary, 
  fontSize: "0.875rem", 
  py: 1.5,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}}>
  {row.cpf}
</TableCell>
<TableCell sx={{ 
  color: designSystem.colors.text.primary, 
  fontWeight: 500, 
  fontSize: "0.875rem", 
  py: 1.5,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}}>
  {row.name}
</TableCell>
```

### ⚙️ Como aplicar
1. Abrir o arquivo `ListaPresenca.tsx`
2. Remover `tableLayout: "fixed"` da propriedade `sx` da Table
3. Adicionar `minWidth` no `sx` da Table (ex: `minWidth: 1200`)
4. Adicionar `overflow`, `textOverflow` e `whiteSpace` em todas as células do TableBody

---

## 2. APROVAÇÃO MÉRITO

### 🔍 Problema
Erros na visualização de alguns documentos PDF.

### 🎯 Causa Raiz
- URLs dos documentos podem estar mal formadas
- Falta de tratamento de erro adequado no iframe
- Possível problema de CORS ou autenticação

### ✅ Solução

**Arquivo:** `src/pages/aprovacaoMerito/AprovacaoMerito.tsx`

**Linhas 263-274:** Melhorar o tratamento do iframe:

```typescript
<Box sx={{ flex: 1, position: "relative", bgcolor: "#FAFAFA" }}>
  {(() => {
    const docUrl = currentMerit.document;
    
    // Verificar se a URL é válida
    if (!docUrl || docUrl.trim() === "") {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
        >
          <Alert severity="error">
            Documento não disponível ou URL inválida
          </Alert>
        </Box>
      );
    }

    // Construir URL completa se necessário
    const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";
    const fullUrl = docUrl.startsWith("http") 
      ? docUrl 
      : `${API_URL}/${docUrl.startsWith("/") ? docUrl.slice(1) : docUrl}`;

    console.log("[AprovacaoMerito] URL do documento:", fullUrl);

    return (
      <iframe
        src={fullUrl}
        title="Documento de Mérito"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        onError={(e) => {
          console.error("[AprovacaoMerito] Erro ao carregar PDF:", {
            docUrl,
            fullUrl,
            error: e
          });
        }}
        onLoad={(e) => {
          console.log("[AprovacaoMerito] PDF carregado com sucesso:", fullUrl);
        }}
      />
    );
  })()}
</Box>
```

**Adicionar importação de Alert:**

```typescript
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Alert, // <-- ADICIONAR ESTA LINHA
  Fade,
  Snackbar,
} from "@mui/material";
```

### ⚙️ Como aplicar
1. Adicionar `Alert` aos imports do MUI
2. Substituir o Box do iframe pela versão acima
3. Testar com diferentes documentos para verificar logs no console

---

## 3. RESULTADO DAS PROVAS

### 🔍 Problema
- Campo CPF mostrando ID do usuário em vez do CPF real
- Campos Local, Data e Hora mostrando "N/A"

### 🎯 Causa Raiz
- **CPF:** Linha 85-89 está usando `user_data_id` como fallback quando não encontra CPF no mapa
- **Local/Data/Hora:** Os dados podem não estar vindo nested corretamente da API

### ✅ Solução

**Arquivo:** `src/pages/resultadoProvas/ResultadoProvas.tsx`

**Linhas 78-122:** Corrigir a lógica de mapeamento:

```typescript
const rows = useMemo(() => {
  return exams.map((exam) => {
    const userData = exam.user_data;
    const user = userData?.user;
    const userDataId = (exam as any)?.user_data_id;
    const userIdKey = userDataId ? String(userDataId) : undefined;

    // CPF: Buscar APENAS no mapa de usuários ou nested data
    // NUNCA usar ID como CPF
    const cpf =
      (userIdKey && userInfoMap[userIdKey]?.cpf) ||
      userData?.cpf ||
      "CPF não disponível";
    
    // Nome: prioriza dados do mapa, depois nested data, depois fallback
    const nome =
      (userIdKey && userInfoMap[userIdKey]?.name) ||
      (user?.first_name || user?.last_name
        ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
        : "Nome não disponível");

    // Normalizar status para exibição/filtragem
    const statusMap: Record<string, string> = {
      APPROVED: "aprovado",
      REJECTED: "reprovado",
      PENDING: "pendente",
    };
    const statusNormalizado =
      exam.status && statusMap[exam.status.toUpperCase()]
        ? statusMap[exam.status.toUpperCase()]
        : exam.status?.toLowerCase() ?? "pendente";

    // Extrair dados de local/data/hora com verificações
    let local = "N/A";
    let date = "N/A";
    let hour = "N/A";

    // Verificar se exam_scheduled_hour existe e tem dados
    if (exam.exam_scheduled_hour) {
      const scheduledHour = exam.exam_scheduled_hour;
      
      // Extrair hora
      if (scheduledHour.hour) {
        hour = scheduledHour.hour;
      }
      
      // Verificar se exam_date existe
      if (scheduledHour.exam_date) {
        const examDate = scheduledHour.exam_date;
        
        // Extrair data
        if (examDate.date) {
          // Formatar data se necessário
          try {
            const dateObj = new Date(examDate.date);
            date = dateObj.toLocaleDateString("pt-BR");
          } catch (e) {
            date = examDate.date;
          }
        }
        
        // Verificar se local existe
        if (examDate.local && examDate.local.name) {
          local = examDate.local.name;
        }
      }
    }

    console.log(`[ResultadoProvas] Dados do exame ${exam.id}:`, {
      cpf,
      nome,
      local,
      date,
      hour,
      exam_scheduled_hour: exam.exam_scheduled_hour
    });

    return {
      id: exam.id,
      cpf,
      name: nome,
      score: exam.score ?? null,
      status: statusNormalizado,
      local,
      date,
      hour,
      user_data_id: userDataId,
    };
  });
}, [exams, userInfoMap]);
```

### ⚙️ Como aplicar
1. Substituir o bloco `const rows = useMemo(...)` completo
2. Verificar no console os logs de dados do exame
3. Se ainda aparecer "N/A", verificar a estrutura dos dados retornados pela API

---

## 4. RESULTADOS MÉRITO

### 🔍 Problema
Funcional, porém visualização de alguns documentos dando NOT FOUND (404).

### 🎯 Causa Raiz
- URLs dos documentos podem estar incorretas
- Falta de validação adequada antes de tentar carregar o PDF
- Possível problema com o caminho relativo vs absoluto

### ✅ Solução

**Arquivo:** `src/pages/resultadosMerito/ResultadosMerito.tsx`

**Linhas 234-268:** Melhorar a função `buildPdfUrl` e adicionar validação:

```typescript
// Constrói URL completa do PDF com validação
const buildPdfUrl = (pdfPath: string | null | undefined): string | null => {
  if (!pdfPath || pdfPath.trim() === "") {
    console.warn("[ResultadosMerito] Caminho do PDF vazio ou inválido:", pdfPath);
    return null;
  }
  
  // Se já for uma URL completa, retorna como está
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
    return pdfPath;
  }
  
  // Remove barra inicial se existir
  const cleanPath = pdfPath.startsWith("/") ? pdfPath.slice(1) : pdfPath;
  
  // Constrói URL completa
  const fullUrl = `${API_URL}/${cleanPath}`;
  
  console.log("[ResultadosMerito] URL construída:", {
    original: pdfPath,
    cleaned: cleanPath,
    final: fullUrl
  });
  
  return fullUrl;
};

// Testar se o PDF existe antes de abrir
const testPdfUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("[ResultadosMerito] Erro ao testar URL do PDF:", error);
    return false;
  }
};

const handleView = async (url: string) => {
  if (!url || url.trim() === "") {
    setLocalSnackbar({
      open: true,
      message: "Documento não disponível",
      severity: "warning",
    });
    return;
  }

  const fullUrl = buildPdfUrl(url);
  
  if (!fullUrl) {
    setLocalSnackbar({
      open: true,
      message: "URL do documento inválida",
      severity: "error",
    });
    return;
  }

  // Testar se o PDF existe
  const exists = await testPdfUrl(fullUrl);
  
  if (!exists) {
    console.error("[ResultadosMerito] Documento não encontrado:", fullUrl);
    setLocalSnackbar({
      open: true,
      message: "Documento não encontrado no servidor (404)",
      severity: "error",
    });
    return;
  }

  setViewerUrl(fullUrl);
};
```

### ⚙️ Como aplicar
1. Substituir a função `buildPdfUrl` pela versão acima
2. Adicionar a função `testPdfUrl`
3. Substituir a função `handleView` pela versão acima
4. Verificar logs no console para identificar URLs problemáticas

---

## 5. DADOS DE ALUNOS

### 🔍 Problema
Página não carrega - erro crítico que impede a visualização.

### 🎯 Causa Raiz
- Linha 78: Usando `useSelective()` em vez de `useStudentData()`
- Conflito entre dados de `user_data` e `student_data`
- Lógica de mesclagem complexa e propensa a erros
- Falta de tratamento adequado para dados ausentes

### ✅ Solução Completa

**Arquivo:** `src/pages/dadosAlunos/DadosAlunos.tsx`

**PASSO 1:** Corrigir imports e hooks (linhas 50-78):

```typescript
const DadosAlunos: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook para buscar dados de user_data (dados pessoais) - USAR useSelective
  const {
    users: userData,
    loading: userDataLoading,
    pagination: userDataPagination,
    fetchUsers,
  } = useSelective();

  // Estados para student_data (dados acadêmicos)
  const [items, setItems] = useState<StudentRow[]>([]);
  const [oldItems, setOldItems] = useState<StudentRow[]>([]);
  const [oldLoading, setOldLoading] = useState(false);
  const [_oldError, setOldError] = useState<string | null>(null);
  const [hasFetchedOld, setHasFetchedOld] = useState(false);
  const [studentDataMap, setStudentDataMap] = useState<Map<string, any>>(new Map());
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  
  // Estado de loading combinado
  const loading = userDataLoading || loadingStudentData;
  const error = null;
```

**PASSO 2:** Corrigir a busca de student_data (linhas 118-146):

```typescript
// Buscar student_data (dados acadêmicos) ao montar
useEffect(() => {
  const fetchStudentData = async () => {
    setLoadingStudentData(true);
    try {
      console.log("[DadosAlunos] Buscando student_data...");
      
      // Buscar todos os student_data sem paginação para fazer o mapa completo
      const response = await studentDataService.list(1, 1000);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        
        // Extrair array de student_data
        let studentDataList: any[] = [];
        if (Array.isArray(raw?.data)) {
          studentDataList = raw.data;
        } else if (Array.isArray(raw)) {
          studentDataList = raw;
        }
        
        console.log(`[DadosAlunos] ${studentDataList.length} student_data carregados`);
        
        // Criar mapa de user_data_id -> student_data
        const map = new Map();
        studentDataList.forEach((sd: any) => {
          if (sd.user_data_id) {
            map.set(String(sd.user_data_id), sd);
          }
        });
        
        console.log(`[DadosAlunos] Mapa criado com ${map.size} entradas`);
        setStudentDataMap(map);
      } else {
        console.error("[DadosAlunos] Erro ao buscar student_data:", response);
      }
    } catch (error) {
      console.error("[DadosAlunos] Exceção ao buscar student_data:", error);
    } finally {
      setLoadingStudentData(false);
    }
  };
  
  fetchStudentData();
}, []);
```

**PASSO 3:** Corrigir merge de dados (linhas 154-182):

```typescript
// Fazer merge de user_data + student_data
useEffect(() => {
  if (!userData || userData.length === 0) {
    console.log("[DadosAlunos] Nenhum user_data disponível");
    setItems([]);
    return;
  }

  console.log(`[DadosAlunos] Fazendo merge de ${userData.length} user_data com student_data`);
  
  const convertedStudents: StudentRow[] = userData.map((user) => {
    const userId = String(user.id);
    const studentData = studentDataMap.get(userId);
    
    console.log(`[DadosAlunos] User ${userId}:`, {
      hasStudentData: !!studentData,
      user,
      studentData
    });
    
    // Nome completo
    const completeName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ") || (user as any)?.name || "Nome não disponível";
    
    return {
      id: userId,
      user_data_id: userId,
      completeName,
      registration: studentData?.registration || "—",
      corp_email: studentData?.corp_email || user.email || "—",
      monitor: studentData?.monitor || "—",
      status: studentData?.status || "Inativo",
      cpf: user.cpf || "—",
      birth_date: user.birth_date || "—",
      username: user.username || "—",
      origin: "novo" as const,
    };
  });
  
  console.log(`[DadosAlunos] ${convertedStudents.length} students convertidos`);
  setItems(convertedStudents);
}, [userData, studentDataMap]);
```

**PASSO 4:** Adicionar definição de `agents` e `psychologists` (após a linha 116):

```typescript
// Dados mockados para agentes e psicólogos
const agents = MOCK_AGENTS;
const psychologists = MOCK_PSYCHOLOGISTS;
```

### ⚙️ Como aplicar
1. Substituir todo o bloco de hooks no início do componente
2. Substituir o useEffect de fetchStudentData
3. Substituir o useEffect de merge
4. Adicionar as variáveis `agents` e `psychologists`
5. Verificar logs no console para diagnosticar problemas
6. Testar paginação e busca

---

## 6. CIDADES

### 🔍 Problema
Não está funcionando - possível erro de API ou hook.

### 🎯 Causa Raiz
- Hook e service parecem corretos
- Problema pode estar na API retornando erro 500
- Falta de tratamento de erro adequado

### ✅ Solução

**Arquivo:** `src/hooks/useCities.ts`

**Adicionar logging detalhado (linhas 47-81):**

```typescript
const fetchCities = useCallback(
  async (page: number = 1, size: number = 10, search?: string) => {
    setLoading(true);
    console.log("[useCities] Buscando cidades:", { page, size, search });
    
    try {
      const response = await citiesService.list(page, size, search);
      
      console.log("[useCities] Resposta da API:", {
        status: response.status,
        hasData: !!response.data,
        data: response.data
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

        console.log(`[useCities] ${list.length} cidades carregadas`);
        
        setCities(list);
        setPagination({
          currentPage: Number(raw?.currentPage ?? page),
          itemsPerPage: Number(raw?.itemsPerPage ?? size),
          totalItems: Number(raw?.totalItems ?? list.length),
          totalPages: Number(raw?.totalPages ?? 0),
        });
      } else {
        console.error("[useCities] Erro na resposta:", response);
        setCities([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(
          response.message || "Erro ao buscar cidades. Verifique se a API está respondendo corretamente.",
          "error"
        );
      }
    } catch (error: any) {
      console.error("[useCities] Exceção ao buscar cidades:", error);
      setCities([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
      showSnackbar(
        error?.message || "Erro de conexão ao buscar cidades. Verifique se a API está disponível.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  },
  [showSnackbar]
);
```

**Arquivo:** `src/pages/cidades/Cidades.tsx`

**Adicionar tratamento de erro visual (após linha 358):**

```typescript
{loading ? (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress {...progressStyles} />
  </Box>
) : cities.length === 0 && !searchTerm ? (
  <Box p={4}>
    <Alert severity="warning" sx={{ mb: 2 }}>
      Nenhuma cidade encontrada. Possíveis causas:
      <ul style={{ marginTop: 8, marginBottom: 0 }}>
        <li>A API não está retornando dados</li>
        <li>Verifique se o endpoint <code>/admin/allowed-cities</code> está funcionando</li>
        <li>Verifique a console do navegador para mais detalhes</li>
      </ul>
    </Alert>
  </Box>
) : (
  <TableContainer sx={{ maxWidth: "100%" }}>
    {/* ... resto da tabela ... */}
  </TableContainer>
)}
```

### ⚙️ Como aplicar
1. Atualizar o hook `useCities.ts` com logging
2. Adicionar Alert de diagnóstico na página `Cidades.tsx`
3. Abrir console do navegador e verificar logs
4. Se aparecer erro 500, verificar logs do backend
5. Testar criar uma nova cidade para ver se persiste

---

## 7. CONTRATOS

### 🔍 Problema
Erro ao carregar - possível problema com estrutura de dados da API.

### 🎯 Causa Raiz
- Linha 57: Espera `response.data.data` mas API pode retornar estrutura diferente
- Falta de tratamento para diferentes formatos de resposta
- Possível erro 500 na API

### ✅ Solução

**Arquivo:** `src/hooks/useContracts.ts`

**Linhas 48-81:** Melhorar o fetchContracts com logging e tratamento:

```typescript
const fetchContracts = useCallback(
  async (pOrEvent?: any, s: number = size) => {
    const p = typeof pOrEvent === "number" ? pOrEvent : page;
    setLoading(true);
    setError(null);
    
    console.log("[useContracts] Buscando contratos:", { page: p, size: s });
    
    try {
      const response = await contractsService.list(p, s);

      console.log("[useContracts] Resposta da API:", {
        status: response.status,
        hasData: !!response.data,
        data: response.data
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        // Tentar diferentes formatos de resposta
        let contractData: any[] = [];
        
        if (Array.isArray(response.data.data)) {
          contractData = response.data.data;
        } else if (Array.isArray(response.data)) {
          contractData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          contractData = response.data.results;
        }
        
        console.log(`[useContracts] ${contractData.length} contratos carregados`);
        
        setContracts(contractData);
        setPage(response.data.currentPage || p);
        setSize(response.data.itemsPerPage || s);
        setTotalItems(response.data.totalItems || contractData.length);
        setTotalPages(response.data.totalPages || Math.ceil(contractData.length / s));
        showSnackbar(`${contractData.length} contratos carregados`, "success");
        return;
      }

      console.error("[useContracts] Erro na resposta:", response);
      setContracts([]);
      const errorMessage = response.message || "Erro ao buscar contratos. Verifique se a API está funcionando.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } catch (err: any) {
      console.error("[useContracts] Exceção ao buscar contratos:", err);
      setContracts([]);
      const errorMessage = err?.message || "Erro de conexão ao buscar contratos";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  },
  [page, size, showSnackbar]
);
```

**Arquivo:** `src/pages/contratos/Contratos.tsx`

**Adicionar diagnóstico de erro (após linha 182):**

```typescript
) : error ? (
  <Box p={4}>
    <Alert severity="error" sx={{ mb: 2 }}>
      <strong>Erro ao carregar contratos:</strong> {error}
    </Alert>
    <Alert severity="info">
      <strong>Diagnóstico:</strong>
      <ul style={{ marginTop: 8, marginBottom: 0 }}>
        <li>Verifique se o endpoint <code>/admin/contract</code> está funcionando</li>
        <li>Abra a console do navegador para ver detalhes do erro</li>
        <li>Se for erro 500, verifique os logs do backend</li>
      </ul>
    </Alert>
  </Box>
) : (
```

### ⚙️ Como aplicar
1. Atualizar o hook `useContracts.ts` com a nova versão de `fetchContracts`
2. Adicionar Alert de diagnóstico na página `Contratos.tsx`
3. Verificar logs no console
4. Testar se os dados aparecem após as mudanças

---

## 8. VISUALIZAÇÃO DE DOCUMENTOS

### 🔍 Problema
Aparentemente funcional, porém visualização de alguns docs não carrega.

### 🎯 Causa Raiz
- Similar aos problemas de PDF em outras páginas
- Falta de validação de URL
- Possível problema com CORS ou autenticação

### ✅ Solução

**Arquivo:** `src/pages/documentos/Documentos.tsx`

**Linhas 104-124:** Melhorar a função `buildPdfUrl`:

```typescript
// Constrói URL completa do PDF com validação e logging
const buildPdfUrl = (pdfPath: string | null | undefined): string | null => {
  if (!pdfPath || pdfPath.trim() === "") {
    console.warn("[Documentos] Caminho do PDF vazio ou inválido:", pdfPath);
    return null;
  }
  
  // Se já for uma URL completa, retorna como está
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
    console.log("[Documentos] URL já está completa:", pdfPath);
    return pdfPath;
  }
  
  // Remove barra inicial se existir
  const cleanPath = pdfPath.startsWith("/") ? pdfPath.slice(1) : pdfPath;
  
  // Constrói URL completa
  const fullUrl = `${API_URL}/${cleanPath}`;
  
  console.log("[Documentos] URL construída:", {
    original: pdfPath,
    cleaned: cleanPath,
    final: fullUrl
  });
  
  return fullUrl;
};
```

**Linhas 119-125:** Adicionar validação ao abrir o viewer:

```typescript
const openViewer = async (url: string) => {
  console.log("[Documentos] Abrindo viewer para URL:", url);
  
  const fullUrl = buildPdfUrl(url);
  
  if (!fullUrl) {
    console.error("[Documentos] URL inválida, não é possível abrir o viewer");
    // Mostrar snackbar de erro
    return;
  }
  
  // Testar se o documento existe
  try {
    const response = await fetch(fullUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.error(`[Documentos] Documento não encontrado (${response.status}):`, fullUrl);
      // Mostrar snackbar de erro
      return;
    }
  } catch (error) {
    console.error("[Documentos] Erro ao verificar documento:", error);
    // Mostrar snackbar de erro
    return;
  }
  
  setViewerUrl(fullUrl);
};
```

**Adicionar estado de snackbar para erros (se não existir):**

```typescript
const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: "" });
```

**Adicionar Snackbar de erro ao final do componente:**

```typescript
<Snackbar
  open={errorSnackbar.open}
  autoHideDuration={6000}
  onClose={() => setErrorSnackbar({ ...errorSnackbar, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    onClose={() => setErrorSnackbar({ ...errorSnackbar, open: false })}
    severity="error"
    sx={{ width: '100%' }}
  >
    {errorSnackbar.message}
  </Alert>
</Snackbar>
```

### ⚙️ Como aplicar
1. Atualizar função `buildPdfUrl`
2. Atualizar função `openViewer` com validação
3. Adicionar estado `errorSnackbar`
4. Adicionar componente `Snackbar` de erro
5. Verificar logs no console ao tentar abrir documentos
6. Identificar quais URLs estão falhando

---

## 9. RESULTADOS ENEM

### 🔍 Problema
100% funcional, porém parece estar com outro tipo de tabela (não sei se integrada).

### 🎯 Causa Raiz
- Estrutura de dados diferente dos outros endpoints
- Possível uso de API externa ou tabela diferente no banco

### ✅ Verificação Recomendada

**Arquivo para verificar:** `src/pages/resultadosEnem/ResultadosEnem.tsx`

1. Abrir o arquivo e verificar qual service está sendo usado
2. Verificar se há algum comentário indicando integração externa
3. Comparar estrutura de dados com outros endpoints

**Para investigar:**

```bash
# Procurar referências ao ENEM
grep -r "enem" src/core/http/services/ --ignore-case
grep -r "ENEM" src/pages/resultadosEnem/ 
```

**Se for uma integração externa, documentar:**
- Qual a API externa (se houver)
- Como os dados são sincronizados
- Se há diferenças no formato de resposta

### ⚙️ Como aplicar
1. Ler o arquivo `ResultadosEnem.tsx` completo
2. Verificar o service usado
3. Comparar com documentação da API
4. Documentar descobertas em um arquivo `ENEM_INTEGRATION.md`

---

## 📊 CHECKLIST DE TESTE

Após aplicar todas as correções, testar cada página:

### ✅ Lista de Presença
- [ ] Campos alinhados corretamente
- [ ] Nomes longos com ellipsis (...)
- [ ] Scroll horizontal funciona se necessário
- [ ] CPF e Celular visíveis
- [ ] Status colorido correto

### ✅ Aprovação Mérito
- [ ] Documentos carregam corretamente
- [ ] Mensagem de erro clara se documento não carregar
- [ ] Console mostra logs úteis
- [ ] Botões de aprovar/reprovar funcionam

### ✅ Resultado das Provas
- [ ] CPF mostra CPF real (não ID)
- [ ] Local, Data e Hora mostram dados reais
- [ ] Mensagem clara se dados não disponíveis
- [ ] Filtros funcionam
- [ ] Paginação funciona

### ✅ Resultados Mérito
- [ ] Lista carrega corretamente
- [ ] Botão "Ver PDF" funciona
- [ ] Mensagem de erro se PDF não existir
- [ ] Nomes dos alunos aparecem corretos

### ✅ Dados de Alunos
- [ ] Página carrega sem erros
- [ ] Lista de alunos aparece
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Detalhes do aluno aparecem ao clicar
- [ ] Botões de ação funcionam

### ✅ Cidades
- [ ] Lista carrega
- [ ] Criar cidade funciona
- [ ] Editar cidade funciona
- [ ] Busca funciona
- [ ] Paginação funciona

### ✅ Contratos
- [ ] Lista carrega
- [ ] Dados aparecem corretos
- [ ] Busca funciona
- [ ] Status colorido correto

### ✅ Visualização de Documentos
- [ ] Lista de documentos carrega
- [ ] Botão "Ver PDF" funciona
- [ ] Upload funciona
- [ ] Mensagem de erro se documento não existir

---

## 🐛 DEBUGGING

### Como verificar erros de API

1. **Abrir DevTools do navegador** (F12)
2. **Ir na aba Network**
3. **Filtrar por XHR/Fetch**
4. **Recarregar a página problemática**
5. **Verificar requisições em vermelho (erro)**
6. **Clicar na requisição e ver:**
   - Request URL
   - Status Code
   - Response (JSON)
   - Headers

### Como verificar logs de console

1. **Abrir DevTools** (F12)
2. **Ir na aba Console**
3. **Procurar por:**
   - Erros em vermelho
   - Logs que começam com `[NomeDaPagina]`
   - Warnings em amarelo
4. **Copiar logs relevantes**

### Erros comuns e soluções

| Erro | Possível Causa | Solução |
|------|----------------|---------|
| 500 Internal Server Error | Erro no backend | Verificar logs do backend |
| 404 Not Found | Endpoint errado ou documento não existe | Verificar URL no console |
| 401 Unauthorized | Token expirado | Fazer logout e login novamente |
| CORS Error | API não configurada para aceitar frontend | Configurar CORS no backend |
| TypeError: Cannot read property 'X' of undefined | Dados não vieram da API | Adicionar verificações de undefined |
| Network Error | API não está rodando | Verificar se backend está online |

---

## 📞 SUPORTE

Se após aplicar todas as correções ainda houver problemas:

1. **Documentar o erro:**
   - Screenshot da tela
   - Logs do console
   - Requisição da aba Network
   - Passos para reproduzir

2. **Verificar:**
   - [ ] Backend está rodando?
   - [ ] Variável `VITE_API_URL` está correta?
   - [ ] Token de autenticação está válido?
   - [ ] Banco de dados tem dados?

3. **Testar:**
   - Fazer logout e login novamente
   - Limpar cache do navegador
   - Testar em janela anônima
   - Testar em outro navegador

---

## 🎯 PRIORIDADES DE CORREÇÃO

### 🔴 CRÍTICO (corrigir primeiro)
1. **Dados de Alunos** - não carrega (bloqueador)
2. **Contratos** - não carrega (bloqueador)
3. **Cidades** - não funciona (bloqueador)

### 🟡 IMPORTANTE (corrigir em seguida)
4. **Resultado das Provas** - CPF incorreto
5. **Lista de Presença** - desalinhamento visual
6. **Aprovação Mérito** - alguns PDFs não carregam

### 🟢 MELHORIAS (corrigir por último)
7. **Resultados Mérito** - alguns PDFs 404
8. **Visualização de Documentos** - alguns PDFs não carregam
9. **Resultados ENEM** - verificar integração

---

## 📝 NOTAS FINAIS

- Todos os logs adicionados começam com `[NomeDaPagina]` para facilitar debugging
- Sempre verificar console do navegador após aplicar correções
- Testar cada funcionalidade após corrigir
- Se um problema não foi resolvido, voltar ao erro anterior e reverificar
- Manter backup do código antes de aplicar correções

**Última atualização:** 15/01/2026
