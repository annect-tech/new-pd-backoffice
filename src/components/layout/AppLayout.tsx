import { useState, useMemo, useEffect } from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";
import Header from "../ui/header/Header";
import LayoutSidebar from "../ui/sidebar/LayoutSidebar";
import getTheme from "../../assets/styles/theme";
import { APP_ROUTES } from "../../util/constants";
import { useAuthContext } from "../../app/providers/AuthProvider";
import CreateProfileModal from "../modals/CreateProfileModal";

// Interface definida localmente para evitar problemas de resolução de módulo
interface UserProfilePayload {
  cpf?: string;
  personal_email?: string;
  bio?: string;
  birth_date?: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
}
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TaskIcon from "@mui/icons-material/Task";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const themeMode = "light";
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const { user, accessToken } = useAuthContext();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfilePayload>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Verifica se deve mostrar o modal de criação de perfil
  useEffect(() => {
    if (accessToken && user) {
      // Simula verificação se o usuário tem perfil
      // Em produção, isso viria de uma API
      const hasProfile = localStorage.getItem(`user_${user.id}_has_profile`);
      if (!hasProfile) {
        setShowCreateProfile(true);
      }
    }
  }, [accessToken, user]);

  const handleCreateProfile = async () => {
    setProfileLoading(true);
    try {
      // Simula criação de perfil com dados mockados
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simula resposta da API com dados mockados
      const mockProfileResponse = {
        id: user?.id || 1,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Salva no localStorage (mock)
      if (user) {
        localStorage.setItem(`user_${user.id}_has_profile`, 'true');
        localStorage.setItem(`user_${user.id}_profile`, JSON.stringify(mockProfileResponse));
      }
      
      console.log('Perfil criado com sucesso (mockado):', mockProfileResponse);
    } catch (error) {
      console.error('Erro ao criar perfil (mockado):', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    // Simula upload de foto com dados mockados
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simula URL da foto enviada
    const mockPhotoUrl = URL.createObjectURL(file);
    
    // Salva no localStorage (mock)
    if (user) {
      const profile = localStorage.getItem(`user_${user.id}_profile`);
      if (profile) {
        const profileData = JSON.parse(profile);
        profileData.profile_photo = mockPhotoUrl;
        localStorage.setItem(`user_${user.id}_profile`, JSON.stringify(profileData));
      }
    }
    
    console.log('Foto enviada com sucesso (mockado):', file.name, 'URL:', mockPhotoUrl);
  };

  const sidebarMenuGroups = [
    {
      title: "Cards Gerais",
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
          icon: <WorkspacePremiumIcon />,
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
      title: "Cards de Admin",
      menus: [
        {
          icon: <LocationCityIcon />,
          label: "Cidades",
          to: APP_ROUTES.CITIES,
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
      <Box display="flex" height="100vh" sx={{ bgcolor: "#F3E5F5", position: "relative" }}>
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
