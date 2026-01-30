import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
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
} from "@mui/material";
import {
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useContracts } from "../../hooks/useContracts";
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
} from "../../styles/designSystem";

const Contratos: React.FC = () => {
  const { contracts, loading, error, fetchContracts, snackbar, closeSnackbar } = useContracts();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === "enviado") {
      return "#4CAF50"; // Verde
    } else if (statusLower === "pronto para enviar" || statusLower === "pendente") {
      return "#FF9800"; // Laranja
    } else if (statusLower === "cancelado") {
      return "#F44336"; // Vermelho
    } else if (statusLower === "rascunho") {
      return "#9E9E9E"; // Cinza
    } else {
      return "#9E9E9E"; // Cinza padrão
    }
  };

  // Traduzir status para português
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'SENT': 'Enviado',
      'ReadyToSend': 'Pronto para enviar',
      'Cancelled': 'Cancelado',
      'CANCELLED': 'Cancelado',
      'PENDING': 'Pendente',
      'DRAFT': 'Rascunho',
    };
    return statusMap[status] || status;
  };

  const rows = Array.isArray(contracts) ? contracts.map((contract) => ({
    id: contract.id,
    email: contract.student_email || "N/A",
    name: contract.student_name || "Nome não disponível",
    status: translateStatus(contract.status || "desconhecido"),
    statusOriginal: contract.status || "desconhecido", // Manter o original para filtros
  })) : [];

  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            title="Contratos"
            subtitle="Gerencie e visualize todos os contratos cadastrados."
            description="Esta página permite gerenciar e visualizar todos os CONTRATOS cadastrados no sistema. Você pode visualizar informações sobre nome do estudante, email e status do contrato (enviado, pronto para enviar, cancelado). Utilize o menu de ações para acessar funcionalidades específicas de cada contrato."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Contratos" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar
                {...toolbarStyles}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <SearchIcon sx={{ 
                    mr: 1, 
                    color: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.text.disabledDark 
                      : designSystem.colors.text.disabled 
                  }} />
                  <TextField
                    placeholder="Pesquisar por nome, email, status..."
                    variant="standard"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton onClick={fetchContracts} {...iconButtonStyles}>
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
                <>
                  <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                  <Table size="small" sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 80 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 250 }}>Nome</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 300 }}>Email</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 150 }} align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography 
                              sx={{ 
                                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                fontSize: "0.95rem" 
                              }}
                            >
                              {searchTerm ? "Nenhum resultado encontrado" : "Nenhum contrato disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => (
                          <TableRow key={row.id} {...tableRowHoverStyles}>
                            <TableCell sx={{ 
                              color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                              fontSize: "0.875rem", 
                              py: 1.5, 
                              width: 80 
                            }}>
                              {row.id}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 250,
                                maxWidth: 250,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.name}
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
                              {row.email}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{
                                color: getStatusColor(row.status),
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 150
                              }}
                            >
                              {row.status}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                    {...tablePaginationStyles}
                  />
                  </TableContainer>
                </>
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
    </Box>
  );
};

export default Contratos;
