import { useState } from "react";
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
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { Search as SearchIcon, Refresh as RefreshIcon, Add as AddIcon } from "@mui/icons-material";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  progressStyles,
} from "../../styles/designSystem";
import { useUsers } from "../../hooks/useUsers";
import { useAuth } from "../../hooks/useAuth";
import CreateUserModal from "../../components/modals/CreateUserModal";
import type { CreateUserPayload } from "../../core/http/services/usersService";

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, loading, error, refetch, createUser, creating, toggleUserActive, toggling, snackbar, closeSnackbar } = useUsers(1, 100);

  const filteredUsers = users.filter((user) => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const username = user.username?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || username.includes(search);
  });

  const getUserDisplayName = (user: typeof users[0]) => {
    if (user.profile?.user_display) {
      return `${user.profile.user_display.first_name} ${user.profile.user_display.last_name}`;
    }
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || user.email || "Usuário sem nome";
  };

  const getUserEmail = (user: typeof users[0]) => {
    return user.profile?.user_display?.email || user.email || "";
  };

  const getUserPhoto = (user: typeof users[0]) => {
    return user.profile?.profile_photo || undefined;
  };

  const getUserUsername = (user: typeof users[0]) => {
    return user.profile?.user_display?.username || user.username || "";
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    try {
      const result = await createUser(payload);
      if (result) {
        setCreateModalOpen(false);
      }
    } catch (error: any) {
      // O erro já foi tratado no useUsers e será exibido no modal
      // Apenas re-lançar para que o modal possa capturá-lo
      throw error;
    }
  };

  const handleToggleActive = async (email: string, currentStatus: boolean) => {
    await toggleUserActive(email, !currentStatus);
  };

  const handleViewProfile = (user: typeof users[0]) => {
    if (!user.profile?.id) return;
    
    // Se o perfil é do próprio usuário logado, redireciona para "Meu Perfil"
    if (currentUser?.id && user.id === currentUser.id) {
      navigate(APP_ROUTES.MY_PROFILE);
    } else {
      // Caso contrário, redireciona para a página de visualização de perfil de outro usuário
      navigate(`/usuario/${user.profile.id}`);
    }
  };

  const handleEditProfile = (user: typeof users[0]) => {
    if (!user.profile?.id) return;
    
    // Se o perfil é do próprio usuário logado, redireciona para "Meu Perfil" (que tem modo de edição)
    if (currentUser?.id && user.id === currentUser.id) {
      navigate(APP_ROUTES.MY_PROFILE);
    } else {
      // Caso contrário, redireciona para a página de edição de perfil de outro usuário
      navigate(`/usuario/${user.profile.id}/editar`);
    }
  };

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
                  backgroundColor: (theme) => theme.palette.mode === "dark" 
                    ? designSystem.colors.background.secondaryDark 
                    : designSystem.colors.background.primary,
                  borderBottom: (theme) => `1px solid ${theme.palette.mode === "dark" 
                    ? designSystem.colors.border.mainDark 
                    : designSystem.colors.border.main}`,
                }}
              >
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ 
                    mr: 1, 
                    color: (theme) => theme.palette.mode === "dark" 
                      ? designSystem.colors.text.disabledDark 
                      : designSystem.colors.text.disabled 
                  }} />
                  <TextField
                    placeholder="Pesquisar por nome, email ou username..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottomColor: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.border.lightDark 
                          : designSystem.colors.border.light,
                      },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.border.darkDark 
                          : designSystem.colors.border.dark,
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: designSystem.colors.primary.main,
                      },
                      "& input": {
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.primaryDark 
                          : designSystem.colors.text.primary,
                      },
                    }}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModalOpen(true)}
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
                    Novo Usuário
                  </Button>
                  <IconButton
                    onClick={refetch}
                    sx={{
                      color: (theme) => theme.palette.mode === "dark" 
                        ? designSystem.colors.text.disabledDark 
                        : designSystem.colors.text.disabled,
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.mode === "dark" 
                          ? "rgba(166, 80, 240, 0.15)" 
                          : designSystem.colors.primary.lightest,
                        color: designSystem.colors.primary.main,
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Lista de Usuários */}
              <Box sx={{ p: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress {...progressStyles} />
                  </Box>
                ) : filteredUsers.length === 0 ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <Typography 
                      sx={{
                        color: (theme) => theme.palette.mode === "dark" 
                          ? designSystem.colors.text.disabledDark 
                          : designSystem.colors.text.disabled,
                        fontSize: "0.95rem"
                      }}
                    >
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
                          backgroundColor: (theme) => theme.palette.mode === "dark" 
                            ? "#181818" 
                            : designSystem.colors.background.secondary,
                          border: (theme) => `1px solid ${theme.palette.mode === "dark" 
                            ? designSystem.colors.border.mainDark 
                            : designSystem.colors.border.main}`,
                          transition: `all ${designSystem.transitions.fast}`,
                          "&:hover": {
                            backgroundColor: (theme) => theme.palette.mode === "dark" 
                              ? "rgba(166, 80, 240, 0.15)" 
                              : designSystem.colors.primary.lightest,
                            borderColor: designSystem.colors.primary.main,
                            boxShadow: (theme) => theme.palette.mode === "dark" 
                              ? designSystem.shadows.smallDark 
                              : designSystem.shadows.small,
                          },
                        }}
                      >
                        <Avatar
                          src={getUserPhoto(user)}
                          alt={getUserDisplayName(user)}
                          sx={{
                            width: 64,
                            height: 64,
                            marginRight: 3,
                            border: `3px solid ${designSystem.colors.background.primary}`,
                            boxShadow: designSystem.shadows.small,
                          }}
                        >
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.primaryDark 
                                : designSystem.colors.text.primary,
                              fontSize: "1.1rem",
                              noWrap: true
                            }}
                          >
                            {getUserDisplayName(user)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: (theme) => theme.palette.mode === "dark" 
                                ? designSystem.colors.text.disabledDark 
                                : designSystem.colors.text.disabled,
                              fontSize: "0.875rem",
                              noWrap: true
                            }}
                          >
                            {getUserEmail(user)}
                          </Typography>
                          {getUserUsername(user) && (
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: (theme) => theme.palette.mode === "dark" 
                                  ? designSystem.colors.text.tertiaryDark 
                                  : designSystem.colors.text.tertiary,
                                fontSize: "0.8rem" 
                              }}
                            >
                              @{getUserUsername(user)}
                            </Typography>
                          )}
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                              label={user.is_active !== false ? "Ativo" : "Inativo"}
                              size="small"
                              color={user.is_active !== false ? "success" : "default"}
                              sx={{
                                fontSize: "0.75rem",
                                height: "20px",
                              }}
                            />
                            <Tooltip title={user.is_active !== false ? "Desativar usuário" : "Ativar usuário"}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={user.is_active !== false}
                                    onChange={() => handleToggleActive(user.email, user.is_active !== false)}
                                    disabled={toggling}
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1.5}>
                          <Tooltip 
                            title={!user.profile?.id ? "Usuário não possui perfil criado" : ""}
                            arrow
                          >
                            <span>
                              <Button
                                variant="outlined"
                                onClick={() => handleViewProfile(user)}
                                disabled={!user.profile?.id}
                                sx={{
                                  borderColor: designSystem.colors.primary.main,
                                  color: designSystem.colors.primary.main,
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  "&:hover": {
                                    borderColor: designSystem.colors.primary.dark,
                                    backgroundColor: designSystem.colors.primary.lightest,
                                  },
                                  "&.Mui-disabled": {
                                    borderColor: (theme) => theme.palette.mode === "dark" 
                                      ? designSystem.colors.border.mainDark 
                                      : designSystem.colors.border.main,
                                    color: (theme) => theme.palette.mode === "dark" 
                                      ? designSystem.colors.text.disabledDark 
                                      : designSystem.colors.text.disabled,
                                  },
                                }}
                              >
                                {currentUser?.id && user.id === currentUser.id ? "Meu Perfil" : "Ver Perfil"}
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip 
                            title={!user.profile?.id ? "Usuário não possui perfil criado" : ""}
                            arrow
                          >
                            <span>
                              <Button
                                variant="contained"
                                onClick={() => handleEditProfile(user)}
                                disabled={!user.profile?.id}
                                sx={{
                                  backgroundColor: designSystem.colors.primary.main,
                                  color: "#FFFFFF",
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  "&:hover": {
                                    backgroundColor: designSystem.colors.primary.dark,
                                  },
                                  "&.Mui-disabled": {
                                    backgroundColor: (theme) => theme.palette.mode === "dark" 
                                      ? designSystem.colors.border.mainDark 
                                      : designSystem.colors.border.main,
                                    color: (theme) => theme.palette.mode === "dark" 
                                      ? designSystem.colors.text.disabledDark 
                                      : designSystem.colors.text.disabled,
                                  },
                                }}
                              >
                                Editar
                              </Button>
                            </span>
                          </Tooltip>
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

      {/* Modal de Criação de Usuário */}
      <CreateUserModal
        open={createModalOpen}
        loading={creating}
        onCreateUser={handleCreateUser}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
