import React, { useMemo, useState } from "react";
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
}

// Dados mockados (substituir por integração futura)
const MOCK_NEW_STUDENTS: StudentRow[] = [
  {
    id: "1",
    completeName: "João Silva",
    registration: "2025A001",
    corp_email: "joao.silva@empresa.com",
    monitor: "Carlos Mendes",
    status: "Ativo",
    cpf: "123.456.789-00",
    birth_date: "1998-03-10",
    username: "joao.silva",
    origin: "novo",
  },
  {
    id: "2",
    completeName: "Maria Santos",
    registration: "2025A002",
    corp_email: "maria.santos@empresa.com",
    monitor: "Ana Prado",
    status: "Ativo",
    cpf: "987.654.321-00",
    birth_date: "1997-07-22",
    username: "maria.santos",
    origin: "novo",
  },
  {
    id: "3",
    completeName: "Pedro Oliveira",
    registration: "2025A003",
    corp_email: "pedro.oliveira@empresa.com",
    monitor: "Carlos Mendes",
    status: "Suspenso",
    cpf: "456.789.123-00",
    birth_date: "1999-01-15",
    username: "pedro.oliveira",
    origin: "novo",
  },
];


const DadosAlunos: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<StudentRow[]>([...MOCK_NEW_STUDENTS]);
  const [oldItems, setOldItems] = useState<StudentRow[]>([]);
  const [oldLoading, setOldLoading] = useState(false);
  const [_oldError, setOldError] = useState<string | null>(null);
  const [hasFetchedOld, setHasFetchedOld] = useState(false);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
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
  

  const combinedRows = useMemo(() => {
    return showOld ? oldItems : items;
  }, [items, oldItems, showOld]);

  const filteredRows = useMemo(() => {
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
  }, [combinedRows, searchTerm, statusFilter]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleRefresh = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setItems([...MOCK_NEW_STUDENTS]);
    setOldItems([]);
    setHasFetchedOld(false);
    setOldError(null);
    setShowOld(false);
    setPage(0);
    setSelectedStudent(null);
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
        overflowX: "hidden", 
        width: "100%",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <Box 
        sx={{ 
          flex: 1, 
          p: { xs: 2, sm: 3, md: 4 }, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "auto", 
          overflowX: "hidden", 
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <Box 
          sx={{ 
            width: "100%", 
            margin: "0 auto", 
            overflowX: "hidden", 
            boxSizing: "border-box",
            position: "relative",
            minWidth: 0,
            maxWidth: "100%",
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
            <Paper {...paperStyles} sx={{ ...paperStyles.sx, overflow: "hidden", width: "100%", maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", minWidth: 0 }}>
              <Toolbar 
                {...toolbarStyles} 
                sx={{ 
                  ...toolbarStyles.sx, 
                  overflowX: "hidden",
                  flexWrap: "wrap",
                  gap: 2,
                  boxSizing: "border-box",
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: { xs: "100%", sm: 240 }, maxWidth: { xs: "100%", sm: 420 } }}>
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
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  flexWrap="wrap"
                  sx={{
                    minWidth: 0,
                    flexShrink: 1,
                  }}
                >
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
                <Box 
                  sx={{ 
                    width: "100%", 
                    maxWidth: "100%",
                    overflow: "hidden", 
                    boxSizing: "border-box", 
                    minWidth: 0, 
                    position: "relative",
                    display: "block",
                    paddingRight: "24px",
                  }}
                >
                  <TableContainer 
                    component="div"
                    sx={{ 
                      overflowX: "auto", 
                      overflowY: "visible",
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      display: "block",
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: designSystem.colors.background.secondary,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: designSystem.colors.border.dark,
                        borderRadius: "4px",
                        "&:hover": {
                          backgroundColor: designSystem.colors.primary.main,
                        },
                      },
                    }}
                  >
                    {/* set a minimum table width so that when viewport is smaller a horizontal scrollbar appears inside the table container */}
                    <Table stickyHeader size="small" sx={{ minWidth: 1320 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 70 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>Nome Completo</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>Matrícula</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>E-mail Corporativo</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 140 }}>Monitor</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 110 }}>Status</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 130 }}>CPF</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>Data de Nascimento</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 170 }}>Agente de Sucesso</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100 }}>Origem</TableCell>
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
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.id}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.completeName}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.registration}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.corp_email}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.monitor}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <Typography sx={{ color: getStatusColor(row.status), fontWeight: 600 }}>
                                {row.status}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.cpf}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.birth_date}</TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.username}</TableCell>
                            <TableCell sx={{ textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.origin}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                    {...tablePaginationStyles}
                    sx={{
                      ...tablePaginationStyles.sx,
                      width: "100%",
                      maxWidth: "100%",
                      overflowX: "auto",
                      boxSizing: "border-box",
                    }}
                  />
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Componentes do pd-dados-alunos embaixo da tabela */}
      {selectedStudent && (
        <Box sx={{ mt: 3, maxWidth: 1400, width: "100%", margin: "24px auto 0", px: { xs: 2, sm: 3, md: 4 }, overflowX: "hidden" }}>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      {viewerUrl && null}
    </Box>
  );
};

export default DadosAlunos;
