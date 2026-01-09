import React, { useEffect, type MouseEvent, useState } from "react";
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
  Breadcrumbs,
  Link,
  Chip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { useContracts } from "../../hooks/useContracts";
import { getTableConfig } from "../../util/constants";
import { APP_ROUTES } from "../../util/constants";

const Contratos: React.FC = () => {
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts } = useContracts();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const openMenu = (e: MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ativo":
        return "success";
      case "pendente":
        return "warning";
      case "cancelado":
        return "error";
      default:
        return "default";
    }
  };

  const columns: any[] = [
    { 
      field: "cpf", 
      headerName: "CPF", 
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    { 
      field: "name", 
      headerName: "Nome", 
      width: 250,
      headerAlign: "center",
      align: "left",
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      renderCell: () => (
        <IconButton 
          size="small" 
          onClick={(e) => openMenu(e)}
          sx={{ color: "#A650F0" }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
    },
  ];

  const rows = Array.isArray(contracts) ? contracts.map((contract) => ({
    id: contract.id,
    cpf: contract.user_data.cpf,
    name: `${contract.user_data.user.first_name} ${contract.user_data.user.last_name}`,
    status: contract.status,
  })) : [];

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
        <Typography color="text.primary">Contratos</Typography>
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
          Contratos Cadastrados
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
            <strong>Contratos Cadastrados</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite gerenciar e visualizar todos os CONTRATOS cadastrados no sistema.
            Você pode visualizar informações sobre CPF, nome do contratante e status do contrato (ativo, pendente ou cancelado).
            Utilize o menu de ações para acessar funcionalidades específicas de cada contrato.
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
            Contratos Cadastrados
          </Typography>
          <IconButton 
            onClick={fetchContracts}
            sx={{ color: "white" }}
            title="Atualizar lista"
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
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
                  color: "white",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
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

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
        >
          <MenuItem onClick={closeMenu}>Fechar</MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default Contratos;
