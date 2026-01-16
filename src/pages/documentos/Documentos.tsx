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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
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

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export default function DocumentsList() {
  const { documents, loading, snackbar, closeSnackbar, fetchDocuments, uploadId, uploadAddress, uploadSchoolHistory, pagination } =
    useDocuments();

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
    userId: parseInt(d.user_data_id),
    userName: d.student_name || `Usuário ${d.user_data_id}`,
    idDoc: d.id_doc,
    idDocStatus: d.id_doc_status,
    addressDoc: d.address_doc,
    addressDocStatus: d.address_doc_status,
    schoolDoc: d.school_history_doc,
    schoolDocStatus: d.school_history_doc_status,
    contractDoc: d.contract_doc,
    contractDocStatus: d.contract_doc_status,
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
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  p: 3,
                  backgroundColor: designSystem.colors.background.primary,
                  borderBottom: `1px solid ${designSystem.colors.border.main}`,
                }}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
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
                  <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 80 }}>ID</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 200 }}>Nome do Usuário</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }} align="center">Identidade</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }} align="center">Endereço</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }} align="center">Histórico</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 120 }} align="center">Contrato</TableCell>
                        <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, minWidth: 180 }}>Enviado em</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              {searchTerm ? "Nenhum resultado encontrado" : "Nenhum documento disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => (
                          <TableRow key={row.id} {...tableRowHoverStyles}>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row.userId}
                            </TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row.userName}
                            </TableCell>
                            <TableCell align="center">
                              {renderDocCell(row, "idDoc")}
                            </TableCell>
                            <TableCell align="center">
                              {renderDocCell(row, "addressDoc")}
                            </TableCell>
                            <TableCell align="center">
                              {renderDocCell(row, "schoolDoc")}
                            </TableCell>
                            <TableCell align="center">
                              {renderDocCell(row, "contractDoc")}
                            </TableCell>
                            <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
