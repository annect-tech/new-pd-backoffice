import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
  Box,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { formatCpf, formatPatrimony } from "../../util/formatters";
import { VALIDATION_PATTERNS } from "../../util/constants";
import { designSystem } from "../../styles/designSystem";
import { usersService, type UserResponse } from "../../core/http/services/usersService";

interface CreateProfilePayload {
  cpf: string;
  personal_email: string;
  bio?: string;
  birth_date: string;
  hire_date: string;
  occupation: string;
  department: string;
  equipment_patrimony: string;
  work_location: string;
  manager: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  onCreateProfile: (payload: CreateProfilePayload, userId: number) => Promise<void>;
  onClose: () => void;
}

const CreateProfileForOtherUserModal: React.FC<Props> = ({
  open,
  loading,
  onCreateProfile,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateProfilePayload>({
    cpf: "",
    personal_email: "",
    bio: "",
    birth_date: "",
    hire_date: "",
    occupation: "",
    department: "",
    equipment_patrimony: "",
    work_location: "",
    manager: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateProfilePayload, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [useNotebook, setUseNotebook] = useState<"yes" | "no" | null>(null);
  const [notebookVal, setNotebookVal] = useState("");

  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserResponse | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        cpf: "",
        personal_email: "",
        bio: "",
        birth_date: "",
        hire_date: "",
        occupation: "",
        department: "",
        equipment_patrimony: "",
        work_location: "",
        manager: "",
      });
      setErrors({});
      setFormError(null);
      setUseNotebook(null);
      setNotebookVal("");
    }
  }, [open]);

  useEffect(() => {
    if (!foundUser) return;

    setFormData((prev) => ({
      ...prev,

      cpf: foundUser.cpf ? formatCpf(foundUser.cpf) : "",
      personal_email: foundUser.email || "",
      birth_date: foundUser.birth_date
        ? new Date(foundUser.birth_date).toISOString().split("T")[0]
        : "",

      occupation: prev.occupation || "Não informado",
      department: prev.department || "Não informado",
      work_location: prev.work_location || "Não informado",
      manager: prev.manager || "Não informado",
      bio: prev.bio || "Não informado",
    }));

    setErrors({});
    setFormError(null);
  }, [foundUser]);

  const handleSearchUser = async () => {
  if (!VALIDATION_PATTERNS.EMAIL.test(searchEmail)) {
    setUserSearchError("Informe um e-mail válido");
    return;
  }

  try {
    setSearchingUser(true);
    setUserSearchError(null);
    setFoundUser(null);

    const response = await usersService.listUsers(1, 10, searchEmail);

    const user = response.data?.data[0];

    if (!user) {
      setUserSearchError("Usuário não encontrado");
      return;
    }

    setFoundUser(user);
    console.log({user})
  } catch {
    setUserSearchError("Erro ao buscar usuário");
  } finally {
    setSearchingUser(false);
  }
};

  const handleChange =
    (field: keyof CreateProfilePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = e.target.value;

      if (field === "cpf") {
        value = formatCpf(value);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFormError(null);
    };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!VALIDATION_PATTERNS.CPF.test(formData.cpf)) {
      newErrors.cpf = "CPF inválido (000.000.000-00)";
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(formData.personal_email)) {
      newErrors.personal_email = "E-mail inválido";
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "Data de nascimento obrigatória";
    }

    if (!formData.occupation) {
      newErrors.occupation = "Cargo obrigatório";
    }

    if (!formData.department) {
      newErrors.department = "Departamento obrigatório";
    }

    if (!formData.work_location) {
      newErrors.work_location = "Local de trabalho obrigatório";
    }

    if (!formData.manager) {
      newErrors.manager = "Gestor obrigatório";
    }

    if (!useNotebook) {
      newErrors.equipment_patrimony = "Informe se usa notebook";
    } else if (useNotebook === "yes" && !/^\d{4,6}$/.test(notebookVal)) {
      newErrors.equipment_patrimony = "Patrimônio deve ter 4 a 6 dígitos";
    }

    if (!foundUser) {
      setFormError("Busque e selecione um usuário antes de continuar");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload: CreateProfilePayload = {
        ...formData,
        equipment_patrimony:
          useNotebook === "no"
            ? "Não usa notebook da empresa"
            : notebookVal,
      };

      if (!foundUser) return;
      await onCreateProfile(payload, foundUser.id);

      onClose();
    } catch (err: any) {
      setFormError(err?.message || "Erro ao criar perfil");
    }
  };

  const tooltipContent = (
    <Box>
      <Typography fontSize={13}>
        Patrimônio é o número de identificação do notebook da empresa.
      </Typography>
      <Typography variant="caption">Exemplo: 123456</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
          borderBottom: `1px solid ${designSystem.colors.border.main}`,
        }}
      >
        Criar Perfil para Usuário
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={500}>Usuário</Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField
                label="E-mail do usuário"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                error={!!userSearchError}
                helperText={userSearchError}
                fullWidth
              />

              <Button
                variant="outlined"
                onClick={handleSearchUser}
                disabled={searchingUser}
                sx={{ whiteSpace: "nowrap" }}
              >
                {searchingUser ? <CircularProgress size={18} /> : "Buscar"}
              </Button>
            </Box>

            {foundUser && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Usuário encontrado:{" "}
                <strong>
                  {foundUser.first_name} {foundUser.last_name}
                </strong>{" "}
                ({foundUser.email})
              </Alert>
            )}
          </Box>

          <TextField
            label="CPF"
            value={formData.cpf}
            onChange={handleChange("cpf")}
            error={!!errors.cpf}
            helperText={errors.cpf}
            inputProps={{ maxLength: 14 }}
            fullWidth
          />

          <TextField
            label="E-mail Pessoal"
            value={formData.personal_email}
            onChange={handleChange("personal_email")}
            error={!!errors.personal_email}
            helperText={errors.personal_email}
            fullWidth
          />

          <TextField
            label="Biografia"
            multiline
            minRows={3}
            value={formData.bio}
            onChange={handleChange("bio")}
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Data de Nascimento"
              type="date"
              value={formData.birth_date}
              onChange={handleChange("birth_date")}
              error={!!errors.birth_date}
              helperText={errors.birth_date}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Data de Contratação (opcional)"
              type="date"
              value={formData.hire_date}
              onChange={handleChange("hire_date")}
              error={!!errors.hire_date}
              helperText={errors.hire_date}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <TextField
            label="Cargo"
            value={formData.occupation}
            onChange={handleChange("occupation")}
            error={!!errors.occupation}
            helperText={errors.occupation}
            fullWidth
          />

          <TextField
            label="Departamento"
            value={formData.department}
            onChange={handleChange("department")}
            error={!!errors.department}
            helperText={errors.department}
            fullWidth
          />

          <TextField
            label="Local de Trabalho"
            value={formData.work_location}
            onChange={handleChange("work_location")}
            error={!!errors.work_location}
            helperText={errors.work_location}
            fullWidth
          />

          <TextField
            label="Gestor"
            value={formData.manager}
            onChange={handleChange("manager")}
            error={!!errors.manager}
            helperText={errors.manager}
            fullWidth
          />

          <Box>
            <Typography>Usa notebook da empresa?</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant={useNotebook === "yes" ? "contained" : "outlined"}
                onClick={() => setUseNotebook("yes")}
              >
                Sim
              </Button>
              <Button
                variant={useNotebook === "no" ? "contained" : "outlined"}
                onClick={() => setUseNotebook("no")}
              >
                Não
              </Button>
            </Box>

            {errors.equipment_patrimony && !useNotebook && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
                {errors.equipment_patrimony}
              </Typography>
            )}


            {useNotebook === "yes" && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <TextField
                  label="Patrimônio"
                  value={notebookVal}
                  onChange={(e) =>
                    setNotebookVal(formatPatrimony(e.target.value))
                  }
                  error={!!errors.equipment_patrimony}
                  helperText={errors.equipment_patrimony}
                  inputProps={{ maxLength: 6 }}
                  fullWidth
                />
                <Tooltip title={tooltipContent} arrow>
                  <IconButton>
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: designSystem.colors.primary.main,
            "&:hover": {
              backgroundColor: designSystem.colors.primary.dark,
            },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Criar Perfil"}
        </Button>
      </DialogActions>

      {formError && (
        <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
          {formError}
        </Alert>
      )}
    </Dialog>
  );
};

export default CreateProfileForOtherUserModal;