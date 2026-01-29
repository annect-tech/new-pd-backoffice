/**
 * Lista de Presença - Gestão de Exames Agendados
 *
 * A API retorna dados completos incluindo user_data e exam_scheduled_hour
 * conforme documentação Swagger.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  IconButton,
  CircularProgress,
  Toolbar,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fade,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useExamsScheduled } from "../../hooks/useExamsScheduled";
import ScheduledStatusUpdaterModal from "../../components/modals/ScheduledStatusUpdaterModal";
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

const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === "—") return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

const formatHour = (hourStr: string): string => {
  if (!hourStr || hourStr === "—") return "—";
  // Handle ISO datetime strings like "1970-01-01T07:19:00.000Z"
  if (hourStr.includes("T")) {
    const date = new Date(hourStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    }
  }
  // Handle "HH:mm:ss" or "HH:mm" formats
  const parts = hourStr.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return hourStr;
};

const ListaPresenca: React.FC = () => {
  const {
    exams,
    loading: examsLoading,
    error,
    pagination,
    snackbar,
    closeSnackbar,
    fetchExams,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  } = useExamsScheduled();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "scheduled" | "present" | "absent"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [generalAnchor, setGeneralAnchor] = useState<null | HTMLElement>(null);
  const [openUpdater, setOpenUpdater] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isFilterActive = filterStatus !== "all" || searchTerm.trim() !== "";

  // Transform exams to rows - dados já vêm completos da API
  const rows = useMemo(() => {
    if (!Array.isArray(exams) || exams.length === 0) {
      return [];
    }

    return exams.map((exam) => {
      const userData = exam.user_data;
      const user = userData?.user;
      const completeName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "—";

      const normalizedStatus = (exam.status || "").toLowerCase();

      return {
        id: exam.id,
        cpf: userData?.cpf || "—",
        name: completeName || "—",
        celphone: userData?.celphone || "Não informado",
        status:
          normalizedStatus === "absent"
            ? "ausente"
            : normalizedStatus === "scheduled"
            ? "agendado"
            : "presente",
        local: exam.exam_scheduled_hour?.exam_date?.local?.name || "—",
        date: formatDate(exam.exam_scheduled_hour?.exam_date?.date || "—"),
        hour: formatHour(exam.exam_scheduled_hour?.hour || "—"),
        originalStatus: normalizedStatus,
      };
    });
  }, [exams]);

  // Filter rows (filtro de status + busca local por nome/CPF)
  const filtered = useMemo(() => {
    let result = rows;

    // Filtrar por status
    if (filterStatus !== "all") {
      result = result.filter((row) => {
        if (filterStatus === "scheduled") return row.originalStatus === "scheduled";
        if (filterStatus === "present") return row.originalStatus === "present";
        if (filterStatus === "absent") return row.originalStatus === "absent";
        return true;
      });
    }

    // Busca local por termo
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      result = result.filter((row) => {
        const searchableText = [row.cpf, row.name, row.celphone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(search);
      });
    }

    return result;
  }, [rows, filterStatus, searchTerm]);

  useEffect(() => {
    if (isFilterActive) {
      // Quando filtro está ativo, buscar todos os dados para filtrar localmente
      fetchExams(1, 9999);
    } else {
      fetchExams(page + 1, rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, isFilterActive]);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(0);
  }, [filterStatus, searchTerm]);

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
  const openGeneralMenu = (e: React.MouseEvent<HTMLElement>) =>
    setGeneralAnchor(e.currentTarget);
  const closeFilterMenu = () => setFilterAnchor(null);
  const closeGeneralMenu = () => setGeneralAnchor(null);

  const applyFilter = (status: "all" | "scheduled" | "present" | "absent") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "presente":
        return designSystem.colors.success.main;
      case "ausente":
        return designSystem.colors.error.main;
      case "agendado":
        return designSystem.colors.warning.main;
      default:
        return designSystem.colors.text.disabled;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Conteúdo Principal */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Header da Página */}
          <PageHeader
            title="Lista de Presença"
            subtitle="Gerencie a presença dos exames agendados."
            description="Esta página permite gerenciar e visualizar a lista de presença dos exames agendados. Você pode pesquisar candidatos por username ou email, filtrar por status (agendado/presente/ausente), exportar os dados em diferentes formatos (CSV, JSON, XLSX) e atualizar o status de presença dos candidatos. Utilize o menu de ações (⋮) para acessar a atualização de status em lote."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Lista de Presença" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por username, email..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton onClick={openFilterMenu} {...iconButtonStyles}>
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
                          boxShadow: designSystem.shadows.medium,
                        },
                      },
                    }}
                  >
                    <MenuItem onClick={() => applyFilter("all")}>
                      Todos ({rows.length})
                    </MenuItem>
                    <MenuItem onClick={() => applyFilter("scheduled")}>
                      Agendados ({rows.filter((r) => r.originalStatus === "scheduled").length})
                    </MenuItem>
                    <MenuItem onClick={() => applyFilter("present")}>
                      Presentes ({rows.filter((r) => r.originalStatus === "present").length})
                    </MenuItem>
                    <MenuItem onClick={() => applyFilter("absent")}>
                      Ausentes ({rows.filter((r) => r.originalStatus === "absent").length})
                    </MenuItem>
                  </Menu>
                  <IconButton onClick={openDownloadMenu} {...iconButtonStyles}>
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
                          boxShadow: designSystem.shadows.medium,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleExportCSV();
                        setDownloadAnchor(null);
                      }}
                    >
                      CSV
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExportJSON();
                        setDownloadAnchor(null);
                      }}
                    >
                      JSON
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExportXLSX();
                        setDownloadAnchor(null);
                      }}
                    >
                      XLSX
                    </MenuItem>
                  </Menu>
                  <IconButton 
                    onClick={() => fetchExams(page + 1, rowsPerPage)} 
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <IconButton onClick={openGeneralMenu} {...iconButtonStyles}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={generalAnchor}
                    open={Boolean(generalAnchor)}
                    onClose={closeGeneralMenu}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 2,
                          boxShadow: designSystem.shadows.medium,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setOpenUpdater(true);
                        closeGeneralMenu();
                      }}
                    >
                      Atualização de Status
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>

              {examsLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
                  <CircularProgress {...progressStyles} />
                  <Typography
                    sx={{
                      mt: 2,
                      color: designSystem.colors.text.disabled,
                      fontSize: "0.875rem",
                    }}
                  >
                    Carregando exames...
                  </Typography>
                </Box>
              ) : error ? (
                <Box p={3}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Erro ao carregar dados
                    </Typography>
                    <Typography variant="body2">
                      {error}
                    </Typography>
                  </Alert>
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
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }}>
                          Celular
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color={designSystem.colors.text.disabled} fontSize="0.95rem">
                              {searchTerm || filterStatus !== "all"
                                ? "Nenhum resultado encontrado"
                                : "Nenhum dado disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        (isFilterActive
                          ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          : filtered
                        ).map((row) => (
                          <TableRow
                            key={row.id}
                            {...tableRowHoverStyles}
                          >
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.secondaryDark 
                                : designSystem.colors.text.secondary, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.cpf}
                            </TableCell>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.primaryDark 
                                : designSystem.colors.text.primary, 
                              fontWeight: 500, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.name}
                            </TableCell>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.secondaryDark 
                                : designSystem.colors.text.secondary, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.celphone}
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography
                                sx={{
                                  color: getStatusColor(row.status),
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {row.status}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.secondaryDark 
                                : designSystem.colors.text.secondary, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.local}
                            </TableCell>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.secondaryDark 
                                : designSystem.colors.text.secondary, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.date}
                            </TableCell>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.secondaryDark 
                                : designSystem.colors.text.secondary, 
                              fontSize: "0.875rem", 
                              py: 1.5 
                            }}>
                              {row.hour}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={isFilterActive ? filtered.length : pagination.totalItems}
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

      <ScheduledStatusUpdaterModal
        open={openUpdater}
        exams={exams}
        onClose={() => {
          setOpenUpdater(false);
          fetchExams(page + 1, rowsPerPage);
        }}
      />
    </Box>
  );
};

export default ListaPresenca;
