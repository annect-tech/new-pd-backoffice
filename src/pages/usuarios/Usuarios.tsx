import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Fade,
  TextField,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  progressStyles,
} from "../../styles/designSystem";

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
    profile_photo: "https://i.pravatar.cc/150?img=1",
    user_display: {
      first_name: "João",
      last_name: "Silva",
      email: "joao.silva@example.com",
      username: "joao.silva",
    },
  },
  {
    id: 2,
    profile_photo: "https://i.pravatar.cc/150?img=2",
    user_display: {
      first_name: "Maria",
      last_name: "Santos",
      email: "maria.santos@example.com",
      username: "maria.santos",
    },
  },
  {
    id: 3,
    profile_photo: "https://i.pravatar.cc/150?img=3",
    user_display: {
      first_name: "Pedro",
      last_name: "Oliveira",
      email: "pedro.oliveira@example.com",
      username: "pedro.oliveira",
    },
  },
  {
    id: 4,
    profile_photo: "https://i.pravatar.cc/150?img=4",
    user_display: {
      first_name: "Ana",
      last_name: "Costa",
      email: "ana.costa@example.com",
      username: "ana.costa",
    },
  },
  {
    id: 5,
    profile_photo: "https://i.pravatar.cc/150?img=5",
    user_display: {
      first_name: "Carlos",
      last_name: "Ferreira",
      email: "carlos.ferreira@example.com",
      username: "carlos.ferreira",
    },
  },
  {
    id: 6,
    profile_photo: "https://i.pravatar.cc/150?img=6",
    user_display: {
      first_name: "Juliana",
      last_name: "Almeida",
      email: "juliana.almeida@example.com",
      username: "juliana.almeida",
    },
  },
];

export default function UserList() {
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    // Simula carregamento de dados
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 500);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.user_display.first_name} ${user.user_display.last_name}`.toLowerCase();
    const email = user.user_display.email.toLowerCase();
    const username = user.user_display.username?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || username.includes(search);
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Conteúdo Principal */}
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
          {/* Header da Página */}
          <PageHeader
            title="Usuários"
            subtitle="Gerencie os perfis de usuários do sistema."
            description="Esta página permite visualizar todos os usuários cadastrados no sistema. Você pode ver os perfis completos, editar informações e pesquisar por nome, email ou username."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Usuários" },
            ]}
          />

          {/* Container de Conteúdo */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              {/* Toolbar de Pesquisa */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  p: 3,
                  backgroundColor: designSystem.colors.background.primary,
                  borderBottom: `1px solid ${designSystem.colors.border.main}`,
                }}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por nome, email ou username..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottomColor: designSystem.colors.border.light,
                      },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: designSystem.colors.border.dark,
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: designSystem.colors.primary.main,
                      },
                      "& input": {
                        color: designSystem.colors.text.primary,
                      },
                    }}
                  />
                </Box>
                <IconButton
                  onClick={fetchUsers}
                  sx={{
                    color: designSystem.colors.text.disabled,
                    "&:hover": {
                      backgroundColor: designSystem.colors.primary.lightest,
                      color: designSystem.colors.primary.main,
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Lista de Usuários */}
              <Box sx={{ p: 3 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress {...progressStyles} />
                  </Box>
                ) : filteredUsers.length === 0 ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <Typography color={designSystem.colors.text.disabled} fontSize="0.95rem">
                      {searchTerm
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário disponível"}
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {filteredUsers.map((user) => (
                      <Paper
                        key={user.id}
                        elevation={0}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: 2.5,
                          borderRadius: 2,
                          backgroundColor: designSystem.colors.background.secondary,
                          border: `1px solid ${designSystem.colors.border.main}`,
                          transition: `all ${designSystem.transitions.fast}`,
                          "&:hover": {
                            backgroundColor: designSystem.colors.primary.lightest,
                            borderColor: designSystem.colors.primary.main,
                            boxShadow: designSystem.shadows.small,
                          },
                        }}
                      >
                        <Avatar
                          src={user.profile_photo}
                          alt={user.user_display.first_name}
                          sx={{
                            width: 64,
                            height: 64,
                            marginRight: 3,
                            border: `3px solid ${designSystem.colors.background.primary}`,
                            boxShadow: designSystem.shadows.small,
                          }}
                        />
                        <Box flex={1} minWidth={0}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color={designSystem.colors.text.primary}
                            noWrap
                            sx={{ fontSize: "1.1rem" }}
                          >
                            {user.user_display.first_name} {user.user_display.last_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={designSystem.colors.text.disabled}
                            noWrap
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {user.user_display.email}
                          </Typography>
                          {user.user_display.username && (
                            <Typography
                              variant="caption"
                              color={designSystem.colors.text.tertiary}
                              sx={{ fontSize: "0.8rem" }}
                            >
                              @{user.user_display.username}
                            </Typography>
                          )}
                        </Box>
                        <Box display="flex" gap={1.5}>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/usuario/${user.id}`)}
                            sx={{
                              borderColor: designSystem.colors.primary.main,
                              color: designSystem.colors.primary.main,
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              "&:hover": {
                                borderColor: designSystem.colors.primary.dark,
                                backgroundColor: designSystem.colors.primary.lightest,
                              },
                            }}
                          >
                            Ver Perfil
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => navigate(`/usuario/${user.id}/editar`)}
                            sx={{
                              backgroundColor: designSystem.colors.primary.main,
                              color: "#FFFFFF",
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              "&:hover": {
                                backgroundColor: designSystem.colors.primary.dark,
                              },
                            }}
                          >
                            Editar
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
