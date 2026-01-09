import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
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
  Snackbar,
  Fade,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useExams } from "../../hooks/useExams";
import NoteUpdaterModal from "../../components/modals/NoteUpdaterModal";
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

const ResultadoProvas: React.FC = () => {
  const {
    exams,
    loading,
    error,
    fetchExams,
    generalAnchor,
    rowAnchor,
    modalOpen,
    setModalOpen,
    handleOpenGeneralMenu,
    handleCloseGeneralMenu,
    handleOpenRowMenu,
    handleCloseRowMenu,
    goToDetail,
  } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "aprovado" | "reprovado"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Transform exams to rows
  const rows = useMemo(() => {
    return exams.map((exam) => ({
      id: exam.id,
      cpf: exam.user_data.cpf,
      name: `${exam.user_data.user.first_name} ${exam.user_data.user.last_name}`,
      score: exam.score ?? null,
      status: exam.status,
      local: exam.exam_scheduled_hour?.exam_date?.local?.name ?? "N/A",
      date: exam.exam_scheduled_hour?.exam_date?.date ?? "N/A",
      hour: exam.exam_scheduled_hour?.hour ?? "N/A",
    }));
  }, [exams]);

  // Filter rows
  const filtered = useMemo(() => {
    return rows
      .filter(
        (row) =>
          row.cpf.includes(searchTerm) ||
          row.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    fetchExams();
  }, [fetchExams]);

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

  const handleExportCSV = () => {
    if (rows.length === 0) {
      setSnackbar({ open: true, message: "Nenhum dado para exportar" });
      return;
    }

    const headers = ["CPF", "Nome", "Score", "Status", "Local", "Data", "Hora"];
    const csvRows = rows.map((row) => [
      row.cpf,
      row.name,
      row.score?.toString() || "N/A",
      row.status,
      row.local,
      row.date,
      row.hour,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resultado_provas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setSnackbar({ open: true, message: "Arquivo CSV exportado com sucesso" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "#4CAF50";
      case "reprovado":
        return "#F44336";
      default:
        return "#666";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Resultado das Provas"
            subtitle="Gerenciamento de Resultados de Exames"
            description="Esta página permite gerenciar e visualizar os RESULTADOS DAS PROVAS dos candidatos. Você pode pesquisar por CPF ou nome, filtrar por status (aprovado/reprovado), exportar os dados em CSV, atualizar notas dos exames e visualizar detalhes de cada exame. Utilize o menu de ações para acessar as funcionalidades disponíveis."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Resultado das Provas" },
            ]}
          />
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por CPF, nome..."
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
                  <IconButton {...iconButtonStyles} onClick={fetchExams}>
                    <RefreshIcon />
                  </IconButton>
                  <IconButton {...iconButtonStyles} onClick={handleOpenGeneralMenu}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={generalAnchor}
                    open={Boolean(generalAnchor)}
                    onClose={handleCloseGeneralMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        setModalOpen(true);
                        handleCloseGeneralMenu();
                      }}
                    >
                      Atualizar Notas
                    </MenuItem>
                  </Menu>
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
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }}>
                          CPF
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>
                          Nome
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100 }}>
                          Score
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>
                          Status
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>
                          Local
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>
                          Data
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>
                          Hora
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100 }} align="center">
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
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
                            <TableCell>{row.cpf}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.score ?? "N/A"}</TableCell>
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
                            <TableCell>{row.local}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.hour}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                {...iconButtonStyles}
                                size="small"
                                onClick={(e) => handleOpenRowMenu(e, row.id)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
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

      <Menu
        anchorEl={rowAnchor}
        open={Boolean(rowAnchor)}
        onClose={handleCloseRowMenu}
      >
        <MenuItem onClick={goToDetail}>Ver detalhes</MenuItem>
        <MenuItem onClick={handleCloseRowMenu}>Cancelar</MenuItem>
      </Menu>

      <NoteUpdaterModal
        open={modalOpen}
        exams={exams}
        onClose={() => {
          setModalOpen(false);
          fetchExams();
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "" })}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultadoProvas;

