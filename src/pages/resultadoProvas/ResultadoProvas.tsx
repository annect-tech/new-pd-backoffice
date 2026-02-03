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
    handleCloseRowMenu,
    goToDetail,
    snackbar,
    closeSnackbar,
  } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "aprovado" | "reprovado" | "pendente" | "ausente"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Transform exams to rows - dados já vêm completos da API
  const rows = useMemo(() => {
    return exams.map((exam) => {
      const userData = exam.user_data;
      const user = userData?.user;

      // CPF e Nome direto da API
      const cpf = userData?.cpf || "N/A";
      const nome = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "N/A";

      // Normalizar status para exibição/filtragem
      const statusMap: Record<string, string> = {
        APPROVED: "aprovado",
        REJECTED: "reprovado",
        PENDING: "pendente",
        ABSENT: "ausente",
      };
      const statusNormalizado =
        exam.status && statusMap[exam.status.toUpperCase()]
          ? statusMap[exam.status.toUpperCase()]
          : exam.status?.toLowerCase() ?? "pendente";

      return {
        id: exam.id,
        cpf,
        name: nome || "N/A",
        score: exam.score ?? null,
        status: statusNormalizado,
        local: exam.exam_scheduled_hour?.exam_date?.local?.name ?? "N/A",
        date: exam.exam_scheduled_hour?.exam_date?.date ?? "N/A",
        hour: exam.exam_scheduled_hour?.hour ?? "N/A",
        user_data_id: exam.user_data_id,
      };
    });
  }, [exams]);

  // Filter rows
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rows
      .filter((row) => {
        const cpfStr = String(row.cpf ?? "").toLowerCase();
        const nameStr = String(row.name ?? "").toLowerCase();
        return cpfStr.includes(term) || nameStr.includes(term);
      })
      .filter((row) => {
        if (filterStatus === "aprovado") return row.status === "aprovado";
        if (filterStatus === "reprovado") return row.status === "reprovado";
        if (filterStatus === "pendente") return row.status === "pendente";
        if (filterStatus === "ausente") return row.status === "ausente";
        return true;
      });
  }, [rows, searchTerm, filterStatus]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    fetchExams(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const applyFilter = (status: "all" | "aprovado" | "reprovado" | "pendente" | "ausente") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const handleExportCSV = () => {
    // Usar filtered em vez de rows para respeitar os filtros aplicados
    if (filtered.length === 0) {
      // O snackbar será gerenciado pelo hook
      return;
    }

    const headers = ["CPF", "Nome", "Score", "Status"];
    const csvRows = filtered.map((row) => [
      row.cpf,
      row.name,
      row.score?.toString() || "N/A",
      row.status,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resultado_provas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    // O snackbar será gerenciado pelo hook quando necessário
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "#4CAF50"; // Verde
      case "reprovado":
        return "#F44336"; // Vermelho
      case "pendente":
        return "#FF9800"; // Laranja
      case "ausente":
        return "#9E9E9E"; // Cinza
      default:
        return "#666"; // Cinza
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
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 2,
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.shadows.mediumDark 
                            : designSystem.shadows.medium,
                          minWidth: 200,
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.colors.background.secondaryDark 
                            : designSystem.colors.background.primary,
                          border: (theme) => `1px solid ${theme.palette.mode === "dark" 
                            ? designSystem.colors.border.mainDark 
                            : designSystem.colors.border.main}`,
                        },
                      },
                    }}
                  >
                    <Typography 
                      sx={{ 
                        px: 2, 
                        py: 1, 
                        fontWeight: 600, 
                        fontSize: "0.875rem", 
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.disabledDark 
                          : designSystem.colors.text.disabled 
                      }}
                    >
                      Filtrar por Status
                    </Typography>
                    <MenuItem 
                      onClick={() => applyFilter("all")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "all" 
                          ? (theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.15)" 
                            : designSystem.colors.background.tertiary)
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        fontWeight: filterStatus === "all" ? 600 : 400,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Todos ({rows.length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("aprovado")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "aprovado" 
                          ? (theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.15)" 
                            : designSystem.colors.background.tertiary)
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        fontWeight: filterStatus === "aprovado" ? 600 : 400,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Aprovados ({rows.filter((r) => r.status === "aprovado").length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("reprovado")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "reprovado" 
                          ? (theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.15)" 
                            : designSystem.colors.background.tertiary)
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        fontWeight: filterStatus === "reprovado" ? 600 : 400,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Reprovados ({rows.filter((r) => r.status === "reprovado").length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("pendente")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "pendente" 
                          ? (theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.15)" 
                            : designSystem.colors.background.tertiary)
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        fontWeight: filterStatus === "pendente" ? 600 : 400,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Pendentes ({rows.filter((r) => r.status === "pendente").length})
                    </MenuItem>
                    <MenuItem
                      onClick={() => applyFilter("ausente")}
                      sx={{
                        backgroundColor: (theme) => filterStatus === "ausente"
                          ? (theme.palette.mode === "dark"
                            ? "rgba(166, 80, 240, 0.15)"
                            : designSystem.colors.background.tertiary)
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark"
                          ? designSystem.colors.text.primaryDark
                          : designSystem.colors.text.primary,
                        fontWeight: filterStatus === "ausente" ? 600 : 400,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark"
                            ? "rgba(166, 80, 240, 0.2)"
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Ausentes ({rows.filter((r) => r.status === "ausente").length})
                    </MenuItem>
                  </Menu>
                  <IconButton {...iconButtonStyles} onClick={openDownloadMenu}>
                    <DownloadIcon />
                  </IconButton>
                  <Menu
                    anchorEl={downloadAnchor}
                    open={Boolean(downloadAnchor)}
                    onClose={() => setDownloadAnchor(null)}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 2,
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.shadows.mediumDark 
                            : designSystem.shadows.medium,
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.colors.background.secondaryDark 
                            : designSystem.colors.background.primary,
                          border: (theme) => `1px solid ${theme.palette.mode === "dark" 
                            ? designSystem.colors.border.mainDark 
                            : designSystem.colors.border.main}`,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleExportCSV();
                        setDownloadAnchor(null);
                      }}
                      sx={{
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      CSV
                    </MenuItem>
                  </Menu>
                  <IconButton {...iconButtonStyles} onClick={() => fetchExams(1, 10)}>
                    <RefreshIcon />
                  </IconButton>
                  <IconButton {...iconButtonStyles} onClick={handleOpenGeneralMenu}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={generalAnchor}
                    open={Boolean(generalAnchor)}
                    onClose={handleCloseGeneralMenu}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 2,
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.shadows.mediumDark 
                            : designSystem.shadows.medium,
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? designSystem.colors.background.secondaryDark 
                            : designSystem.colors.background.primary,
                          border: (theme) => `1px solid ${theme.palette.mode === "dark" 
                            ? designSystem.colors.border.mainDark 
                            : designSystem.colors.border.main}`,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setModalOpen(true);
                        handleCloseGeneralMenu();
                      }}
                      sx={{
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "rgba(166, 80, 240, 0.2)" 
                            : designSystem.colors.primary.lightest,
                        },
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
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
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: (theme) => theme.palette.mode === "dark" 
                ? designSystem.shadows.mediumDark 
                : designSystem.shadows.medium,
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? designSystem.colors.background.secondaryDark 
                : designSystem.colors.background.primary,
              border: (theme) => `1px solid ${theme.palette.mode === "dark" 
                ? designSystem.colors.border.mainDark 
                : designSystem.colors.border.main}`,
            },
          },
        }}
      >
        <MenuItem 
          onClick={goToDetail}
          sx={{
            color: (theme) => theme.palette.mode === "dark" 
              ? designSystem.colors.text.primaryDark 
              : designSystem.colors.text.primary,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? "rgba(166, 80, 240, 0.2)" 
                : designSystem.colors.primary.lightest,
            },
          }}
        >
          Ver detalhes
        </MenuItem>
        <MenuItem 
          onClick={handleCloseRowMenu}
          sx={{
            color: (theme) => theme.palette.mode === "dark" 
              ? designSystem.colors.text.primaryDark 
              : designSystem.colors.text.primary,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? "rgba(166, 80, 240, 0.2)" 
                : designSystem.colors.primary.lightest,
            },
          }}
        >
          Cancelar
        </MenuItem>
      </Menu>

      <NoteUpdaterModal
        open={modalOpen}
        exams={exams}
        onClose={() => {
          setModalOpen(false);
          fetchExams(1, 10);
        }}
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

export default ResultadoProvas;

