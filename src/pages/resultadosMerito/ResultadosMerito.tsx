import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  Link,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAcademicMerit } from "../../hooks/useAcademicMerit";
import PdfViewModa from "../../components/modals/PdfViewModa";
import { APP_ROUTES } from "../../util/constants";

const ResultadosMerito: React.FC = () => {
  const navigate = useNavigate();
  const { allMerits, loading, error, fetchAllMerits } = useAcademicMerit();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "aprovado" | "reprovado"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // Transform allMerits to rows
  const rows = useMemo(() => {
    return allMerits.map((m) => ({
      id: m.id,
      aluno: `${m.user_data_display.user.first_name} ${m.user_data_display.user.last_name}`,
      documento: m.document,
      status: m.status || "pendente",
      criadoEm: new Date(m.created_at).toLocaleString("pt-BR"),
      atualizadoEm: m.updated_at
        ? new Date(m.updated_at).toLocaleString("pt-BR")
        : "N/A",
    }));
  }, [allMerits]);

  // Filter rows
  const filtered = useMemo(() => {
    return rows
      .filter(
        (row) =>
          row.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.id.toString().includes(searchTerm)
      )
      .filter((row) => {
        if (filterStatus === "aprovado") return row.status === "aprovado";
        if (filterStatus === "reprovado") return row.status === "reprovado";
        return true;
      });
  }, [rows, searchTerm, filterStatus]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    fetchAllMerits();
  }, [fetchAllMerits]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openFilterMenu = (e: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(e.currentTarget);
  const openDownloadMenu = (e: React.MouseEvent<HTMLElement>) =>
    setDownloadAnchor(e.currentTarget);
  const closeFilterMenu = () => setFilterAnchor(null);
  const applyFilter = (status: "all" | "aprovado" | "reprovado") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const handleView = (url: string) => {
    setViewerUrl(url);
  };

  const handleExportCSV = () => {
    if (rows.length === 0) return;

    const headers = ["ID", "Aluno", "Status", "Criado em", "Atualizado em"];
    const csvRows = rows.map((row) => [
      row.id,
      row.aluno,
      row.status,
      row.criadoEm,
      row.atualizadoEm,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resultados_merito_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "#4CAF50";
      case "reprovado":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  return (
    <Box p={2}>
      {/* Breadcrumb */}
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
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Resultados Mérito</Typography>
      </Breadcrumbs>

      {/* Título e Texto Explicativo */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#A650F0",
            fontWeight: 600,
            mb: 2,
          }}
        >
          Resultados Mérito
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
            <strong>Resultados Mérito</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite visualizar os RESULTADOS DOS MÉRITOS ACADÊMICOS dos candidatos.
            Você pode pesquisar por nome ou ID, filtrar por status (aprovado/reprovado),
            exportar os dados em CSV e visualizar os documentos PDF de cada mérito.
            Utilize o botão "Ver PDF" para abrir o documento completo.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por nome, ID..."
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#A650F0",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "#A650F0",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#A650F0",
                },
              }}
            />
          </Box>
          <Box>
            <IconButton onClick={openFilterMenu}>
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={filterAnchor}
              open={Boolean(filterAnchor)}
              onClose={closeFilterMenu}
            >
              <MenuItem onClick={() => applyFilter("all")}>
                Todos ({rows.length})
              </MenuItem>
              <MenuItem onClick={() => applyFilter("aprovado")}>
                Aprovados ({rows.filter((r) => r.status === "aprovado").length})
              </MenuItem>
              <MenuItem onClick={() => applyFilter("reprovado")}>
                Reprovados ({rows.filter((r) => r.status === "reprovado").length})
              </MenuItem>
            </Menu>
            <IconButton onClick={openDownloadMenu}>
              <DownloadIcon />
            </IconButton>
            <Menu
              anchorEl={downloadAnchor}
              open={Boolean(downloadAnchor)}
              onClose={() => setDownloadAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  handleExportCSV();
                  setDownloadAnchor(null);
                }}
              >
                CSV
              </MenuItem>
            </Menu>
            <IconButton onClick={fetchAllMerits}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
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
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 200,
                    }}
                  >
                    Aluno
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 150,
                    }}
                  >
                    Documento
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 130,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 180,
                    }}
                  >
                    Criado em
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 180,
                    }}
                  >
                    Atualizado em
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        {searchTerm || filterStatus !== "all"
                          ? "Nenhum resultado encontrado"
                          : "Nenhum dado disponível"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "#F9F9F9",
                        },
                        "&:hover": {
                          backgroundColor: "#F3E5F5",
                        },
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.aluno}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleView(row.documento)}
                          sx={{
                            borderColor: "#A650F0",
                            color: "#A650F0",
                            "&:hover": {
                              borderColor: "#8B3DD9",
                              backgroundColor: "#F3E5F5",
                            },
                          }}
                        >
                          Ver PDF
                        </Button>
                      </TableCell>
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
                      <TableCell>{row.criadoEm}</TableCell>
                      <TableCell>{row.atualizadoEm}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </TableContainer>
        )}
      </Paper>

      {viewerUrl && (
        <PdfViewModa
          open={Boolean(viewerUrl)}
          documentUrl={viewerUrl}
          onClose={() => setViewerUrl(null)}
        />
      )}
    </Box>
  );
};

export default ResultadosMerito;

