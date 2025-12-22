import React, { useState } from 'react'
import { Box, TextField, Button, Alert, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material'
import AuthCard from '../../../components/geralComponents/AuthCard'
import AuthPromotionalSection from '../../../components/auth/SideAuthSection'
import { getAuthTextFieldStyles } from '../../../components/auth/authTextFieldStyles'
import { useAuth } from '../../../hooks/useAuth'
import { useAuthContext } from '../../../app/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { APP_ROUTES } from '../../../util/constants'
import { applyCpfMask, removeCpfMask } from '../../../util/masks'

export default function Login() {
  const theme = useTheme()
  const { login, loading, error } = useAuth()
  const { setCredentials } = useAuthContext()
  const navigate = useNavigate()
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCpfMask(e.target.value)
    setCpf(maskedValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    const cpfNumbers = removeCpfMask(cpf)
    if (cpfNumbers.length !== 11) {
      setFormError('CPF inválido')
      return
    }

    if (!password) {
      setFormError('Senha é obrigatória')
      return
    }

    try {
      // Usa CPF sem máscara como credential (mesma lógica do new-pd-seletivo)
      await login({ credential: cpfNumbers, password })
      navigate(APP_ROUTES.HOME)
    } catch (err: any) {
      setFormError(err.message || 'Erro ao fazer login')
    }
  }

  const handleAutoLogin = () => {
    setFormError(null)
    // Autenticação automática sem backend - apenas para acessar o sistema
    // Define tokens mockados para passar pelo AuthMiddleware sem fazer login real
    const mockAccessToken = 'mock-access-token-bypass-' + Date.now()
    const mockRefreshToken = 'mock-refresh-token-bypass-' + Date.now()
    
    // Define as credenciais mockadas diretamente
    setCredentials({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: {
        id: 1,
        first_name: 'Usuário',
        last_name: 'Teste',
        email: 'usuario.teste@example.com',
        role: 'admin'
      }
    })
    
    // Navega imediatamente - o AuthMiddleware verificará o token no próximo render
    navigate(APP_ROUTES.HOME, { replace: true })
  }

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
          <form onSubmit={handleSubmit}>
            <TextField
              label="CPF"
              value={cpf}
              onChange={handleCpfChange}
              fullWidth
              margin="normal"
              required
              autoFocus
              placeholder="000.000.000-00"
              inputProps={{
                maxLength: 14,
              }}
              sx={getAuthTextFieldStyles(theme)}
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={getAuthTextFieldStyles(theme)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(v => !v)} 
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!formError && !password}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  sx={{
                    color: theme.palette.grey[500],
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Lembrar informações
                </Typography>
              }
              sx={{ mt: 1 }}
            />
            {(formError || error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError || error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 3, 
                mb: 1, 
                py: 1.5, 
                fontWeight: 600,
                borderRadius: 2,
                background: theme.palette.primary.main
              }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                Não tem conta?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate(APP_ROUTES.REGISTER)}
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
                  CADASTRAR
                </Button>
              </Typography>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleAutoLogin}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Entrar Automaticamente
              </Button>
            </Box>
          </form>
        </AuthCard>
      </Box>
    </Box>
  )
}
