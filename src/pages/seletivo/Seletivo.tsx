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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Fade,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useSelective } from "../../hooks/useSelective";
import type { UserProfile } from "../../interfaces/userProfile";
import { APP_ROUTES } from "../../util/constants";
import { designSystem, tableHeadStyles, tableRowHoverStyles, iconButtonStyles, textFieldStyles, progressStyles } from "../../styles/designSystem";

const Seletivo: React.FC = () => {
  const navigate = useNavigate();
  const {
    users,
    loading,
    snackbar,
    closeSnackbar,
    fetchUsers,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  } = useSelective();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(
    null
  );
  const [openModalType, setOpenModalType] = useState<
    "persona" | "addresses" | "guardians" | "registration" | null
  >(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter users
  const filtered = useMemo(() => {
    return users
      .filter((u) => u.first_name.toLowerCase() !== "admin")
      .filter(
        (u) =>
          u.cpf.includes(searchTerm) ||
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((u) => {
        if (filterStatus === "active") return u.allowed_city.active;
        if (filterStatus === "inactive") return !u.allowed_city.active;
        return true;
      });
  }, [users, searchTerm, filterStatus]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
  const applyFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const openModal = (
    type: "persona" | "addresses" | "guardians" | "registration",
    user: UserProfile
  ) => {
    setCurrentUser(user);
    setOpenModalType(type);
  };
  const closeModal = () => {
    setOpenModalType(null);
    setCurrentUser(null);
  };

  const translateLabel = (label: string) => {
    const translations: { [key: string]: string } = {
      professional_status: "Situação Profissional",
      experience: "Experiência com TI",
      experience_duration: "Tempo de experiência",
      programming_knowledge_level: "Conhecimento em programação",
      motivation_level: "Motivação para o curso",
      project_priority: "Prioridade do projeto",
      weekly_available_hours: "Horas/semana disponíveis",
      study_commitment: "Comprometimento",
      frustration_handling: "Frustrações",
      profession: "Profissão",
      maritial_status: "Estado Civil",
      family_income: "Renda familiar",
      education_level: "Nivel Educacional",
      pcd: "PCD?",
      internet_type: "Operadora de internet",
      public_school: "Escola Publica?",
      contract: "pendente",
    };
    return translations[label] || label;
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
          {/* Breadcrumb */}
          <Fade in timeout={600}>
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
                  color: "#9333EA",
                  textDecoration: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    color: "#A650F0",
                  },
                  transition: "color 0.2s ease",
                }}
              >
                Dashboard
              </Link>
              <Typography color="#1F2937" fontWeight={500}>
                Seletivo
              </Typography>
            </Breadcrumbs>
          </Fade>

          {/* Título e Texto Explicativo */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#1F2937",
                  mb: 1,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                }}
              >
                Seletivo
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6B7280",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  mb: 3,
                }}
              >
                Gerencie e visualize todos os candidatos do processo seletivo.
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 3,
                  border: "1px solid #E5E7EB",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #A650F0 0%, #C084FC 100%)",
                  },
                }}
              >
                <Typography variant="body2" color="#4B5563" sx={{ lineHeight: 1.7 }}>
                  Pesquise candidatos por CPF, nome ou email, filtre por status (ativos/inativos),
                  exporte os dados em diferentes formatos (CSV, JSON, XLSX) e visualize informações detalhadas
                  de cada candidato, incluindo dados de persona, endereços, guardiões e informações de registro.
                </Typography>
              </Paper>
            </Box>
          </Fade>

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  p: 3,
                  backgroundColor: "#FFFFFF",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: "#6B7280" }} />
                  <TextField
                    placeholder="Pesquisar por CPF, nome, email..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "#D1D5DB",
                      },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: "#9CA3AF",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#A650F0",
                      },
                      "& input": {
                        color: "#1F2937",
                      },
                    }}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    onClick={openFilterMenu}
                    sx={{
                      color: "#6B7280",
                      "&:hover": {
                        backgroundColor: "#FAF5FF",
                        color: "#A650F0",
                      },
                    }}
                  >
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
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                      },
                    }}
                  >
                    <MenuItem onClick={() => applyFilter("all")}>
                      Todos ({users.length})
                    </MenuItem>
                    <MenuItem onClick={() => applyFilter("active")}>
                      Ativos ({users.filter((u) => u.allowed_city.active).length})
                    </MenuItem>
                    <MenuItem onClick={() => applyFilter("inactive")}>
                      Inativos ({users.filter((u) => !u.allowed_city.active).length})
                    </MenuItem>
                  </Menu>
                  <IconButton
                    onClick={openDownloadMenu}
                    sx={{
                      color: "#6B7280",
                      "&:hover": {
                        backgroundColor: "#FAF5FF",
                        color: "#A650F0",
                      },
                    }}
                  >
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
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                    onClick={fetchUsers}
                    sx={{
                      color: "#6B7280",
                      "&:hover": {
                        backgroundColor: "#FAF5FF",
                        color: "#A650F0",
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress sx={{ color: "#A650F0" }} />
                </Box>
              ) : (
                <TableContainer sx={{ maxWidth: "100%" }}>
                  <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 40 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 110 }}>CPF</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 150 }}>Nome</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 90 }}>Data Nasc.</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 110 }}>Celular</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 180 }}>Email</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100 }}>Cidade</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 40 }}>UF</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 50 }} align="center"><PersonIcon fontSize="small" sx={{ fontSize: "1rem" }} /></TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 50 }} align="center"><HomeIcon fontSize="small" sx={{ fontSize: "1rem" }} /></TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 50 }} align="center"><PeopleIcon fontSize="small" sx={{ fontSize: "1rem" }} /></TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 50 }} align="center"><DescriptionIcon fontSize="small" sx={{ fontSize: "1rem" }} /></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                            <Typography color="#6B7280" fontSize="0.95rem">
                              {searchTerm || filterStatus !== "all"
                                ? "Nenhum resultado encontrado"
                                : "Nenhum dado disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((user) => (
                          <TableRow
                              key={user.id}
                              {...tableRowHoverStyles}
                              sx={{
                                ...tableRowHoverStyles.sx,
                                cursor: "pointer",
                              }}
                            >
                            <TableCell sx={{ color: "#374151", fontSize: "0.875rem", py: 1.5 }}>
                              {user.id}
                            </TableCell>
                            <TableCell sx={{ color: "#374151", fontSize: "0.875rem", py: 1.5 }}>
                              {user.cpf}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#1F2937",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                py: 1.5,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell sx={{ color: "#374151", fontSize: "0.875rem", py: 1.5 }}>
                              {user.birth_date}
                            </TableCell>
                            <TableCell sx={{ color: "#374151", fontSize: "0.875rem", py: 1.5 }}>
                              {user.celphone}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#374151",
                                fontSize: "0.875rem",
                                py: 1.5,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.email}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#374151",
                                fontSize: "0.875rem",
                                py: 1.5,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.allowed_city.localidade}
                            </TableCell>
                            <TableCell sx={{ color: "#374151", fontSize: "0.875rem", py: 1.5 }}>
                              {user.allowed_city.uf}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => openModal("persona", user)}
                                sx={{
                                  color: "#6B7280",
                                  padding: "4px",
                                  "&:hover": {
                                    backgroundColor: "#F3E8FF",
                                    color: "#A650F0",
                                  },
                                }}
                              >
                                <PersonIcon sx={{ fontSize: "1.1rem" }} />
                              </IconButton>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => openModal("addresses", user)}
                                sx={{
                                  color: "#6B7280",
                                  padding: "4px",
                                  "&:hover": {
                                    backgroundColor: "#F3E8FF",
                                    color: "#A650F0",
                                  },
                                }}
                              >
                                <HomeIcon sx={{ fontSize: "1.1rem" }} />
                              </IconButton>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => openModal("guardians", user)}
                                sx={{
                                  color: "#6B7280",
                                  padding: "4px",
                                  "&:hover": {
                                    backgroundColor: "#F3E8FF",
                                    color: "#A650F0",
                                  },
                                }}
                              >
                                <PeopleIcon sx={{ fontSize: "1.1rem" }} />
                              </IconButton>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => openModal("registration", user)}
                                sx={{
                                  color: "#6B7280",
                                  padding: "4px",
                                  "&:hover": {
                                    backgroundColor: "#F3E8FF",
                                    color: "#A650F0",
                                  },
                                }}
                              >
                                <DescriptionIcon sx={{ fontSize: "1.1rem" }} />
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
                    sx={{
                      borderTop: "1px solid #E5E7EB",
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Snackbar */}
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

      {/* Modal Persona */}
      <Dialog
        open={openModalType === "persona"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
          Dados de Persona
        </DialogTitle>
        <DialogContent dividers>
          {currentUser?.personas &&
            Object.entries(currentUser.personas).map(([k, v]) => (
              <Typography key={k} sx={{ mb: 1.5, color: "#374151" }}>
                <strong style={{ color: "#1F2937" }}>{translateLabel(k)}:</strong> {v}
              </Typography>
            ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeModal}
            sx={{
              color: "#A650F0",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#FAF5FF",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Endereços */}
      <Dialog
        open={openModalType === "addresses"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
          Endereços
        </DialogTitle>
        <DialogContent dividers>
          {currentUser?.addresses && currentUser.addresses.length > 0 ? (
            currentUser.addresses.map((a) => (
              <Box key={a.id} mb={2} pb={2} borderBottom="1px solid #E5E7EB">
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>CEP:</strong> {a.cep}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Logradouro:</strong> {a.logradouro}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Complemento:</strong> {a.complemento || "—"}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Bairro:</strong> {a.bairro}
                </Typography>
                <Typography sx={{ color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Cidade:</strong> {a.localidade} ({a.uf})
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="#6B7280">Nenhum endereço cadastrado</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeModal}
            sx={{
              color: "#A650F0",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#FAF5FF",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Guardiões */}
      <Dialog
        open={openModalType === "guardians"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
          Dados do Guardião
        </DialogTitle>
        <DialogContent dividers>
          {currentUser?.guardians && currentUser.guardians.length > 0 ? (
            currentUser.guardians.map((g) => (
              <Box key={g.cpf} mb={2} pb={2} borderBottom="1px solid #E5E7EB">
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Relacionamento:</strong> {g.relationship}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Nome:</strong> {g.name}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>CPF:</strong> {g.cpf}
                </Typography>
                <Typography sx={{ mb: 0.5, color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Celular:</strong> {g.cellphone}
                </Typography>
                <Typography sx={{ color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Email:</strong> {g.email}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="#6B7280">Nenhum guardião cadastrado</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeModal}
            sx={{
              color: "#A650F0",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#FAF5FF",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Registro */}
      <Dialog
        open={openModalType === "registration"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
          Dados de Registro
        </DialogTitle>
        <DialogContent dividers>
          {currentUser && (
            <>
              {currentUser.registration_data &&
                Object.entries(currentUser.registration_data).map(([k, v]) => (
                  <Typography key={k} sx={{ mb: 1.5, color: "#374151" }}>
                    <strong style={{ color: "#1F2937" }}>{translateLabel(k)}:</strong>{" "}
                    {typeof v === "string"
                      ? v
                          .replace(/_/g, " ")
                          .replace(/^./, (match) => match.toUpperCase())
                      : v}
                  </Typography>
                ))}
              {currentUser.contract && (
                <Typography sx={{ color: "#374151" }}>
                  <strong style={{ color: "#1F2937" }}>Contrato:</strong> {currentUser.contract.status}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeModal}
            sx={{
              color: "#A650F0",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#FAF5FF",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Seletivo;


