import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Snackbar,
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  HowToReg as EnrollIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  iconButtonStyles,
  progressStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  tablePaginationStyles,
  textFieldStyles,
  primaryButtonStyles,
  dialogStyles,
} from "../../styles/designSystem";
import {
  studentDataService,
  type StudentReadyToEnrolledCsvDto,
  type PaginatedResponse,
} from "../../core/http/services/studentDataService";

// Helper para montar nome completo a partir de first_name e last_name
const getFullName = (student: StudentReadyToEnrolledCsvDto): string => {
  const firstName = student.first_name?.trim() || "";
  const lastName = student.last_name?.trim() || "";
  return `${firstName} ${lastName}`.trim() || "Nome não informado";
};

// Helper para obter o ID do estudante (API pode retornar como 'id' ou 'student_data_id')
const getStudentId = (student: StudentReadyToEnrolledCsvDto): string => {
  return String(student.id || student.student_data_id || "");
};

const CriacaoUsuarios: React.FC = () => {
  // ==================== State ====================
  const [students, setStudents] = useState<StudentReadyToEnrolledCsvDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // ==================== Data Fetching ====================
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentDataService.listReadyToEnrolledCsv(page + 1, rowsPerPage);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const responseData = response.data as PaginatedResponse<StudentReadyToEnrolledCsvDto>;
        setStudents(responseData.data || []);
        setTotalItems(responseData.totalItems ?? (responseData.data || []).length);
      } else {
        setSnackbar({
          open: true,
          message: "Falha ao carregar estudantes para matrícula",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar estudantes para matrícula:", err);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, refreshKey]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ==================== Filtered Data ====================
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter((s) => {
      const fullName = getFullName(s).toLowerCase();
      return (
        fullName.includes(term) ||
        s.registration.toLowerCase().includes(term) ||
        s.corp_email.toLowerCase().includes(term) ||
        s.personal_email.toLowerCase().includes(term)
      );
    });
  }, [students, searchTerm]);

  // ==================== Selection Handlers ====================
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map((s) => getStudentId(s)));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOne = (studentDataId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentDataId)
        ? prev.filter((id) => id !== studentDataId)
        : [...prev, studentDataId]
    );
  };

  const isSelected = (studentDataId: string) => selectedStudents.includes(studentDataId);
  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  // ==================== Action Handlers ====================
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedStudents([]);
    setPage(0);
    setRefreshKey((prev) => prev + 1);
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      setSnackbar({
        open: true,
        message: "Nenhum dado para exportar",
        severity: "warning",
      });
      return;
    }

    const headers = [
      "Nome Completo",
      "Primeiro Nome",
      "Sobrenome",
      "E-mail Corporativo",
      "Senha Padrão",
      "Matrícula",
    ];

    const rows = filteredStudents.map((s) => [
      getFullName(s),
      s.first_name || "",
      s.last_name || "",
      s.corp_email,
      s.defaultPassword || "",
      s.registration,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `estudantes_para_matricula_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    setSnackbar({
      open: true,
      message: "Arquivo CSV exportado com sucesso",
      severity: "success",
    });
  };

  const handleConfirm = () => {
    if (selectedStudents.length === 0) {
      setSnackbar({
        open: true,
        message: "Selecione pelo menos um estudante",
        severity: "warning",
      });
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmModalClose = () => {
    setConfirmModalOpen(false);
  };

  const handleConfirmModalConfirm = async () => {
    setConfirmLoading(true);
    try {
      const response = await studentDataService.enrollMultipleStudents(selectedStudents);

      if (response.status >= 200 && response.status < 300) {
        const count = selectedStudents.length;
        setSelectedStudents([]);
        setRefreshKey((prev) => prev + 1);
        setSnackbar({
          open: true,
          message: `${count} estudante(s) matriculado(s) com sucesso! Emails com credenciais serão enviados.`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Falha ao matricular estudantes",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao matricular estudantes:", err);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setConfirmLoading(false);
      setConfirmModalOpen(false);
    }
  };

  // ==================== Pagination Handlers ====================
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const selectedStudentsData = students.filter((s) =>
    selectedStudents.includes(getStudentId(s))
  );

  // ==================== Render ====================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          <PageHeader
            title="Matrícula de Estudantes"
            subtitle="Confirme a matrícula dos estudantes após cadastrar no Google Workspace"
            description="Exporte o CSV com os dados dos estudantes prontos para matrícula, cadastre os usuários no Google Workspace e confirme a matrícula para enviar as credenciais por email."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Contratos", path: APP_ROUTES.CONTRACTS },
              { label: "Matrícula de Estudantes" },
            ]}
          />

            <Fade in timeout={500}>
              <Paper {...paperStyles}>
                <Toolbar {...toolbarStyles}>
                  <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                    <SearchIcon
                      sx={{
                        mr: 1,
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? designSystem.colors.text.disabledDark
                            : designSystem.colors.text.disabled,
                      }}
                    />
                    <TextField
                    placeholder="Pesquisar por nome, matrícula ou e-mail..."
                      variant="standard"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      {...textFieldStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCSV}
                      variant="outlined"
                    >
                    Exportar CSV para Google
                    </Button>
                    <IconButton onClick={handleRefresh} {...iconButtonStyles} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Toolbar>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress {...progressStyles} />
                  </Box>
                ) : (
                  <>
                  {selectedStudents.length > 0 && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? designSystem.colors.background.secondaryDark
                              : designSystem.colors.primary.lightest,
                          borderBottom: (theme) =>
                            `1px solid ${
                              theme.palette.mode === "dark"
                                ? designSystem.colors.border.mainDark
                                : designSystem.colors.border.main
                            }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            color: (theme) =>
                              theme.palette.mode === "dark"
                                ? designSystem.colors.text.primaryDark
                                : designSystem.colors.text.primary,
                            fontWeight: 500,
                          }}
                        >
                        {selectedStudents.length}{" "}
                        {selectedStudents.length === 1 ? "estudante selecionado" : "estudantes selecionados"}
                        </Typography>
                        <Button
                        startIcon={<EnrollIcon />}
                        onClick={handleConfirm}
                          {...primaryButtonStyles}
                        >
                        Confirmar Matrícula
                        </Button>
                      </Box>
                    )}

                    <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                      <Table size="small" sx={{ minWidth: 750 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              {...tableHeadStyles}
                              sx={{ ...tableHeadStyles.sx, width: 50, padding: "8px" }}
                              padding="checkbox"
                            >
                              <Checkbox
                                indeterminate={isIndeterminate}
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                sx={{
                                  color: designSystem.colors.primary.main,
                                  "&.Mui-checked": {
                                    color: designSystem.colors.primary.main,
                                  },
                                  "&.MuiCheckbox-indeterminate": {
                                    color: designSystem.colors.primary.main,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 220 }}>
                              Nome Completo
                            </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 140 }}>
                              Matrícula
                            </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 280 }}>
                              E-mail Corporativo
                            </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 180 }}>
                            Senha Padrão
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                {searchTerm
                                    ? "Nenhum resultado encontrado"
                                    : "Nenhum estudante disponível para matrícula"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                          filteredStudents.map((student) => {
                            const studentId = getStudentId(student);
                            const selected = isSelected(studentId);
                            const fullName = getFullName(student);
                              return (
                                <TableRow
                                  key={studentId}
                                  {...tableRowHoverStyles}
                                  selected={selected}
                                  sx={{
                                    ...tableRowHoverStyles.sx,
                                    ...(selected && {
                                      backgroundColor: (theme) =>
                                        theme.palette.mode === "dark"
                                          ? "rgba(166, 80, 240, 0.25) !important"
                                          : `${designSystem.colors.primary.lighter} !important`,
                                    }),
                                  }}
                                >
                                  <TableCell padding="checkbox" sx={{ padding: "8px" }}>
                                    <Checkbox
                                      checked={selected}
                                      onChange={() => handleSelectOne(studentId)}
                                      sx={{
                                        color: designSystem.colors.primary.main,
                                        "&.Mui-checked": {
                                          color: designSystem.colors.primary.main,
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                      fontWeight: 500,
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    maxWidth: 220,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                  {fullName}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    }}
                                  >
                                    {student.registration}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    maxWidth: 280,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {student.corp_email}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {student.defaultPassword || "-"}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        component="div"
                      count={searchTerm.trim() ? filteredStudents.length : totalItems}
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
                  </>
                )}
              </Paper>
            </Fade>
        </Box>
      </Box>

      {/* Modal de Confirmação de Matrícula */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleConfirmModalClose}
        maxWidth="sm"
        fullWidth
        {...dialogStyles}
      >
        <DialogTitle
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
            fontWeight: 600,
          }}
        >
          Confirmar Matrícula de Estudantes
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
              mb: 2,
            }}
          >
            Você está prestes a confirmar a matrícula de{" "}
            <strong>{selectedStudents.length}</strong>{" "}
            {selectedStudents.length === 1 ? "estudante" : "estudantes"}.
          </Typography>
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
              mb: 3,
            }}
          >
            Isso irá:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Atualizar o status para "ENROLLED" (Matriculado)
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Marcar "added_on_csv" como verdadeiro
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Disparar email com credenciais para cada estudante
              </Typography>
            </li>
          </Box>
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? designSystem.colors.background.secondaryDark
                  : designSystem.colors.background.secondary,
              borderRadius: 2,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Typography
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                fontWeight: 600,
                mb: 1,
                fontSize: "0.875rem",
              }}
            >
              Estudantes selecionados:
            </Typography>
            {selectedStudentsData.map((student) => (
              <Typography
                key={getStudentId(student)}
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                  fontSize: "0.875rem",
                  mb: 0.5,
                }}
              >
                • {getFullName(student)} ({student.personal_email})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleConfirmModalClose}
            disabled={confirmLoading}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmModalConfirm}
            disabled={confirmLoading}
            {...primaryButtonStyles}
          >
            {confirmLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Confirmar Matrícula"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "error" ? 8000 : 4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            whiteSpace: "pre-line",
            maxWidth: "600px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CriacaoUsuarios;
