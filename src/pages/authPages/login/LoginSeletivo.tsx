/*
 * PÁGINA DE LOGIN DO PROJETO NEW-PD-SELETIVO
 * Este arquivo contém o código da página de login do projeto new-pd-seletivo
 * Mantido comentado para referência futura
 */

/*
import React, { useState } from 'react'
import { Box, TextField, Button, Alert, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material'
import AuthCard from '../../components/ui/cards/AuthCard'
import AuthPromotionalSection from '../../components/auth/SideAuthSection'
import { getAuthTextFieldStyles } from '../../components/auth/authTextFieldStyles'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { APP_ROUTES } from '../../util/constants'
import { applyCpfMask, removeCpfMask } from '../../util/masks'

export default function Login() {
  const theme = useTheme()
  const { login, loading, error } = useAuth()
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

    try {
      // Por enquanto, usando email como cpf até atualizar o backend
      await login({ email: cpfNumbers, password })
      navigate(APP_ROUTES.HOME)
    } catch (err: any) {
      setFormError(err.message || 'Erro ao fazer login')
    }
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
            <Typography variant="body2" align="center" sx={{ mt: 2, color: theme.palette.text.primary }}>
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
          </form>
        </AuthCard>
      </Box>
    </Box>
  )
}
*/

// Arquivo mantido apenas para referência - código comentado acima

