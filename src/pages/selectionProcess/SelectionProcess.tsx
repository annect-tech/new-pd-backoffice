import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Fade,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  DialogContentText,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";

import PageHeader from "../../components/ui/page/PageHeader";
import { APP_ROUTES } from "../../util/constants";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  progressStyles,
} from "../../styles/designSystem";
import { selectionProcessService, type SelectionProcess } from "../../core/http/services/selectionProcessService";
import { tenantCitiesService, type TenantCity } from "../../core/http/services/tenantCitiesService";

const GestaoProcessosSeletivos: React.FC = () => {
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [tenantCities, setTenantCities] = useState<TenantCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", tenant_city_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const [processToActivate, setProcessToActivate] = useState<SelectionProcess | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [procRes, cityRes] = await Promise.all([
        selectionProcessService.findAll(),
        tenantCitiesService.list()
      ]);

      if (procRes?.data) setProcesses(procRes.data.data || []);
      if (cityRes?.data) {
        const filteredCities = cityRes.data.data.filter((city: TenantCity) => city.name);
        setTenantCities(filteredCities || []);
      }
    } catch (err) {
      showSnackbar("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCityInfo = (cityId: string) => {
    return tenantCities.find((c) => c.id === cityId);
  };

  const isProcessActive = (processId: string, cityId: string) => {
    const city = getCityInfo(cityId);
    return city?.activeProcessId === processId;
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    );
  }, [processes, searchTerm]);

  const handleOpenModal = (process?: SelectionProcess) => {
    if (process) {
      setEditingId(process.id);
      setFormData({ name: process.name, tenant_city_id: process.tenant_city_id });
    } else {
      setEditingId(null);
      setFormData({ name: "", tenant_city_id: "" });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.tenant_city_id) {
      showSnackbar("Preencha todos os campos", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await selectionProcessService.update(editingId, formData);
        showSnackbar(res.message || "Processo atualizado com sucesso", "success");
      } else {
        const res = await selectionProcessService.create(formData);
        showSnackbar(res.message || "Processo criado com sucesso", "success");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showSnackbar(err.message || "Erro ao salvar processo", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConfirmActivate = (process: SelectionProcess) => {
    setProcessToActivate(process);
    setConfirmActivateOpen(true);
  };

  const handleConfirmActivation = async () => {
    if (!processToActivate) return;
    
    setSubmitting(true);
    try {
      const res = await selectionProcessService.activate(processToActivate.id);
      showSnackbar(res.message || "Processo ativado com sucesso!", "success");
      setConfirmActivateOpen(false);
      fetchData();
    } catch (err: any) {
      showSnackbar(err.message || "Erro ao ativar processo", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, margin: "0 auto" }}>
        <PageHeader
          title="Processos Seletivos"
          subtitle="Configuração e Gestão de Editais"
          description="Gerencie os processos seletivos. O ícone verde indica o processo ativo atual de cada cidade."
          breadcrumbs={[
            { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
            { label: "Processos Seletivos" },
          ]}
        />

        <Fade in timeout={600}>
          <Paper {...paperStyles}>
            <Toolbar {...toolbarStyles}>
              <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
                <SearchIcon sx={{ mr: 1, color: "text.disabled" }} />
                <TextField
                  placeholder="Buscar processo..."
                  variant="standard"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  {...textFieldStyles}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton {...iconButtonStyles} onClick={fetchData}>
                  <RefreshIcon />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal()}
                  sx={{
                    backgroundColor: designSystem.colors.primary.main,
                    "&:hover": { backgroundColor: designSystem.colors.primary.darker },
                  }}
                >
                  Novo Processo
                </Button>
              </Box>
            </Toolbar>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell {...tableHeadStyles}>Nome do Processo</TableCell>
                    <TableCell {...tableHeadStyles}>Cidade Sede</TableCell>
                    <TableCell {...tableHeadStyles} align="center">Ativo</TableCell>
                    <TableCell {...tableHeadStyles} align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        <CircularProgress {...progressStyles} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcesses.map((p) => {
                      const active = isProcessActive(p.id, p.tenant_city_id);
                      return (
                        <TableRow key={p.id} {...tableRowHoverStyles}>
                          <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                          <TableCell>{getCityInfo(p.tenant_city_id)?.name || "N/A"}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={active ? "Este processo já está ativo" : "Clique para ativar este processo"}>
                              <span>
                                <IconButton 
                                  onClick={() => handleOpenConfirmActivate(p)}
                                  sx={{ 
                                    color: active ? designSystem.colors.success?.main || "green" : "text.disabled" 
                                  }}
                                >
                                  {active ? <CheckCircleIcon /> : <UncheckedIcon />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="primary" onClick={() => handleOpenModal(p)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
      </Box>

      <Dialog open={modalOpen} onClose={() => !submitting && setModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Editar Processo" : "Novo Processo Seletivo"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              label="Nome do Processo"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel id="select-city-label">Cidade Sede</InputLabel>
              <Select
                labelId="select-city-label"
                label="Cidade Sede"
                value={formData.tenant_city_id}
                onChange={(e) => setFormData({ ...formData, tenant_city_id: e.target.value })}
              >
                {tenantCities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={submitting}>
            {editingId ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmActivateOpen} onClose={() => !submitting && setConfirmActivateOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: designSystem.colors.primary.main }}>
          Confirmar Ativação
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você está prestes a definir <strong>{processToActivate?.name}</strong> como o processo seletivo ativo para <strong> {processToActivate ? getCityInfo(processToActivate.tenant_city_id)?.name : ""}</strong>
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação desativará automaticamente qualquer outro processo que esteja ativo para esta cidade no momento.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmActivateOpen(false)} disabled={submitting}>
            Voltar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleConfirmActivation}
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            Confirmar e Ativar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GestaoProcessosSeletivos;