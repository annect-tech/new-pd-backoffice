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
import { usersService } from "../../core/http/services/usersService";
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
    snackbar,
    closeSnackbar,
  } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "aprovado" | "reprovado" | "pendente"
  >("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, { name?: string; cpf?: string }>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Transform exams to rows
  const rows = useMemo(() => {
    return exams.map((exam) => {
      const userData = exam.user_data;
      const user = userData?.user;
      const userDataId = (exam as any)?.user_data_id;
      const userIdKey = userDataId ? String(userDataId) : undefined;

      // CPF: prioriza dados do mapa, depois nested data, depois ID
      const cpf =
        (userIdKey && userInfoMap[userIdKey]?.cpf) ||
        userData?.cpf ||
        (userDataId ? String(userDataId) : "N/A");
      
      // Nome: prioriza dados do mapa, depois nested data, depois fallback
      const nome =
        (userIdKey && userInfoMap[userIdKey]?.name) ||
        (user?.first_name || user?.last_name
          ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
          : userDataId
          ? `Usuário ${userDataId}`
          : "N/A");

      // Normalizar status para exibição/filtragem
      const statusMap: Record<string, string> = {
        APPROVED: "aprovado",
        REJECTED: "reprovado",
        PENDING: "pendente",
      };
      const statusNormalizado =
        exam.status && statusMap[exam.status.toUpperCase()]
          ? statusMap[exam.status.toUpperCase()]
          : exam.status?.toLowerCase() ?? "pendente";

      return {
        id: exam.id,
        cpf,
        name: nome,
        score: exam.score ?? null,
        status: statusNormalizado,
        local: exam.exam_scheduled_hour?.exam_date?.local?.name ?? "N/A",
        date: exam.exam_scheduled_hour?.exam_date?.date ?? "N/A",
        hour: exam.exam_scheduled_hour?.hour ?? "N/A",
        user_data_id: userDataId,
      };
    });
  }, [exams, userInfoMap]);

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

  // Buscar dados de usuário (nome/cpf) a partir de user_data_id
  useEffect(() => {
    if (!exams || exams.length === 0) return;

    const uniqueUserIds = [
      ...new Set(
        exams
          .map((e) => (e as any)?.user_data_id)
          .filter(Boolean)
          .map((id) => String(id))
      ),
    ];

    if (uniqueUserIds.length === 0) {
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const map: Record<string, { name?: string; cpf?: string }> = {};
      
      try {
        const resp = await usersService.listAllUsers(1, 1000);
        
        if (resp.status === 200 && resp.data) {
          let users: any[] = [];
          
          if (Array.isArray(resp.data)) {
            users = resp.data;
          } else if (resp.data?.data && Array.isArray(resp.data.data)) {
            users = resp.data.data;
          } else if (resp.data?.results && Array.isArray(resp.data.results)) {
            users = resp.data.results;
          }
          
          uniqueUserIds.forEach((userId) => {
            const user = users.find((u) => String(u.id) === userId);
            
            if (user) {
              const firstName = user.first_name || "";
              const lastName = user.last_name || "";
              const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
              
              map[userId] = {
                name: fullName || user.username || undefined,
                cpf: user.cpf || undefined,
              };
            }
          });
        }
        
        setUserInfoMap((prev) => ({ ...prev, ...map }));
      } catch {
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [exams]);

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
  const applyFilter = (status: "all" | "aprovado" | "reprovado" | "pendente") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const handleExportCSV = () => {
    if (rows.length === 0) {
      // O snackbar será gerenciado pelo hook
      return;
    }

    const headers = ["CPF", "Nome", "Score", "Status"];
    const csvRows = rows.map((row) => [
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
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          minWidth: 200,
                        },
                      },
                    }}
                  >
                    <Typography sx={{ px: 2, py: 1, fontWeight: 600, fontSize: "0.875rem", color: "#6B7280" }}>
                      Filtrar por Status
                    </Typography>
                    <MenuItem 
                      onClick={() => applyFilter("all")}
                      sx={{ 
                        backgroundColor: filterStatus === "all" ? "#F3F4F6" : "transparent",
                        fontWeight: filterStatus === "all" ? 600 : 400 
                      }}
                    >
                      Todos ({rows.length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("aprovado")}
                      sx={{ 
                        backgroundColor: filterStatus === "aprovado" ? "#F3F4F6" : "transparent",
                        fontWeight: filterStatus === "aprovado" ? 600 : 400 
                      }}
                    >
                      Aprovados ({rows.filter((r) => r.status === "aprovado").length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("reprovado")}
                      sx={{ 
                        backgroundColor: filterStatus === "reprovado" ? "#F3F4F6" : "transparent",
                        fontWeight: filterStatus === "reprovado" ? 600 : 400 
                      }}
                    >
                      Reprovados ({rows.filter((r) => r.status === "reprovado").length})
                    </MenuItem>
                    <MenuItem 
                      onClick={() => applyFilter("pendente")}
                      sx={{ 
                        backgroundColor: filterStatus === "pendente" ? "#F3F4F6" : "transparent",
                        fontWeight: filterStatus === "pendente" ? 600 : 400 
                      }}
                    >
                      Pendentes ({rows.filter((r) => r.status === "pendente").length})
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
                <>
                  {loadingUsers && (
                    <Box sx={{ px: 2, py: 1 }}>
                      <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                        Carregando dados dos usuários...
                      </Alert>
                    </Box>
                  )}
                <TableContainer sx={{ maxWidth: "100%" }}>
                  <Table stickyHeader size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }}>
                          ID Resultado
                        </TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>
                          ID Usuário
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
                </>
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

