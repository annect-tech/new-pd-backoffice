import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { httpClient } from "../../core/http/httpClient";
import PageHeader from "../../components/ui/page/PageHeader";
import { APP_ROUTES } from "../../util/constants";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

interface Endpoint {
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  category: string;
  queryParams?: { name: string; default: any; description: string }[];
}

const ENDPOINTS: Endpoint[] = [
  // ==================== HEALTH ====================
  { name: "Health Check", method: "GET", path: "/health", description: "Lista todos os serviços e seus status", category: "🏥 Health" },
  
  // ==================== USERS ====================
  { name: "Listar Usuários (Tenant)", method: "GET", path: "/admin/users", description: "Usuários do tenant atual", category: "👥 Users", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }, { name: "search", default: "", description: "Buscar" }] },
  { name: "Buscar User por ID (Admin)", method: "GET", path: "/admin/users/{id}", description: "Busca dados completos de um usuário por ID", category: "👥 Users", queryParams: [{ name: "id", default: "4255", description: "ID do usuário" }] },
  { name: "Listar TODOS Usuários", method: "GET", path: "/admin/users/admin-master", description: "Todos os usuários (sem filtro tenant)", category: "👥 Users", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 100, description: "Itens por página" }, { name: "search", default: "", description: "Buscar" }] },
  { name: "Listar Usuários (User)", method: "GET", path: "/user/users", description: "Lista todos os usuários", category: "👥 Users", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }, { name: "search", default: "", description: "Buscar" }] },
  
  // ==================== USER DATA (SELETIVO) ====================
  { name: "Listar User Data (Admin)", method: "GET", path: "/admin/user-data", description: "Dados do seletivo (seletivo_userdata)", category: "📋 User Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Buscar User Data por ID (Admin)", method: "GET", path: "/admin/user-data/{id}", description: "Busca dados completos de um usuário por ID", category: "📋 User Data", queryParams: [{ name: "id", default: "1", description: "ID do usuário" }] },
  { name: "Buscar User Data (Admin)", method: "GET", path: "/admin/user-data/search-student", description: "Busca user data por CPF/Data", category: "📋 User Data", queryParams: [{ name: "cpf", default: "", description: "CPF" }, { name: "birth_date", default: "", description: "Data Nascimento" }] },
  { name: "Listar User Data (User)", method: "GET", path: "/user/user-data", description: "Lista user data", category: "📋 User Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Buscar User Data (User)", method: "GET", path: "/user/user-data/search-student", description: "Busca user data por CPF/Data", category: "📋 User Data", queryParams: [{ name: "cpf", default: "", description: "CPF" }, { name: "birth_date", default: "", description: "Data Nascimento" }] },
  
  // ==================== STUDENT DATA ====================
  { name: "Listar Student Data (Admin)", method: "GET", path: "/admin/student-data", description: "Dados acadêmicos dos alunos", category: "🎓 Student Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Student Data (User)", method: "GET", path: "/user/student-data", description: "Dados acadêmicos dos alunos", category: "🎓 Student Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== STUDENT EXAMS ====================
  { name: "Listar Student Exams (Admin)", method: "GET", path: "/admin/student-exams", description: "Exames/Provas dos alunos", category: "📝 Student Exams", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Student Exams (User)", method: "GET", path: "/user/student-exams", description: "Exames/Provas dos alunos", category: "📝 Student Exams", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== ENEM RESULTS ====================
  { name: "Listar ENEM Results (Admin)", method: "GET", path: "/admin/enem-results", description: "Resultados do ENEM", category: "📊 ENEM Results", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar ENEM Results (User)", method: "GET", path: "/user/enem-results", description: "Resultados do ENEM", category: "📊 ENEM Results", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== ACADEMIC MERIT ====================
  { name: "Listar Academic Merit (Admin)", method: "GET", path: "/admin/academic-merit-documents", description: "Documentos de mérito acadêmico", category: "🏆 Academic Merit", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Academic Merit (User)", method: "GET", path: "/user/academic-merit-documents", description: "Documentos de mérito acadêmico", category: "🏆 Academic Merit", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== ADDRESSES ====================
  { name: "Listar Addresses (Admin)", method: "GET", path: "/admin/addresses", description: "Endereços dos usuários", category: "📍 Addresses", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Addresses (User)", method: "GET", path: "/user/addresses", description: "Endereços dos usuários", category: "📍 Addresses", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== GUARDIANS ====================
  { name: "Listar Guardians (Admin)", method: "GET", path: "/admin/guardians", description: "Responsáveis/Guardiões", category: "👨‍👩‍👧 Guardians", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Guardians (User)", method: "GET", path: "/user/guardians", description: "Responsáveis/Guardiões", category: "👨‍👩‍👧 Guardians", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== PERSONAS ====================
  { name: "Listar Personas (Admin)", method: "GET", path: "/admin/persona", description: "Dados de persona dos usuários", category: "🎭 Personas", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Personas (User)", method: "GET", path: "/user/persona", description: "Dados de persona dos usuários", category: "🎭 Personas", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== EXAM MANAGEMENT ====================
  { name: "Listar Exam Locais (Admin)", method: "GET", path: "/admin/exam", description: "Locais de prova", category: "🏫 Exam Management", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Exam Locais (User)", method: "GET", path: "/user/exam", description: "Locais de prova", category: "🏫 Exam Management", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== EXAM DATES ====================
  { name: "Listar Exam Dates (Admin)", method: "GET", path: "/admin/exam/dates/{localId}", description: "Lista datas de um local específico", category: "📅 Exam Dates", queryParams: [{ name: "localId", default: "1", description: "ID do Local" }] },
  { name: "Listar Exam Dates (User)", method: "GET", path: "/user/exam/dates/{localId}", description: "Lista datas de um local específico", category: "📅 Exam Dates", queryParams: [{ name: "localId", default: "1", description: "ID do Local" }] },
  
  // ==================== EXAM HOURS ====================
  { name: "Listar Exam Hours (Admin)", method: "GET", path: "/admin/exam/hours/{dateId}", description: "Lista horários de uma data específica", category: "🕐 Exam Hours", queryParams: [{ name: "dateId", default: "1", description: "ID da Data" }] },
  { name: "Listar Exam Hours (User)", method: "GET", path: "/user/exam/hours/{dateId}", description: "Lista horários de uma data específica", category: "🕐 Exam Hours", queryParams: [{ name: "dateId", default: "1", description: "ID da Data" }] },
  
  // ==================== CANDIDATE DOCUMENTS ====================
  { name: "Listar Candidate Documents (Admin)", method: "GET", path: "/admin/candidate-documents", description: "Documentos dos candidatos", category: "📄 Candidate Documents", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Candidate Documents (User)", method: "GET", path: "/user/candidate-documents", description: "Documentos dos candidatos", category: "📄 Candidate Documents", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== CONTRACTS ====================
  { name: "Listar Contracts (Admin)", method: "GET", path: "/admin/contract", description: "Lista todos os contratos gerados", category: "📜 Contracts", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Contracts (User)", method: "GET", path: "/user/contract", description: "Lista todos os contratos gerados", category: "📜 Contracts", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== TENANT CITIES ====================
  { name: "Listar Tenant Cities (Admin)", method: "GET", path: "/admin/tenant-cities", description: "Lista todas as Tenant Cities", category: "🏙️ Tenant Cities", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Tenant Cities (User)", method: "GET", path: "/user/tenant-cities", description: "Lista todas as Tenant Cities", category: "🏙️ Tenant Cities", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== ALLOWED CITIES ====================
  { name: "Listar Allowed Cities (Admin)", method: "GET", path: "/admin/allowed-cities", description: "Lista as cidades permitidas", category: "🗺️ Allowed Cities", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Allowed Cities (User)", method: "GET", path: "/user/allowed-cities", description: "Lista as cidades permitidas", category: "🗺️ Allowed Cities", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== USER PROFILES ====================
  { name: "Listar User Profiles (Admin)", method: "GET", path: "/admin/user-profiles", description: "Lista todos os perfis de usuários", category: "👤 User Profiles", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar User Profiles (User)", method: "GET", path: "/user/user-profiles", description: "Lista todos os perfis de usuários", category: "👤 User Profiles", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  
  // ==================== REGISTRATION DATA ====================
  { name: "Listar Registration Data (Admin)", method: "GET", path: "/admin/registration-data", description: "Lista todos os dados cadastrais", category: "📝 Registration Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
  { name: "Listar Registration Data (User)", method: "GET", path: "/user/registration-data", description: "Lista todos os dados cadastrais", category: "📝 Registration Data", queryParams: [{ name: "page", default: 1, description: "Página" }, { name: "size", default: 10, description: "Itens por página" }] },
];

const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"json" | "table">("json");
  const [params, setParams] = useState<Record<string, any>>({});

  const handleExecute = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Separar path params de query params
      let finalPath = selectedEndpoint.path;
      const queryParams: Record<string, any> = {};

      selectedEndpoint.queryParams?.forEach((param) => {
        const value = params[param.name] ?? param.default;
        
        // Se o path contém {paramName}, substituir
        if (finalPath.includes(`{${param.name}}`)) {
          finalPath = finalPath.replace(`{${param.name}}`, String(value));
        } else if (value) {
          // Caso contrário, é query param
          queryParams[param.name] = value;
        }
      });

      let result = await httpClient.get(
        API_URL,
        finalPath,
        Object.keys(queryParams).length > 0 ? { queryParams } : undefined
      );

      if (result.status === 403 && finalPath.startsWith('/admin/')) {
        const userPath = finalPath.replace('/admin/', '/user/');
        
        const fallbackResult = await httpClient.get(
          API_URL,
          userPath,
          Object.keys(queryParams).length > 0 ? { queryParams } : undefined
        );
        
        if (fallbackResult.status >= 200 && fallbackResult.status < 300) {
          result = fallbackResult;
          setError(`⚠️ Endpoint ${finalPath} retornou 403 (Sem permissão). Usando ${userPath} como alternativa.`);
        }
      }

      if (result.status >= 400) {
        const errorMsg = result.data?.message || result.message || `Erro ${result.status}`;
        setError(errorMsg);
        setResponse(result.data || result);
      } else {
        setResponse(result.data);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao executar requisição");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data: any) => {
    if (!data) return null;

    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data.data)) {
      items = data.data;
    } else if (Array.isArray(data.results)) {
      items = data.results;
    }

    if (items.length === 0) {
      return <Alert severity="info">Nenhum dado retornado</Alert>;
    }

    const keys = Object.keys(items[0]);

    return (
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {keys.map((key) => (
                <TableCell key={key} sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  {key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.slice(0, 50).map((item, idx) => (
              <TableRow key={idx} hover>
                {keys.map((key) => (
                  <TableCell key={key}>
                    {typeof item[key] === "object"
                      ? JSON.stringify(item[key])
                      : String(item[key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {items.length > 50 && (
          <Alert severity="info" sx={{ m: 2 }}>
            Mostrando apenas os primeiros 50 de {items.length} registros
          </Alert>
        )}
      </TableContainer>
    );
  };

  const categories = Array.from(new Set(ENDPOINTS.map((e) => e.category)));

  return (
    <Box sx={{ minHeight: "100vh", p: 3 }}>
      <PageHeader
        title="API Explorer"
        subtitle="Teste todos os endpoints da API"
        description="Esta página permite testar e visualizar dados de todos os endpoints da API. Selecione um endpoint, configure os parâmetros e execute para ver os resultados."
        breadcrumbs={[
          { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
          { label: "API Explorer" },
        ]}
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Sidebar - Lista de Endpoints */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Endpoints Disponíveis
            </Typography>
            
            {categories.map((category) => (
              <Accordion key={category} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {ENDPOINTS.filter((e) => e.category === category).map((endpoint) => (
                    <Button
                      key={endpoint.path}
                      fullWidth
                      variant={selectedEndpoint?.path === endpoint.path ? "contained" : "text"}
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        setResponse(null);
                        setError(null);
                        // Inicializar params com valores padrão
                        const defaultParams = endpoint.queryParams?.reduce((acc, param) => {
                          acc[param.name] = param.default;
                          return acc;
                        }, {} as Record<string, any>) || {};
                        setParams(defaultParams);
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        textTransform: "none",
                        py: 1,
                      }}
                    >
                      <Chip
                        label={endpoint.method}
                        size="small"
                        color={endpoint.method === "GET" ? "primary" : "secondary"}
                        sx={{ mr: 1, minWidth: 50 }}
                      />
                      <Typography variant="body2" noWrap>
                        {endpoint.name}
                      </Typography>
                    </Button>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {selectedEndpoint ? (
            <Paper sx={{ p: 3 }}>
              {/* Endpoint Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedEndpoint.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedEndpoint.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Chip label={selectedEndpoint.method} color="primary" />
                  <Chip label={selectedEndpoint.path} variant="outlined" />
                </Box>
              </Box>

              {/* Query Parameters */}
              {selectedEndpoint.queryParams && selectedEndpoint.queryParams.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Parâmetros:
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedEndpoint.queryParams.map((param) => (
                      <Grid item xs={12} sm={6} key={param.name}>
                        <TextField
                          label={param.name}
                          helperText={param.description}
                          value={params[param.name] ?? param.default}
                          onChange={(e) =>
                            setParams((prev) => ({
                              ...prev,
                              [param.name]: e.target.value,
                            }))
                          }
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Execute Button */}
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                onClick={handleExecute}
                disabled={loading}
                fullWidth
                size="large"
              >
                {loading ? "Executando..." : "Executar Requisição"}
              </Button>

              {/* Response */}
              {(response || error) && (
                <Box sx={{ mt: 3 }}>
                  {/* View Mode Toggle */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Button
                      size="small"
                      variant={viewMode === "json" ? "contained" : "outlined"}
                      startIcon={<CodeIcon />}
                      onClick={() => setViewMode("json")}
                    >
                      JSON
                    </Button>
                    <Button
                      size="small"
                      variant={viewMode === "table" ? "contained" : "outlined"}
                      startIcon={<TableChartIcon />}
                      onClick={() => setViewMode("table")}
                      disabled={!response}
                    >
                      Tabela
                    </Button>
                  </Box>

                  {/* Error or Warning */}
                  {error && (
                    <Alert severity={error.startsWith("⚠️") ? "warning" : "error"}>
                      {error}
                    </Alert>
                  )}

                  {/* Response Content */}
                  {response && (
                    <>
                      {viewMode === "json" ? (
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: "#1e1e1e",
                            color: "#d4d4d4",
                            maxHeight: 600,
                            overflow: "auto",
                          }}
                        >
                          <pre style={{ margin: 0, fontSize: "12px" }}>
                            {JSON.stringify(response, null, 2)}
                          </pre>
                        </Paper>
                      ) : (
                        renderTable(response)
                      )}

                      {/* Stats */}
                      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                        {response.totalItems && (
                          <Chip label={`Total: ${response.totalItems} itens`} size="small" />
                        )}
                        {response.data && Array.isArray(response.data) && (
                          <Chip label={`Retornados: ${response.data.length} itens`} size="small" />
                        )}
                        {response.currentPage && (
                          <Chip label={`Página: ${response.currentPage}/${response.totalPages}`} size="small" />
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Selecione um endpoint para começar
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApiExplorer;
