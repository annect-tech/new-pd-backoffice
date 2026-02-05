import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Fade, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { PasswordService } from '../../core/http/services/passwordService';

interface ResetPasswordProps {
  message: string;
  credential: string;
}

interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface FieldErrors {
  code?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}


export default function ResetPassword({ message, credential }: ResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showError, setShowError] = useState('');
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    code: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const passwordType = showPassword ? 'text' : 'password';

  const fields = [
    { id: 'code', label: 'Código de Verificação', placeholder: 'Digite o código enviado', type: 'text' },
    { id: 'newPassword', label: 'Nova senha', placeholder: 'Digite sua nova senha', type: passwordType },
    { id: 'confirmNewPassword', label: 'Confirme a senha', placeholder: 'Confirme sua nova senha', type: passwordType },
  ];

  const handleChange = (id: string, value: string) => {
    setShowError('');
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateFields = (data: ResetPasswordFormData): FieldErrors => {
    const newErrors: FieldErrors = {};

    if (data.code.length !== 4) {
      newErrors.code = 'O código deve ter 4 dígitos';
    }

    if (data.newPassword.length <= 4 || data.newPassword.length > 128) {
      newErrors.newPassword = 'A senha deve ter entre 5 e 128 caracteres';
    }

    if (data.confirmNewPassword !== data.newPassword) {
      newErrors.confirmNewPassword = 'As senhas não coincidem';
    }

    return newErrors;
    };

  const resetUserPassword = async () => {
    const validationErrors = validateFields(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const response = await PasswordService.resetPassword(
        credential,
        formData.code,
        formData.newPassword,
        formData.confirmNewPassword
      );
      console.log({response})

      if (response.message === 'Senha redefinida com sucesso.') {
        //TODO: chamar a função setForgotPasswordData(null) do componente pai para voltar à exibir a tela de login.
        // Caso a message seja diferente disso, exibir no alert
        return;
      }

      setShowError(response.message);
    } catch (err: any) {
      setShowError(err.message);
    }
  };

  if (!message) {
    return (
      <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
        Por favor, insira um e-mail válido e cadastrado para recuperar sua senha.
      </Alert>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
        <Typography variant="body2" color="#0369a1" sx={{ mb: 2, fontWeight: 500 }}>
          {message}
        </Typography>

        {fields.map((field) => (
          <TextField
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            fullWidth
            value={formData[field.id as keyof typeof formData]}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={Boolean(errors[field.id as keyof FieldErrors])}
            helperText={errors[field.id as keyof FieldErrors]}
            variant="outlined"
            size="small"
            sx={{ 
              mb: 1.5,
              bgcolor: '#fff',
              '& .MuiOutlinedInput-root': { borderRadius: 1.5, color: '#000' },
            }}
            InputProps={{
              endAdornment: field.id.includes('Password') && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(v => !v)}
                    onMouseDown={e => e.preventDefault()}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    sx={{
                      color: '#374151',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="medium" />
                    ) : (
                      <Visibility fontSize="medium" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}

          />
        ))}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 1.5, textTransform: 'none', borderRadius: 1.5 }}
          onClick={() => resetUserPassword()}
        >
          Resetar Senha
        </Button>
        
        {showError.length && ( <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}> {showError} </Alert> )}
      </Box>
    </Fade>
  );
}