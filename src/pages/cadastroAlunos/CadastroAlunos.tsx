import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Typography,
  Alert,
  Snackbar,
  Divider,
  Fade,
} from "@mui/material";
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import { designSystem, primaryButtonStyles, paperStyles } from "../../styles/designSystem";
import { applyCpfMask, removeCpfMask } from "../../util/masks";
import { userProfileService } from "../../core/http/services/userProfileService";
import { usersService, type UserResponse } from "../../core/http/services/usersService";
import { studentDataService } from "../../core/http/services/studentDataService";

const statusOptions = [
  { label: "Ativo", value: "Ativo" },
  { label: "Inativo", value: "Inativo" },
  { label: "Retido", value: "Retido" },
  { label: "Suspenso", value: "Suspenso" },
  { label: "Atenção", value: "Atencao" },
];


interface FormValues {
  cpf: string;
  registration: string;
  corp_email: string;
  monitor: string;
  status: string;
}

const validateForm = (values: FormValues): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const cleanCpf = removeCpfMask(values.cpf || "");
  if (!cleanCpf) {
    errors.cpf = "CPF é obrigatório";
  } else if (!/^\d{11}$/.test(cleanCpf)) {
    errors.cpf = "CPF deve ter 11 dígitos numéricos";
  }
  
  if (!values.registration) {
    errors.registration = "Matrícula é obrigatória";
  }
  
  if (!values.corp_email) {
    errors.corp_email = "E-mail corporativo é obrigatório";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.corp_email)) {
    errors.corp_email = "Formato de e-mail inválido";
  }
  
  if (!values.monitor) {
    errors.monitor = 'Campo "Monitor" é obrigatório';
  }
  
  if (!values.status) {
    errors.status = "Status é obrigatório";
  }
  
  return errors;
};

