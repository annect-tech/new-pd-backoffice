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
    if (!Array.isArray(users)) {
      return [];
    }
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
        <Typography color="text.primary">Seletivo</Typography>
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
          Seletivo
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
            <strong>Seletivo</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite gerenciar e visualizar todos os CANDIDATOS do processo seletivo.
            Você pode pesquisar candidatos por CPF, nome ou email, filtrar por status (ativos/inativos),
            exportar os dados em diferentes formatos (CSV, JSON, XLSX) e visualizar informações detalhadas
            de cada candidato, incluindo dados de persona, endereços, guardiões e informações de registro.
            Utilize os ícones nas colunas da tabela para acessar informações específicas de cada candidato.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por CPF, nome, email..."
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
                Todos ({users.length})
              </MenuItem>
              <MenuItem onClick={() => applyFilter("active")}>
                Ativos ({users.filter((u) => u.allowed_city.active).length})
              </MenuItem>
              <MenuItem onClick={() => applyFilter("inactive")}>
                Inativos ({users.filter((u) => !u.allowed_city.active).length})
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
            <IconButton onClick={fetchUsers}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
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
                      minWidth: 50,
                    }}
                  >
                    ID
                  </TableCell>
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
                    Data Nasc.
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
                      minWidth: 200,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 100,
                    }}
                  >
                    Cidade
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 50,
                    }}
                  >
                    UF
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  >
                    Persona
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 100,
                    }}
                  >
                    Endereços
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 100,
                    }}
                  >
                    Guardião
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#A650F0",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  >
                    Registro
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
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
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.cpf}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.birth_date}</TableCell>
                      <TableCell>{user.celphone}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.allowed_city.localidade}</TableCell>
                      <TableCell>{user.allowed_city.uf}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openModal("persona", user)}
                        >
                          <PersonIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openModal("addresses", user)}
                        >
                          <HomeIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openModal("guardians", user)}
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openModal("registration", user)}
                        >
                          <DescriptionIcon fontSize="small" />
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

      {/* Modal Persona */}
      <Dialog
        open={openModalType === "persona"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Persona Data</DialogTitle>
        <DialogContent dividers>
          {currentUser?.personas &&
            Object.entries(currentUser.personas).map(([k, v]) => (
              <Typography key={k} sx={{ mb: 1 }}>
                <strong>{translateLabel(k)}:</strong> {v}
              </Typography>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Endereços */}
      <Dialog
        open={openModalType === "addresses"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Endereços</DialogTitle>
        <DialogContent dividers>
          {currentUser?.addresses && currentUser.addresses.length > 0 ? (
            currentUser.addresses.map((a) => (
              <Box key={a.id} mb={2}>
                <Typography>
                  <strong>CEP:</strong> {a.cep}
                </Typography>
                <Typography>
                  <strong>Logradouro:</strong> {a.logradouro}
                </Typography>
                <Typography>
                  <strong>Complemento:</strong> {a.complemento || "—"}
                </Typography>
                <Typography>
                  <strong>Bairro:</strong> {a.bairro}
                </Typography>
                <Typography>
                  <strong>Cidade:</strong> {a.localidade} ({a.uf})
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>Nenhum endereço cadastrado</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Guardiões */}
      <Dialog
        open={openModalType === "guardians"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Dados do Guardião</DialogTitle>
        <DialogContent dividers>
          {currentUser?.guardians && currentUser.guardians.length > 0 ? (
            currentUser.guardians.map((g) => (
              <Box key={g.cpf} mb={2}>
                <Typography>
                  <strong>Relacionamento:</strong> {g.relationship}
                </Typography>
                <Typography>
                  <strong>Nome:</strong> {g.name}
                </Typography>
                <Typography>
                  <strong>CPF:</strong> {g.cpf}
                </Typography>
                <Typography>
                  <strong>Celular:</strong> {g.cellphone}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {g.email}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>Nenhum guardião cadastrado</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Registro */}
      <Dialog
        open={openModalType === "registration"}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Dados de Registro</DialogTitle>
        <DialogContent dividers>
          {currentUser && (
            <>
              {currentUser.registration_data &&
                Object.entries(currentUser.registration_data).map(([k, v]) => (
                  <Typography key={k}>
                    <strong>{translateLabel(k)}:</strong>{" "}
                    {typeof v === "string"
                      ? v
                          .replace(/_/g, " ")
                          .replace(/^./, (match) => match.toUpperCase())
                      : v}
                  </Typography>
                ))}
              {currentUser.contract && (
                <Typography>
                  <strong>Contrato:</strong> {currentUser.contract.status}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Seletivo;


