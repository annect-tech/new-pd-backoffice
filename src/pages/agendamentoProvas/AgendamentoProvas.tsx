import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  Grid,
  Chip,
  TextField,
  Collapse,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useExamSchedule } from "../../hooks/useExamSchedule";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  primaryButtonStyles,
  progressStyles,
} from "../../styles/designSystem";

// Horários padrão disponíveis
const DEFAULT_AVAILABLE_HOURS = {
  morning: ["08:00", "09:00", "10:00", "11:00", "12:00"],
  afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  evening: ["19:00", "20:00", "21:00"],
};

// Dias da semana em português
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Meses em português
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const AgendamentoProvas: React.FC = () => {
  const {
    locals,
    wizardData,
    currentStep,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    fetchLocals,
    updateWizardData,
    toggleDate,
    toggleDefaultHour,
    setCustomHoursForDate,
    useDefaultHoursForDate,
    addCustomHourToDate,
    removeCustomHourFromDate,
    getHoursForDate,
    isDateCustomized,
    saveSchedule,
    nextStep,
    prevStep,
  } = useExamSchedule();

  // Estado do calendário
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Estado para controlar qual data está expandida para personalização
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  
  // Estado para novo horário personalizado
  const [newCustomHour, setNewCustomHour] = useState("");

  useEffect(() => {
    fetchLocals();
  }, [fetchLocals]);

  // Gerar dias do mês para o calendário
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Adicionar dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [calendarDate]);

  // Verificar se uma data está selecionada
  const isDateSelected = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    return wizardData.selectedDates.some(
      (d) => d.toISOString().split("T")[0] === dateStr
    );
  };

  // Verificar se uma data é hoje
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navegar mês anterior
  const prevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navegar próximo mês
  const nextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  /**
   * Formatar data para exibição no formato DD/MM/YYYY
   * Conforme documentação da API
   */
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Obter nome do dia da semana
  const getWeekdayName = (date: Date): string => {
    return WEEKDAYS_FULL[date.getDay()];
  };

  // Toggle personalização de uma data
  const toggleDateCustomization = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (expandedDate === dateStr) {
      setExpandedDate(null);
    } else {
      setExpandedDate(dateStr);
      // Se não tem horários personalizados, iniciar com os padrão
      if (!isDateCustomized(date)) {
        setCustomHoursForDate(date, [...wizardData.defaultHours]);
      }
    }
    setNewCustomHour("");
  };

  /**
   * Adicionar novo horário personalizado
   * Formato esperado: HH:mm
   */
  const handleAddCustomHour = (date: Date) => {
    // Valida formato HH:mm
    if (newCustomHour && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newCustomHour)) {
      // Normaliza para HH:mm (com zero à esquerda)
      const [h, m] = newCustomHour.split(":");
      const normalizedHour = `${h.padStart(2, "0")}:${m}`;
      addCustomHourToDate(date, normalizedHour);
      setNewCustomHour("");
    }
  };

  // Verificar se pode avançar
  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return (
        wizardData.localId &&
        wizardData.selectedDates.length > 0 &&
        wizardData.defaultHours.length > 0
      );
    }
    return true;
  }, [currentStep, wizardData]);

  // Renderizar Step 1: Seleção de Datas e Horários Padrão
  const renderStep1 = () => (
    <Fade in timeout={500}>
      <Box>
        {/* Seleção de Local */}
        <Paper
          {...paperStyles}
          sx={{
            ...paperStyles.sx,
            p: 3,
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
              mb: 2,
            }}
          >
            Local da Prova
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>Selecione o local</InputLabel>
            <Select
              value={wizardData.localId || ""}
              label="Selecione o local"
              onChange={(e) => updateWizardData({ localId: e.target.value })}
              sx={{ borderRadius: 2 }}
            >
              {locals.map((local) => (
                <MenuItem key={local.id} value={local.id}>
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>{local.name}</Typography>
                    {local.full_address && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: (theme) => theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280" 
                        }}
                      >
                        {local.full_address}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Calendário e Horários */}
        <Grid container spacing={4}>
          {/* Calendário */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              {...paperStyles}
              sx={{
                ...paperStyles.sx,
                p: 3,
              }}
            >
              {/* Header do Calendário */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                  }}
                >
                  {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </Typography>
                <Box>
                  <IconButton
                    onClick={prevMonth}
                    sx={{
                      border: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                      borderRadius: 2,
                      mr: 1,
                      color: designSystem.colors.primary.main,
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={nextMonth}
                    sx={{
                      border: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                      borderRadius: 2,
                      color: designSystem.colors.primary.main,
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Dias da Semana */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {WEEKDAYS.map((day) => (
                  <Grid key={day} size={12 / 7}>
                    <Typography
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Dias do Mês */}
              <Grid container spacing={1}>
                {calendarDays.map((day, index) => (
                  <Grid key={index} size={12 / 7}>
                    {day ? (
                      <Button
                        fullWidth
                        onClick={() => toggleDate(day)}
                        sx={{
                          minWidth: 0,
                          height: 48,
                          borderRadius: 2,
                          fontWeight: isDateSelected(day) ? 700 : 500,
                          fontSize: "1rem",
                          backgroundColor: isDateSelected(day)
                            ? designSystem.colors.primary.main
                            : "transparent",
                          color: isDateSelected(day)
                            ? "#FFFFFF"
                            : isToday(day)
                            ? designSystem.colors.primary.main
                            : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                          border: isToday(day) && !isDateSelected(day)
                            ? `2px solid ${designSystem.colors.primary.main}`
                            : "none",
                          "&:hover": {
                            backgroundColor: isDateSelected(day)
                              ? designSystem.colors.primary.dark
                              : designSystem.colors.primary.lightest,
                            color: isDateSelected(day)
                              ? "#FFFFFF"
                              : designSystem.colors.primary.main,
                          },
                          transition: `all ${designSystem.transitions.fast}`,
                        }}
                      >
                        {day.getDate()}
                      </Button>
                    ) : (
                      <Box sx={{ height: 48 }} />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Horários Padrão */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              {...paperStyles}
              sx={{
                ...paperStyles.sx,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                  mb: 3,
                }}
              >
                Horários padrão
              </Typography>

              {/* Manhã */}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  mb: 1.5,
                }}
              >
                Manhã
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {DEFAULT_AVAILABLE_HOURS.morning.map((hour) => (
                  <Grid key={hour} size={6}>
                    <Button
                      fullWidth
                      variant={wizardData.defaultHours.includes(hour) ? "contained" : "outlined"}
                      onClick={() => toggleDefaultHour(hour)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        backgroundColor: wizardData.defaultHours.includes(hour)
                          ? designSystem.colors.primary.main
                          : "transparent",
                        borderColor: (theme) => theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main,
                        color: wizardData.defaultHours.includes(hour)
                          ? "#FFFFFF"
                          : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                        "&:hover": {
                          backgroundColor: wizardData.defaultHours.includes(hour)
                            ? designSystem.colors.primary.dark
                            : designSystem.colors.primary.lightest,
                          borderColor: designSystem.colors.primary.main,
                          color: wizardData.defaultHours.includes(hour)
                            ? "#FFFFFF"
                            : designSystem.colors.primary.main,
                        },
                      }}
                    >
                      {hour}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Tarde */}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  mb: 1.5,
                }}
              >
                Tarde
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {DEFAULT_AVAILABLE_HOURS.afternoon.map((hour) => (
                  <Grid key={hour} size={6}>
                    <Button
                      fullWidth
                      variant={wizardData.defaultHours.includes(hour) ? "contained" : "outlined"}
                      onClick={() => toggleDefaultHour(hour)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        backgroundColor: wizardData.defaultHours.includes(hour)
                          ? designSystem.colors.primary.main
                          : "transparent",
                        borderColor: (theme) => theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main,
                        color: wizardData.defaultHours.includes(hour)
                          ? "#FFFFFF"
                          : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                        "&:hover": {
                          backgroundColor: wizardData.defaultHours.includes(hour)
                            ? designSystem.colors.primary.dark
                            : designSystem.colors.primary.lightest,
                          borderColor: designSystem.colors.primary.main,
                          color: wizardData.defaultHours.includes(hour)
                            ? "#FFFFFF"
                            : designSystem.colors.primary.main,
                        },
                      }}
                    >
                      {hour}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Noite */}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  mb: 1.5,
                }}
              >
                Noite
              </Typography>
              <Grid container spacing={1}>
                {DEFAULT_AVAILABLE_HOURS.evening.map((hour) => (
                  <Grid key={hour} size={6}>
                    <Button
                      fullWidth
                      variant={wizardData.defaultHours.includes(hour) ? "contained" : "outlined"}
                      onClick={() => toggleDefaultHour(hour)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        backgroundColor: wizardData.defaultHours.includes(hour)
                          ? designSystem.colors.primary.main
                          : "transparent",
                        borderColor: (theme) => theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main,
                        color: wizardData.defaultHours.includes(hour)
                          ? "#FFFFFF"
                          : (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                        "&:hover": {
                          backgroundColor: wizardData.defaultHours.includes(hour)
                            ? designSystem.colors.primary.dark
                            : designSystem.colors.primary.lightest,
                          borderColor: designSystem.colors.primary.main,
                          color: wizardData.defaultHours.includes(hour)
                            ? "#FFFFFF"
                            : designSystem.colors.primary.main,
                        },
                      }}
                    >
                      {hour}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Personalizar horários por data */}
        {wizardData.selectedDates.length > 0 && (
          <Paper
            {...paperStyles}
            sx={{
              ...paperStyles.sx,
              p: 3,
              mt: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                mb: 3,
              }}
            >
              Personalizar horários por data
            </Typography>

            {wizardData.selectedDates.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const isExpanded = expandedDate === dateStr;
              const customized = isDateCustomized(date);
              const currentHours = getHoursForDate(date);

              return (
                <Paper
                  key={dateStr}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: (theme) => `1px solid ${
                      isExpanded
                        ? designSystem.colors.primary.main
                        : theme.palette.mode === "dark"
                        ? designSystem.colors.border.mainDark
                        : designSystem.colors.border.main
                    }`,
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: `all ${designSystem.transitions.fast}`,
                  }}
                >
                  {/* Header da Data */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? designSystem.colors.background.secondaryDark
                          : designSystem.colors.background.secondary,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                        }}
                      >
                        {formatDate(date)} - {getWeekdayName(date)}
                      </Typography>
                      {customized && (
                        <Chip
                          label="Personalizado"
                          size="small"
                          sx={{
                            backgroundColor: designSystem.colors.primary.lighter,
                            color: designSystem.colors.primary.dark,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {isExpanded && customized && (
                        <Button
                          size="small"
                          onClick={() => useDefaultHoursForDate(date)}
                          sx={{
                            color: (theme) => theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
                            fontWeight: 500,
                            "&:hover": {
                              backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.05)",
                            },
                          }}
                        >
                          Usar padrão
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => toggleDateCustomization(date)}
                        sx={{
                          ...primaryButtonStyles.sx,
                          textTransform: "none",
                        }}
                      >
                        {isExpanded ? "Fechar" : "Personalizar"}
                      </Button>
                    </Box>
                  </Box>

                  {/* Conteúdo Expandido */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ p: 3 }}>
                      {/* Adicionar novo horário */}
                      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                          label="Novo horário"
                          placeholder="Ex: 14:30"
                          value={newCustomHour}
                          onChange={(e) => setNewCustomHour(e.target.value)}
                          size="small"
                          sx={{ width: 150 }}
                          helperText="Formato: HH:mm"
                        />
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddCustomHour(date)}
                          disabled={!newCustomHour}
                          sx={{
                            ...primaryButtonStyles.sx,
                            textTransform: "none",
                          }}
                        >
                          Adicionar horário
                        </Button>
                      </Box>

                      {/* Grid de horários */}
                      <Grid container spacing={2}>
                        {currentHours.map((hour) => (
                          <Grid key={hour} size={{ xs: 6, sm: 4, md: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  flex: 1,
                                  py: 1.5,
                                  px: 2,
                                  textAlign: "center",
                                  border: (theme) => `1px solid ${
                                    theme.palette.mode === "dark"
                                      ? designSystem.colors.border.mainDark
                                      : designSystem.colors.border.main
                                  }`,
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                  }}
                                >
                                  {hour}
                                </Typography>
                              </Paper>
                              <IconButton
                                size="small"
                                onClick={() => removeCustomHourFromDate(date, hour)}
                                sx={{
                                  backgroundColor: designSystem.colors.error.light,
                                  color: designSystem.colors.error.main,
                                  "&:hover": {
                                    backgroundColor: designSystem.colors.error.main,
                                    color: "#FFFFFF",
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Paper>
        )}
      </Box>
    </Fade>
  );

  // Renderizar Resumo (Step 2)
  const renderSummary = () => {
    // Encontrar o local selecionado
    const selectedLocal = locals.find((l) => l.id === wizardData.localId);
    
    // Calcular totais
    const totalDates = wizardData.selectedDates.length;
    const totalHours = wizardData.selectedDates.reduce(
      (acc, date) => acc + getHoursForDate(date).length,
      0
    );

    return (
      <Fade in timeout={500}>
        <Paper
          {...paperStyles}
          sx={{
            ...paperStyles.sx,
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
              mb: 4,
            }}
          >
            Resumo do Agendamento
          </Typography>

          {/* Local */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                mb: 1,
              }}
            >
              Local
            </Typography>
            <Typography
              sx={{
                fontWeight: 500,
                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
              }}
            >
              {selectedLocal?.name || "—"}
            </Typography>
            {selectedLocal?.full_address && (
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
                  mt: 0.5,
                }}
              >
                {selectedLocal.full_address}
              </Typography>
            )}
          </Box>

          {/* Datas e Horários */}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
              mb: 2,
            }}
          >
            Datas e Horários ({totalDates} data(s))
          </Typography>

          <Grid container spacing={2}>
            {wizardData.selectedDates.map((date) => {
              const hours = getHoursForDate(date);
              const customized = isDateCustomized(date);

              return (
                <Grid key={date.toISOString()} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: (theme) => `1px solid ${
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main
                      }`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                        }}
                      >
                        {formatDate(date)}
                      </Typography>
                      {customized && (
                        <Chip
                          label="Personalizado"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor: designSystem.colors.primary.lighter,
                            color: designSystem.colors.primary.dark,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                      }}
                    >
                      {getWeekdayName(date)}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                      {hours.map((hour) => (
                        <Chip
                          key={hour}
                          label={hour}
                          size="small"
                          sx={{
                            backgroundColor: designSystem.colors.primary.lighter,
                            color: designSystem.colors.primary.dark,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Total de horários */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: (theme) => `1px solid ${
                theme.palette.mode === "dark"
                  ? designSystem.colors.border.mainDark
                  : designSystem.colors.border.main
              }`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
              }}
            >
              Total de horários: {totalHours}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: (theme) => theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
              }}
            >
              Ao confirmar, serão criados {totalDates} data(s) com {totalHours} horário(s) no total.
            </Typography>
          </Box>
        </Paper>
      </Fade>
    );
  };

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
          {/* Progress Indicator */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                mb: 1,
              }}
            >
              {currentStep + 1}/2
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((currentStep + 1) / 2) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? designSystem.colors.background.tertiaryDark
                    : designSystem.colors.background.tertiary,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: designSystem.colors.primary.main,
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <PageHeader
            title="Agendamento de Provas"
            subtitle={
              currentStep === 0
                ? "Selecione as datas disponíveis no calendário e defina os horários padrão. Você poderá personalizar os horários para cada data específica depois."
                : "Revise as informações do agendamento antes de confirmar."
            }
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Agendamento de Provas" },
            ]}
            showInfoCard={false}
          />

          {/* Loading */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress {...progressStyles} />
            </Box>
          ) : (
            <>
              {/* Conteúdo do Step */}
              {currentStep === 0 && renderStep1()}
              {currentStep === 1 && renderSummary()}

              {/* Botões de Navegação */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 4,
                  pt: 3,
                  borderTop: (theme) => `1px solid ${
                    theme.palette.mode === "dark"
                      ? designSystem.colors.border.mainDark
                      : designSystem.colors.border.main
                  }`,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderColor: designSystem.colors.primary.main,
                    color: designSystem.colors.primary.main,
                    "&:hover": {
                      borderColor: designSystem.colors.primary.dark,
                      backgroundColor: designSystem.colors.primary.lightest,
                    },
                    "&:disabled": {
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? designSystem.colors.border.mainDark
                          : designSystem.colors.border.main,
                    },
                  }}
                >
                  Voltar
                </Button>

                {currentStep < 1 ? (
                  <Button
                    variant="contained"
                    onClick={nextStep}
                    disabled={!canProceed}
                    sx={{
                      ...primaryButtonStyles.sx,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={saveSchedule}
                    disabled={saving}
                    sx={{
                      ...primaryButtonStyles.sx,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    {saving ? (
                      <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
                    ) : (
                      "Confirmar Agendamento"
                    )}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

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

export default AgendamentoProvas;
