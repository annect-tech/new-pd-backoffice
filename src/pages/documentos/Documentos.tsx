import { type ChangeEvent, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Toolbar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate } from "react-router";
import { useDocuments } from "./useDocuments";
import PdfViewModa from "../../components/modals/PdfViewModa";
import { getTableConfig, APP_ROUTES } from "../../util/constants";

export default function DocumentsList() {
  const navigate = useNavigate();
  const { docs, loading, error, uploadId, uploadAddress, uploadSchoolHistory } =
    useDocuments();

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const rows = docs.map((d) => ({
    id: d.id,
    userId: d.user_data,
    userName: d.user_name || `Usuário ${d.user_data}`,
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

  const openViewer = (url: string) => setViewerUrl(url);
  const closeViewer = () => setViewerUrl(null);

  const renderDocCell = (
    params: any,
    type: "idDoc" | "addressDoc" | "schoolDoc" | "contractDoc"
  ) => {
    const url = params.row[type] as string | null;
    const userId = params.row.userId as number;

    if (url) {
      return (
        <IconButton
          size="small"
          onClick={() => openViewer(url)}
          sx={{ color: "gray" }}
        >
          <VisibilityIcon />
        </IconButton>
      );
    } else {
      // choose upload handler
      let inputId = "";
      let handlerType: "id" | "address" | "school";
      if (type === "idDoc") {
        inputId = `id-upload-${params.id}`;
        handlerType = "id";
      }
      if (type === "addressDoc") {
        inputId = `addr-upload-${params.id}`;
        handlerType = "address";
      }
      if (type === "schoolDoc") {
        inputId = `school-upload-${params.id}`;
        handlerType = "school";
      }
      if (type === "contractDoc") {
        inputId = `contract-upload-${params.id}`;
        handlerType = "school";
      } // or new handler
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
            <IconButton component="span" size="small" sx={{ color: "gray" }}>
              <UploadFileIcon />
            </IconButton>
          </label>
        </>
      );
    }
  };

  const columns: any[] = [
    { field: "userId", headerName: "ID", width: 80 },
    { field: "userName", headerName: "Nome do Usuário", width: 200, flex: 1 },
    {
      field: "idDoc",
      headerName: "Identidade",
      width: 120,
      renderCell: (params: any) => renderDocCell(params, "idDoc"),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "addressDoc",
      headerName: "Endereço",
      width: 120,
      renderCell: (params: any) => renderDocCell(params, "addressDoc"),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "schoolDoc",
      headerName: "Histórico",
      width: 120,
      renderCell: (params: any) => renderDocCell(params, "schoolDoc"),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "contractDoc",
      headerName: "Contrato",
      width: 120,
      renderCell: (params: any) => renderDocCell(params, "contractDoc"),
      align: "center",
      headerAlign: "center",
    },
    { field: "createdAt", headerName: "Enviado em", width: 180 },
  ];

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
        <Typography color="text.primary">Visualização de Documentos</Typography>
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
          Visualização de Documentos
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
            <strong>Documentos de Candidatos</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite visualizar e gerenciar os documentos dos candidatos. Você pode visualizar documentos de identidade, endereço, histórico escolar e contratos. Clique no ícone de visualização para abrir o documento ou no ícone de upload para enviar um novo documento.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#A650F0",
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ color: "white" }}>
            Documentos de Candidatos
          </Typography>
          <IconButton
            onClick={() => window.location.reload()}
            sx={{ color: "white" }}
            title="Atualizar lista"
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
              }
              {...getTableConfig()}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#A650F0",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
                    color: "gray",
                  },
                },
                "& .even": {
                  backgroundColor: "#F5F5F5",
                },
                "& .odd": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#E1BEE7",
                  cursor: "pointer",
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {viewerUrl && (
        <PdfViewModa
          open={true}
          documentUrl={viewerUrl}
          onClose={closeViewer}
        />
      )}
    </Box>
  );
}
