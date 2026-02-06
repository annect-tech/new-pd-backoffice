import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  primaryButtonStyles,
  progressStyles,
  tablePaginationStyles,
} from "../../styles/designSystem";
import AgentModal from "../../components/modals/AgentModal";
import PsychologistModal from "../../components/modals/PsychologistModal";
import EditStudentModal from "../../components/modals/EditStudentModal";
import { useStudentData } from "../../hooks/useStudentData";

interface StudentRow {
  id: string;
  completeName: string;
  registration: string;
  corp_email: string;
  monitor: string;
  status: string;
  cpf: string;
  birth_date: string;
  username: string;
  origin: "novo" | "antigo";
  user_data_id?: string;
}

const DadosAlunos: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook para buscar dados de alunos (student_data)
  const {
    students,
    loading: studentLoading,
    pagination: studentPagination,
    fetchStudents,
    snackbar: hookSnackbar,
    closeSnackbar: closeHookSnackbar,
  } = useStudentData();

  const [items, setItems] = useState<StudentRow[]>([]);
  const [oldItems, setOldItems] = useState<StudentRow[]>([]);
  const [oldLoading, setOldLoading] = useState(false);
  const [_oldError, setOldError] = useState<string | null>(null);
  const [hasFetchedOld, setHasFetchedOld] = useState(false);
  const loading = studentLoading;
  const error = null;
  const [viewerUrl] = useState<string | null>(null); // reservado se necessário
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Ativo" | "Inativo" | "Retido" | "Suspenso"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [showOld, setShowOld] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [openPsychoModal, setOpenPsychoModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  
  // Dados mockados para agentes e psicólogos
  const MOCK_AGENTS = [
    { name: "Carlos Mendes", value: "carlos.mendes@projetodesenvolve.com.br", email: "carlos.mendes@projetodesenvolve.com.br" },
    { name: "Ana Prado", value: "ana.prado@projetodesenvolve.com.br", email: "ana.prado@projetodesenvolve.com.br" },
  ];
  
  const MOCK_PSYCHOLOGISTS = [
    { name: "Marcos Amatoshi", value: "marcos.amatoshi@projetodesenvolve.com.br" },
    { name: "Nislayne julia", value: "nislayne@projetodesenvolve.com.br" },
    { name: "Isabela Jales", value: "isabelajales@projetodesenvolve.com.br" },
  ];
  
  // Buscar student_data com paginação
  useEffect(() => {
    fetchStudents(page + 1, rowsPerPage, searchTerm.trim() || undefined);
  }, [page, rowsPerPage, searchTerm, fetchStudents]);

  // Mapear StudentData para StudentRow
  useEffect(() => {
    if (students && students.length > 0) {
      const convertedStudents: StudentRow[] = students.map((student) => {
        // Construir nome completo a partir de first_name + last_name se completeName não existir
        const completeName = student.completeName
          || [student.first_name, student.last_name].filter(Boolean).join(" ")
          || "—";

        return {
          id: String(student.id),
          user_data_id: student.user_data_id ? String(student.user_data_id) : (student.user_id ? String(student.user_id) : String(student.id)),
          completeName,
          registration: student.registration || "—",
          corp_email: student.corp_email || "—",
          monitor: student.monitor || "—",
          status: student.status || "Inativo",
          cpf: student.cpf || "—",
          birth_date: student.birth_date || "—",
          username: student.username || "—",
          origin: "novo" as const,
        };
      });
      setItems(convertedStudents);
    }
  }, [students]);

  const combinedRows = useMemo(() => {
    return showOld ? oldItems : items;
  }, [items, oldItems, showOld]);

  const filteredRows = useMemo(() => {
    // Se estiver mostrando dados novos da API, não precisa filtrar localmente
    // pois a busca já é feita no backend
    if (!showOld) {
      return combinedRows.filter((row) => {
        if (statusFilter === "all") return true;
        return row.status === statusFilter;
      });
    }
    
    // Para dados antigos, filtrar localmente
    return combinedRows
      .filter(
        (row) =>
          row.completeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.cpf.includes(searchTerm)
      )
      .filter((row) => {
        if (statusFilter === "all") return true;
        return row.status === statusFilter;
      });
  }, [combinedRows, searchTerm, statusFilter, showOld]);

  const paginatedRows = useMemo(() => {
    // Se estiver mostrando dados novos da API, não paginar localmente
    if (!showOld) {
      return filteredRows;
    }
    
    // Para dados antigos, paginar localmente
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage, showOld]);
  
  // Total de itens para paginação
  const totalItems = showOld ? filteredRows.length : studentPagination.totalItems;

  const handleRefresh = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setOldItems([]);
    setHasFetchedOld(false);
    setOldError(null);
    setShowOld(false);
    setPage(0);
    setSelectedStudent(null);
    fetchStudents(1, rowsPerPage);
  };
  
  const fetchOldFromApi = async () => {
    if (hasFetchedOld) {
      setShowOld(true);
      return;
    }
    
    setOldLoading(true);
    setOldError(null);
    try {
      const res = await fetch("https://form.pdinfinita.com.br/enrolled", {
        headers: {
          "api-key": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
        },
      });
      if (!res.ok) throw new Error(`Erro ao buscar dados antigos (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.data ? data.data : [];
      const mapped: StudentRow[] = arr.map((s: any, idx: number) => ({
        id: s.id?.toString() || s.registrationCode?.toString() || s.inscription?.toString() || `old-${idx}`,
        completeName: s.nomeCompleto || s.name || "N/A",
        registration: s.registrationCode || s.matricula || s.inscription || "",
        corp_email: s.emailPd || s.email || "",
        monitor: s.monitor || "N/A",
        status: s.status || "Inativo",
        cpf: s.cpf || "",
        birth_date: s.dataNasc || "",
        username: s.agenteDoSucesso || s.username || "",
        origin: "antigo",
      }));
      setOldItems(mapped);
      setHasFetchedOld(true);
      setShowOld(true);
      setPage(0);
    } catch (err: any) {
      setOldError(err.message || "Erro ao buscar dados antigos");
    } finally {
      setOldLoading(false);
    }
  };
  
  const toggleOldData = () => {
    if (showOld) {
      setShowOld(false);
      setPage(0);
      setSelectedStudent(null);
    } else {
      fetchOldFromApi();
    }
  };
  
  const handleSelectStudent = (student: StudentRow) => {
    setSelectedStudent(student);
    setSeeMore(false);
  };
  
  const handleSaveStudent = (updatedStudent: StudentRow) => {
    if (updatedStudent.origin === "novo") {
      setItems((prev) =>
        prev.map((item) => (item.id === updatedStudent.id ? updatedStudent : item))
      );
    } else {
      setOldItems((prev) =>
        prev.map((item) => (item.id === updatedStudent.id ? updatedStudent : item))
      );
    }
    setSelectedStudent(updatedStudent);
    handleSnackbarMessage("Aluno atualizado com sucesso!");
  };
  
  const handleEditError = (message: string) => {
    handleSnackbarMessage(message);
  };
  
  const handleSnackbarMessage = (message: string) => {
    setSnackbar({ open: true, message });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nome Completo",
      "Matrícula",
      "E-mail Corporativo",
      "Monitor",
      "Status",
      "CPF",
      "Data de Nascimento",
      "Agente de Sucesso",
      "Origem",
    ];
    const csvRows = filteredRows.map((row) => [
      row.id,
      row.completeName,
      row.registration,
      row.corp_email,
      row.monitor,
      row.status,
      row.cpf,
      row.birth_date,
      row.username,
      row.origin,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dados_alunos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "#4CAF50";
      case "Inativo":
        return "#9E9E9E";
      case "Retido":
        return "#FF9800";
      case "Suspenso":
        return "#F44336";
      default:
        return "#666";
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box 
        sx={{ 
          flex: 1, 
          p: { xs: 2, sm: 3, md: 4 }, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "auto",
          width: "100%",
        }}
      >
        <Box 
          sx={{ 
            maxWidth: 1400, 
            width: "100%", 
            margin: "0 auto",
          }}
        >
          <PageHeader
            title="Dados de Alunos"
            subtitle="Visualize e gerencie informações dos alunos."
            description="Esta página permite visualizar, pesquisar e gerenciar os dados completos dos alunos cadastrados no sistema. Você pode filtrar por status, pesquisar por nome/matrícula/CPF, editar informações, vincular agentes de sucesso e psicólogos, e exportar os dados em diferentes formatos."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Dados de Alunos" },
            ]}
          />
          <Fade in timeout={1000}>
            <Paper {...paperStyles} sx={{ ...paperStyles.sx, overflow: "hidden" }}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por nome, matrícula ou CPF..."
                    variant="standard"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton {...iconButtonStyles} onClick={(e) => setStatusAnchor(e.currentTarget)}>
                    <FilterListIcon />
                  </IconButton>
                  <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>
                    <MenuItem onClick={() => { setStatusFilter("all"); setStatusAnchor(null); }}>
                      Todos ({combinedRows.length})
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("Ativo"); setStatusAnchor(null); }}>
                      Ativos ({combinedRows.filter((i) => i.status === "Ativo").length})
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("Inativo"); setStatusAnchor(null); }}>
                      Inativos ({combinedRows.filter((i) => i.status === "Inativo").length})
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("Retido"); setStatusAnchor(null); }}>
                      Retidos ({combinedRows.filter((i) => i.status === "Retido").length})
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("Suspenso"); setStatusAnchor(null); }}>
                      Suspensos ({combinedRows.filter((i) => i.status === "Suspenso").length})
                    </MenuItem>
                  </Menu>
                  <IconButton {...iconButtonStyles} onClick={(e) => setDownloadAnchor(e.currentTarget)}>
                    <DownloadIcon />
                  </IconButton>
                  <Menu anchorEl={downloadAnchor} open={Boolean(downloadAnchor)} onClose={() => setDownloadAnchor(null)}>
                    <MenuItem
                      onClick={() => {
                        handleExportCSV();
                        setDownloadAnchor(null);
                      }}
                    >
                      CSV
                    </MenuItem>
                  </Menu>
                  <IconButton {...iconButtonStyles} onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(APP_ROUTES.STUDENT_CREATE)}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Novo
                  </Button>
                  <Button
                    variant="text"
                    onClick={toggleOldData}
                    disabled={oldLoading}
                    sx={{ 
                      color: designSystem.colors.primary.main,
                      whiteSpace: "nowrap",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {oldLoading ? "Carregando..." : showOld ? "Ocultar dados antigos" : "Mostrar dados antigos"}
                  </Button>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : error ? (
                <Box p={2}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
                  <Table size="small" sx={{ minWidth: 1200 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 60 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 180 }}>Nome Completo</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 120 }}>Matrícula</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 220 }}>E-mail Corporativo</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 120 }}>Monitor</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }}>Status</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 130 }}>CPF</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 120 }}>Data de Nasc.</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 140 }}>Agente de Sucesso</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 110 }}>Origem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              {searchTerm || statusFilter !== "all" ? "Nenhum resultado encontrado" : "Nenhum dado disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => (
                          <TableRow
                            key={row.id}
                            {...tableRowHoverStyles}
                            onClick={() => handleSelectStudent(row)}
                            sx={{
                              ...tableRowHoverStyles.sx,
                              cursor: "pointer",
                              ...(selectedStudent?.id === row.id && {
                                backgroundColor: `${designSystem.colors.primary.lighter} !important`,
                                "&:hover": { backgroundColor: `${designSystem.colors.primary.light} !important` },
                              }),
                            }}
                          >
                            <TableCell sx={{ width: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.id}</TableCell>
                            <TableCell sx={{ width: 180, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.completeName}</TableCell>
                            <TableCell sx={{ width: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.registration}</TableCell>
                            <TableCell sx={{ width: 220, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.corp_email}</TableCell>
                            <TableCell sx={{ width: 120, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.monitor}</TableCell>
                            <TableCell sx={{ width: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <Typography sx={{ color: getStatusColor(row.status), fontWeight: 600 }}>
                                {row.status}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.cpf}</TableCell>
                            <TableCell sx={{ width: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.birth_date}</TableCell>
                            <TableCell sx={{ width: 140, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.username}</TableCell>
                            <TableCell sx={{ width: 110, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.origin}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                    {...tablePaginationStyles}
                  />
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Componentes do pd-dados-alunos embaixo da tabela */}
      {selectedStudent && (
        <Box sx={{ mt: 3, maxWidth: 1400, width: "100%", margin: "24px auto 0", px: { xs: 2, sm: 3, md: 4 } }}>
          {/* DashboardHead - Botões de ação */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              mb: 2,
              borderTopLeftRadius: "12px",
              borderBottomRightRadius: "12px",
              boxShadow: "2px 2px 10px 0px rgba(0,0,0,0.75)",
            }}
          >
            <Box
              display={"flex"}
              justifyContent={"space-evenly"}
              alignItems={"center"}
              margin={0.75}
            >
              <Button
                variant="text"
                color="primary"
                onClick={() => setOpenPsychoModal(true)}
              >
                Enviar para Recuperação
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={() => setOpenAgentModal(true)}
              >
                Transferir Aluno
              </Button>
            </Box>
          </Paper>

          {/* DataTable - Dados detalhados do aluno */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              mb: 2,
              borderTopLeftRadius: "12px",
              boxShadow: "2px 2px 10px 0px rgba(0,0,0,0.75)",
            }}
          >
            {/* Status destacado */}
            <Box
              width={"100%"}
              bgcolor={getStatusColor(selectedStudent.status)}
              sx={{ borderTopLeftRadius: "12px" }}
            >
              <Typography
                p={1}
                textAlign={"center"}
                variant="h3"
                fontWeight={700}
                fontSize={"1.5rem"}
              >
                {selectedStudent.status}
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Box
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        position={"relative"}
                        p={2}
                      >
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          color={"#1F2937"}
                          position={"absolute"}
                          left={"50%"}
                          sx={{
                            fontSize: {
                              xs: "2rem",
                              sm: "1.5rem",
                              md: "1.5rem",
                              lg: "1.8rem",
                              xl: "1.8rem",
                            },
                            transform: "translateX(-50%)",
                          }}
                        >
                          Dados do aluno
                        </Typography>
                        <IconButton
                          {...iconButtonStyles}
                          sx={{ ...iconButtonStyles.sx, position: "absolute", right: 0 }}
                          onClick={() => setOpenEditModal(true)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} align="justify">
                      <Typography>
                        <strong>Nome:</strong> {selectedStudent.completeName}
                      </Typography>
                    </TableCell>
                    <TableCell align="justify">
                      <Typography>
                        <strong>CPF:</strong> {selectedStudent.cpf}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="justify">
                      <Box display={"flex"} alignItems={"center"}>
                        <Typography>
                          <strong>Email:</strong> {selectedStudent.corp_email}
                        </Typography>
                        <IconButton
                          {...iconButtonStyles}
                          onClick={() =>
                            window.open(`mailto:${selectedStudent.corp_email}`, "_blank")
                          }
                        >
                          <EmailIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="justify">
                      <Typography>
                        <strong>Matrícula:</strong> {selectedStudent.registration}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {seeMore && (
                    <>
                      <TableRow>
                        <TableCell align="justify">
                          <Typography>
                            <strong>Data de nascimento:</strong> {selectedStudent.birth_date}
                          </Typography>
                        </TableCell>
                        <TableCell align="justify">
                          <Typography>
                            <strong>Monitor:</strong> {selectedStudent.monitor}
                          </Typography>
                        </TableCell>
                        <TableCell align="justify">
                          <Typography>
                            <strong>Agente de Sucesso:</strong> {selectedStudent.username}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Box>
                        <Button
                          {...primaryButtonStyles}
                          onClick={() => setSeeMore(!seeMore)}
                        >
                          {seeMore ? "Ver menos" : "Ver mais"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Modais */}
      <AgentModal
        open={openAgentModal}
        agentesOp={MOCK_AGENTS}
        close={(agente) => {
          if (agente !== "close") {
            handleSnackbarMessage(`Aluno transferido para ${agente}`);
          }
          setOpenAgentModal(false);
        }}
      />

      <PsychologistModal
        open={openPsychoModal}
        psicologosOp={MOCK_PSYCHOLOGISTS}
        close={(psychologist) => {
          if (psychologist !== "close") {
            handleSnackbarMessage(`Aluno enviado para recuperação: ${psychologist}`);
          }
          setOpenPsychoModal(false);
        }}
      />

      <EditStudentModal
        open={openEditModal}
        student={selectedStudent}
        onClose={() => setOpenEditModal(false)}
        onSave={handleSaveStudent}
        onError={handleEditError}
        agents={MOCK_AGENTS}
      />

      {/* Snackbar local */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      {/* Snackbar do hook useSelective */}
      <Snackbar
        open={hookSnackbar.open}
        autoHideDuration={3000}
        onClose={closeHookSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeHookSnackbar}
          severity={hookSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {hookSnackbar.message}
        </Alert>
      </Snackbar>

      {viewerUrl && null}
    </Box>
  );
};

export default DadosAlunos;
