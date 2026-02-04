import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
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
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
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

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await selectionProcessService.findAll();

      if (response && response.data) {
        setProcesses(response.data.data || []);
      }
      
    } catch (err) {
      showSnackbar("Erro ao carregar processos seletivos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (!processes || !processes.length) return;

    const getCities = async () => {
      const allCities = await tenantCitiesService.list();
      
      if (allCities && allCities.data) {
        setTenantCities(allCities.data.data || []);
      }
    }

    getCities();
  }, [processes])

  // useEffect(() => {
  //   if (!tenantCities || !tenantCities.length) return;



  // }, [tenantCities])

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
      fetchProcesses();
    } catch (err: any) {
      showSnackbar(err.message || "Erro ao salvar processo", "error");
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
          description="Gerencie os processos seletivos do sistema. Clique em um processo para editar seus detalhes ou utilize o botão 'Novo Processo' para cadastrar um novo edital e associá-lo a uma cidade sede."
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
                <IconButton {...iconButtonStyles} onClick={fetchProcesses}>
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
                    <TableCell {...tableHeadStyles}>ID</TableCell>
                    <TableCell {...tableHeadStyles}>Nome do Processo</TableCell>
                    <TableCell {...tableHeadStyles}>ID Cidade Sede (Tenant)</TableCell>
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
                  ) : filteredProcesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">Nenhum processo seletivo encontrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcesses.map((p) => (
                      <TableRow 
                        key={p.id} 
                        {...tableRowHoverStyles}
                        onClick={() => handleOpenModal(p)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {p.id.split("-")[0]}...
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                        <TableCell>{p.tenant_city_id}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
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
              placeholder="Ex: Vestibular 2024.2"
            />
            <TextField
              label="ID da Cidade Sede (Tenant)"
              fullWidth
              value={formData.tenant_city_id}
              onChange={(e) => setFormData({ ...formData, tenant_city_id: e.target.value })}
              placeholder="UUID da cidade"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {editingId ? "Salvar Alterações" : "Criar Processo"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestaoProcessosSeletivos;