import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Place as PlaceIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  EventNote as EventNoteIcon,
} from "@mui/icons-material";
import { useExamSchedule } from "../../hooks/useExamSchedule";
import { useAllowedCities } from "../../hooks/useAllowedCities";
import { useAuthContext } from "../../app/providers/AuthProvider";
import { examsScheduledService } from "../../core/http/services/examsScheduledService";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  primaryButtonStyles,
  progressStyles,
} from "../../styles/designSystem";
import type { ExamLocal, ExamDate, ExamHour, ScheduleGridResponse } from "../../interfaces/examScheduleTypes";

const GerenciamentoProvas: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Verifica se o usuário é admin
  const isAdmin = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return false;
    const adminRoles = ['ADMIN', 'ADMIN_MASTER'];
    return user.roles.some(role => adminRoles.includes(role.toUpperCase()));
  }, [user?.roles]);

  const {
    locals,
    dates,
    hours,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    showSnackbar,
    fetchLocals,
    fetchDates,
    fetchHours,
    createLocal,
    updateLocal,
    deleteLocal,
    addHourToDate,
    updateDate,
    deleteDate,
    updateHour,
    deleteHour,
  } = useExamSchedule();

  const { allowedCities, fetchAllowedCities } = useAllowedCities();

  // Estado para local selecionado
  const [selectedLocal, setSelectedLocal] = useState<ExamLocal | null>(null);
  const [selectedDate, setSelectedDate] = useState<ExamDate | null>(null);

  // Estado para grade de alunos
  const [scheduleGrid, setScheduleGrid] = useState<ScheduleGridResponse | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);

  // Estados dos modais
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [hourModalOpen, setHourModalOpen] = useState(false);
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Estados de edição
  const [editingLocal, setEditingLocal] = useState<ExamLocal | null>(null);
  const [editingDate, setEditingDate] = useState<ExamDate | null>(null);
  const [editingHour, setEditingHour] = useState<ExamHour | null>(null);

  // Estados de formulário
  const [localForm, setLocalForm] = useState({ name: "", full_address: "", allowed_city_id: "" });
  const [dateForm, setDateForm] = useState({ date: "" });
  const [hourForm, setHourForm] = useState({ hour: "" });

  // Estado para deletar
  const [deleteTarget, setDeleteTarget] = useState<{ type: "local" | "date" | "hour"; id: string; name: string } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    fetchLocals();
    fetchAllowedCities(1, 100); // Carrega até 100 cidades para o dropdown
  }, [fetchLocals, fetchAllowedCities]);

  // Carregar datas quando selecionar local
  useEffect(() => {
    if (selectedLocal) {
      fetchDates(selectedLocal.id);
    }
  }, [selectedLocal, fetchDates]);

  // Carregar horários quando selecionar data
  useEffect(() => {
    if (selectedDate) {
      fetchHours(selectedDate.id);
    }
  }, [selectedDate, fetchHours]);

  // Carregar grade de alunos
  const loadScheduleGrid = useCallback(async (localId: string, dateId: string) => {
    setLoadingGrid(true);
    try {
      const response = await examsScheduledService.getScheduleGrid(localId, dateId);
      if (response.status >= 200 && response.status < 300 && response.data) {
        setScheduleGrid(response.data);
        setGridModalOpen(true);
      } else {
        showSnackbar("Erro ao carregar grade de alunos", "error");
      }
    } catch {
      showSnackbar("Erro ao carregar grade de alunos", "error");
    } finally {
      setLoadingGrid(false);
    }
  }, [showSnackbar]);

  // ============== HANDLERS DE LOCAL ==============

  const handleOpenLocalModal = (local?: ExamLocal) => {
    if (local) {
      setEditingLocal(local);
      setLocalForm({
        name: local.name,
        full_address: local.full_address,
        allowed_city_id: String(local.allowed_city_id || ""),
      });
    } else {
      setEditingLocal(null);
      setLocalForm({ name: "", full_address: "", allowed_city_id: "" });
    }
    setLocalModalOpen(true);
  };

  const handleSaveLocal = async () => {
    if (!localForm.name || !localForm.full_address || !localForm.allowed_city_id) {
      showSnackbar("Preencha todos os campos", "error");
      return;
    }

    if (editingLocal) {
      const success = await updateLocal(editingLocal.id, {
        name: localForm.name,
        full_address: localForm.full_address,
        allowed_city_id: Number(localForm.allowed_city_id),
      });
      if (success) setLocalModalOpen(false);
    } else {
      const result = await createLocal(
        localForm.name,
        localForm.full_address,
        Number(localForm.allowed_city_id)
      );
      if (result) setLocalModalOpen(false);
    }
  };

  // ============== HANDLERS DE DATA ==============

  const handleOpenDateModal = (date?: ExamDate) => {
    if (date) {
      setEditingDate(date);
      setDateForm({ date: date.date });
    } else {
      setEditingDate(null);
      setDateForm({ date: "" });
    }
    setDateModalOpen(true);
  };

  const handleSaveDate = async () => {
    if (!dateForm.date) {
      showSnackbar("Informe a data", "error");
      return;
    }

    if (editingDate) {
      const success = await updateDate(editingDate.id, dateForm.date);
      if (success) {
        setDateModalOpen(false);
        if (selectedLocal) fetchDates(selectedLocal.id);
      }
    }
  };

  // ============== HANDLERS DE HORÁRIO ==============

  const handleOpenHourModal = (hour?: ExamHour) => {
    if (hour) {
      setEditingHour(hour);
      setHourForm({ hour: hour.hour });
    } else {
      setEditingHour(null);
      setHourForm({ hour: "" });
    }
    setHourModalOpen(true);
  };

  const handleSaveHour = async () => {
    if (!hourForm.hour) {
      showSnackbar("Informe o horário", "error");
      return;
    }

    if (editingHour) {
      const success = await updateHour(editingHour.id, hourForm.hour);
      if (success) {
        setHourModalOpen(false);
        if (selectedDate) fetchHours(selectedDate.id);
      }
    } else if (selectedDate) {
      const result = await addHourToDate(Number(selectedDate.id), hourForm.hour);
      if (result) {
        setHourModalOpen(false);
        fetchHours(selectedDate.id);
      }
    }
  };

  // ============== HANDLERS DE DELETE ==============

  const handleOpenDeleteModal = (type: "local" | "date" | "hour", id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    let success = false;
    switch (deleteTarget.type) {
      case "local":
        success = await deleteLocal(deleteTarget.id);
        if (success) {
          setSelectedLocal(null);
          setSelectedDate(null);
        }
        break;
      case "date":
        success = await deleteDate(deleteTarget.id);
        if (success && selectedLocal) {
          fetchDates(selectedLocal.id);
          setSelectedDate(null);
        }
        break;
      case "hour":
        success = await deleteHour(deleteTarget.id);
        if (success && selectedDate) {
          fetchHours(selectedDate.id);
        }
        break;
    }

    if (success) {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  // ============== RENDER ==============

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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <PageHeader
              title="Gerenciamento de Provas"
              subtitle="Visualize e gerencie os locais, datas e horários cadastrados para as provas do processo seletivo."
              breadcrumbs={[
                { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
                { label: "Gerenciamento de Provas" },
              ]}
              showInfoCard={false}
            />
            <Button
              variant="contained"
              startIcon={<EventNoteIcon />}
              onClick={() => navigate(APP_ROUTES.EXAM_SCHEDULE)}
              sx={{
                ...primaryButtonStyles.sx,
                textTransform: "none",
                whiteSpace: "nowrap",
                mt: 1,
              }}
            >
              Criar Agendamento
            </Button>
          </Box>

          {loading && !locals.length ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress {...progressStyles} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Coluna de Locais */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  {...paperStyles}
                  sx={{
                    ...paperStyles.sx,
                    p: 0,
                    height: "fit-content",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PlaceIcon sx={{ color: designSystem.colors.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Locais de Prova
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Atualizar">
                        <IconButton size="small" onClick={() => fetchLocals()}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenLocalModal()}
                          sx={{ ...primaryButtonStyles.sx, textTransform: "none" }}
                        >
                          Novo
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    {locals.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Nenhum local cadastrado
                        </Typography>
                      </Box>
                    ) : (
                      locals.map((local) => (
                        <Box
                          key={local.id}
                          onClick={() => {
                            setSelectedLocal(local);
                            setSelectedDate(null);
                          }}
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            borderBottom: (theme) => `1px solid ${
                              theme.palette.mode === "dark"
                                ? designSystem.colors.border.mainDark
                                : designSystem.colors.border.main
                            }`,
                            backgroundColor: selectedLocal?.id === local.id
                              ? designSystem.colors.primary.lightest
                              : "transparent",
                            "&:hover": {
                              backgroundColor: designSystem.colors.primary.lightest,
                              "& .local-name": {
                                color: designSystem.colors.primary.main,
                              },
                              "& .local-address": {
                                color: designSystem.colors.primary.dark,
                              },
                              "& .local-icons .MuiIconButton-root:not(:last-child)": {
                                color: designSystem.colors.primary.main,
                              },
                            },
                            transition: `all ${designSystem.transitions.fast}`,
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                className="local-name"
                                sx={{
                                  fontWeight: 600,
                                  color: selectedLocal?.id === local.id
                                    ? designSystem.colors.primary.main
                                    : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                {local.name}
                              </Typography>
                              <Typography
                                className="local-address"
                                variant="caption"
                                sx={{
                                  color: (theme) => theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
                                  display: "block",
                                  mt: 0.5,
                                  transition: "color 0.2s ease",
                                }}
                              >
                                {local.full_address}
                              </Typography>
                            </Box>
                            {isAdmin && (
                            <Box className="local-icons" sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenLocalModal(local);
                                }}
                                sx={{
                                  color: selectedLocal?.id === local.id
                                    ? designSystem.colors.primary.main
                                    : "inherit",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteModal("local", local.id, local.name);
                                }}
                                sx={{ color: designSystem.colors.error.main }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            )}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Coluna de Datas */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  {...paperStyles}
                  sx={{
                    ...paperStyles.sx,
                    p: 0,
                    height: "fit-content",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon sx={{ color: designSystem.colors.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Datas
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    {!selectedLocal ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Selecione um local para ver as datas
                        </Typography>
                      </Box>
                    ) : dates.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Nenhuma data cadastrada
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Use o Agendamento de Provas para criar datas
                        </Typography>
                      </Box>
                    ) : (
                      dates.map((date) => (
                        <Box
                          key={date.id}
                          onClick={() => setSelectedDate(date)}
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            borderBottom: (theme) => `1px solid ${
                              theme.palette.mode === "dark"
                                ? designSystem.colors.border.mainDark
                                : designSystem.colors.border.main
                            }`,
                            backgroundColor: selectedDate?.id === date.id
                              ? designSystem.colors.primary.lightest
                              : "transparent",
                            "&:hover": {
                              backgroundColor: designSystem.colors.primary.lightest,
                              "& .date-text": {
                                color: designSystem.colors.primary.main,
                              },
                              "& .date-icons .MuiIconButton-root:not(:last-child)": {
                                color: designSystem.colors.primary.main,
                              },
                            },
                            transition: `all ${designSystem.transitions.fast}`,
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography
                              className="date-text"
                              sx={{
                                fontWeight: 600,
                                color: selectedDate?.id === date.id
                                  ? designSystem.colors.primary.main
                                  : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                transition: "color 0.2s ease",
                              }}
                            >
                              {date.date}
                            </Typography>
                            <Box className="date-icons" sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="Ver alunos agendados">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedLocal) {
                                      loadScheduleGrid(selectedLocal.id, date.id);
                                    }
                                  }}
                                  disabled={loadingGrid}
                                  sx={{
                                    color: selectedDate?.id === date.id
                                      ? designSystem.colors.primary.main
                                      : "inherit",
                                    transition: "color 0.2s ease",
                                  }}
                                >
                                  <PeopleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {isAdmin && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDateModal(date);
                                    }}
                                    sx={{
                                      color: selectedDate?.id === date.id
                                        ? designSystem.colors.primary.main
                                        : "inherit",
                                      transition: "color 0.2s ease",
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDeleteModal("date", date.id, date.date);
                                    }}
                                    sx={{ color: designSystem.colors.error.main }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Coluna de Horários */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  {...paperStyles}
                  sx={{
                    ...paperStyles.sx,
                    p: 0,
                    height: "fit-content",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimeIcon sx={{ color: designSystem.colors.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Horários
                      </Typography>
                    </Box>
                    {selectedDate && isAdmin && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenHourModal()}
                        sx={{ ...primaryButtonStyles.sx, textTransform: "none" }}
                      >
                        Novo
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    {!selectedDate ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Selecione uma data para ver os horários
                        </Typography>
                      </Box>
                    ) : hours.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Nenhum horário cadastrado
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2 }}>
                        <Grid container spacing={1}>
                          {hours.map((hour) => (
                            <Grid key={hour.id} size={6}>
                              <Chip
                                label={hour.hour}
                                onDelete={isAdmin ? () => handleOpenDeleteModal("hour", hour.id, hour.hour) : undefined}
                                onClick={isAdmin ? () => handleOpenHourModal(hour) : undefined}
                                sx={{
                                  width: "100%",
                                  justifyContent: "space-between",
                                  backgroundColor: designSystem.colors.primary.lighter,
                                  color: designSystem.colors.primary.dark,
                                  fontWeight: 600,
                                  cursor: isAdmin ? "pointer" : "default",
                                  transition: "all 0.2s ease",
                                  "& .MuiChip-deleteIcon": {
                                    color: designSystem.colors.error.main,
                                  },
                                  "&:hover": {
                                    backgroundColor: "#FFFFFF",
                                    color: designSystem.colors.primary.main,
                                  },
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {/* Modal de Local */}
      <Dialog open={localModalOpen} onClose={() => setLocalModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocal ? "Editar Local de Prova" : "Novo Local de Prova"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Local"
              value={localForm.name}
              onChange={(e) => setLocalForm({ ...localForm, name: e.target.value })}
              fullWidth
              placeholder="Ex: Escola Municipal João Paulo II"
            />
            <TextField
              label="Endereço Completo"
              value={localForm.full_address}
              onChange={(e) => setLocalForm({ ...localForm, full_address: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Rua das Flores, 123 - Centro - Cidade/UF"
            />
            <FormControl fullWidth>
              <InputLabel>Cidade Permitida</InputLabel>
              <Select
                value={localForm.allowed_city_id}
                label="Cidade Permitida"
                onChange={(e) => setLocalForm({ ...localForm, allowed_city_id: e.target.value as string })}
                displayEmpty
              >
                {!allowedCities || allowedCities.length === 0 ? (
                  <MenuItem value="" disabled>
                    Carregando cidades...
                  </MenuItem>
                ) : (
                  allowedCities.map((city: any) => (
                    <MenuItem key={city.id} value={String(city.id)}>
                      {city.cidade ? `${city.cidade} - ${city.uf}` : city.name || city.city_name || "Cidade sem nome"}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocalModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveLocal}
            disabled={saving}
            sx={primaryButtonStyles.sx}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Data */}
      <Dialog open={dateModalOpen} onClose={() => setDateModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Data"
              value={dateForm.date}
              onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
              fullWidth
              placeholder="DD/MM/YYYY"
              helperText="Formato: DD/MM/YYYY"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveDate}
            disabled={saving}
            sx={primaryButtonStyles.sx}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Horário */}
      <Dialog open={hourModalOpen} onClose={() => setHourModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingHour ? "Editar Horário" : "Novo Horário"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Horário"
              value={hourForm.hour}
              onChange={(e) => setHourForm({ ...hourForm, hour: e.target.value })}
              fullWidth
              placeholder="HH:mm"
              helperText="Formato: HH:mm (ex: 08:00, 14:30)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHourModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveHour}
            disabled={saving}
            sx={primaryButtonStyles.sx}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Delete */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir{" "}
            <strong>
              {deleteTarget?.type === "local" && "o local "}
              {deleteTarget?.type === "date" && "a data "}
              {deleteTarget?.type === "hour" && "o horário "}
              "{deleteTarget?.name}"
            </strong>
            ?
          </Typography>
          {deleteTarget?.type === "local" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Atenção: Isso também excluirá todas as datas e horários associados.
            </Alert>
          )}
          {deleteTarget?.type === "date" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Atenção: Isso também excluirá todos os horários associados a esta data.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Grade de Alunos */}
      <Dialog open={gridModalOpen} onClose={() => setGridModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Alunos Agendados - {selectedLocal?.name} - {selectedDate?.date}
        </DialogTitle>
        <DialogContent>
          {scheduleGrid && Object.keys(scheduleGrid).length > 0 ? (
            Object.entries(scheduleGrid).map(([hour, data]) => (
              <Accordion key={hour} defaultExpanded={data.count > 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={hour}
                      sx={{
                        backgroundColor: designSystem.colors.primary.lighter,
                        color: designSystem.colors.primary.dark,
                        fontWeight: 600,
                      }}
                    />
                    <Typography>
                      {data.count} aluno(s) agendado(s)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {data.students.length === 0 ? (
                    <Typography color="text.secondary">
                      Nenhum aluno agendado neste horário
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.students.map((student) => (
                            <TableRow key={student.exam_id}>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.cpf}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={examsScheduledService.getStatusLabel(student.status)}
                                  size="small"
                                  color={examsScheduledService.getStatusColor(student.status)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                Nenhum horário com alunos agendados
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGridModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default GerenciamentoProvas;
