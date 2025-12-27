import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { APP_ROUTES } from '../../util/constants';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Button,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';

// Interface baseada no código fornecido
interface UserProfileResponse {
  id: number;
  profile_photo?: string;
  user_display: {
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
  };
}

// Dados mockados
const MOCK_USERS: UserProfileResponse[] = [
  {
    id: 1,
    profile_photo: 'https://i.pravatar.cc/150?img=1',
    user_display: {
      first_name: 'João',
      last_name: 'Silva',
      email: 'joao.silva@example.com',
      username: 'joao.silva',
    },
  },
  {
    id: 2,
    profile_photo: 'https://i.pravatar.cc/150?img=2',
    user_display: {
      first_name: 'Maria',
      last_name: 'Santos',
      email: 'maria.santos@example.com',
      username: 'maria.santos',
    },
  },
  {
    id: 3,
    profile_photo: 'https://i.pravatar.cc/150?img=3',
    user_display: {
      first_name: 'Pedro',
      last_name: 'Oliveira',
      email: 'pedro.oliveira@example.com',
      username: 'pedro.oliveira',
    },
  },
  {
    id: 4,
    profile_photo: 'https://i.pravatar.cc/150?img=4',
    user_display: {
      first_name: 'Ana',
      last_name: 'Costa',
      email: 'ana.costa@example.com',
      username: 'ana.costa',
    },
  },
  {
    id: 5,
    profile_photo: 'https://i.pravatar.cc/150?img=5',
    user_display: {
      first_name: 'Carlos',
      last_name: 'Ferreira',
      email: 'carlos.ferreira@example.com',
      username: 'carlos.ferreira',
    },
  },
  {
    id: 6,
    profile_photo: 'https://i.pravatar.cc/150?img=6',
    user_display: {
      first_name: 'Juliana',
      last_name: 'Almeida',
      email: 'juliana.almeida@example.com',
      username: 'juliana.almeida',
    },
  },
];

export default function UserList() {
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 500);
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="40vh"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      elevation={2}
      sx={{
        width: '90vw',
        maxWidth: 1200,
        margin: '32px auto',
        padding: 4,
        borderRadius: 5,
        backgroundColor: theme.palette.background.default,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Box width="100%" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(APP_ROUTES.HOME)}
        >
          Voltar para Home
        </Button>
      </Box>
      <Typography variant="h4" fontWeight="bold" color="text.secondary" mb={4}>
        Lista de Perfis de Usuários
      </Typography>
      <Stack spacing={3}>
        {users.map((user) => (
          <Paper
            key={user.id}
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              borderRadius: 3,
              backgroundColor: 'lightgray',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Avatar
              src={user.profile_photo}
              alt={user.user_display.first_name}
              sx={{
                width: 72,
                height: 72,
                marginRight: 3,
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            <Box flex={1} minWidth={0}>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                noWrap
              >
                {user.user_display.first_name} {user.user_display.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.user_display.email}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/usuario/${user.id}`)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              >
                Ver Perfil
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/usuario/${user.id}/editar`)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              >
                Editar Perfil
              </Button>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
