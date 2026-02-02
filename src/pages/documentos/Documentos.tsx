import React, { type ChangeEvent, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Toolbar,
  Alert,
  Snackbar,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
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
import { useDocuments } from "../../hooks/useDocuments";
import PdfViewModal from "../../components/modals/PdfViewModal";
import { APP_ROUTES } from "../../util/constants";
import { getApiUrl } from "../../core/http/apiUrl";

const API_URL = getApiUrl();

export default function DocumentsList() {
  const { documents, loading, snackbar, closeSnackbar, fetchDocuments, uploadId, uploadAddress, uploadSchoolHistory, pagination, updateDocument } =
    useDocuments();

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingUserDataId, setRejectingUserDataId] = useState<string | null>(null);

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Carregar documentos ao montar o componente
  React.useEffect(() => {
    fetchDocuments(page + 1, rowsPerPage);
  }, [page, rowsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = documents.map((d) => ({
    id: d.id,
    documentId: d.id, // ID do documento para usar na atualização
    userId: parseInt(d.user_data_id),
    userDataId: d.user_data_id,
    userName: d.student_name || `Usuário ${d.user_data_id}`,
    userEmail: d.student_email,
    idDoc: d.id_doc,
    idDocStatus: d.id_doc_status,
    addressDoc: d.address_doc,
    addressDocStatus: d.address_doc_status,
    schoolDoc: d.school_history_doc,
    schoolDocStatus: d.school_history_doc_status,
    contractDoc: d.contract_doc,
    contractDocStatus: d.contract_doc_status || '',
    createdAt: new Date(d.created_at).toLocaleString(),
  }));

  const filteredRows = rows.filter(
    (row) =>
      row.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.userId.toString().includes(searchTerm)
  );

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFile = (
    e: ChangeEvent<HTMLInputElement>,
    userId: number,
    type: "id" | "address" | "school"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "id") uploadId(userId, file.name, file);
    if (type === "address") uploadAddress(userId, file.name, file);
    if (type === "school") uploadSchoolHistory(userId, file.name, file);
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

  const openViewer = (url: string) => {
    const fullUrl = buildPdfUrl(url);
    if (fullUrl) {
      setViewerUrl(fullUrl);
    }
  };
  const closeViewer = () => setViewerUrl(null);

  // Função para atualizar o status do contrato
  const handleContractStatusChange = async (userDataId: string, newStatus: string) => {
    if (newStatus === "refused") {
      setRejectingUserDataId(userDataId);
      setRejectDialogOpen(true);
      return;
    }
    setUpdatingStatus(userDataId);
    try {
      const success = await updateDocument(userDataId, { contract_doc_status: newStatus });
      if (success) {
        fetchDocuments(page + 1, rowsPerPage);
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Função para confirmar rejeição com motivo
  const handleRejectConfirm = async () => {
    if (!rejectingUserDataId) return;
    setRejectDialogOpen(false);
    setUpdatingStatus(rejectingUserDataId);
    try {
      const success = await updateDocument(rejectingUserDataId, {
        contract_doc_status: "refused",
        contract_doc_refuse_reason: rejectReason.trim(),
      });
      if (success) {
        fetchDocuments(page + 1, rowsPerPage);
      }
    } finally {
      setUpdatingStatus(null);
      setRejectReason("");
      setRejectingUserDataId(null);
    }
  };

  // Função para obter a cor do texto do status
  const getStatusTextColor = (status: string): string => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "approved") return "#4CAF50"; // Verde
    if (statusLower === "pending") return "#FF9800"; // Laranja
    if (statusLower === "refused") return "#F44336"; // Vermelho
    return "#9E9E9E"; // Cinza padrão
  };

  // Traduzir status
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'approved': 'Aprovado',
      'pending': 'Pendente',
      'refused': 'Rejeitado',
    };
    return statusMap[status?.toLowerCase()] || status || 'N/A';
  };

  const renderDocCell = (
    row: any,
    type: "idDoc" | "addressDoc" | "schoolDoc" | "contractDoc"
  ) => {
    const url = row[type] as string | null;
    const userId = row.userId as number;

    if (url) {
      return (
        <IconButton
          {...iconButtonStyles}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            openViewer(url);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      );
    } else {
      let inputId = "";
      let handlerType: "id" | "address" | "school";
      if (type === "idDoc") {
        inputId = `id-upload-${row.id}`;
        handlerType = "id";
      }
      if (type === "addressDoc") {
        inputId = `addr-upload-${row.id}`;
        handlerType = "address";
      }
      if (type === "schoolDoc") {
        inputId = `school-upload-${row.id}`;
        handlerType = "school";
      }
      if (type === "contractDoc") {
        inputId = `contract-upload-${row.id}`;
        handlerType = "school";
      }
      return (
        <>
          <input
            type="file"
            accept="image/*,.pdf"
            style={{ display: "none" }}
            id={inputId}
            onChange={(e) => handleFile(e, userId, handlerType)}
          />
          <label htmlFor={inputId}>
            <IconButton
              {...iconButtonStyles}
              component="span"
              size="small"
              onClick={(e) => e.stopPropagation()}
            >
              <UploadFileIcon />
            </IconButton>
          </label>
        </>
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Documentos"
            subtitle="Visualize e gerencie documentos."
            description="Esta página permite visualizar e gerenciar documentos dos candidatos e alunos. Utilize os filtros e a busca para encontrar documentos específicos."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Documentos" },
            ]}
          />
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
                    placeholder="Pesquisar por CPF, nome, email..."
                    variant="standard"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    {...iconButtonStyles}
                    onClick={() => fetchDocuments(page + 1, rowsPerPage)}
                    title="Atualizar lista"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                  <Table size="small" sx={{ minWidth: 1100 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 80 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 300 }}>Email</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 180 }}>Nome do Usuário</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }} align="center">Identidade</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }} align="center">Endereço</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }} align="center">Histórico</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }} align="center">Contrato</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 150 }} align="center">Status Contrato</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 150 }}>Enviado em</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                            <Typography 
                              sx={{ 
                                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                fontSize: "0.95rem" 
                              }}
                            >
                              {searchTerm ? "Nenhum resultado encontrado" : "Nenhum documento disponível"}
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
                              {row.userDataId}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 180,
                                maxWidth: 180,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.userName}
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
                              {row.userEmail}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 100
                              }}
                            >
                              {renderDocCell(row, "idDoc")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 100
                              }}
                            >
                              {renderDocCell(row, "addressDoc")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 100
                              }}
                            >
                              {renderDocCell(row, "schoolDoc")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 100
                              }}
                            >
                              {renderDocCell(row, "contractDoc")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 150
                              }}
                            >
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={row.contractDocStatus || ''}
                                  onChange={(e) => handleContractStatusChange(row.userDataId, e.target.value)}
                                  disabled={updatingStatus === row.userDataId}
                                  displayEmpty
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: getStatusTextColor(row.contractDocStatus || ''),
                                    fontWeight: 500,
                                    "& .MuiSelect-select": {
                                      py: 0.5,
                                      color: getStatusTextColor(row.contractDocStatus || ''),
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      borderColor: "transparent",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                      borderColor: "transparent",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                      borderColor: "transparent",
                                    },
                                  }}
                                  renderValue={(value) => (
                                    <Typography
                                      sx={{
                                        color: getStatusTextColor(value as string),
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {translateStatus(value as string)}
                                    </Typography>
                                  )}
                                >
                                  <MenuItem value="pending">Pendente</MenuItem>
                                  <MenuItem value="approved">Aprovado</MenuItem>
                                  <MenuItem value="refused">Rejeitado</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                fontSize: "0.875rem",
                                py: 1.5,
                                width: 150,
                                maxWidth: 150,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.createdAt}
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
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
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
          open={true}
          documentUrl={viewerUrl}
          onClose={closeViewer}
        />
      )}

      {/* Dialog de rejeição */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason("");
          setRejectingUserDataId(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reprovar contrato</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo da reprovação"
            fullWidth
            multiline
            minRows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason("");
              setRejectingUserDataId(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={handleRejectConfirm}
          >
            Reprovar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
