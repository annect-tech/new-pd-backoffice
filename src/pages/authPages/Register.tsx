import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, Link } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { APP_ROUTES } from '../../util/constants'
import AuthPromotionalSection from '../../components/auth/SideAuthSection'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (password !== password2) {
      setFormError('As senhas não coincidem')
      return
    }
    try {
      await register({ first_name: firstName, last_name: lastName, email, password, password2 })
      navigate(APP_ROUTES.LOGIN)
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar')
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
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
              Criar conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha os dados para começar
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

            {/* Nome e Sobrenome */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
              <TextField
                label="Nome"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                fullWidth
                required
                autoFocus
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: '#fafafa',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                    '&.Mui-focused': {
                      bgcolor: '#fff',
                    },
                  },
                }}
              />
              <TextField
                label="Sobrenome"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: '#fafafa',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                    '&.Mui-focused': {
                      bgcolor: '#fff',
                    },
                  },
                }}
              />
            </Box>

            {/* E-mail */}
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  },
                },
              }}
            />

            {/* Senha */}
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(v => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirmar senha */}
            <TextField
              label="Confirmar senha"
              type={showPassword2 ? 'text' : 'password'}
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword2(v => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword2 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Botão de cadastro */}
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
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </Button>

            {/* Link para login */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate(APP_ROUTES.LOGIN)}
                  underline="none"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Entrar
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
