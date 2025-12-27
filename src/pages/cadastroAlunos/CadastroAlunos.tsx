import React, { useState } from "react";
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
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";

// Funções utilitárias para CPF
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

const cleanCPF = (value: string): string => {
  return value.replace(/\D/g, "");
};

const statusOptions = [
  { label: "Ativo", value: "Ativo" },
  { label: "Inativo", value: "Inativo" },
  { label: "Retido", value: "Retido" },
  { label: "Suspenso", value: "Suspenso" },
  { label: "Atenção", value: "Atencao" },
];

// Dados mockados de monitores
const MOCK_MONITORS = [
  { id: 1, username: "carlos.mendes", first_name: "Carlos", last_name: "Mendes" },
  { id: 2, username: "ana.prado", first_name: "Ana", last_name: "Prado" },
  { id: 3, username: "joao.silva", first_name: "João", last_name: "Silva" },
];

// Dados mockados de usuários para buscar por CPF
const MOCK_USERS = [
  {
    id: 1,
    cpf: "12345678900",
    registration: "2025A001",
    email: "candidato1@projetodesenvolve.com.br",
    first_name: "Candidato",
    last_name: "Um",
  },
  {
    id: 2,
    cpf: "98765432100",
    registration: "2025A002",
    email: "candidato2@projetodesenvolve.com.br",
    first_name: "Candidato",
    last_name: "Dois",
  },
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
  
  const cleanCpf = cleanCPF(values.cpf || "");
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
  const [isFetching, setIsFetching] = useState(false);
  const [cpfFetchError, setCpfFetchError] = useState<string | null>(null);
  const [cpfDisplay, setCpfDisplay] = useState("");
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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpfDisplay(formatted);
    const cleanValue = cleanCPF(formatted);
    setFormValues((prev) => ({ ...prev, cpf: cleanValue }));
    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: "" }));
    }
  };

  const onCpfBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cpf = cleanCPF(e.target.value);
    if (!/^\d{11}$/.test(cpf)) return;

    setIsFetching(true);
    setCpfFetchError(null);

    try {
      // Mock: buscar dados do usuário
      const usr = MOCK_USERS.find((u) => u.cpf === cpf);

      if (!usr) {
        setCpfFetchError("Nenhum usuário encontrado para este CPF");
      } else {
        setFormValues((prev) => ({
          ...prev,
          registration: usr.registration,
          corp_email: usr.email,
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
      // Mock: buscar usuário pelo CPF
      const usr = MOCK_USERS.find((u) => u.cpf === formValues.cpf);
      if (!usr) {
        throw new Error("Usuário não encontrado para este CPF");
      }

      // Mock: criar aluno (simular requisição)
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Em produção, aqui faria a requisição real:
      // await fetch("https://form-api-hml.pdinfinita.com.br/enrolled", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Api-Key": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
      //   },
      //   body: JSON.stringify(payload),
      // });

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
    <Box p={2}>
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
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.STUDENTS)}
          sx={{
            color: "#A650F0",
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Dados de Alunos
        </Link>
        <Typography color="text.primary">Cadastro de Alunos</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: "#A650F0", fontWeight: 600, mb: 2 }}>
          Cadastro de Alunos
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
            <strong>Cadastro de Alunos</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre um novo aluno no sistema baseando-se em um candidato pré existente. Informe o CPF de um candidato já aprovado em algum método
            para cadastrá-lo como aluno. O sistema buscará automaticamente os dados do candidato e preencherá
            os campos de matrícula e e-mail corporativo.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {formError}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%)",
            border: "1px solid #E1BEE7",
          }}
        >
          {/* Header do Formulário */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #A650F0 0%, #8B3DD9 100%)",
              p: 3,
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <PersonIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Novo Cadastro de Aluno
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Preencha os dados abaixo para cadastrar um novo aluno
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box component="form" onSubmit={onSubmit} noValidate sx={{ p: 4 }}>
            {/* Seção: Dados do Candidato */}
            <Card
              elevation={0}
              sx={{
                mb: 3,
                border: "1px solid #E1BEE7",
                borderRadius: 2,
                backgroundColor: "#FAFAFA",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <InfoIcon sx={{ color: "#A650F0", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: "#A650F0" }}>
                    Dados do Candidato
                  </Typography>
                </Box>

                <Box>
                  <Tooltip
                    title="Informe o CPF de um candidato já aprovado em algum método para cadastrá-lo como aluno."
                    arrow
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
                        startAdornment: (
                          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                            <BadgeIcon sx={{ color: "#A650F0" }} />
                          </Box>
                        ),
                        endAdornment: isFetching ? <CircularProgress size={20} /> : null,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#A650F0",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#A650F0",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#A650F0",
                        },
                      }}
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {/* Seção: Informações Acadêmicas */}
            <Card
              elevation={0}
              sx={{
                mb: 3,
                border: "1px solid #E1BEE7",
                borderRadius: 2,
                backgroundColor: "#FAFAFA",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <SchoolIcon sx={{ color: "#A650F0", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: "#A650F0" }}>
                    Informações Acadêmicas
                  </Typography>
                </Box>

                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                    <TextField
                      label="Matrícula"
                      fullWidth
                      value={formValues.registration}
                      onChange={(e) => handleFieldChange("registration", e.target.value)}
                      error={!!errors.registration}
                      helperText={errors.registration}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                            <AssignmentIcon sx={{ color: "#A650F0" }} />
                          </Box>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#A650F0",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#A650F0",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#A650F0",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                    <TextField
                      label="E-mail Corporativo"
                      fullWidth
                      value={formValues.corp_email}
                      onChange={(e) => handleFieldChange("corp_email", e.target.value)}
                      error={!!errors.corp_email}
                      helperText={errors.corp_email}
                      type="email"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                            <EmailIcon sx={{ color: "#A650F0" }} />
                          </Box>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#A650F0",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#A650F0",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#A650F0",
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Seção: Configurações do Aluno */}
            <Card
              elevation={0}
              sx={{
                mb: 3,
                border: "1px solid #E1BEE7",
                borderRadius: 2,
                backgroundColor: "#FAFAFA",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <PersonIcon sx={{ color: "#A650F0", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: "#A650F0" }}>
                    Configurações do Aluno
                  </Typography>
                </Box>

                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                    <FormControl fullWidth error={!!errors.monitor}>
                      <InputLabel
                        sx={{
                          "&.Mui-focused": {
                            color: "#A650F0",
                          },
                        }}
                      >
                        Agente de Sucesso
                      </InputLabel>
                      <Select
                        label="Agente de Sucesso"
                        value={monitorOpt}
                        onChange={handleMonitorChange}
                        startAdornment={
                          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                            <PersonIcon sx={{ color: "#A650F0", ml: 1 }} />
                          </Box>
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E1BEE7",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#A650F0",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#A650F0",
                          },
                        }}
                      >
                        {MOCK_MONITORS.map((m) => (
                          <MenuItem key={m.id} value={m.username}>
                            {m.first_name} {m.last_name}
                          </MenuItem>
                        ))}
                        <MenuItem value="Outro">Outro</MenuItem>
                      </Select>
                      {errors.monitor && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.monitor}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel
                        sx={{
                          "&.Mui-focused": {
                            color: "#A650F0",
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
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E1BEE7",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#A650F0",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#A650F0",
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
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.status}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>

                  {monitorOpt === "Outro" && (
                    <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                      <TextField
                        label="Outro Monitor"
                        fullWidth
                        value={monitorOther}
                        onChange={handleMonitorOtherChange}
                        error={!!errors.monitor}
                        helperText={errors.monitor}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: "#A650F0",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#A650F0",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#A650F0",
                          },
                        }}
                      />
                    </Box>
                  )}

                  {statusOpt === "Outro" && (
                    <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
                      <TextField
                        label="Outro Status"
                        fullWidth
                        value={statusOther}
                        onChange={handleStatusOtherChange}
                        error={!!errors.status}
                        helperText={errors.status}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: "#A650F0",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#A650F0",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#A650F0",
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />

            {/* Botões de Ação */}
            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                onClick={() => navigate(APP_ROUTES.STUDENTS)}
                sx={{
                  color: "#A650F0",
                  borderColor: "#A650F0",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#8B3DD9",
                    backgroundColor: "#F3E5F5",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isFetching}
                sx={{
                  backgroundColor: "#A650F0",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(166, 80, 240, 0.3)",
                  "&:hover": {
                    backgroundColor: "#8B3DD9",
                    boxShadow: "0 6px 16px rgba(166, 80, 240, 0.4)",
                  },
                  "&:disabled": {
                    backgroundColor: "#CCB2E6",
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
