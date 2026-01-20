import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { designSystem } from "../../styles/designSystem";
import { formatCpf, removeCpfMask } from "../../util/formatters";
import { VALIDATION_PATTERNS } from "../../util/constants";
import type { CreateUserPayload } from "../../core/http/services/usersService";
import { useTenantCities } from "../../hooks/useTenantCities";

interface CreateUserModalProps {
  open: boolean;
  loading: boolean;
  onCreateUser: (payload: CreateUserPayload) => Promise<void>;
  onClose: () => void;
}

// Tipo local que inclui birth_date para o formulário (mas não será enviado ao backend)
interface CreateUserFormData extends CreateUserPayload {
  birth_date?: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  loading,
  onCreateUser,
  onClose,
}) => {
  const { tenantCities, fetchTenantCities } = useTenantCities();
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: "",
    first_name: "",
    last_name: "",
    social_name: "",
    email: "",
    cpf: "",
    password: "",
    tenant_city_id: "",
    birth_date: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        social_name: "",
        email: "",
        cpf: "",
        password: "",
        tenant_city_id: "",
        birth_date: "",
      } as CreateUserFormData);
      setErrors({});
      setFormError(null);
      setShowPassword(false);
      
      // Fetch tenant cities if not already loaded
      if (tenantCities.length === 0) {
        fetchTenantCities();
      }
    }
  }, [open]);

  const handleChange = (field: keyof CreateUserFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;

    // Apply CPF mask
    if (field === "cpf") {
      value = formatCpf(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserPayload, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username é obrigatório";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Primeiro nome é obrigatório";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Último nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!VALIDATION_PATTERNS.EMAIL.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    const cpfNumbers = removeCpfMask(formData.cpf);
    if (!cpfNumbers) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumbers.length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    }

    if (!formData.tenant_city_id) {
      newErrors.tenant_city_id = "Tenant City é obrigatória";
    }

    // birth_date não é mais obrigatório (backend não aceita no CreateUser)
    // if (!formData.birth_date) {
    //   newErrors.birth_date = "Data de nascimento é obrigatória";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Remover birth_date do payload (backend não aceita esse campo no CreateUser)
      const { birth_date, ...formDataWithoutBirthDate } = formData;
      
      // Preparar payload removendo campos vazios opcionais
      const payload: CreateUserPayload = {
        username: formDataWithoutBirthDate.username,
        first_name: formDataWithoutBirthDate.first_name,
        last_name: formDataWithoutBirthDate.last_name,
        email: formDataWithoutBirthDate.email,
        cpf: removeCpfMask(formData.cpf),
        password: formDataWithoutBirthDate.password,
        tenant_city_id: formDataWithoutBirthDate.tenant_city_id,
        // social_name é opcional, só incluir se não estiver vazio
        ...(formDataWithoutBirthDate.social_name?.trim() && {
          social_name: formDataWithoutBirthDate.social_name.trim(),
        }),
      };
      
      await onCreateUser(payload);
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || "Erro ao criar usuário";
      setFormError(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: designSystem.colors.text.primary,
          borderBottom: `1px solid ${designSystem.colors.border.main}`,
          pb: 2,
        }}
      >
        Criar Novo Usuário
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange("username")}
                error={!!errors.username}
                helperText={errors.username}
                required
                fullWidth
                disabled={loading}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Primeiro Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange("first_name")}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
                fullWidth
                disabled={loading}
              />
              <TextField
                label="Último Nome"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange("last_name")}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
                fullWidth
                disabled={loading}
              />
            </Box>

            <TextField
              label="Nome Social (Opcional)"
              name="social_name"
              value={formData.social_name}
              onChange={handleChange("social_name")}
              fullWidth
              disabled={loading}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange("cpf")}
                error={!!errors.cpf}
                helperText={errors.cpf}
                required
                fullWidth
                disabled={loading}
                inputProps={{ maxLength: 14 }}
              />
              <TextField
                label="Data de Nascimento"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange("birth_date")}
                error={!!errors.birth_date}
                helperText={errors.birth_date}
                required
                fullWidth
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            <TextField
              label="Senha"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password || "Mínimo 8 caracteres"}
              required
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth required error={!!errors.tenant_city_id} disabled={loading}>
              <InputLabel>Tenant City</InputLabel>
              <Select
                value={formData.tenant_city_id}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, tenant_city_id: e.target.value }));
                  setErrors((prev) => ({ ...prev, tenant_city_id: undefined }));
                }}
                label="Tenant City"
              >
                {tenantCities.map((tenantCity) => (
                  <MenuItem key={tenantCity.id} value={tenantCity.id}>
                    {tenantCity.domain}
                  </MenuItem>
                ))}
              </Select>
              {errors.tenant_city_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.tenant_city_id}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${designSystem.colors.border.main}`,
          }}
        >
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: designSystem.colors.primary.main,
              "&:hover": {
                backgroundColor: designSystem.colors.primary.dark,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Criar Usuário"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;
