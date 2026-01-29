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
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAllowedCities } from "../../hooks/useAllowedCities";
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
import type { AllowedCityPayload } from "../../core/http/services/allowedCitiesService";

type Mode = "create" | "edit";

const AllowedCities: React.FC = () => {
  const navigate = useNavigate();
  const {
    allowedCities,
    loading,
    pagination,
    createAllowedCity,
    updateAllowedCity,
    deleteAllowedCity,
    snackbar,
    closeSnackbar,
    fetchAllowedCities,
    fetchError,
  } = useAllowedCities();

  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AllowedCityPayload>({
    cidade: "",
    uf: "",
    active: true,
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cnpj: "",
    tenant_city_id: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllowedCities(page + 1, rowsPerPage, searchTerm.trim() || undefined);
  }, [fetchAllowedCities, page, rowsPerPage, searchTerm]);

  const handleOpen = (m: Mode, allowedCity?: typeof allowedCities[0]) => {
    setMode(m);
    if (m === "edit" && allowedCity) {
      setForm({
        cidade: allowedCity.cidade || "",
        uf: allowedCity.uf || "",
        active: allowedCity.active ?? true,
        rua: allowedCity.rua || "",
        numero: allowedCity.numero || "",
        complemento: allowedCity.complemento || "",
        bairro: allowedCity.bairro || "",
        cnpj: allowedCity.cnpj || "",
        tenant_city_id: allowedCity.tenant_city_id || "",
      });
      setEditingId(allowedCity.id);
    } else {
      setForm({
        cidade: "",
        uf: "",
        active: true,
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cnpj: "",
        tenant_city_id: "",
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({
      cidade: "",
      uf: "",
      active: true,
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cnpj: "",
      tenant_city_id: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.cidade.trim() || !form.uf.trim() || !form.rua.trim() || 
        !form.numero.trim() || !form.bairro.trim() || !form.cnpj.trim() || 
        !form.tenant_city_id.trim()) {
      return;
    }

    const payload: AllowedCityPayload = {
      cidade: form.cidade.trim(),
      uf: form.uf.trim().toUpperCase(),
      active: form.active,
      rua: form.rua.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim(),
      bairro: form.bairro.trim(),
      cnpj: form.cnpj.trim(),
      tenant_city_id: form.tenant_city_id.trim(),
    };

    if (mode === "create") {
      await createAllowedCity(payload);
    } else if (mode === "edit" && editingId) {
      await updateAllowedCity(editingId, payload);
    }

    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta Cidade Permitida?")) {
      setDeletingId(id);
      await deleteAllowedCity(id);
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
            title="Cidades Permitidas"
            subtitle="Gerencie as cidades permitidas no sistema de processos seletivos."
            description="Allowed Cities são entidades que representam cidades autorizadas a participar de processos seletivos específicos, permitindo controle granular sobre quais localidades podem acessar determinados recursos."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Cidades Permitidas" },
            ]}
          />

          {fetchError && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {fetchError}
            </Alert>
          )}

          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por cidade ou UF..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0);
                    }}
                    fullWidth
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    onClick={() =>
                      fetchAllowedCities(page + 1, rowsPerPage, searchTerm.trim() || undefined)
                    }
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(APP_ROUTES.TENANT_CITIES)}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Tenant Cities
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen("create")}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Adicionar
                  </Button>
                </Box>
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
                          <TableCell>Cidade / UF</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell sx={{ minWidth: 280 }}>Tenant City ID</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allowedCities.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color={designSystem.colors.text.disabled}>
                                {searchTerm
                                  ? "Nenhuma cidade permitida encontrada"
                                  : "Nenhuma cidade permitida cadastrada"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          allowedCities.map((allowedCity) => (
                            <TableRow
                              key={allowedCity.id}
                              {...tableRowHoverStyles}
                            >
                              <TableCell>
                                <Typography 
                                  sx={{ 
                                    fontSize: "0.75rem",
                                    fontFamily: "monospace",
                                    maxWidth: 150,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {allowedCity.id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontWeight={500}>
                                  {allowedCity.cidade || allowedCity.name || "N/A"} - {allowedCity.uf || ""}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {allowedCity.active ? (
                                  <Chip label="Ativa" color="success" size="small" />
                                ) : (
                                  <Chip label="Inativa" color="default" size="small" />
                                )}
                              </TableCell>
                              <TableCell sx={{ minWidth: 280 }}>
                                <Typography 
                                  sx={{ 
                                    fontSize: "0.75rem",
                                    fontFamily: "monospace",
                                    color: (theme) => allowedCity.tenant_city_id 
                                      ? (theme.palette.mode === "dark" ? designSystem.colors.text.secondaryDark : designSystem.colors.text.secondary)
                                      : (theme.palette.mode === "dark" ? designSystem.colors.text.disabledDark : designSystem.colors.text.disabled),
                                    maxWidth: 260,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {allowedCity.tenant_city_id ?? "Não vinculado"}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen("edit", allowedCity)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(allowedCity.id)}
                                  disabled={deletingId === allowedCity.id}
                                  color="error"
                                >
                                  {deletingId === allowedCity.id ? (
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
          {mode === "create" ? "Nova Cidade Permitida" : "Editar Cidade Permitida"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Cidade"
              fullWidth
              variant="outlined"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              placeholder="Ex: São Paulo"
              required
            />
            <TextField
              margin="dense"
              label="UF"
              fullWidth
              variant="outlined"
              value={form.uf}
              onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
              placeholder="SP"
              required
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              margin="dense"
              label="Rua"
              fullWidth
              variant="outlined"
              value={form.rua}
              onChange={(e) => setForm({ ...form, rua: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Número"
              fullWidth
              variant="outlined"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Complemento"
              fullWidth
              variant="outlined"
              value={form.complemento}
              onChange={(e) => setForm({ ...form, complemento: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Bairro"
              fullWidth
              variant="outlined"
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="CNPJ"
              fullWidth
              variant="outlined"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Tenant City ID"
              fullWidth
              variant="outlined"
              value={form.tenant_city_id}
              onChange={(e) => setForm({ ...form, tenant_city_id: e.target.value })}
              placeholder="UUID da Tenant City"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="text">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="outlined"
            disabled={
              !form.cidade.trim() || !form.uf.trim() || !form.rua.trim() || 
              !form.numero.trim() || !form.bairro.trim() || !form.cnpj.trim() || 
              !form.tenant_city_id.trim()
            }
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

export default AllowedCities;
