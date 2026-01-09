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
  Chip,
  Fade,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { useContracts } from "../../hooks/useContracts";
import { getTableConfig } from "../../util/constants";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  iconButtonStyles,
  progressStyles,
} from "../../styles/designSystem";

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
          sx={{
            color: designSystem.colors.text.disabled,
            padding: "4px",
            "&:hover": {
              backgroundColor: designSystem.colors.primary.lighter,
              color: designSystem.colors.primary.main,
            },
          }}
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

  const rows = contracts.map((contract) => ({
    id: contract.id,
    cpf: contract.user_data.cpf,
    name: `${contract.user_data.user.first_name} ${contract.user_data.user.last_name}`,
    status: contract.status,
  }));

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
            description="Esta página permite gerenciar e visualizar todos os CONTRATOS cadastrados no sistema. Você pode visualizar informações sobre CPF, nome do contratante e status do contrato (ativo, pendente ou cancelado). Utilize o menu de ações para acessar funcionalidades específicas de cada contrato."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Contratos" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  p: 3,
                  backgroundColor: designSystem.colors.background.primary,
                  borderBottom: `1px solid ${designSystem.colors.border.main}`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: designSystem.colors.text.primary,
                    fontSize: "1.1rem",
                  }}
                >
                  Contratos Cadastrados
                </Typography>
                <IconButton onClick={fetchContracts} {...iconButtonStyles}>
                  <RefreshIcon />
                </IconButton>
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
                      border: "none",
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: designSystem.colors.background.secondary,
                        color: designSystem.colors.text.secondary,
                        borderBottom: `2px solid ${designSystem.colors.border.main}`,
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        },
                      },
                      "& .even": {
                        backgroundColor: designSystem.colors.background.primary,
                      },
                      "& .odd": {
                        backgroundColor: designSystem.colors.background.secondary,
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: `${designSystem.colors.primary.lightest} !important`,
                        cursor: "pointer",
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${designSystem.colors.border.main}`,
                        color: designSystem.colors.text.secondary,
                        fontSize: "0.875rem",
                      },
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: `1px solid ${designSystem.colors.border.main}`,
                        backgroundColor: designSystem.colors.background.secondary,
                      },
                    }}
                  />
                </Box>
              )}

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 2,
                      boxShadow: designSystem.shadows.medium,
                    },
                  },
                }}
              >
                <MenuItem onClick={closeMenu}>Fechar</MenuItem>
              </Menu>
            </Paper>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default Contratos;
