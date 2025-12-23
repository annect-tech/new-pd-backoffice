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
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import PdfViewModa from "../../components/modals/PdfViewModa";
import EnemStatusUpdaterModal from "../../components/modals/EnemStatusUpdaterModal";
import { APP_ROUTES } from "../../util/constants";
import type { EnemResult } from "../../interfaces/enemResult";

// Dados mockados (substituir por API futuramente)
const MOCK_RESULTS: EnemResult[] = [
  {
    id: "1",
    inscription_number: "2025ENEM001",
    name: "Ana Souza",
    cpf: "123.456.789-00",
    foreign_language: "Inglês",
    languages_score: 720,
    human_sciences_score: 680,
    natural_sciences_score: 705,
    math_score: 750,
    essay_score: 920,
    pdf_file: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    status: "aprovado",
    created_at: "2025-02-10T14:30:00Z",
    user_id: 1,
  },
  {
    id: "2",
    inscription_number: "2025ENEM002",
    name: "Bruno Lima",
    cpf: "987.654.321-00",
    foreign_language: "Espanhol",
    languages_score: 640,
    human_sciences_score: 610,
    natural_sciences_score: 630,
    math_score: 590,
    essay_score: 780,
    pdf_file: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    status: "pendente",
    created_at: "2025-02-11T09:10:00Z",
    user_id: 2,
  },
  {
    id: "3",
    inscription_number: "2025ENEM003",
    name: "Carla Menezes",
    cpf: "321.654.987-00",
    foreign_language: "Inglês",
    languages_score: 580,
    human_sciences_score: 600,
    natural_sciences_score: 590,
    math_score: 560,
    essay_score: 700,
    pdf_file: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    status: "reprovado",
    created_at: "2025-02-12T18:45:00Z",
    user_id: 3,
  },
];

const ResultadosEnem: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<EnemResult[]>(MOCK_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "aprovado" | "reprovado" | "pendente">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);

  const handleRefresh = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setItems(MOCK_RESULTS);
  };

  // Atualiza status localmente (mock)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    return { success: true, message: "Status atualizado localmente (mock)." };
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return items
      .filter(
        (item) =>
          item.inscription_number?.toLowerCase().includes(term) ||
          item.name?.toLowerCase().includes(term) ||
          item.cpf?.includes(term)
      )
      .filter((item) => {
        if (statusFilter === "all") return true;
        return item.status?.toLowerCase() === statusFilter;
      });
  }, [items, searchTerm, statusFilter]);

  const rows = useMemo(() => {
    return filteredItems.map((item) => ({
      id: item.id,
      inscription: item.inscription_number,
      name: item.name,
      cpf: item.cpf,
      language: item.foreign_language,
      status: item.status || "pendente",
      createdAt: new Date(item.created_at).toLocaleString("pt-BR"),
      pdf: item.pdf_file,
    }));
  }, [filteredItems]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return rows.slice(startIndex, startIndex + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = ["Inscrição", "Nome", "CPF", "Idioma", "Status", "Enviado em"];
    const csvRows = rows.map((row) => [
      row.inscription,
      row.name,
      row.cpf,
      row.language,
      row.status,
      row.createdAt,
    ]);
    const csvContent = [headers, ...csvRows]
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resultados_enem_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "aprovado") return "#4CAF50";
    if (normalized === "reprovado") return "#F44336";
    return "#FF9800";
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
        <Typography color="text.primary">Resultados ENEM</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: "#A650F0", fontWeight: 600, mb: 2 }}>
          Resultados ENEM
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
            <strong>Resultados ENEM</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e gerencie os boletins do ENEM. Pesquise por inscrição, nome ou CPF, filtre por status,
            exporte em CSV, visualize os PDFs e atualize o status pelo modal dedicado.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por inscrição, nome ou CPF..."
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
                Todos ({items.length})
              </MenuItem>
              <MenuItem onClick={() => { setStatusFilter("aprovado"); setStatusAnchor(null); }}>
                Aprovados ({items.filter((i) => i.status?.toLowerCase() === "aprovado").length})
              </MenuItem>
              <MenuItem onClick={() => { setStatusFilter("reprovado"); setStatusAnchor(null); }}>
                Reprovados ({items.filter((i) => i.status?.toLowerCase() === "reprovado").length})
              </MenuItem>
              <MenuItem onClick={() => { setStatusFilter("pendente"); setStatusAnchor(null); }}>
                Pendentes ({items.filter((i) => i.status?.toLowerCase() === "pendente").length})
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
            <Button variant="outlined" onClick={() => setModalOpen(true)}>
              Atualizar Status ENEM
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
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 140 }}>
                    Inscrição
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 200 }}>
                    Nome
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 130 }}>
                    CPF
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 130 }}>
                    Idioma
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 140 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 180 }}>
                    Enviado em
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#A650F0", color: "#FFFFFF", fontWeight: 600, minWidth: 100 }}>
                    PDF
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        {searchTerm || statusFilter !== "all" ? "Nenhum resultado encontrado" : "Nenhum dado disponível"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { backgroundColor: "#F9F9F9" },
                        "&:hover": { backgroundColor: "#F3E5F5" },
                      }}
                    >
                      <TableCell>{row.inscription}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.cpf}</TableCell>
                      <TableCell>{row.language}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: getStatusColor(row.status),
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.createdAt}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => setViewerUrl(row.pdf)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredItems.length}
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

      {viewerUrl && (
        <PdfViewModa open documentUrl={viewerUrl} onClose={() => setViewerUrl(null)} />
      )}

      <EnemStatusUpdaterModal
        open={modalOpen}
        results={items}
        onClose={() => setModalOpen(false)}
        onUpdate={handleUpdateStatus}
      />
    </Box>
  );
};

export default ResultadosEnem;
