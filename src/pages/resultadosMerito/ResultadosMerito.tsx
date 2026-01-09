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
  Button,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAcademicMerit } from "../../hooks/useAcademicMerit";
import PdfViewModa from "../../components/modals/PdfViewModa";
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
  progressStyles,
  tablePaginationStyles,
} from "../../styles/designSystem";

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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Resultados Mérito"
            subtitle="Gerenciamento de Méritos Acadêmicos"
            description="Esta página permite visualizar os RESULTADOS DOS MÉRITOS ACADÊMICOS dos candidatos. Você pode pesquisar por nome ou ID, filtrar por status (aprovado/reprovado), exportar os dados em CSV e visualizar os documentos PDF de cada mérito. Utilize o botão 'Ver PDF' para abrir o documento completo."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Resultados Mérito" },
            ]}
          />
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por nome, ID..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    {...textFieldStyles}
                  />
                </Box>
                <Box>
                  <IconButton {...iconButtonStyles} onClick={openFilterMenu}>
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
                  <IconButton {...iconButtonStyles} onClick={openDownloadMenu}>
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
                  <IconButton {...iconButtonStyles} onClick={fetchAllMerits}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
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
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 80 }}>
                          ID
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>
                          Aluno
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>
                          Documento
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 130 }}>
                          Status
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 180 }}>
                          Criado em
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 180 }}>
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
                          <TableRow key={row.id} {...tableRowHoverStyles}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.aluno}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleView(row.documento)}
                                sx={{
                                  borderColor: designSystem.colors.primary.main,
                                  color: designSystem.colors.primary.main,
                                  "&:hover": {
                                    borderColor: designSystem.colors.primary.darker,
                                    backgroundColor: designSystem.colors.primary.lightest,
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
                    {...tablePaginationStyles}
                  />
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

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

