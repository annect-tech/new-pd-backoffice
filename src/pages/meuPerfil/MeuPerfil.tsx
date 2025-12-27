import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  useTheme,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
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

// Dados mockados do usuário logado
const MOCK_MY_PROFILE: UserProfile = {
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const MeuPerfil: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
      setUserProfile(MOCK_MY_PROFILE);
      setFormData({
        bio: MOCK_MY_PROFILE.bio || '',
        first_name: MOCK_MY_PROFILE.user_display.first_name,
        last_name: MOCK_MY_PROFILE.user_display.last_name,
        cpf: MOCK_MY_PROFILE.cpf,
        personal_email: MOCK_MY_PROFILE.personal_email,
        birth_date: MOCK_MY_PROFILE.birth_date,
        hire_date: MOCK_MY_PROFILE.hire_date || '',
        occupation: MOCK_MY_PROFILE.occupation || '',
        department: MOCK_MY_PROFILE.department || '',
        equipment_patrimony: MOCK_MY_PROFILE.equipment_patrimony || '',
        work_location: MOCK_MY_PROFILE.work_location || '',
        manager: MOCK_MY_PROFILE.manager || '',
        profile_photo: MOCK_MY_PROFILE.profile_photo || '',
      });
      setLoading(false);
    }, 500);
  }, []);

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

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        bio: userProfile.bio || '',
        first_name: userProfile.user_display.first_name,
        last_name: userProfile.user_display.last_name,
        cpf: userProfile.cpf,
        personal_email: userProfile.personal_email,
        birth_date: userProfile.birth_date,
        hire_date: userProfile.hire_date || '',
        occupation: userProfile.occupation || '',
        department: userProfile.department || '',
        equipment_patrimony: userProfile.equipment_patrimony || '',
        work_location: userProfile.work_location || '',
        manager: userProfile.manager || '',
        profile_photo: userProfile.profile_photo || '',
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Simula salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Atualiza o perfil local
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          bio: formData.bio,
          cpf: formData.cpf,
          personal_email: formData.personal_email,
          birth_date: formData.birth_date,
          hire_date: formData.hire_date,
          occupation: formData.occupation,
          department: formData.department,
          equipment_patrimony: formData.equipment_patrimony,
          work_location: formData.work_location,
          manager: formData.manager,
          profile_photo: formData.profile_photo,
          user_display: {
            ...userProfile.user_display,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.personal_email,
          },
        });
      }

      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success',
      });

      setEditing(false);
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

  if (!userProfile) return null;

  const username = userProfile.user_display.username;

  const details = [
    { label: 'Bio', field: 'bio', value: editing ? formData.bio : userProfile.bio, type: 'textarea' },
    { label: 'Nome', field: 'name', value: editing ? `${formData.first_name} ${formData.last_name}` : `${userProfile.user_display.first_name} ${userProfile.user_display.last_name}`, type: 'text' },
    { label: 'CPF', field: 'cpf', value: editing ? formData.cpf : userProfile.cpf, type: 'text' },
    { label: 'E-mail', field: 'personal_email', value: editing ? formData.personal_email : userProfile.personal_email, type: 'email' },
    { label: 'Nascimento', field: 'birth_date', value: editing ? formData.birth_date : formatDate(userProfile.birth_date), type: 'date' },
    { label: 'Contratação', field: 'hire_date', value: editing ? formData.hire_date : (userProfile.hire_date ? formatDate(userProfile.hire_date) : '—'), type: 'date' },
    { label: 'Cargo', field: 'occupation', value: editing ? formData.occupation : userProfile.occupation, type: 'text' },
    { label: 'Departamento', field: 'department', value: editing ? formData.department : userProfile.department, type: 'text' },
    { label: 'Patrimônio', field: 'equipment_patrimony', value: editing ? formData.equipment_patrimony : userProfile.equipment_patrimony, type: 'text' },
    { label: 'Local de trabalho', field: 'work_location', value: editing ? formData.work_location : userProfile.work_location, type: 'text' },
    { label: 'Gestor', field: 'manager', value: editing ? formData.manager : userProfile.manager, type: 'text' },
  ];

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
        <Typography color="text.primary">Meu Perfil</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '75vw',
            maxWidth: 1000,
            padding: 4,
            border: '1px solid rgba(145, 150, 158, 0.5)',
            borderRadius: 5,
            backgroundColor: theme.palette.background.default,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 160,
              background: 'linear-gradient(135deg, #A650F0 0%, #8B3DD9 100%)',
              position: 'relative',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={editing ? formData.profile_photo : userProfile.profile_photo}
                sx={{
                  width: 140,
                  height: 140,
                  border: '5px solid #fff',
                  position: 'absolute',
                  bottom: -70,
                  left: theme.spacing(5),
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
              />
              {editing && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photo-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: theme.spacing(20),
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
                </>
              )}
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: 10,
              mx: 5,
              p: 3,
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 3,
              bgcolor: theme.palette.background.default,
              width: '100%',
              wordBreak: 'break-all',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#A650F0">
                  {username}
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Membro desde {formatDate(userProfile.created_at)}
                </Typography>
              </Box>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#A650F0',
                    '&:hover': { backgroundColor: '#8B3DD9' },
                  }}
                >
                  Editar Perfil
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
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
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#A650F0',
                      '&:hover': { backgroundColor: '#8B3DD9' },
                    }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
              {details.map(({ label, field, value, type }, index) => {
                if (editing && field === 'bio') {
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: '1 1 100%',
                        bgcolor: '#F3E5F5',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid #E1BEE7',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="#A650F0"
                        fontWeight="500"
                        fontSize={18}
                        mb={1}
                      >
                        {label}
                      </Typography>
                      <TextField
                        multiline
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#A650F0',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#A650F0',
                            },
                          },
                        }}
                      />
                    </Box>
                  );
                }

                if (editing && field === 'name') {
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: '1 1 30%',
                        minWidth: '200px',
                        bgcolor: '#F3E5F5',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid #E1BEE7',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="#A650F0"
                        fontWeight="500"
                        fontSize={18}
                        mb={1}
                      >
                        {label}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Nome"
                          value={formData.first_name}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          size="small"
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              '&:hover fieldset': {
                                borderColor: '#A650F0',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#A650F0',
                              },
                            },
                          }}
                        />
                        <TextField
                          label="Sobrenome"
                          value={formData.last_name}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          size="small"
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              '&:hover fieldset': {
                                borderColor: '#A650F0',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#A650F0',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  );
                }

                if (editing && ['cpf', 'personal_email', 'occupation', 'department', 'equipment_patrimony', 'work_location', 'manager'].includes(field)) {
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: '1 1 30%',
                        minWidth: '200px',
                        bgcolor: '#F3E5F5',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid #E1BEE7',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="#A650F0"
                        fontWeight="500"
                        fontSize={18}
                        mb={1}
                      >
                        {label}
                      </Typography>
                      <TextField
                        type={type}
                        value={formData[field as keyof typeof formData]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#A650F0',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#A650F0',
                            },
                          },
                        }}
                      />
                    </Box>
                  );
                }

                if (editing && ['birth_date', 'hire_date'].includes(field)) {
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: '1 1 30%',
                        minWidth: '200px',
                        bgcolor: '#F3E5F5',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid #E1BEE7',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="#A650F0"
                        fontWeight="500"
                        fontSize={18}
                        mb={1}
                      >
                        {label}
                      </Typography>
                      <TextField
                        type="date"
                        value={formData[field as keyof typeof formData]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#A650F0',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#A650F0',
                            },
                          },
                        }}
                      />
                    </Box>
                  );
                }

                // Modo visualização
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: label === 'Bio' ? '1 1 100%' : '1 1 30%',
                      minWidth: label === 'Bio' ? '100%' : '200px',
                      bgcolor: '#F3E5F5',
                      borderRadius: 2,
                      p: 1.5,
                      border: '1px solid #E1BEE7',
                    }}
                  >
                    {label && (
                      <Typography
                        variant="subtitle1"
                        color="#A650F0"
                        fontWeight="500"
                        fontSize={18}
                      >
                        {label}
                      </Typography>
                    )}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      mt={label ? 1 : 0}
                      sx={{
                        padding: '8px',
                        borderRadius: '4px',
                        fontWeight: '400',
                        wordBreak: 'break-all',
                      }}
                    >
                      {value || '—'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
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

export default MeuPerfil;

