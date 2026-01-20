// src/pages/RegisterPage.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthCard from '../../../components/ui/card/AuthCard';
import AuthPromotionalSection from '../../../components/auth/SideAuthSection';
import { getAuthTextFieldStyles } from '../../../components/auth/authTextFieldStyles';
import useRegister from './register';
import { APP_ROUTES } from '../../../util/constants';

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    form,
    errors,
    showPassword,
    showPasswordConfirmation,
    setShowPassword,
    setShowPasswordConfirmation,
    handleChange,
    handleSubmit,
  } = useRegister();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <AuthPromotionalSection />
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: theme.palette.background.default,
        }}
      >
        <AuthCard>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%' }}
          >
            <Typography variant="h5" fontWeight={700} mb={2} align="center">
              Crie sua conta
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Primeiro Nome"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                sx={getAuthTextFieldStyles(theme)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Último Nome"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                sx={getAuthTextFieldStyles(theme)}
              />
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={getAuthTextFieldStyles(theme)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={
                errors.password ||
                'A senha deve ter 8+ caracteres, 1 maiúscula, 1 número e 1 especial.'
              }
              sx={getAuthTextFieldStyles(theme)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p: boolean) => !p)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Senha"
              name="passwordConfirmation"
              type={showPasswordConfirmation ? 'text' : 'password'}
              value={form.passwordConfirmation}
              onChange={handleChange}
              error={!!errors.passwordConfirmation}
              helperText={errors.passwordConfirmation}
              sx={getAuthTextFieldStyles(theme)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswordConfirmation((p: boolean) => !p)}
                      edge="end"
                      aria-label="toggle password confirmation visibility"
                    >
                      {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {(Object.keys(errors).length > 0 && Object.values(errors).some(e => e)) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {Object.values(errors).find((e): e is string => typeof e === 'string' && e.length > 0) || 'Por favor, corrija os erros no formulário'}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 1, 
                py: 1.5, 
                fontWeight: 600,
                borderRadius: 2,
                background: theme.palette.primary.main
              }}
            >
              Registrar
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2, color: theme.palette.text.primary }}>
              Já possui conta?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate(APP_ROUTES.LOGIN)}
                sx={{
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    background: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                ENTRAR
              </Button>
            </Typography>
          </Box>
        </AuthCard>
      </Box>
    </Box>
  );
};

export default RegisterPage;
