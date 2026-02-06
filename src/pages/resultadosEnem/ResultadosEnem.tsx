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
  Snackbar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  progressStyles,
  tablePaginationStyles,
} from "../../styles/designSystem";
import EnemStatusUpdaterModal from "../../components/modals/EnemStatusUpdaterModal";
import { APP_ROUTES } from "../../util/constants";
import { useEnemResults } from "../../hooks/useEnemResults";
import EnemDetailsModal from "../../components/modals/EnemDetailsModal";
import type { EnemResult } from "../../interfaces/enemResult";

const ResultadosEnem: React.FC = () => {
  const { items, loading, error, fetchEnemResults, updateStatus, snackbar, closeSnackbar } = useEnemResults();
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "aprovado" | "reprovado" | "pendente">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [enemResultToView, setEnemResultToView] = useState<EnemResult | null>(null);

  useEffect(() => {
    fetchEnemResults();
  }, [fetchEnemResults]);

  const handleRefresh = () => {
    setStatusFilter("all");
    setSearchTerm("");
    fetchEnemResults();
  };

  // Atualiza status usando o hook
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    return await updateStatus(id, newStatus);
  };

  // Normaliza o status para valores corretos
  const normalizeStatus = (status: string | null | undefined): string => {
    if (!status) return "pendente";
    
    const normalized = status.toLowerCase().trim();
    
    // Mapeia valores incorretos ou variações
    if (normalized === "aprovado" || normalized === "approved" || normalized === "aprovada") {
      return "aprovado";
    }
    if (normalized === "reprovado" || normalized === "rejected" || normalized === "reprovada") {
      return "reprovado";
    }
    if (normalized === "filesent" || normalized === "filesent?" || normalized === "file_sent" || normalized === "enviado") {
      return "pendente";
    }
    
    // Se não reconhecer o status, retorna pendente
    if (!["aprovado", "reprovado", "pendente"].includes(normalized)) {
      return "pendente";
    }
    
    return normalized;
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
        const itemStatus = normalizeStatus(item.status);
        return itemStatus === statusFilter;
      });
  }, [items, searchTerm, statusFilter]);

  const rows = useMemo(() => {
    return filteredItems.map((item) => ({
      ...item,
      status: normalizeStatus(item.status),
      created_at: new Date(item.created_at).toLocaleString("pt-BR"),
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
      row.inscription_number,
      row.name,
      row.cpf,
      row.foreign_language,
      row.status,
      row.created_at,
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Resultados ENEM"
            subtitle="Gerenciamento de Notas do ENEM"
            description="Esta página permite gerenciar e visualizar as NOTAS DO ENEM dos candidatos. Você pode pesquisar por CPF ou nome, atualizar notas e exportar os dados no formato CSV."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Resultados ENEM" },
            ]}
          />
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por inscrição, nome ou CPF..."
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
                      Todos
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("aprovado"); setStatusAnchor(null); }}>
                      Aprovados
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("reprovado"); setStatusAnchor(null); }}>
                      Reprovados
                    </MenuItem>
                    <MenuItem onClick={() => { setStatusFilter("pendente"); setStatusAnchor(null); }}>
                      Pendentes
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
                  <Button variant="outlined" onClick={() => setModalOpen(true)}>
                    Atualizar Status ENEM
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
                <TableContainer sx={{ maxWidth: "100%" }}>
                  <Table stickyHeader size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 140 }}>
                          Inscrição
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>
                          Nome
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 130 }}>
                          CPF
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 130 }}>
                          Idioma
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 140 }}>
                          Status
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 180 }}>
                          Enviado em
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100 }}>
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
                            {...tableRowHoverStyles}
                          >
                            <TableCell>{row.inscription_number}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.cpf}</TableCell>
                            <TableCell>{row.foreign_language}</TableCell>
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
                            <TableCell>{row.created_at}</TableCell>
                            <TableCell>
                              <IconButton 
                                {...iconButtonStyles} 
                                onClick={() => setEnemResultToView(row)}
                              >
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
                    {...tablePaginationStyles}
                  />
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {enemResultToView && (
        <EnemDetailsModal
          open={Boolean(enemResultToView)}
          onClose={() => setEnemResultToView(null)}
          candidate={enemResultToView}
        />
      )}

      <EnemStatusUpdaterModal
        open={modalOpen}
        results={items}
        onClose={() => setModalOpen(false)}
        onUpdate={handleUpdateStatus}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultadosEnem;
