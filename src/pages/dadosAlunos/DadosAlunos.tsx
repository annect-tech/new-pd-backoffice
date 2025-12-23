import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
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
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";

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

const MOCK_OLD_STUDENTS: StudentRow[] = [
  {
    id: "A-1001",
    completeName: "Carla Menezes",
    registration: "2019B010",
    corp_email: "carla.menezes@aluno.com",
    monitor: "N/A",
    status: "Inativo",
    cpf: "321.654.987-00",
    birth_date: "1995-05-12",
    username: "agente.paulo",
    origin: "antigo",
  },
  {
    id: "A-1002",
    completeName: "Bruno Lima",
    registration: "2018B011",
    corp_email: "bruno.lima@aluno.com",
    monitor: "N/A",
    status: "Retido",
    cpf: "741.852.963-00",
    birth_date: "1994-11-03",
    username: "agente.marina",
    origin: "antigo",
  },
];

const DadosAlunos: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<StudentRow[]>([...MOCK_NEW_STUDENTS]);
  const [oldItems, setOldItems] = useState<StudentRow[]>([]);
  const [oldLoading, setOldLoading] = useState(false);
  const [oldError, setOldError] = useState<string | null>(null);
  const [hasFetchedOld, setHasFetchedOld] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [viewerUrl] = useState<string | null>(null); // reservado se necessário
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Ativo" | "Inativo" | "Retido" | "Suspenso"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [showOld, setShowOld] = useState(false);

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
    <Box p={2}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            color: "#A650F0",
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Dados de Alunos</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: "#A650F0", fontWeight: 600, mb: 2 }}>
          Dados de Alunos
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: "#F3E5F5",
            borderRadius: 2,
            borderLeft: "4px solid #A650F0",
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Dados de Alunos</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e gerencie os dados dos alunos. Pesquise por nome, matrícula ou CPF,
            filtre por status, exporte em CSV e alterna entre alunos atuais e dados antigos (mock).
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por nome, matrícula ou CPF..."
              variant="standard"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiInput-underline:before": { borderBottomColor: "#A650F0" },
                "& .MuiInput-underline:hover:before": { borderBottomColor: "#A650F0" },
                "& .MuiInput-underline:after": { borderBottomColor: "#A650F0" },
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={(e) => setStatusAnchor(e.currentTarget)}>
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
            <IconButton onClick={(e) => setDownloadAnchor(e.currentTarget)}>
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
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate(APP_ROUTES.STUDENT_CREATE)}
            >
              Novo
            </Button>
            <Button
              variant="text"
              onClick={() => setShowOld((p) => !p)}
              sx={{ color: "#A650F0" }}
            >
              {showOld ? "Ocultar dados antigos" : "Mostrar dados antigos"}
            </Button>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 70 }}>ID</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 200 }}>Nome Completo</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 150 }}>Matrícula</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 200 }}>E-mail Corporativo</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 140 }}>Monitor</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 110 }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 130 }}>CPF</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 150 }}>Data de Nascimento</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 170 }}>Agente de Sucesso</TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 100 }}>Origem</TableCell>
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
                      hover
                      sx={{
                        "&:nth-of-type(even)": { backgroundColor: "#F9F9F9" },
                        "&:hover": { backgroundColor: "#F3E5F5" },
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.completeName}</TableCell>
                      <TableCell>{row.registration}</TableCell>
                      <TableCell>{row.corp_email}</TableCell>
                      <TableCell>{row.monitor}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: getStatusColor(row.status), fontWeight: 600 }}>
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.cpf}</TableCell>
                      <TableCell>{row.birth_date}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{row.origin}</TableCell>
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
            />
          </TableContainer>
        )}
      </Paper>

      {viewerUrl && null}
    </Box>
  );
};

export default DadosAlunos;
