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
} from "@mui/icons-material";
import { useSelective } from "../../hooks/useSelective";
import { selectiveService } from "../../core/http/services/selectiveService";
import type { UserProfile, Address } from "../../interfaces/userProfile";
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

const Seletivo: React.FC = () => {
  const {
    users,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchUsers,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  } = useSelective();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(
    null
  );
  const [openModalType, setOpenModalType] = useState<
    "persona" | "addresses" | "guardians" | "registration" | null
  >(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addressesMap] = useState<Map<number, Address[]>>(new Map());
  const [loadingAddresses] = useState(false);

  // Enriquecer usuários com dados de endereço do mapa
  const enrichedUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    
    return users.map((user) => {
      // Se o usuário já tem endereços, retornar como está
      if (user.addresses && user.addresses.length > 0) {
        return user;
      }
      
      // Caso contrário, buscar do mapa de endereços
      const userAddresses = addressesMap.get(user.id);
      if (userAddresses && userAddresses.length > 0) {
        return {
          ...user,
          addresses: userAddresses,
        };
      }
      
      return user;
    });
  }, [users, addressesMap]);

  // Filter and sort users
  const filtered = useMemo(() => {
    if (!Array.isArray(enrichedUsers)) {
      return [];
    }
    
    if (enrichedUsers.length === 0) {
      return [];
    }
    
    let result = [...enrichedUsers];
    
    // Filtrar por status (ativo/inativo)
    if (filterStatus !== "all") {
      result = result.filter((u) => {
        const isActive = u.allowed_city?.active ?? true;
        return filterStatus === "active" ? isActive : !isActive;
      });
    }
    
    // Filtrar por termo de busca
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.trim().toLowerCase();

      result = result.filter((u) => {
        // Buscar em ID
        const id = String(u.id || "").toLowerCase();
        if (id.includes(searchLower)) return true;

        // Buscar em nome
        const name = (u.name || "").toLowerCase();
        if (name.includes(searchLower)) return true;

        // Buscar em CPF
        const cpf = (u.cpf || "").toLowerCase();
        if (cpf.includes(searchLower)) return true;

        // Buscar em email
        const email = (u.email || "").toLowerCase();
        if (email.includes(searchLower)) return true;

        return false;
      });
    }

    if (sortOrder !== "none") {
      result.sort((a, b) => {
        // Ordenar por nome
        const nameA = (a.name || "").trim().toLowerCase();
        const nameB = (b.name || "").trim().toLowerCase();

        const comparison = nameA.localeCompare(nameB, 'pt-BR');
        const finalResult = sortOrder === "asc" ? comparison : -comparison;

        return finalResult;
      });
    }
    
    return result;
  }, [enrichedUsers, filterStatus, sortOrder, debouncedSearchTerm]);

  // Debounce do searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Resetar página quando o termo de pesquisa ou filtro de status mudar
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchTerm, filterStatus]);

  // Buscar dados quando página ou rowsPerPage mudarem
  // Não enviamos o searchTerm ao backend, pois filtramos localmente
  useEffect(() => {
    fetchUsers(page + 1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

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
  const applySortOrder = (order: "asc" | "desc" | "none") => {
    setSortOrder(order);
    closeFilterMenu();
  };

  const openModal = async (
    type: "persona" | "addresses" | "guardians" | "registration",
    user: UserProfile
  ) => {
    setLoadingDetails(true);
    setOpenModalType(type);
    
    try {
      // Buscar dados completos do usuário
      let response: any;

      switch (type) {
        case 'persona':
          response = await selectiveService.getPersonaByUserId(user.id);
          break;
        case 'addresses':
          response = await selectiveService.getAddressByUserId(user.id);
          break;
        case 'guardians':
          response = await selectiveService.getGuardiansByUserId(user.id);
          break;
        case 'registration':
          response = await selectiveService.getDocumentsByUserId(user.id);
          break;
        default:
          response = null;
      }
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        setCurrentUser(response.data);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingDetails(false);
    }
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
          <PageHeader
            title="Seletivo"
            subtitle="Gerencie e visualize todos os candidatos do processo seletivo."
            description="Pesquise candidatos por CPF, nome ou email, exporte os dados em diferentes formatos (CSV, JSON, XLSX) e visualize informações detalhadas de cada candidato, incluindo dados de persona, endereços, guardiões e informações de registro."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Seletivo" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ 
                    mr: 1, 
                    color: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.text.disabledDark 
                      : designSystem.colors.text.disabled 
                  }} />
                  <TextField
                    placeholder="Pesquisar por ID, nome, CPF ou email..."
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
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? "0 4px 12px rgba(0,0,0,0.5)" 
                            : "0 4px 12px rgba(0,0,0,0.1)",
                          minWidth: 200,
                          bgcolor: (theme) => theme.palette.mode === "dark" ? "#2C2C2C" : "#FFFFFF",
                          border: (theme) => theme.palette.mode === "dark" 
                            ? "1px solid rgba(255, 255, 255, 0.1)" 
                            : "none",
                        },
                      },
                    }}
                  >
                    <Typography sx={{ 
                      px: 2, 
                      py: 1, 
                      fontWeight: 600, 
                      fontSize: "0.875rem", 
                      color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280" 
                    }}>
                      Filtrar por Status
                    </Typography>
                    <MenuItem 
                      onClick={() => applyFilter("all")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "all" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: filterStatus === "all" ? 600 : 400 
                      }}
                    >
                      Todos
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("active")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "active" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: filterStatus === "active" ? 600 : 400 
                      }}
                    >
                      Ativos
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("inactive")}
                      sx={{ 
                        backgroundColor: (theme) => filterStatus === "inactive" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: filterStatus === "inactive" ? 600 : 400 
                      }}
                    >
                      Inativos
                    </MenuItem>
                    <Box sx={{ 
                      borderTop: (theme) => theme.palette.mode === "dark" 
                        ? "1px solid rgba(255, 255, 255, 0.1)" 
                        : "1px solid #E5E7EB", 
                      my: 1 
                    }} />
                    <Typography sx={{ 
                      px: 2, 
                      py: 1, 
                      fontWeight: 600, 
                      fontSize: "0.875rem", 
                      color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280" 
                    }}>
                      Ordenar por Nome
                    </Typography>
                    <MenuItem 
                      onClick={() => applySortOrder("none")}
                      sx={{ 
                        backgroundColor: (theme) => sortOrder === "none" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: sortOrder === "none" ? 600 : 400 
                      }}
                    >
                      Sem ordenação
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applySortOrder("asc")}
                      sx={{ 
                        backgroundColor: (theme) => sortOrder === "asc" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: sortOrder === "asc" ? 600 : 400 
                      }}
                    >
                      A → Z
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applySortOrder("desc")}
                      sx={{ 
                        backgroundColor: (theme) => sortOrder === "desc" 
                          ? (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F3F4F6")
                          : "transparent",
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                        fontWeight: sortOrder === "desc" ? 600 : 400 
                      }}
                    >
                      Z → A
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
                          boxShadow: (theme) => theme.palette.mode === "dark" 
                            ? "0 4px 12px rgba(0,0,0,0.5)" 
                            : "0 4px 12px rgba(0,0,0,0.1)",
                          bgcolor: (theme) => theme.palette.mode === "dark" ? "#2C2C2C" : "#FFFFFF",
                          border: (theme) => theme.palette.mode === "dark" 
                            ? "1px solid rgba(255, 255, 255, 0.1)" 
                            : "none",
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
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                      }}
                    >
                      CSV
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExportJSON();
                        setDownloadAnchor(null);
                      }}
                      sx={{
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                      }}
                    >
                      JSON
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExportXLSX();
                        setDownloadAnchor(null);
                      }}
                      sx={{
                        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "inherit",
                      }}
                    >
                      XLSX
                    </MenuItem>
                  </Menu>
                  <IconButton 
                    onClick={() => fetchUsers(page + 1, rowsPerPage, searchTerm.trim() || undefined)} 
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Toolbar>

              {loading || loadingAddresses ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 60 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 200 }}>Nome</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 300 }}>Email</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 150 }} align="center">
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography 
                              sx={{ 
                                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                fontSize: "0.95rem" 
                              }}
                            >
                              {searchTerm || filterStatus !== "all"
                                ? "Nenhum resultado encontrado"
                                : "Nenhum dado disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((user) => (
                          <TableRow
                              key={user.id}
                              {...tableRowHoverStyles}
                              sx={{
                                ...tableRowHoverStyles.sx,
                              }}
                            >
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#374151", 
                              fontSize: "0.875rem", 
                              py: 1.5, 
                              width: 60 
                            }}>
                              {user.id}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 200,
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.name || "—"}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 300,
                                maxWidth: 300,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.email || "—"}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, width: 150 }}>
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <IconButton
                                  onClick={() => openModal("persona", user)}
                                >
                                  <PersonIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => openModal("addresses", user)}
                                >
                                  <HomeIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => openModal("guardians", user)}
                                >
                                  <PeopleIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => openModal("registration", user)}
                                >
                                  <DescriptionIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={pagination.totalItems}
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
          {loadingDetails && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress {...progressStyles} />
            </Box>
          )}
          {!loadingDetails && currentUser && (
            Object
              .entries(currentUser)
              .filter(([k]) => k !== 'auth_user_id')
              .map(([k, v]) => (
                <Typography key={k} sx={{ mb: 1.5 }}>
                  <strong>{translateLabel(k)}:</strong> <span style={{ color: "#fff" }}>{String(v)}</span>
                </Typography>
            ))
          )}
          {!loadingDetails && !currentUser && (
            <Typography color="#6B7280">Nenhum dado disponível</Typography>
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
          {loadingDetails && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress {...progressStyles} />
            </Box>
          )}
          {!loadingDetails && currentUser && (
            currentUser?.data?.map((a: any) => (
              <Box key={a.id} mb={2} pb={2} borderBottom="1px solid #E5E7EB">
                <Typography sx={{ mb: 0.5 }}>
                  <strong>CEP:</strong> {a.cep}
                </Typography>
                <Typography sx={{ mb: 0.5 }}>
                  <strong>Logradouro:</strong> {a.logradouro}
                </Typography>
                <Typography sx={{ mb: 0.5 }}>
                  <strong>Complemento:</strong> {a.complemento || "—"}
                </Typography>
                <Typography sx={{ mb: 0.5 }}>
                  <strong>Bairro:</strong> {a.bairro}
                </Typography>
                <Typography sx={{ mb: 0.5 }}>
                  <strong>Cidade:</strong> {a.localidade} ({a.uf})
                </Typography>
              </Box>
            ))
          )}
          {!loadingDetails && !currentUser && (
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
          {loadingDetails && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress {...progressStyles} />
            </Box>
          )}
          {!loadingDetails && currentUser && (
            <Box key={currentUser.cpf} mb={2} pb={2} borderBottom="1px solid #E5E7EB">
              <Typography sx={{ mb: 0.5 }}>
                <strong>Relacionamento:</strong> {currentUser.relationship}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <strong>Nome:</strong> {currentUser.name}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <strong>CPF:</strong> {currentUser.cpf}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <strong>Celular:</strong> {currentUser.cellphone}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <strong>Email:</strong> {currentUser.email}
              </Typography>
            </Box>
          )}
          {!loadingDetails && !currentUser && (
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
          {loadingDetails && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress {...progressStyles} />
            </Box>
          )}
          {!loadingDetails && currentUser && (
            <Box key={currentUser.id} mb={2} pb={2} borderBottom="1px solid #E5E7EB">
              <Typography sx={{ mb: 0.5 }}>
                <strong>Contrato:</strong> <a target="_blank" href={currentUser.contract_doc}>{currentUser.contract_doc}</a>
              </Typography>
            </Box>
          )}
          {!loadingDetails && !currentUser && (
            <Typography color="#6B7280">Nenhum dado disponível</Typography>
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


