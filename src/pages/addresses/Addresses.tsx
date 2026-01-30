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
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAddresses } from "../../hooks/useAddresses";
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
import type { AddressPayload } from "../../core/http/services/addressesService";
import { useAppSelector } from "../../core/store/hooks";

type Mode = "create" | "edit";

const Addresses: React.FC = () => {
  const {
    addresses,
    loading,
    pagination,
    createAddress,
    updateAddress,
    deleteAddress,
    snackbar,
    closeSnackbar,
    fetchAddresses,
  } = useAddresses();
  
  const user = useAppSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddressPayload>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil",
    latitude: undefined,
    longitude: undefined,
    reference: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    fetchAddresses(page + 1, rowsPerPage, searchTerm.trim() || undefined);
  }, [fetchAddresses, page, rowsPerPage, searchTerm]);

  const handleOpen = (m: Mode, address?: typeof addresses[0]) => {
    try {
      setMode(m);
      if (m === "edit" && address) {
        // Converter dados do formato da API (pode vir em português ou inglês)
        const street = (address as any).logradouro || address.street || "";
        const number = (address as any).numero || address.number || "";
        const complement = (address as any).complemento || address.complement || "";
        const neighborhood = (address as any).bairro || address.neighborhood || "";
        const city = (address as any).cidade || address.city || "";
        const state = (address as any).uf || address.state || "";
        
        setForm({
          cep: address.cep ?? "",
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          country: address.country ?? "Brasil",
          latitude: address.latitude ?? undefined,
          longitude: address.longitude ?? undefined,
          reference: address.reference ?? "",
        });
        setEditingId(address.id ?? null);
      } else {
        setForm({
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          country: "Brasil",
          latitude: undefined,
          longitude: undefined,
          reference: "",
        });
        setEditingId(null);
      }
      setOpen(true);
    } catch (error) {
      console.error("Erro ao abrir modal de edição:", error);
      // Log do erro para debug
    }
  };

  const handleClose = () => {
    if (submitting) return; // Prevenir fechamento durante submissão
    setOpen(false);
    setForm({
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      latitude: undefined,
      longitude: undefined,
      reference: "",
    });
    setEditingId(null);
    setSubmitting(false);
    setLoadingCep(false);
  };

  const handleSubmit = async () => {
    if (!form.cep.trim() || !form.street.trim() || !form.number.trim() || 
        !form.neighborhood.trim() || !form.city.trim() || !form.state.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      // Remove formatação do CEP (remove hífen)
      const cleanCep = form.cep.replace(/\D/g, "");
      
      // Converte para o formato esperado pela API (português)
      const apiPayload: any = {
        cep: cleanCep,
        logradouro: form.street.trim(),
        numero: form.number.trim(),
        bairro: form.neighborhood.trim(),
        cidade: form.city.trim(),
        uf: form.state.trim().toUpperCase(),
        ...(form.complement?.trim() && { complemento: form.complement.trim() }),
      };

      // Adiciona user_id apenas na criação (obrigatório pela API)
      if (mode === "create") {
        if (!user?.id) {
          throw new Error("Usuário não identificado. Faça login novamente.");
        }
        apiPayload.user_id = user.id;
        await createAddress(apiPayload);
      } else if (mode === "edit" && editingId) {
        // Para edição, não precisa de user_id
        await updateAddress(editingId, apiPayload);
      }

      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este endereço?")) {
      setDeletingId(id);
      await deleteAddress(id);
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

  const formatCEP = (value: string) => {
    if (!value) return "";
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const fetchCepData = async (cep: string) => {
    // Remove formatação do CEP
    const cleanCep = cep.replace(/\D/g, "");
    
    // Verifica se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        // CEP não encontrado - não faz nada, mantém os campos como estão
        return;
      }

      // Preenche os campos com os dados do ViaCEP
      // Preserva número, complemento e referência que o usuário já digitou
      setForm((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        // Mantém número, complemento e referência
        number: prev.number,
        complement: prev.complement,
        reference: prev.reference,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    setForm({ ...form, cep: formatted });
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
            title="Endereços"
            subtitle="Gerencie os endereços do sistema."
            description="Endereços representam localizações físicas no sistema, incluindo informações sobre cidades, estados, CEPs e detalhes de logradouros. São utilizados para cadastro de endereços de alunos, localização de escolas e locais de prova."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Endereços" },
            ]}
          />

          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por rua, cidade, bairro ou CEP..."
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
                      fetchAddresses(page + 1, rowsPerPage, searchTerm.trim() || undefined)
                    }
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
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
                          <TableCell>CEP</TableCell>
                          <TableCell>Logradouro</TableCell>
                          <TableCell>Número</TableCell>
                          <TableCell>Bairro</TableCell>
                          <TableCell>Cidade</TableCell>
                          <TableCell>UF</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {addresses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                              <Typography color={designSystem.colors.text.disabled}>
                                {searchTerm
                                  ? "Nenhum endereço encontrado"
                                  : "Nenhum endereço cadastrado"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          addresses.map((address) => (
                            <TableRow
                              key={address.id}
                              {...tableRowHoverStyles}
                            >
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem" }}>
                                  {address.id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
                                  {address.cep}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                                  {address.street}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem" }}>
                                  {address.number}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem" }}>
                                  {address.neighborhood}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem" }}>
                                  {address.city}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.875rem" }}>
                                  {address.state}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={address.is_deleted ? "Deletado" : "Ativo"}
                                  color={address.is_deleted ? "default" : "success"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen("edit", address)}
                                  sx={{ mr: 1 }}
                                  disabled={address.is_deleted}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(address.id)}
                                  disabled={deletingId === address.id || address.is_deleted}
                                  color="error"
                                >
                                  {deletingId === address.id ? (
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
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={submitting}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          color: designSystem.colors.text.primary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2
        }}>
          {mode === "create" ? "Novo Endereço" : "Editar Endereço"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={submitting}
            sx={{
              color: designSystem.colors.text.disabled,
              "&:hover": {
                backgroundColor: designSystem.colors.primary.lightest,
                color: designSystem.colors.primary.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(12, 1fr)' },
              gap: 2 
            }}
          >
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <TextField
                fullWidth
                label="CEP"
                value={form.cep || ""}
                onChange={(e) => handleCepChange(e.target.value)}
                onBlur={(e) => {
                  const cleanCep = e.target.value.replace(/\D/g, "");
                  if (cleanCep.length === 8 && !loadingCep) {
                    fetchCepData(cleanCep);
                  }
                }}
                placeholder="12345-678"
                required
                inputProps={{ maxLength: 9 }}
                InputProps={{
                  endAdornment: loadingCep ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
                helperText={loadingCep ? "Buscando endereço..." : "Digite o CEP e clique fora para buscar automaticamente"}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 8' } }}>
              <TextField
                fullWidth
                label="Logradouro/Rua"
                value={form.street || ""}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="Ex: Avenida Paulista"
                required
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <TextField
                fullWidth
                label="Número"
                value={form.number || ""}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder="Ex: 1578"
                required
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 8' } }}>
              <TextField
                fullWidth
                label="Complemento"
                value={form.complement || ""}
                onChange={(e) => setForm({ ...form, complement: e.target.value })}
                placeholder="Ex: Andar 5, Sala 10 (opcional)"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                label="Bairro"
                value={form.neighborhood || ""}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="Ex: Bela Vista"
                required
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <TextField
                fullWidth
                label="Cidade"
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: São Paulo"
                required
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 2' } }}>
              <TextField
                fullWidth
                label="UF"
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: (e.target.value || "").toUpperCase() })}
                placeholder="SP"
                required
                inputProps={{ maxLength: 2 }}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                label="País"
                value={form.country || "Brasil"}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Brasil"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                label="Ponto de Referência"
                value={form.reference || ""}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="Ex: Próximo ao metrô (opcional)"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={form.latitude ?? ""}
                onChange={(e) => setForm({ ...form, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Ex: -23.561414 (opcional)"
                inputProps={{ step: "0.000001" }}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={form.longitude ?? ""}
                onChange={(e) => setForm({ ...form, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Ex: -46.655881 (opcional)"
                inputProps={{ step: "0.000001" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="text"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              submitting ||
              !form.cep.trim() || 
              !form.street.trim() || 
              !form.number.trim() || 
              !form.neighborhood.trim() || 
              !form.city.trim() || 
              !form.state.trim()
            }
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              bgcolor: designSystem.colors.primary.main,
              "&:hover": {
                bgcolor: designSystem.colors.primary.darker,
              },
            }}
          >
            {submitting 
              ? (mode === "create" ? "Criando..." : "Salvando...") 
              : (mode === "create" ? "Criar" : "Salvar")
            }
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

export default Addresses;
