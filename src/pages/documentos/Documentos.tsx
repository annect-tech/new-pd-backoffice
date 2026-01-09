import { type ChangeEvent, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Toolbar,
  Alert,
  Fade,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  iconButtonStyles,
  progressStyles,
} from "../../styles/designSystem";
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
          {...iconButtonStyles}
          size="small"
          onClick={() => openViewer(url)}
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
            <IconButton {...iconButtonStyles} component="span" size="small">
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
                  p: 3,
                  backgroundColor: designSystem.colors.background.primary,
                  borderBottom: `1px solid ${designSystem.colors.border.main}`,
                }}
              >
                <Typography variant="h6" sx={{ color: designSystem.colors.text.primary, fontWeight: 600 }}>
                  Documentos de Candidatos
                </Typography>
                <IconButton
                  {...iconButtonStyles}
                  onClick={() => window.location.reload()}
                  title="Atualizar lista"
                >
                  <RefreshIcon />
                </IconButton>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress {...progressStyles} />
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
                        backgroundColor: designSystem.colors.background.secondary,
                        borderBottom: `2px solid ${designSystem.colors.border.main}`,
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: 600,
                          color: designSystem.colors.text.secondary,
                        },
                      },
                      "& .even": {
                        backgroundColor: designSystem.colors.background.primary,
                      },
                      "& .odd": {
                        backgroundColor: designSystem.colors.background.secondary,
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: designSystem.colors.primary.lightest,
                        cursor: "pointer",
                      },
                      border: "none",
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

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
