import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { formatCpf, formatDate, formatPatrimony } from "../../util/formatters";
import { VALIDATION_PATTERNS } from "../../util/constants";
import logoDesenvolve from "../../assets/images/logo/LOGO DESENVOLVE.png";

// Interface definida localmente para evitar problemas de resolução de módulo
interface UserProfilePayload {
  cpf?: string;
  personal_email?: string;
  bio?: string;
  birth_date?: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  profileData: UserProfilePayload;
  onChange: React.Dispatch<React.SetStateAction<UserProfilePayload>>;
  onCreateProfile: () => Promise<void>;
  onUploadPhoto: (file: File) => Promise<void>;
  onClose: () => void;
}

const dataSteps = [
  "cpf",
  "personal_email",
  "bio",
  "birth_date",
  "hire_date",
  "occupation",
  "department",
  "equipment_patrimony",
  "work_location",
  "manager",
];

const CreateProfileModal: React.FC<Props> = ({
  open,
  loading,
  profileData,
  onChange,
  onCreateProfile,
  onUploadPhoto,
  onClose,
}) => {
  const [step, setStep] = useState(-2);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // selects / "Outro"
  const [useNotebook, setUseNotebook] = useState<"yes" | "no" | null>(null);
  const [notebookVal, setNotebookVal] = useState("");
  const [occOpt, setOccOpt] = useState("");
  const [occOther, setOccOther] = useState("");
  const [deptOpt, setDeptOpt] = useState("");
  const [deptOther, setDeptOther] = useState("");
  const [locOpt, setLocOpt] = useState("");
  const [locOther, setLocOther] = useState("");
  const [mgrOpt, setMgrOpt] = useState("");
  const [mgrOther, setMgrOther] = useState("");

  useEffect(() => {
    if (open) {
      // reinicia tudo ao abrir
      setStep(-2);
      setTimeout(() => setStep(-1), 800);
      setError(null);
      setFile(null);
      setPreview(null);
      setUploading(false);
      setReviewError(null);
      setReviewLoading(false);
      setUseNotebook(null);
      setNotebookVal("");
      setOccOpt("");
      setOccOther("");
      setDeptOpt("");
      setDeptOther("");
      setLocOpt("");
      setLocOther("");
      setMgrOpt("");
      setMgrOther("");
    }
  }, [open]);

  const tooltipContent = (
    <Box display={"flex"} flexDirection="column" alignItems="center">
      <Typography fontSize={13}>
        Patrimônio é o número de identificação do seu notebook empresarial.
        Verifique no seu notebook algo parecido com a imagem abaixo:
      </Typography>
      <br />
      <Box
        sx={{
          width: 100,
          height: 60,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          border: "1px solid #ccc",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          EQ-XXXX
        </Typography>
      </Box>
    </Box>
  );

  const next = async () => {
    setError(null);

    if (step >= 0 && step < dataSteps.length) {
      const field = dataSteps[step];
      const current = (profileData as any)[field] || "";

      switch (field) {
        case "cpf":
          if (!VALIDATION_PATTERNS.CPF.test(current)) {
            setError("CPF inválido, coloque no formato 000.000.000-00");
            return;
          }
          break;

        case "personal_email":
          if (!/^[^@]+@[^@]+\.[^@]+$/.test(current)) {
            setError("E-mail inválido");
            return;
          }
          break;

        case "equipment_patrimony": {
          if (!useNotebook) {
            setError("Escolha Sim ou Não");
            return;
          }
          const val =
            useNotebook === "no" ? "Não usa notebook da empresa" : notebookVal;
          if (useNotebook === "yes" && !/^\d{4,6}$/.test(notebookVal)) {
            setError("Número do patrimônio deve ter entre 4 e 6 dígitos.");
            return;
          }
          onChange({ ...profileData, equipment_patrimony: val });
          break;
        }

        case "occupation": {
          const val = occOpt === "Outro" ? occOther : occOpt;
          if (!val) {
            setError("Preencha o cargo");
            return;
          }
          onChange({ ...profileData, occupation: val });
          break;
        }

        case "department": {
          const val = deptOpt === "Outro" ? deptOther : deptOpt;
          if (!val) {
            setError("Preencha o dept.");
            return;
          }
          onChange({ ...profileData, department: val });
          break;
        }

        case "work_location": {
          const val = locOpt === "Outro" ? locOther : locOpt;
          if (!val) {
            setError("Preencha o local");
            return;
          }
          onChange({ ...profileData, work_location: val });
          break;
        }

        case "manager": {
          const val = mgrOpt === "Outro" ? mgrOther : mgrOpt;
          if (!val) {
            setError("Preencha o gestor");
            return;
          }
          onChange({ ...profileData, manager: val });
          break;
        }

        default:
          // bio, birth_date, hire_date: genérico, já está em profileData
          break;
      }
    }

    if (step < dataSteps.length - 1) {
      setStep((s) => s + 1);
    } else if (step === dataSteps.length - 1) {
      setStep(dataSteps.length);
    }
  };

  const handleReviewConfirm = async () => {
    setReviewLoading(true);
    setReviewError(null);
    try {
      // Simula criação de perfil (dados mockados)
      // A função onCreateProfile já está mockada no AppLayout
      await onCreateProfile();
      
      // Adiciona ao array de perfis mockados para referência futura
      const existingProfiles = localStorage.getItem('mock_profiles');
      const profiles = existingProfiles ? JSON.parse(existingProfiles) : [];
      const newProfile = {
        id: Date.now(),
        ...profileData,
        created_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      localStorage.setItem('mock_profiles', JSON.stringify(profiles));
      
      setStep(dataSteps.length + 1);
    } catch (error: any) {
      let errorMessage = error.message || "Erro ao criar perfil";
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.cpf && Array.isArray(parsedError.cpf)) {
          errorMessage = parsedError.cpf.join(", ");
        }
      } catch {}
      if (errorMessage.includes("user profile with this cpf already exists")) {
        errorMessage = "Perfil de usuário com este CPF já existe.";
      }
      setReviewError(errorMessage);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const formattedValue =
      name === "cpf"
        ? formatCpf(value)
        : name === "equipment_patrimony"
        ? formatPatrimony(value)
        : value;
    onChange({ ...profileData, [name]: formattedValue });
  };

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
      setError("Imagem até 1MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const uploadPhoto = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Simula upload de foto (dados mockados)
      await onUploadPhoto(file);
      
      // Simula sucesso do upload
      console.log('Foto de perfil enviada com sucesso (mockado)');
      
      // Fecha o modal após sucesso
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setError("Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const fields = [
    { label: "CPF", value: formatCpf(profileData.cpf || "") },
    { label: "E-mail Pessoal", value: profileData.personal_email || "" },
    { label: "Biografia", value: profileData.bio || "" },
    {
      label: "Data de Nascimento",
      value: profileData.birth_date ? formatDate(profileData.birth_date) : "",
    },
    {
      label: "Data de Contratação",
      value: profileData.hire_date ? formatDate(profileData.hire_date) : "",
    },
    { label: "Cargo", value: profileData.occupation || "" },
    { label: "Departamento", value: profileData.department || "" },
    { label: "Notebook", value: profileData.equipment_patrimony || "" },
    { label: "Local de Trabalho", value: profileData.work_location || "" },
    { label: "Gestor", value: profileData.manager || "" },
  ];

  return (
    <Dialog open={open} fullWidth maxWidth="sm" disableEscapeKeyDown>
      <Box
        textAlign="center"
        pt={8}
        sx={{
          overflow: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          minHeight: "8vh",
          height: "auto",
        }}
      >
        <Box
          sx={{
            animation: step === -2 ? "logoAnimation 4.5s ease-in-out" : "none",
            "@keyframes logoAnimation": {
              "0%": { transform: "scale(0)", opacity: 0 },
              "50%": { transform: "scale(1)", opacity: 1 },
              "100%": { transform: "scale(1) translateY(-20px)", opacity: 1 },
            },
          }}
        >
          <Box
            component="img"
            src={logoDesenvolve}
            alt="Logo"
            sx={{ width: 100, mx: "auto" }}
          />
        </Box>
      </Box>
      <DialogContent>
        {step === -1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              animation: "fadeIn 1.8s ease-in-out",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(20px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography align="center" variant="h6">
              Olá, bem-vindo ao projeto Desenvolve!
            </Typography>
            <Typography fontSize={12}>
              Clique em "Começar" para criar seu perfil.
            </Typography>

            <Button
              onClick={() => setStep(0)}
              variant="contained"
              color="primary"
              sx={{
                mt: 1,
                mb: 0.5,
                alignItems: "flex-end",
                backgroundColor: "#A650F0",
                "&:hover": { backgroundColor: "#8B3DD9" },
              }}
            >
              Começar
            </Button>
          </Box>
        )}

        {step >= 0 && step < dataSteps.length && (
          <Box
            sx={{
              animation: "slideIn 0.5s ease-out",
              "@keyframes slideIn": {
                "0%": { opacity: 0, transform: "translateX(50px)" },
                "100%": { opacity: 1, transform: "translateX(0)" },
              },
            }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle1">
                {dataSteps[step] === "cpf" && "Digite seu CPF:"}
                {dataSteps[step] === "personal_email" && "E-mail Pessoal:"}
                {dataSteps[step] === "bio" && "Biografia"}
                {dataSteps[step] === "birth_date" && "Data de Nascimento"}
                {dataSteps[step] === "hire_date" && "Data de Contratação"}
                {dataSteps[step] === "occupation" && "Cargo"}
                {dataSteps[step] === "department" && "Departamento"}
                {dataSteps[step] === "equipment_patrimony" &&
                  "Usa Notebook da Empresa?"}
                {dataSteps[step] === "work_location" && "Local de Trabalho"}
                {dataSteps[step] === "manager" && "Gestor"}
              </Typography>

              {["cpf", "personal_email", "birth_date", "hire_date"].includes(
                dataSteps[step]
              ) && (
                <TextField
                  fullWidth
                  sx={{ mb: 1 }}
                  name={dataSteps[step]}
                  type={dataSteps[step].includes("date") ? "date" : "text"}
                  placeholder={
                    dataSteps[step] === "cpf" ? "000.000.000-00" : ""
                  }
                  value={(profileData as any)[dataSteps[step]] || ""}
                  onChange={handleChange}
                  InputLabelProps={
                    dataSteps[step].includes("date")
                      ? { shrink: true }
                      : undefined
                  }
                  error={!!error}
                  helperText={error}
                  color="primary"
                />
              )}

              {dataSteps[step] === "bio" && (
                <TextField
                  fullWidth
                  sx={{ mb: 2 }}
                  name="bio"
                  multiline
                  minRows={3}
                  maxRows={10}
                  label="Fale um pouco sobre você"
                  value={profileData.bio || ""}
                  onChange={handleChange}
                  error={!!error}
                  helperText={error}
                  color="primary"
                />
              )}

              {dataSteps[step] === "occupation" && (
                <FormControl fullWidth error={!!error}>
                  <InputLabel color="primary">Cargo</InputLabel>
                  <Select
                    value={occOpt}
                    label="Cargo"
                    onChange={(e) => setOccOpt(e.target.value)}
                    color="primary"
                  >
                    <MenuItem value="Agente de Sucesso">
                      Agente de Sucesso
                    </MenuItem>
                    <MenuItem value="Gestor">Gestor</MenuItem>
                    <MenuItem value="Monitor">Monitor</MenuItem>
                    <MenuItem value="Desenvolvedor">Desenvolvedor</MenuItem>
                    <MenuItem value="Psicologo">Psicólogo</MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                  {occOpt === "Outro" && (
                    <TextField
                      sx={{ mt: 2 }}
                      fullWidth
                      label="Especifique"
                      value={occOther}
                      onChange={(e) => setOccOther(e.target.value)}
                      helperText={error}
                      color="primary"
                    />
                  )}
                </FormControl>
              )}

              {dataSteps[step] === "department" && (
                <FormControl fullWidth error={!!error}>
                  <InputLabel color="primary">Departamento</InputLabel>
                  <Select
                    value={deptOpt}
                    label="Departamento"
                    onChange={(e) => setDeptOpt(e.target.value)}
                    color="primary"
                  >
                    <MenuItem value="Sucesso do Aluno">
                      Sucesso do Aluno
                    </MenuItem>
                    <MenuItem value="Sucesso do Professor">
                      Sucesso do Professor
                    </MenuItem>
                    <MenuItem value="Administrativo">Administrativo</MenuItem>
                    <MenuItem value="Desenvolvimento">
                      Desenvolvimento
                    </MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                  {deptOpt === "Outro" && (
                    <TextField
                      sx={{ mt: 2 }}
                      fullWidth
                      label="Especifique"
                      value={deptOther}
                      onChange={(e) => setDeptOther(e.target.value)}
                      helperText={error}
                      color="primary"
                    />
                  )}
                </FormControl>
              )}

              {dataSteps[step] === "equipment_patrimony" && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      variant={
                        useNotebook === "yes" ? "contained" : "outlined"
                      }
                      onClick={() => setUseNotebook("yes")}
                      color="primary"
                      sx={{
                        width: "50%",
                        backgroundColor:
                          useNotebook === "yes" ? "#A650F0" : "transparent",
                        color: useNotebook === "yes" ? "white" : "#A650F0",
                        borderColor: "#A650F0",
                        "&:hover": {
                          backgroundColor:
                            useNotebook === "yes" ? "#8B3DD9" : "rgba(166, 80, 240, 0.04)",
                        },
                      }}
                    >
                      Sim
                    </Button>
                    <Button
                      variant={
                        useNotebook === "no" ? "contained" : "outlined"
                      }
                      onClick={() => setUseNotebook("no")}
                      color="primary"
                      sx={{
                        width: "50%",
                        backgroundColor:
                          useNotebook === "no" ? "#A650F0" : "transparent",
                        color: useNotebook === "no" ? "white" : "#A650F0",
                        borderColor: "#A650F0",
                        "&:hover": {
                          backgroundColor:
                            useNotebook === "no" ? "#8B3DD9" : "rgba(166, 80, 240, 0.04)",
                        },
                      }}
                    >
                      Não
                    </Button>
                  </Box>
                  {useNotebook === "yes" && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextField
                        fullWidth
                        label="Número do notebook"
                        value={notebookVal}
                        onChange={(e) =>
                          setNotebookVal(formatPatrimony(e.target.value))
                        }
                        helperText={error}
                        inputProps={{ maxLength: 6 }}
                        color="primary"
                        FormHelperTextProps={{
                          sx: { color: "red" },
                        }}
                      />
                      <Tooltip title={tooltipContent} arrow>
                        <IconButton>
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </>
              )}

              {dataSteps[step] === "work_location" && (
                <FormControl fullWidth error={!!error}>
                  <InputLabel color="primary">Local de Trabalho</InputLabel>
                  <Select
                    value={locOpt}
                    label="Local de Trabalho"
                    onChange={(e) => setLocOpt(e.target.value)}
                    color="primary"
                  >
                    <MenuItem value="Rua Tome de Souza 810 - 5º andar">
                      Rua Tome de Souza 810 - 5º andar
                    </MenuItem>
                    <MenuItem value="Rua Tome de Souza 810 - 4º andar">
                      Rua Tome de Souza 810 - 4º andar
                    </MenuItem>
                    <MenuItem value="Rua Tome de Souza 810 - 7º andar">
                      Rua Tome de Souza 810 - 7º andar
                    </MenuItem>
                    <MenuItem value="Remoto">Remoto</MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                  {locOpt === "Outro" && (
                    <TextField
                      sx={{ mt: 2 }}
                      fullWidth
                      label="Especifique"
                      value={locOther}
                      onChange={(e) => setLocOther(e.target.value)}
                      helperText={error}
                      color="primary"
                    />
                  )}
                </FormControl>
              )}

              {dataSteps[step] === "manager" && (
                <FormControl fullWidth error={!!error}>
                  <InputLabel color="primary">Gestor</InputLabel>
                  <Select
                    value={mgrOpt}
                    label="Gestor"
                    onChange={(e) => setMgrOpt(e.target.value)}
                    color="primary"
                  >
                    <MenuItem value="Mariana">Mariana</MenuItem>
                    <MenuItem value="Maycon">Maycon</MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                  {mgrOpt === "Outro" && (
                    <TextField
                      sx={{ mt: 2 }}
                      fullWidth
                      label="Especifique"
                      value={mgrOther}
                      onChange={(e) => setMgrOther(e.target.value)}
                      helperText={error}
                      color="primary"
                    />
                  )}
                </FormControl>
              )}

              <Button
                onClick={next}
                variant="contained"
                disabled={loading}
                color="primary"
                sx={{
                  backgroundColor: "#A650F0",
                  "&:hover": { backgroundColor: "#8B3DD9" },
                }}
              >
                {loading ? <CircularProgress size={20} /> : "Próximo"}
              </Button>
            </Stack>
          </Box>
        )}

        {step === dataSteps.length && (
          <Box
            sx={{
              animation: "fadeIn 0.6s ease-out",
              "@keyframes fadeIn": {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
              },
            }}
          >
            <Stack spacing={2} sx={{ wordBreak: "break-word" }}>
              <Typography align="center" variant="h6">
                Revisão dos Dados
              </Typography>
              {fields.map((field, index) => (
                <Typography key={index} variant="body1">
                  <strong>{field.label}:</strong> {field.value || "—"}
                </Typography>
              ))}
              {reviewError && (
                <Typography color="error">{reviewError}</Typography>
              )}
            </Stack>
          </Box>
        )}

        {step === dataSteps.length + 1 && (
          <Box
            sx={{
              animation: "scaleIn 0.5s ease-out",
              "@keyframes scaleIn": {
                "0%": { opacity: 0, transform: "scale(0.8)" },
                "100%": { opacity: 1, transform: "scale(1)" },
              },
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Typography>Envie sua foto de perfil</Typography>
              {preview ? (
                <Box
                  component="img"
                  src={preview}
                  sx={{ width: 120, height: 120, borderRadius: "50%" }}
                />
              ) : (
                <Button component="label" variant="outlined" color="primary">
                  Selecionar Imagem
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={pickFile}
                  />
                </Button>
              )}
              {error && <Typography color="error">{error}</Typography>}
              <Button
                onClick={uploadPhoto}
                variant="contained"
                disabled={uploading || !file}
                color="primary"
                sx={{
                  backgroundColor: "#A650F0",
                  "&:hover": { backgroundColor: "#8B3DD9" },
                }}
              >
                {uploading ? <CircularProgress size={20} /> : "Enviar Foto"}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step >= 0 && step < dataSteps.length && (
          <Button
            sx={{ m: 2 }}
            onClick={() => setStep((s) => s - 1)}
            color="primary"
          >
            Voltar
          </Button>
        )}
        {step === dataSteps.length && (
          <>
            <Button
              sx={{ m: 2 }}
              onClick={() => setStep(dataSteps.length - 1)}
              disabled={reviewLoading}
              color="primary"
            >
              Voltar
            </Button>
            <Button
              sx={{
                m: 2,
                backgroundColor: "#A650F0",
                "&:hover": { backgroundColor: "#8B3DD9" },
              }}
              onClick={handleReviewConfirm}
              variant="contained"
              disabled={reviewLoading}
              color="primary"
            >
              {reviewLoading ? <CircularProgress size={20} /> : "Confirmar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProfileModal;