const CadastroAlunos: React.FC = () => {
  const navigate = useNavigate();
  
  // Estilos compartilhados para inputs seguindo o design system
  const inputFocusSx = {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: designSystem.colors.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: designSystem.colors.primary.main,
        borderWidth: "2px",
      },
      "& fieldset": {
        borderColor: (theme: any) => theme.palette.mode === "dark" 
          ? designSystem.colors.border.mainDark 
          : designSystem.colors.border.main,
      },
      backgroundColor: (theme: any) => theme.palette.mode === "dark" 
        ? "#2C2C2C" 
        : "#FFFFFF",
    },
    "& .MuiInputLabel-root": {
      color: (theme: any) => theme.palette.mode === "dark" 
        ? designSystem.colors.text.secondaryDark 
        : designSystem.colors.text.secondary,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: designSystem.colors.primary.main,
    },
    "& .MuiInputBase-input": {
      color: (theme: any) => theme.palette.mode === "dark" 
        ? designSystem.colors.text.primaryDark 
        : designSystem.colors.text.primary,
    },
  };
  const [isFetching, setIsFetching] = useState(false);
  const [cpfFetchError, setCpfFetchError] = useState<string | null>(null);
  const [cpfDisplay, setCpfDisplay] = useState("");
  const [foundUserId, setFoundUserId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    cpf: "",
    registration: "",
    corp_email: "",
    monitor: "",
    status: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [monitorOpt, setMonitorOpt] = useState<string>("");
  const [monitorOther, setMonitorOther] = useState<string>("");
  const [statusOpt, setStatusOpt] = useState<string>("");
  const [statusOther, setStatusOther] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [monitors, setMonitors] = useState<UserResponse[]>([]);

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const response = await usersService.listUsers(1, 1000);
        if (response.status === 200 && response.data) {
          const users: UserResponse[] = Array.isArray(response.data)
            ? response.data
            : Array.isArray((response.data as any)?.data)
              ? (response.data as any).data
              : [];
          setMonitors(users);
        }
      } catch {
        console.error("Erro ao buscar monitores");
      }
    };
    fetchMonitors();
  }, []);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = applyCpfMask(e.target.value);
    setCpfDisplay(formatted);
    const cleanValue = removeCpfMask(formatted);
    setFormValues((prev) => ({ ...prev, cpf: cleanValue }));
    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: "" }));
    }
  };

  const onCpfBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cpf = removeCpfMask(e.target.value);
    if (!/^\d{11}$/.test(cpf)) return;

    setIsFetching(true);
    setCpfFetchError(null);
    setFoundUserId(null);

    try {
      const profile = await userProfileService.getByCpf(cpf);

      if (!profile) {
        setCpfFetchError("Nenhum usuário encontrado para este CPF");
      } else {
        setFoundUserId(profile.user_id);
        setFormValues((prev) => ({
          ...prev,
          corp_email: profile.user_display?.email || prev.corp_email,
        }));
      }
    } catch {
      setCpfFetchError("Erro ao buscar dados do usuário");
    } finally {
      setIsFetching(false);
    }
  };

  const handleMonitorChange = (e: any) => {
    const value = e.target.value;
    setMonitorOpt(value);
    setMonitorOther("");
    setFormValues((prev) => ({ ...prev, monitor: value === "Outro" ? "" : value }));
    if (errors.monitor) {
      setErrors((prev) => ({ ...prev, monitor: "" }));
    }
  };

  const handleMonitorOtherChange = (e: any) => {
    setMonitorOther(e.target.value);
    setFormValues((prev) => ({ ...prev, monitor: e.target.value }));
    if (errors.monitor) {
      setErrors((prev) => ({ ...prev, monitor: "" }));
    }
  };

  const handleStatusChange = (e: any) => {
    const value = e.target.value;
    setStatusOpt(value);
    setStatusOther("");
    setFormValues((prev) => ({ ...prev, status: value === "Outro" ? "" : value }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "" }));
    }
  };

  const handleStatusOtherChange = (e: any) => {
    setStatusOther(e.target.value);
    setFormValues((prev) => ({ ...prev, status: e.target.value }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "" }));
    }
  };

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      if (!foundUserId) {
        throw new Error("Usuário não encontrado para este CPF. Busque o CPF primeiro.");
      }

      const createResponse = await studentDataService.create({
        user_id: foundUserId,
        registration: formValues.registration,
        corp_email: formValues.corp_email,
        monitor: formValues.monitor,
        status: formValues.status,
      });

      if (createResponse.status !== 200 && createResponse.status !== 201) {
        throw new Error(createResponse.message || "Erro ao cadastrar aluno");
      }

      setSnackbar({
        open: true,
        message: "Aluno cadastrado com sucesso!",
        severity: "success",
      });

      setTimeout(() => {
        navigate(APP_ROUTES.STUDENTS);
      }, 1500);
    } catch (err: any) {
      let msg = "Erro ao criar estudante. Verifique os dados e tente novamente.";
      if (err && typeof err === "object") {
        if (err.response && err.response.data) {
          const data = err.response.data;
          if (typeof data === "string") {
            msg = data;
          } else if (typeof data === "object") {
            msg = Object.entries(data)
              .map(
                ([field, messages]) =>
                  `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
              )
              .join(" | ");
          }
        } else if (err.message && typeof err.message === "string") {
          msg = err.message;
        }
      }
      setFormError(msg);
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          {/* Header da Página */}
          <PageHeader
            title="Cadastro de Alunos"
            subtitle="Cadastre um novo aluno no sistema."
            description="Cadastre um novo aluno no sistema baseando-se em um candidato pré existente. Informe o CPF de um candidato já aprovado em algum método para cadastrá-lo como aluno. O sistema buscará automaticamente os dados do candidato e preencherá os campos de matrícula e e-mail corporativo."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Dados de Alunos", path: APP_ROUTES.STUDENTS },
              { label: "Cadastro de Alunos" },
            ]}
          />

          <Fade in timeout={1000}>
            <Box sx={{ maxWidth: 900, mx: "auto" }}>
              {formError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: designSystem.borderRadius.medium,
                    backgroundColor: designSystem.colors.error.light,
                    color: designSystem.colors.error.main,
                  }}
                >
                  {formError}
                </Alert>
              )}

              <Paper 
                {...paperStyles}
                sx={{
                  ...paperStyles.sx,
                  backgroundColor: (theme) => theme.palette.mode === "dark" 
                    ? "#181818" 
                    : designSystem.colors.background.primary,
                }}
              >
                <Box component="form" onSubmit={onSubmit} noValidate sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  {/* Seção: Dados do Candidato */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <BadgeIcon sx={{ color: designSystem.colors.primary.main, fontSize: 24 }} />
                      Dados do Candidato
                    </Typography>

                    <Tooltip
                      title="Informe o CPF de um candidato já aprovado em algum método para cadastrá-lo como aluno."
                      arrow
                      placement="top"
                    >
                      <TextField
                        label="CPF"
                        fullWidth
                        value={cpfDisplay}
                        onChange={handleCpfChange}
                        onBlur={onCpfBlur}
                        error={!!errors.cpf || !!cpfFetchError}
                        helperText={errors.cpf ?? cpfFetchError ?? "Digite o CPF do candidato aprovado"}
                        placeholder="000.000.000-00"
                        disabled={isFetching}
                        InputProps={{
                          endAdornment: isFetching ? (
                            <CircularProgress 
                              size={20} 
                              sx={{ color: designSystem.colors.primary.main }} 
                            />
                          ) : null,
                        }}
                        sx={inputFocusSx}
                      />
                    </Tooltip>
                  </Box>

                  <Divider sx={{ 
                    my: 4, 
                    borderColor: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.border.mainDark 
                      : designSystem.colors.border.main 
                  }} />

                  {/* Seção: Informações Acadêmicas */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <SchoolIcon sx={{ color: designSystem.colors.primary.main, fontSize: 24 }} />
                      Informações Acadêmicas
                    </Typography>

                    <Box 
                      display="grid" 
                      gap={3}
                      sx={{
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      }}
                    >
                      <TextField
                        label="Matrícula"
                        fullWidth
                        value={formValues.registration}
                        onChange={(e) => handleFieldChange("registration", e.target.value)}
                        error={!!errors.registration}
                        helperText={errors.registration}
                        sx={inputFocusSx}
                      />

                      <TextField
                        label="E-mail Corporativo"
                        fullWidth
                        value={formValues.corp_email}
                        onChange={(e) => handleFieldChange("corp_email", e.target.value)}
                        error={!!errors.corp_email}
                        helperText={errors.corp_email}
                        type="email"
                        sx={inputFocusSx}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ 
                    my: 4, 
                    borderColor: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.border.mainDark 
                      : designSystem.colors.border.main 
                  }} />

                  {/* Seção: Configurações do Aluno */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <PersonIcon sx={{ color: designSystem.colors.primary.main, fontSize: 24 }} />
                      Configurações do Aluno
                    </Typography>

                    <Box 
                      display="grid" 
                      gap={3}
                      sx={{
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      }}
                    >
                      <FormControl fullWidth error={!!errors.monitor}>
                        <InputLabel
                          sx={{
                            color: (theme) => theme.palette.mode === "dark" 
                              ? designSystem.colors.text.secondaryDark 
                              : designSystem.colors.text.secondary,
                            "&.Mui-focused": {
                              color: designSystem.colors.primary.main,
                            },
                          }}
                        >
                          Agente de Sucesso
                        </InputLabel>
                        <Select
                          label="Agente de Sucesso"
                          value={monitorOpt}
                          onChange={handleMonitorChange}
                          sx={{
                            backgroundColor: (theme) => theme.palette.mode === "dark" 
                              ? "#2C2C2C" 
                              : "#FFFFFF",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.border.mainDark 
                                : designSystem.colors.border.main,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: designSystem.colors.primary.main,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: designSystem.colors.primary.main,
                              borderWidth: "2px",
                            },
                            "& .MuiSelect-select": {
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.primaryDark 
                                : designSystem.colors.text.primary,
                            },
                          }}
                        >
                          {monitors.map((m) => (
                            <MenuItem key={m.id} value={m.username}>
                              {m.first_name || m.last_name
                                ? `${m.first_name || ""} ${m.last_name || ""}`.trim()
                                : m.username || m.email}
                            </MenuItem>
                          ))}
                          <MenuItem value="Outro">Outro</MenuItem>
                        </Select>
                        {errors.monitor && (
                          <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ mt: 0.5, ml: 1.75 }}
                          >
                            {errors.monitor}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl fullWidth error={!!errors.status}>
                        <InputLabel
                          sx={{
                            color: (theme) => theme.palette.mode === "dark" 
                              ? designSystem.colors.text.secondaryDark 
                              : designSystem.colors.text.secondary,
                            "&.Mui-focused": {
                              color: designSystem.colors.primary.main,
                            },
                          }}
                        >
                          Status
                        </InputLabel>
                        <Select
                          label="Status"
                          value={statusOpt}
                          onChange={handleStatusChange}
                          sx={{
                            backgroundColor: (theme) => theme.palette.mode === "dark" 
                              ? "#2C2C2C" 
                              : "#FFFFFF",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.border.mainDark 
                                : designSystem.colors.border.main,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: designSystem.colors.primary.main,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: designSystem.colors.primary.main,
                              borderWidth: "2px",
                            },
                            "& .MuiSelect-select": {
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.primaryDark 
                                : designSystem.colors.text.primary,
                            },
                          }}
                        >
                          {statusOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                          <MenuItem value="Outro">Outro</MenuItem>
                        </Select>
                        {errors.status && (
                          <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ mt: 0.5, ml: 1.75 }}
                          >
                            {errors.status}
                          </Typography>
                        )}
                      </FormControl>

                      {monitorOpt === "Outro" && (
                        <TextField
                          label="Outro Monitor"
                          fullWidth
                          value={monitorOther}
                          onChange={handleMonitorOtherChange}
                          error={!!errors.monitor}
                          helperText={errors.monitor}
                          sx={inputFocusSx}
                        />
                      )}

                      {statusOpt === "Outro" && (
                        <TextField
                          label="Outro Status"
                          fullWidth
                          value={statusOther}
                          onChange={handleStatusOtherChange}
                          error={!!errors.status}
                          helperText={errors.status}
                          sx={inputFocusSx}
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ 
                    my: 4, 
                    borderColor: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.border.mainDark 
                      : designSystem.colors.border.main 
                  }} />

                  {/* Botões de Ação */}
                  <Box 
                    display="flex" 
                    gap={2} 
                    justifyContent="flex-end" 
                    sx={{
                      flexDirection: { xs: "column-reverse", sm: "row" },
                    }}
                  >
                    <Button
                      onClick={() => navigate(APP_ROUTES.STUDENTS)}
                      sx={{
                        color: designSystem.colors.primary.main,
                        fontWeight: 600,
                        textTransform: "none",
                        minWidth: { xs: "100%", sm: 140 },
                        "&:hover": {
                          backgroundColor: designSystem.colors.primary.lightest,
                        },
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isFetching}
                      {...primaryButtonStyles}
                      sx={{
                        ...primaryButtonStyles.sx,
                        textTransform: "none",
                        minWidth: { xs: "100%", sm: 180 },
                        "&:disabled": {
                          backgroundColor: designSystem.colors.primary.light,
                          color: designSystem.colors.background.primary,
                        },
                      }}
                    >
                      {isFetching ? (
                        <>
                          <CircularProgress size={18} sx={{ mr: 1 }} color="inherit" />
                          Processando...
                        </>
                      ) : (
                        "Cadastrar Aluno"
                      )}
                    </Button>
                  </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CadastroAlunos;
