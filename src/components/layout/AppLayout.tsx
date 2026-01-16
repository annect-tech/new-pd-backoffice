import { useState, useMemo, useEffect } from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";
import Header from "../ui/header/Header";
import LayoutSidebar from "../ui/sidebar/LayoutSidebar";
import getTheme from "../../assets/styles/theme";
import { APP_ROUTES } from "../../util/constants";
import { useAuthContext } from "../../app/providers/AuthProvider";
import { useUserProfile } from "../../hooks/useUserProfile";
import CreateProfileModal from "../modals/CreateProfileModal";
import type { UserProfilePayload } from "../../interfaces/profile";

import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TaskIcon from "@mui/icons-material/Task";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const themeMode = "light";
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const { user, accessToken } = useAuthContext();
  const { fetchProfileByUserId, fetchProfileByCpf, createProfile, uploadPhoto } = useUserProfile();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfilePayload>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Verifica se o usuário tem permissão para criar perfil (requer ADMIN ou ADMIN_MASTER)
  const hasAdminPermission = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return false;
    const adminRoles = ['ADMIN', 'ADMIN_MASTER'];
    return user.roles.some(role => 
      adminRoles.includes(role.toUpperCase())
    );
  }, [user?.roles]);

  // TEMPORARIAMENTE DESABILITADO: Verificação de perfil bloqueando acesso
  // TODO: Reativar após completar integrações e testes
  // Verifica se deve mostrar o modal de criação de perfil
  useEffect(() => {
    setShowCreateProfile(false);
    
    /* CÓDIGO ORIGINAL COMENTADO - Reativar quando necessário
    const checkUserProfile = async () => {
      if (accessToken && user?.id) {
        setCheckingProfile(true);
        try {
          // Só verificar perfil se o usuário tiver permissão de admin
          // Caso contrário, não mostrar modal (usuário não pode criar perfil)
          if (!hasAdminPermission) {
            setCheckingProfile(false);
            return;
          }

          const profile = await fetchProfileByUserId(user.id);
          if (!profile) {
            setShowCreateProfile(true);
          } else {
            setShowCreateProfile(false);
          }
        } catch {
          // Em caso de erro, não mostrar modal (pode ser problema de conexão ou permissão)
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkUserProfile();
    */
  }, [accessToken, user?.id, fetchProfileByUserId, hasAdminPermission]);

  const handleCreateProfile = async () => {
    if (!user?.id) {
      throw new Error("User ID não disponível para criar perfil");
    }

    if (!hasAdminPermission) {
      const errorMessage = "Você não tem permissão para criar perfis. Esta ação requer role ADMIN ou ADMIN_MASTER.";
      throw new Error(errorMessage);
    }

    setProfileLoading(true);
    try {
      let existingProfileByUserId = null;
      try {
        existingProfileByUserId = await fetchProfileByUserId(user.id);
        
        if (existingProfileByUserId && existingProfileByUserId.id) {
          const errorMessage = `Já existe um perfil para este usuário (ID: ${user.id}, Perfil ID: ${existingProfileByUserId.id}). Não é possível criar outro perfil.`;
          throw new Error(errorMessage);
        }
      } catch (checkError: any) {
        if (checkError.message && (checkError.message.includes("não encontrado") || checkError.message.includes("Perfil não encontrado"))) {
          // Perfil não existe, pode continuar
        } else if (checkError.message && checkError.message.includes("Já existe um perfil")) {
          throw checkError;
        }
      }

      if (profileData.cpf) {
        try {
          const existingProfileByCpf = await fetchProfileByCpf(profileData.cpf);
          
          if (existingProfileByCpf && existingProfileByCpf.id) {
            const errorMessage = `Já existe um perfil com este CPF (CPF: ${profileData.cpf}, Perfil ID: ${existingProfileByCpf.id}, User ID: ${existingProfileByCpf.user_id}). Não é possível criar outro perfil com o mesmo CPF.`;
            throw new Error(errorMessage);
          }
        } catch (checkError: any) {
          if (checkError.message && (checkError.message.includes("não encontrado") || checkError.message.includes("Perfil não encontrado"))) {
            // Perfil não existe, pode continuar
          } else if (checkError.message && checkError.message.includes("Já existe um perfil")) {
            throw checkError;
          }
        }
      }

      const payload = {
        user_id: user.id,
        ...profileData,
      };

      // Criar perfil via API
      const success = await createProfile(payload);

      if (success) {
        setShowCreateProfile(false);
        // Limpar dados do formulário
        setProfileData({});
      }
    } catch (error: any) {
      if (error.message === "Internal server error" || error.message.includes("Internal server error")) {
        const improvedMessage = `Erro ao criar perfil para o usuário ID ${user.id}.\n\nPossíveis causas:\n• Já existe um perfil para este usuário (constraint unique no banco)\n• Já existe um perfil com este CPF (${profileData.cpf})\n• Erro no servidor. Verifique os logs do backend.\n\nSugestão: Verifique se já existe um perfil para este usuário antes de tentar criar novamente.`;
        throw new Error(improvedMessage);
      }
      
      // Re-lançar o erro para que o CreateProfileModal possa capturá-lo
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!user?.id) {
      return;
    }

    try {
      const profile = await fetchProfileByUserId(user.id);
      if (!profile?.id) {
        throw new Error("Perfil não encontrado. Crie o perfil primeiro.");
      }

      const url = await uploadPhoto(profile.id, file);
      if (!url) {
        throw new Error("Erro ao fazer upload da foto");
      }
    } catch (error) {
      throw error;
    }
  };

  const sidebarMenuGroups = [
    {
      menus: [
        {
          icon: <DashboardIcon />,
          label: "Dashboard",
          to: APP_ROUTES.DASHBOARD,
        },
        {
          icon: <TrackChangesIcon />,
          label: "Seletivo",
          to: APP_ROUTES.SELECTIVE,
        },
        {
          icon: <CalendarMonthIcon />,
          label: "Lista de Presença",
          to: APP_ROUTES.EXAM_SCHEDULED,
        },
        {
          icon: <WorkspacePremiumIcon />,
          label: "Aprovação Mérito",
          to: APP_ROUTES.MERIT_VALIDATION,
        },
        {
          icon: <TaskIcon />,
          label: "Resultado das Provas",
          to: APP_ROUTES.EXAMS,
        },
        {
          icon: <EmojiEventsIcon />,
          label: "Resultados Mérito",
          to: APP_ROUTES.MERIT_RESULTS,
        },
        {
          icon: <FormatListBulletedIcon />,
          label: "Resultados ENEM",
          to: APP_ROUTES.ENEM_RESULTS,
        },
        {
          icon: <BadgeIcon />,
          label: "Dados de Alunos",
          to: APP_ROUTES.STUDENTS,
        },
        {
          icon: <PersonAddIcon />,
          label: "Cadastro de Alunos",
          to: APP_ROUTES.STUDENT_CREATE,
        },
        {
          icon: <GroupsIcon />,
          label: "Retenção",
          to: APP_ROUTES.RETENTION,
        },
      ],
    },
    {
      menus: [
        {
          icon: <ApartmentIcon />,
          label: "Tenant Cities",
          to: APP_ROUTES.TENANT_CITIES,
        },
        {
          icon: <LocationCityIcon />,
          label: "Allowed Cities",
          to: APP_ROUTES.ALLOWED_CITIES,
        },
        {
          icon: <HomeIcon />,
          label: "Endereços",
          to: APP_ROUTES.ADDRESSES,
        },
        {
          icon: <EditIcon />,
          label: "Contratos",
          to: APP_ROUTES.CONTRACTS,
        },
        {
          icon: <InsertDriveFileIcon />,
          label: "Visualização de Documentos",
          to: APP_ROUTES.DOCUMENTS,
        },
        {
          icon: <PersonIcon />,
          label: "Usuários",
          to: APP_ROUTES.USERS_LIST,
        },
      ],
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" height="100vh" sx={{ position: "relative" }}>
        {/* Overlay para melhor legibilidade */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.7)",
            zIndex: 0,
          }}
        />

        <LayoutSidebar
          collapsed={collapsed}
          menuGroups={sidebarMenuGroups}
          onClose={() => setCollapsed(true)}
        />
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          sx={{
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: "100%",
              position: "relative",
              zIndex: 1100,
            }}
          >
            <Header onMenuClick={() => setCollapsed((p) => !p)} />
          </Box>
          <Box
            component="main"
            flexGrow={1}
            overflow="auto"
            sx={{
              marginLeft: "60px", // Espaço para o sidebar colapsado
              width: "calc(100% - 60px)",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      {/* Modal de Criação de Perfil */}
      <CreateProfileModal
        open={showCreateProfile}
        loading={profileLoading}
        profileData={profileData}
        onChange={setProfileData}
        onCreateProfile={handleCreateProfile}
        onUploadPhoto={handleUploadPhoto}
        onClose={() => setShowCreateProfile(false)}
      />
    </ThemeProvider>
  );
}
