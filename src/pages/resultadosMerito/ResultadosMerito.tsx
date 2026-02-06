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
  Snackbar,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useAcademicMerit } from "../../hooks/useAcademicMerit";
import { academicMeritService } from "../../core/http/services/academicMeritService";
import PdfViewModal from "../../components/modals/PdfViewModal";
import { APP_ROUTES } from "../../util/constants";
import { getApiUrl } from "../../core/http/apiUrl";
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

const API_URL = getApiUrl();

const ResultadosMerito: React.FC = () => {
  const { allMerits, loading, error, fetchAllMerits, snackbar, closeSnackbar } = useAcademicMerit();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pendente" | "aprovado" | "reprovado">("all");
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ element: HTMLElement; id: string | number } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | number | null>(null);
  const [localSnackbar, setLocalSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({ open: false, message: "", severity: "info" });

  // Transform allMerits to rows
  const rows = useMemo(() => {
    if (!allMerits || allMerits.length === 0) {
      return [];
    }
    
    return allMerits.map((m) => {
      let alunoNome = "Nome não disponível";
      const firstName = m?.user_data_display?.user?.first_name || "";
      const lastName = m?.user_data_display?.user?.last_name || "";
      alunoNome = `${firstName} ${lastName}`.trim();
      
      // Mapear status da API para formato usado no frontend
      const statusMap: Record<string, string> = {
        "PENDING": "pendente",
        "APPROVED": "aprovado",
        "REJECTED": "reprovado",
      };
      const statusNormalizado = m.status 
        ? (statusMap[m.status.toUpperCase()] || m.status.toLowerCase())
        : "pendente";
      
      return {
        id: m.id,
        aluno: alunoNome,
        documento: m.document || "",
        status: statusNormalizado,
        criadoEm: m.created_at 
          ? new Date(m.created_at).toLocaleString("pt-BR")
          : "N/A",
        atualizadoEm: m.updated_at
          ? new Date(m.updated_at).toLocaleString("pt-BR")
          : "N/A",
      };
    });
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
        if (filterStatus === "pendente") return row.status === "pendente";
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
    fetchAllMerits(1, 1000);
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
  const applyFilter = (status: "all" | "pendente" | "aprovado" | "reprovado") => {
    setFilterStatus(status);
    closeFilterMenu();
  };

  const openStatusMenu = (e: React.MouseEvent<HTMLElement>, id: string | number) => {
    e.stopPropagation();
    setStatusMenuAnchor({ element: e.currentTarget, id });
  };

  const closeStatusMenu = () => {
    setStatusMenuAnchor(null);
  };

  const handleUpdateStatus = async (id: string | number, newStatus: "PENDING" | "APPROVED" | "REJECTED") => {
    setUpdatingStatus(id);
    closeStatusMenu();
    
    try {
      const response = await academicMeritService.updateStatus(id, newStatus);
      
      if (response.status >= 200 && response.status < 300) {
        const statusMap: Record<string, string> = {
          "PENDING": "pendente",
          "APPROVED": "aprovado",
          "REJECTED": "reprovado",
        };
        setLocalSnackbar({
          open: true,
          message: `Status alterado para ${statusMap[newStatus]} com sucesso`,
          severity: "success",
        });
        // Recarregar a lista
        await fetchAllMerits(1, 1000);
      } else {
        let errorMessage = response.message || "Erro ao alterar status";
        const merit = allMerits.find(m => String(m.id) === String(id));
        
        // Se for erro de userData já existente, tratar como sucesso com aviso
        if (errorMessage.includes("Já existe um userData") || errorMessage.includes("userData associado")) {
          const statusMap: Record<string, string> = {
            "PENDING": "pendente",
            "APPROVED": "aprovado",
            "REJECTED": "reprovado",
          };
          setLocalSnackbar({
            open: true,
            message: `Status alterado para ${statusMap[newStatus]} com sucesso`,
            severity: "success",
          });
          // Mostrar aviso adicional após um pequeno delay
          setTimeout(() => {
            setLocalSnackbar({
              open: true,
              message: "Aviso: O usuário já possui um registro em seletivo_userdata.",
              severity: "info",
            });
          }, 500);
          // Recarregar a lista
          await fetchAllMerits(1, 1000);
        }
        // Mensagem mais descritiva para erro de user_data_id inválido
        else if (errorMessage.includes("user_data_id inválido") || response.status === 404) {
          errorMessage = `Não foi possível alterar o status. O usuário associado (ID: ${merit?.user_data_id || "desconhecido"}) não existe ou não está configurado corretamente no sistema. Verifique os dados do usuário no banco de dados.`;
          setLocalSnackbar({
            open: true,
            message: errorMessage,
            severity: "error",
          });
        } else {
          setLocalSnackbar({
            open: true,
            message: errorMessage,
            severity: "error",
          });
        }
      }
    } catch (err: any) {
      let errorMessage = err.message || "Erro ao alterar status";
      const merit = allMerits.find(m => String(m.id) === String(id));
      
      if (errorMessage.includes("user_data_id inválido")) {
        errorMessage = `Não foi possível alterar o status. O usuário associado (ID: ${merit?.user_data_id || "desconhecido"}) não existe ou não está configurado corretamente no sistema. Verifique os dados do usuário no banco de dados.`;
        setLocalSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
      else if (errorMessage.includes("Já existe um userData") || errorMessage.includes("userData associado")) {
        const statusMap: Record<string, string> = {
          "PENDING": "pendente",
          "APPROVED": "aprovado",
          "REJECTED": "reprovado",
        };
        setLocalSnackbar({
          open: true,
          message: `Status alterado para ${statusMap[newStatus]} com sucesso`,
          severity: "success",
        });
        // Mostrar aviso adicional após um pequeno delay
        setTimeout(() => {
          setLocalSnackbar({
            open: true,
            message: "Aviso: O usuário já possui um registro em seletivo_userdata.",
            severity: "info",
          });
        }, 500);
        // Recarregar a lista
        await fetchAllMerits(1, 1000);
      }
      else {
        setLocalSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Constrói URL completa do PDF
  const buildPdfUrl = (pdfPath: string | null | undefined): string | null => {
    if (!pdfPath) return null;
    
    // Se já for uma URL completa, retorna como está
    if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
      return pdfPath;
    }
    
    // Remove barra inicial se existir
    const cleanPath = pdfPath.startsWith("/") ? pdfPath.slice(1) : pdfPath;
    
    // Constrói URL completa
    return `${API_URL}/${cleanPath}`;
  };

  const handleView = (url: string) => {
    if (url && url.trim() !== "") {
      const fullUrl = buildPdfUrl(url);
      if (fullUrl) {
        setViewerUrl(fullUrl);
      } else {
        setLocalSnackbar({
          open: true,
          message: "Documento não disponível",
          severity: "warning",
        });
      }
    } else {
      setLocalSnackbar({
        open: true,
        message: "Documento não disponível",
        severity: "warning",
      });
    }
  };

  const closeLocalSnackbar = () => {
    setLocalSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleExportCSV = () => {
    // Usar filtered em vez de rows para respeitar os filtros aplicados
    if (filtered.length === 0) return;

    const headers = ["ID", "Aluno", "Status", "Criado em", "Atualizado em"];
    const csvRows = filtered.map((row) => [
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
      case "pendente":
        return "#FF9800";
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
            description="Esta página permite visualizar os RESULTADOS DOS MÉRITOS ACADÊMICOS dos candidatos. Você pode pesquisar por nome ou ID, filtrar por status (pendente/aprovado/reprovado), exportar os dados em CSV, visualizar os documentos PDF e alterar o status de cada mérito. Utilize o botão 'Ver PDF' para abrir o documento completo e o menu de ações (⋮) para alterar o status."
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
                    <MenuItem onClick={() => applyFilter("pendente")}>
                      Pendentes ({rows.filter((r) => r.status === "pendente").length})
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
                  <IconButton {...iconButtonStyles} onClick={() => fetchAllMerits(1, 1000)}>
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
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 100, textAlign: "center" }}>
                          Ações
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
                          <TableRow key={row.id} {...tableRowHoverStyles}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.aluno}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleView(row.documento)}
                                disabled={!row.documento || row.documento.trim() === ""}
                                sx={{
                                  borderColor: designSystem.colors.primary.main,
                                  color: designSystem.colors.primary.main,
                                  "&:hover": {
                                    borderColor: designSystem.colors.primary.darker,
                                    backgroundColor: designSystem.colors.primary.lightest,
                                  },
                                  "&:disabled": {
                                    borderColor: designSystem.colors.text.disabled,
                                    color: designSystem.colors.text.disabled,
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
                            <TableCell align="center">
                              {updatingStatus === row.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <IconButton
                                  size="small"
                                  onClick={(e) => openStatusMenu(e, row.id)}
                                  sx={{
                                    color: designSystem.colors.text.secondary,
                                    "&:hover": {
                                      backgroundColor: designSystem.colors.background.secondary,
                                    },
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              )}
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

      {viewerUrl && (
        <PdfViewModal
          open={Boolean(viewerUrl)}
          documentUrl={viewerUrl}
          onClose={() => setViewerUrl(null)}
        />
      )}

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

      <Snackbar
        open={localSnackbar.open}
        autoHideDuration={3000}
        onClose={closeLocalSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeLocalSnackbar}
          severity={localSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {localSnackbar.message}
        </Alert>
      </Snackbar>

      {/* Menu de alteração de status */}
      <Menu
        anchorEl={statusMenuAnchor?.element || null}
        open={Boolean(statusMenuAnchor)}
        onClose={closeStatusMenu}
      >
        <MenuItem
          onClick={() => statusMenuAnchor && handleUpdateStatus(statusMenuAnchor.id, "PENDING")}
          disabled={updatingStatus === statusMenuAnchor?.id}
        >
          Marcar como Pendente
        </MenuItem>
        <MenuItem
          onClick={() => statusMenuAnchor && handleUpdateStatus(statusMenuAnchor.id, "APPROVED")}
          disabled={updatingStatus === statusMenuAnchor?.id}
        >
          Marcar como Aprovado
        </MenuItem>
        <MenuItem
          onClick={() => statusMenuAnchor && handleUpdateStatus(statusMenuAnchor.id, "REJECTED")}
          disabled={updatingStatus === statusMenuAnchor?.id}
        >
          Marcar como Reprovado
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ResultadosMerito;

