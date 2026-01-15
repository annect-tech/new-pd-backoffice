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
import { useMyProfile } from '../../hooks/useUsers';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/ui/page/PageHeader';
import type { UserProfilePayload } from '../../interfaces/profile';

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
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError, fetchMyProfile } = useMyProfile();
  const { updateProfile, uploadPhoto, snackbar: profileSnackbar, closeSnackbar: closeProfileSnackbar } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
    console.log("[MeuPerfil] User do contexto:", user);
    console.log("[MeuPerfil] User ID:", user?.id);
    
    if (user?.id) {
      console.log("[MeuPerfil] Buscando perfil para userId:", user.id);
      fetchMyProfile(user.id);
    } else {
      console.log("[MeuPerfil] User ID não disponível");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        first_name: profile.user_display?.first_name || '',
        last_name: profile.user_display?.last_name || '',
        cpf: profile.cpf || '',
        personal_email: profile.personal_email || '',
        birth_date: profile.birth_date ? profile.birth_date.split('T')[0] : '',
        hire_date: profile.hire_date ? profile.hire_date.split('T')[0] : '',
        occupation: profile.occupation || '',
        department: profile.department || '',
        equipment_patrimony: '',
        work_location: profile.work_location || '',
        manager: profile.manager || '',
        profile_photo: profile.profile_photo || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setUploadingPhoto(true);
    try {
      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_photo: reader.result as string }));
      };
      reader.readAsDataURL(file);

      // Upload real para API
      const url = await uploadPhoto(profile.id, file);
      if (url) {
        setFormData((prev) => ({ ...prev, profile_photo: url }));
        setSnackbar({
          open: true,
          message: 'Foto atualizada com sucesso!',
          severity: 'success',
        });
        // Recarregar perfil para obter URL atualizada
        if (user?.id) {
          await fetchMyProfile(user.id);
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao fazer upload da foto. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        first_name: profile.user_display?.first_name || '',
        last_name: profile.user_display?.last_name || '',
        cpf: profile.cpf || '',
        personal_email: profile.personal_email || '',
        birth_date: profile.birth_date ? profile.birth_date.split('T')[0] : '',
        hire_date: profile.hire_date ? profile.hire_date.split('T')[0] : '',
        occupation: profile.occupation || '',
        department: profile.department || '',
        equipment_patrimony: '',
        work_location: profile.work_location || '',
        manager: profile.manager || '',
        profile_photo: profile.profile_photo || '',
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    if (!profile?.id) {
      setSnackbar({
        open: true,
        message: 'Perfil não encontrado.',
        severity: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      // Preparar payload para atualização
      const payload: UserProfilePayload = {
        bio: formData.bio || undefined,
        personal_email: formData.personal_email || undefined,
        birth_date: formData.birth_date || undefined,
        hire_date: formData.hire_date || undefined,
        occupation: formData.occupation || undefined,
        department: formData.department || undefined,
        equipment_patrimony: formData.equipment_patrimony || undefined,
        work_location: formData.work_location || undefined,
        manager: formData.manager || undefined,
      };

      // Remover campos vazios
      Object.keys(payload).forEach((key) => {
        const value = payload[key as keyof UserProfilePayload];
        if (value === '' || value === null || value === undefined) {
          delete payload[key as keyof UserProfilePayload];
        }
      });

      // Atualizar perfil via API
      const success = await updateProfile(profile.id, payload);

      if (success) {
        setSnackbar({
          open: true,
          message: 'Perfil atualizado com sucesso!',
          severity: 'success',
        });

        // Recarrega o perfil após salvar
        if (user?.id) {
          await fetchMyProfile(user.id);
        }

        setEditing(false);
      } else {
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar perfil. Tente novamente.',
          severity: 'error',
        });
      }
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

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (profileError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Meu Perfil"
            subtitle="Visualize e edite suas informações pessoais."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Meu Perfil" },
            ]}
          />
          <Alert severity="error" sx={{ mb: 2 }}>
            {profileError}
          </Alert>
          <Button variant="contained" onClick={() => user?.id && fetchMyProfile(user.id)}>
            Tentar novamente
          </Button>
        </Box>
      </Box>
    );
  }

  // Se não há perfil mas também não há erro, significa que o usuário ainda não tem perfil criado
  if (!profile && !profileLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <PageHeader
            title="Meu Perfil"
            subtitle="Visualize e edite suas informações pessoais."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Meu Perfil" },
            ]}
          />
          <Alert severity="info" sx={{ mb: 2 }}>
            Você ainda não possui um perfil cadastrado. Entre em contato com o administrador para criar seu perfil.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              User ID: {user?.id || "Não disponível"}
            </Typography>
            <Button variant="outlined" onClick={() => user?.id && fetchMyProfile(user.id)} sx={{ mt: 2 }}>
              Recarregar
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const username = profile.user_display?.username || user?.email || 'Usuário';

  const details = [
    { label: 'Bio', field: 'bio', value: editing ? formData.bio : profile.bio, type: 'textarea' },
    { label: 'Nome', field: 'name', value: editing ? `${formData.first_name} ${formData.last_name}` : `${profile.user_display?.first_name || ''} ${profile.user_display?.last_name || ''}`.trim() || '—', type: 'text' },
    { label: 'CPF', field: 'cpf', value: editing ? formData.cpf : profile.cpf || '—', type: 'text' },
    { label: 'E-mail', field: 'personal_email', value: editing ? formData.personal_email : profile.personal_email || profile.user_display?.email || '—', type: 'email' },
    { label: 'Nascimento', field: 'birth_date', value: editing ? formData.birth_date : (profile.birth_date ? formatDate(profile.birth_date) : '—'), type: 'date' },
    { label: 'Contratação', field: 'hire_date', value: editing ? formData.hire_date : (profile.hire_date ? formatDate(profile.hire_date) : '—'), type: 'date' },
    { label: 'Cargo', field: 'occupation', value: editing ? formData.occupation : profile.occupation || '—', type: 'text' },
    { label: 'Departamento', field: 'department', value: editing ? formData.department : profile.department || '—', type: 'text' },
    { label: 'Patrimônio', field: 'equipment_patrimony', value: editing ? formData.equipment_patrimony : '—', type: 'text' },
    { label: 'Local de trabalho', field: 'work_location', value: editing ? formData.work_location : profile.work_location || '—', type: 'text' },
    { label: 'Gestor', field: 'manager', value: editing ? formData.manager : profile.manager || '—', type: 'text' },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <PageHeader
            title="Meu Perfil"
            subtitle="Visualize e edite suas informações pessoais."
            description="Gerencie suas informações de perfil, incluindo dados pessoais, profissionais e configurações da conta."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Meu Perfil" },
            ]}
          />

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
                src={editing ? formData.profile_photo : profile.profile_photo}
                sx={{
                  width: 140,
                  height: 140,
                  border: '5px solid #fff',
                  position: 'absolute',
                  bottom: -70,
                  left: theme.spacing(5),
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
              >
                {!profile.profile_photo && (profile.user_display?.first_name?.[0] || username[0] || 'U')}
              </Avatar>
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
                {profile.created_at && (
                  <Typography variant="body1" color="text.secondary" mt={1}>
                    Membro desde {formatDate(profile.created_at)}
                  </Typography>
                )}
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
                    disabled={saving || uploadingPhoto}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#A650F0',
                      '&:hover': { backgroundColor: '#8B3DD9' },
                    }}
                  >
                    {saving || uploadingPhoto ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
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
      </Box>
      </Box>

      {/* Snackbar local */}
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

      {/* Snackbar do hook useUserProfile */}
      <Snackbar
        open={profileSnackbar.open}
        autoHideDuration={3000}
        onClose={closeProfileSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeProfileSnackbar}
          severity={profileSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {profileSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeuPerfil;

