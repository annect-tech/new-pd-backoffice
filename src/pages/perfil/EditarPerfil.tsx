import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import { APP_ROUTES } from '../../util/constants';

interface UserProfile {
  id: number;
  profile_photo?: string;
  bio?: string;
  cpf: string;
  personal_email: string;
  birth_date: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
  created_at: string;
  user_display: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Dados mockados
const MOCK_PROFILE: UserProfile = {
  id: 1,
  profile_photo: 'https://i.pravatar.cc/150?img=1',
  bio: 'Profissional dedicado com experiência em gestão de projetos e desenvolvimento de equipes. Apaixonado por tecnologia e inovação.',
  cpf: '123.456.789-00',
  personal_email: 'usuario@example.com',
  birth_date: '1990-05-15',
  hire_date: '2020-01-10',
  occupation: 'Desenvolvedor Full Stack',
  department: 'Tecnologia',
  equipment_patrimony: 'EQ-2020-001',
  work_location: 'Escritório Central',
  manager: 'João Silva',
  created_at: '2020-01-10T10:00:00Z',
  user_display: {
    username: 'usuario.teste',
    first_name: 'João',
    last_name: 'Silva',
    email: 'usuario@example.com',
  },
};

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    bio: '',
    first_name: '',
    last_name: '',
    cpf: '',
    personal_email: '',
    birth_date: '',
    hire_date: '',
    occupation: '',
    department: '',
    equipment_patrimony: '',
    work_location: '',
    manager: '',
    profile_photo: '',
  });

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setFormData({
        bio: MOCK_PROFILE.bio || '',
        first_name: MOCK_PROFILE.user_display.first_name,
        last_name: MOCK_PROFILE.user_display.last_name,
        cpf: MOCK_PROFILE.cpf,
        personal_email: MOCK_PROFILE.personal_email,
        birth_date: MOCK_PROFILE.birth_date,
        hire_date: MOCK_PROFILE.hire_date || '',
        occupation: MOCK_PROFILE.occupation || '',
        department: MOCK_PROFILE.department || '',
        equipment_patrimony: MOCK_PROFILE.equipment_patrimony || '',
        work_location: MOCK_PROFILE.work_location || '',
        manager: MOCK_PROFILE.manager || '',
        profile_photo: MOCK_PROFILE.profile_photo || '',
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simula salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success',
      });

      setTimeout(() => {
        navigate(`/usuario/${id}`);
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* Breadcrumb */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            color: '#A650F0',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.USERS_LIST)}
          sx={{
            color: '#A650F0',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Usuários
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/usuario/${id}`)}
          sx={{
            color: '#A650F0',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Perfil
        </Link>
        <Typography color="text.primary">Editar Perfil</Typography>
      </Breadcrumbs>

      {/* Título */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#A650F0',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Editar Perfil
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: '#F3E5F5',
            borderRadius: 2,
            borderLeft: '4px solid #A650F0',
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Editar Perfil</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atualize as informações do seu perfil. Os campos marcados com * são obrigatórios.
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '75vw',
            maxWidth: 1000,
            padding: 4,
            borderRadius: 3,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Foto de Perfil */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                src={formData.profile_photo}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: '3px solid #A650F0',
                }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    backgroundColor: '#A650F0',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#8B3DD9',
                    },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Clique para alterar a foto
              </Typography>
            </Box>

            {/* Bio */}
            <TextField
              label="Bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#A650F0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#A650F0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#A650F0',
                },
              }}
            />

            {/* Nome */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nome"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
              <TextField
                label="Sobrenome"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
            </Box>

            {/* CPF e E-mail */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
              <TextField
                label="E-mail"
                type="email"
                value={formData.personal_email}
                onChange={(e) => handleChange('personal_email', e.target.value)}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
            </Box>

            {/* Datas */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Data de Nascimento"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
              <TextField
                label="Data de Contratação"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleChange('hire_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
            </Box>

            {/* Cargo e Departamento */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Cargo"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
              <TextField
                label="Departamento"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
            </Box>

            {/* Patrimônio e Local de Trabalho */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Patrimônio"
                value={formData.equipment_patrimony}
                onChange={(e) => handleChange('equipment_patrimony', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
              <TextField
                label="Local de Trabalho"
                value={formData.work_location}
                onChange={(e) => handleChange('work_location', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#A650F0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A650F0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#A650F0',
                  },
                }}
              />
            </Box>

            {/* Gestor */}
            <TextField
              label="Gestor"
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#A650F0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#A650F0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#A650F0',
                },
              }}
            />

            {/* Botões */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/usuario/${id}`)}
                sx={{
                  color: '#A650F0',
                  borderColor: '#A650F0',
                  '&:hover': {
                    borderColor: '#8B3DD9',
                    backgroundColor: 'rgba(166, 80, 240, 0.04)',
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  backgroundColor: '#A650F0',
                  '&:hover': {
                    backgroundColor: '#8B3DD9',
                  },
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditarPerfil;

