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
import { applyPhoneMask, removePhoneMask, applyDateMask } from "../../util/masks";

interface CreateUserModalProps {
  open: boolean;
  loading: boolean;
  onCreateUser: (payload: CreateUserPayload) => Promise<void>;
  onClose: () => void;
}

// Tipo local que inclui birth_date para o formulário
interface CreateUserFormData extends Omit<CreateUserPayload, 'birth_date'> {
  birth_date: string;
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
    cellphone: "",
    birth_date: "",
  });
  
  // Estado separado para exibição da data (DD/MM/YYYY)
  const [birthDateDisplay, setBirthDateDisplay] = useState("");
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
        cellphone: "",
        birth_date: "",
      } as CreateUserFormData);
      setBirthDateDisplay("");
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
    
    // Apply phone mask
    if (field === "cellphone") {
      value = applyPhoneMask(value);
    }
    
    // Apply date mask for display
    if (field === "birth_date") {
      value = applyDateMask(value);
      setBirthDateDisplay(value);
      // Atualizar formData com o valor formatado (mantém o formato DD/MM/YYYY)
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFormError(null);
      return;
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

    if (!formData.cellphone || !formData.cellphone.trim()) {
      newErrors.cellphone = "Celular é obrigatório";
    } else {
      const phoneNumbers = removePhoneMask(formData.cellphone);
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.cellphone = "Celular deve ter 10 ou 11 dígitos";
      }
    }

    // Validar data usando birthDateDisplay que é o valor exibido
    const dateToValidate = (birthDateDisplay || formData.birth_date || "").trim();
    if (!dateToValidate || dateToValidate.length === 0) {
      newErrors.birth_date = "Data de nascimento é obrigatória";
    } else if (dateToValidate.length < 10) {
      newErrors.birth_date = "A data deve estar no formato DD/MM/YYYY ou DD-MM-YYYY";
    } else {
      // Validar formato DD/MM/YYYY ou DD-MM-YYYY
      const datePattern = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
      if (!datePattern.test(dateToValidate)) {
        newErrors.birth_date = "A data deve estar no formato DD/MM/YYYY ou DD-MM-YYYY";
      } else {
        // Validar se a data é válida
        const parts = dateToValidate.match(datePattern);
        if (parts) {
          const [, day, month, year] = parts;
          const dayNum = parseInt(day, 10);
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);
          
          if (monthNum < 1 || monthNum > 12) {
            newErrors.birth_date = "Mês inválido";
          } else if (dayNum < 1 || dayNum > 31) {
            newErrors.birth_date = "Dia inválido";
          } else if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
            newErrors.birth_date = "Ano inválido";
          }
        }
      }
    }

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
      // Usar birthDateDisplay que já está formatado (DD/MM/YYYY)
      let dateValue = (birthDateDisplay || formData.birth_date || "").trim();
      
      // Validar se a data foi preenchida
      if (!dateValue || dateValue.length < 10) {
        setFormError("Data de nascimento é obrigatória e deve estar no formato DD/MM/YYYY");
        setErrors((prev) => ({ ...prev, birth_date: "Data de nascimento é obrigatória" }));
        return;
      }
      
      // Converter de DD/MM/YYYY para DD-MM-YYYY
      let formattedBirthDate = dateValue;
      if (formattedBirthDate.includes('/')) {
        formattedBirthDate = formattedBirthDate.replace(/\//g, '-');
      }
      
      // Garantir que está no formato DD-MM-YYYY (10 caracteres)
      if (formattedBirthDate.length !== 10 || !/^\d{2}-\d{2}-\d{4}$/.test(formattedBirthDate)) {
        setFormError("A data deve estar no formato DD/MM/YYYY");
        setErrors((prev) => ({ ...prev, birth_date: "A data deve estar no formato DD/MM/YYYY ou DD-MM-YYYY" }));
        return;
      }
      
      // Preparar payload - garantir que todos os campos obrigatórios estão presentes
      const payload: CreateUserPayload = {
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        cpf: removeCpfMask(formData.cpf),
        password: formData.password,
        tenant_city_id: formData.tenant_city_id,
        cellphone: removePhoneMask(formData.cellphone), // Enviar apenas números como string
        birth_date: formattedBirthDate, // Enviar no formato DD-MM-YYYY (ex: "01-01-2000")
        // social_name é opcional, só incluir se não estiver vazio
        ...(formData.social_name?.trim() && {
          social_name: formData.social_name.trim(),
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
                value={birthDateDisplay}
                onChange={handleChange("birth_date")}
                error={!!errors.birth_date}
                helperText={errors.birth_date || "Formato: DD/MM/YYYY"}
                required
                fullWidth
                disabled={loading}
                placeholder="DD/MM/YYYY"
                inputProps={{ maxLength: 10 }}
              />
            </Box>

            <TextField
              label="Celular"
              name="cellphone"
              value={formData.cellphone}
              onChange={handleChange("cellphone")}
              error={!!errors.cellphone}
              helperText={errors.cellphone || "Formato: (00) 00000-0000"}
              required
              fullWidth
              disabled={loading}
              placeholder="(00) 00000-0000"
              inputProps={{ maxLength: 15 }}
            />

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
