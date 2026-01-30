import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toolbar,
  Snackbar,
  Alert,
  Typography,
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
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTenantCities } from "../../hooks/useTenantCities";
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
import type { TenantCityPayload } from "../../core/http/services/tenantCitiesService";

type Mode = "create" | "edit";

const TenantCities: React.FC = () => {
  const {
    tenantCities,
    loading,
    pagination,
    createTenantCity,
    updateTenantCity,
    deleteTenantCity,
    snackbar,
    closeSnackbar,
    fetchTenantCities,
  } = useTenantCities();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TenantCityPayload>({
    name: "",
    domain: "",
    tag: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchTenantCities(page + 1, rowsPerPage, debouncedSearchTerm.trim() || undefined);
  }, [fetchTenantCities, page, rowsPerPage, debouncedSearchTerm]);

  const handleOpen = (m: Mode, tenantCity?: typeof tenantCities[0]) => {
    setMode(m);
    if (m === "edit" && tenantCity) {
      setForm({
        name: tenantCity.name ?? "",
        domain: tenantCity.domain ?? "",
        tag: tenantCity.tag ?? "",
      });
      setEditingId(tenantCity.id);
    } else {
      setForm({ name: "", domain: "", tag: "" });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ name: "", domain: "", tag: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const nameTrim = (form.name ?? "").trim();
    const domainTrim = (form.domain ?? "").trim();
    const tagTrim = (form.tag ?? "").trim();

    if (!nameTrim || !domainTrim || !tagTrim) return;

    const payload: TenantCityPayload = {
      name: nameTrim,
      domain: domainTrim,
      tag: tagTrim,
    };

    if (mode === "create") {
      await createTenantCity(payload);
    } else if (mode === "edit" && editingId) {
      await updateTenantCity(editingId, payload);
    }

    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta Cidade Sede?")) {
      setDeletingId(id);
      await deleteTenantCity(id);
      setDeletingId(null);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
            title="Cidades Sedes"
            subtitle="Gerencie as cidades sedes do sistema."
            description="Cidades Sedes são domínios que representam diferentes organizações ou cidades no sistema. Cada usuário deve estar associado a uma cidade sede."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Cidades Sedes" },
            ]}
          />

          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ flex: 1, maxWidth: 400 }}
                >
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por domínio..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0);
                    }}
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Box>
                <div>
                  <IconButton
                    onClick={() =>
                      fetchTenantCities(page + 1, rowsPerPage, searchTerm.trim() || undefined)
                    }
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    style={{ marginLeft: "10px" }}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen("create")}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Nova Cidade Sede
                  </Button>
                </div>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead {...tableHeadStyles}>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Nome</TableCell>
                          <TableCell>Domínio</TableCell>
                          <TableCell>Tag</TableCell>
                          <TableCell>Criado em</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tenantCities.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography color={designSystem.colors.text.disabled}>
                                {searchTerm
                                  ? "Nenhuma Cidade Sede encontrada"
                                  : "Nenhuma Cidade Sede cadastrada"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          tenantCities.map((tenantCity) => (
                            <TableRow
                              key={tenantCity.id}
                              {...tableRowHoverStyles}
                            >
                              <TableCell>{tenantCity.id}</TableCell>
                              <TableCell>
                                <Typography fontWeight={500}>
                                  {tenantCity.name ?? "—"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography>
                                  {tenantCity.domain ?? "Sem domínio"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography>
                                  {tenantCity.tag ?? "—"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {new Date(tenantCity.createdAt).toLocaleDateString("pt-BR")}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen("edit", tenantCity)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(tenantCity.id)}
                                  disabled={deletingId === tenantCity.id}
                                  color="error"
                                >
                                  {deletingId === tenantCity.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={pagination.totalItems}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={tablePaginationStyles}
                    labelRowsPerPage="Linhas por página"
                    labelDisplayedRows={({ from, to, count }) => 
                      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                    }
                  />
                </>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Dialog de Criar/Editar */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === "create" ? "Nova Cidade Sede" : "Editar Cidade Sede"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            variant="outlined"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Cidade Exemplo"
            required
          />
          <TextField
            margin="dense"
            label="Domínio"
            fullWidth
            variant="outlined"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            placeholder="Ex: exemplo.com.br"
            required
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            margin="dense"
            label="Tag"
            fullWidth
            variant="outlined"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            placeholder="Ex: cidade-exemplo"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="text">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="outlined"
            disabled={!form.name?.trim() || !form.domain?.trim() || !form.tag?.trim()}
          >
            {mode === "create" ? "Criar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default TenantCities;
