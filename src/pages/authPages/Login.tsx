import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material'
import AuthCard from '../../components/ui/cards/AuthCard'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { APP_ROUTES } from '../../util/constants'

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
    <Box>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
        }}
      >
       
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <AuthCard>
          <Typography variant="h5" fontWeight={700} mb={2} align="center">
            Entrar na plataforma
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email, CPF ou Username"
              type="text"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              helperText="Você pode usar email, CPF ou username para entrar"
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {(formError || error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError || error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, mb: 1, py: 1.5, fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            {/* Registro removido - não existe no backend */}
            {/* Apenas administradores podem criar usuários */}
          </form>
        </AuthCard>
      </Box>
    </Box>
  )
}