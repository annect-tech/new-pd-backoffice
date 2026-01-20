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
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { APP_ROUTES } from '../../util/constants';
import { usersService, type UserProfileResponse } from '../../core/http/services/usersService';

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

const Perfil: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) {
        setError('ID do usuário não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await usersService.getProfileById(id);
        
        if (response.status === 200 && response.data) {
          setUserProfile(response.data);
        } else {
          setError(response.message || 'Erro ao carregar perfil do usuário');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(APP_ROUTES.USERS_LIST)}>
          Voltar para lista de usuários
        </Button>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box p={2}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Perfil não encontrado
        </Alert>
        <Button variant="contained" onClick={() => navigate(APP_ROUTES.USERS_LIST)}>
          Voltar para lista de usuários
        </Button>
      </Box>
    );
  }

  const username = userProfile.user_display?.username || 'N/A';

  const details = [
    { label: 'Bio', value: userProfile.bio },
    { label: 'Nome', value: `${userProfile.user_display?.first_name || ''} ${userProfile.user_display?.last_name || ''}`.trim() || 'N/A' },
    { label: 'CPF', value: userProfile.cpf },
    { label: 'E-mail', value: userProfile.personal_email },
    { label: 'Nascimento', value: formatDate(userProfile.birth_date || '') },
    { label: 'Contratação', value: userProfile.hire_date ? formatDate(userProfile.hire_date) : '—' },
    { label: 'Cargo', value: userProfile.occupation },
    { label: 'Departamento', value: userProfile.department },
    { label: 'Patrimônio', value: userProfile.equipment_patrimony },
    { label: 'Local de trabalho', value: userProfile.work_location },
    { label: 'Gestor', value: userProfile.manager },
    { label: '', value: '' },
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
        <Typography color="text.primary">Perfil</Typography>
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
            <Avatar
              src={userProfile.profile_photo}
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
                  {userProfile.created_at && `Membro desde ${formatDate(userProfile.created_at)}`}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`${APP_ROUTES.USERS_LIST}/${id}/editar`)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#A650F0',
                  '&:hover': { backgroundColor: '#8B3DD9' },
                }}
              >
                Editar Perfil
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
              {details.map(({ label, value }, index) => (
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
              ))}
            </Box>
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
};

export default Perfil;

