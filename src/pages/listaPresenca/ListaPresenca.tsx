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
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useExamsScheduled } from "../../hooks/useExamsScheduled";
import ScheduledStatusUpdaterModal from "../../components/modals/ScheduledStatusUpdaterModal";
import { APP_ROUTES } from "../../util/constants";

const ListaPresenca: React.FC = () => {
  const navigate = useNavigate();
  const {
    exams,
    loading,
    error,
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

  // Transform exams to rows
  const rows = useMemo(() => {
    return exams.map((exam) => ({
      id: exam.id,
      cpf: exam.user_data.cpf,
      name: `${exam.user_data.user.first_name} ${exam.user_data.user.last_name}`,
      celphone: exam.user_data.celphone || "Não informado",
      status:
        exam.status === "absent"
          ? "ausente"
          : exam.status === "scheduled"
          ? "agendado"
          : "presente",
      local: exam.exam_scheduled_hour.exam_date.local.name,
      date: exam.exam_scheduled_hour.exam_date.date,
      hour: exam.exam_scheduled_hour.hour,
      originalStatus: exam.status,
    }));
  }, [exams]);

  // Filter rows
  const filtered = useMemo(() => {
    return rows
      .filter(
        (row) =>
          row.cpf.includes(searchTerm) ||
          row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.celphone.includes(searchTerm)
      )
      .filter((row) => {
        if (filterStatus === "scheduled") return row.originalStatus === "scheduled";
        if (filterStatus === "present") return row.originalStatus === "present";
        if (filterStatus === "absent") return row.originalStatus === "absent";
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
        return "#4CAF50";
      case "ausente":
        return "#F44336";
      case "agendado":
        return "#FF9800";
      default:
        return "#666";
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
        <Typography color="text.primary">Lista de Presença</Typography>
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
          Lista de Presença
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
            <strong>Lista de Presença</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite gerenciar e visualizar a LISTA DE PRESENÇA dos exames agendados.
            Você pode pesquisar candidatos por CPF, nome ou celular, filtrar por status (agendado/presente/ausente),
            exportar os dados em diferentes formatos (CSV, JSON, XLSX) e atualizar o status de presença dos candidatos.
            Utilize o menu de ações para acessar a atualização de status em lote.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por CPF, nome, celular..."
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
            <IconButton onClick={fetchExams}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={openGeneralMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={generalAnchor}
              open={Boolean(generalAnchor)}
              onClose={closeGeneralMenu}
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
                      minWidth: 120,
                    }}
                  >
                    CPF
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 200,
                    }}
                  >
                    Nome
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 120,
                    }}
                  >
                    Celular
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 150,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 200,
                    }}
                  >
                    Local
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 150,
                    }}
                  >
                    Data
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 150,
                    }}
                  >
                    Hora
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
                      <TableCell>{row.cpf}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.celphone}</TableCell>
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
          fetchExams();
        }}
      />
    </Box>
  );
};

export default ListaPresenca;

