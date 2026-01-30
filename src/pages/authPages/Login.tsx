import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { APP_ROUTES } from '../../util/constants'
import AuthPromotionalSection from '../../components/auth/SideAuthSection'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [credential, setCredential] = useState('') // Renomeado de email
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      await login({ credential, password }) // Usar credential
      navigate(APP_ROUTES.DASHBOARD) // Redirecionar para dashboard
    } catch (err: any) {
      setFormError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* Seção promocional lateral */}
      <AuthPromotionalSection />

      {/* Seção do formulário */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: '#F8F9FA',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Título minimalista */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h4"
              fontWeight={600}
              color="#1a1a1a"
              sx={{ mb: 0.5 }}
            >
              Entrar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acesse sua conta
            </Typography>
          </Box>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {/* Mensagem de erro */}
            {(formError || error) && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 1,
                  border: '1px solid #fee',
                  bgcolor: '#fef2f2',
                }}
              >
                {formError || error}
              </Alert>
            )}

            <TextField
              label="E-mail"
              type="text"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              fullWidth
              required
              autoFocus
              variant="outlined"
              InputLabelProps={{
                sx: {
                  color: '#374151',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: 'primary.main',
                  },
                },
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                  color: '#000',
                  '& input': {
                    color: '#000',
                  },
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  },
                },
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{
                sx: {
                  color: '#374151',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: 'primary.main',
                  },
                },
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                  color: '#000',
                  '& input': {
                    color: '#000',
                  },
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
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

            {/* Link esqueci a senha */}
            {/* <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                href="#"
                underline="hover"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Esqueceu a senha?
              </Link>
            </Box> */}

            {/* Botão de login */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '0.9375rem',
                textTransform: 'none',
                borderRadius: 1.5,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            {/* Registro removido - não existe no backend */}
            {/* Apenas administradores podem criar usuários */}
          </form>
        </Box>
      </Box>
    </Box>
  )
}
