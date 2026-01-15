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
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const themeMode = "light";
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const { user, accessToken } = useAuthContext();
  const { fetchProfileByUserId, fetchProfileByCpf, createProfile, uploadPhoto } = useUserProfile();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfilePayload>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

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
    // DESABILITADO TEMPORARIAMENTE - Permite acesso sem perfil para testes
    setCheckingProfile(false);
    setShowCreateProfile(false);
    
    /* CÓDIGO ORIGINAL COMENTADO - Reativar quando necessário
    const checkUserProfile = async () => {
      if (accessToken && user?.id) {
        setCheckingProfile(true);
        try {
          // Só verificar perfil se o usuário tiver permissão de admin
          // Caso contrário, não mostrar modal (usuário não pode criar perfil)
          if (!hasAdminPermission) {
            console.log("[AppLayout] Usuário sem permissão de admin, não verificando perfil");
            setCheckingProfile(false);
            return;
          }

          // Buscar perfil do usuário via API
          const profile = await fetchProfileByUserId(user.id);
          if (!profile) {
            // Usuário não tem perfil, mostrar modal
            setShowCreateProfile(true);
          } else {
            // Usuário já tem perfil, não mostrar modal
            console.log("[AppLayout] Usuário já possui perfil:", profile.id);
            setShowCreateProfile(false);
          }
        } catch (error) {
          console.error("[AppLayout] Erro ao verificar perfil:", error);
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
      console.error("[AppLayout] User ID não disponível para criar perfil");
      throw new Error("User ID não disponível para criar perfil");
    }

    // Verificar permissões antes de tentar criar
    if (!hasAdminPermission) {
      const errorMessage = "Você não tem permissão para criar perfis. Esta ação requer role ADMIN ou ADMIN_MASTER.";
      console.error("[AppLayout]", errorMessage);
      throw new Error(errorMessage);
    }

    setProfileLoading(true);
    try {
      // Verificar se já existe um perfil para este usuário antes de tentar criar
      console.log(`[AppLayout] Verificando se já existe perfil para user_id: ${user.id}`);
      
      // Verificação 1: Por user_id
      let existingProfileByUserId = null;
      try {
        existingProfileByUserId = await fetchProfileByUserId(user.id);
        console.log(`[AppLayout] Resultado da verificação de perfil por user_id:`, existingProfileByUserId);
        
        if (existingProfileByUserId && existingProfileByUserId.id) {
          const errorMessage = `Já existe um perfil para este usuário (ID: ${user.id}, Perfil ID: ${existingProfileByUserId.id}). Não é possível criar outro perfil.`;
          console.error("[AppLayout]", errorMessage);
          throw new Error(errorMessage);
        } else {
          console.log(`[AppLayout] Nenhum perfil encontrado para user_id: ${user.id}`);
        }
      } catch (checkError: any) {
        console.error(`[AppLayout] Erro ao verificar perfil existente por user_id:`, checkError);
        
        // Se o erro for "perfil não encontrado", continuar normalmente
        if (checkError.message && (checkError.message.includes("não encontrado") || checkError.message.includes("Perfil não encontrado"))) {
          // Perfil não existe, pode continuar
          console.log("[AppLayout] Perfil não encontrado por user_id, continuando verificação");
        } else if (checkError.message && checkError.message.includes("Já existe um perfil")) {
          // Perfil já existe, propagar o erro
          throw checkError;
        } else {
          // Outro erro na verificação - logar mas continuar (pode ser problema de conexão)
          console.warn("[AppLayout] Aviso ao verificar perfil existente por user_id:", checkError.message);
        }
      }

      // Verificação 2: Por CPF (se fornecido)
      if (profileData.cpf) {
        console.log(`[AppLayout] Verificando se já existe perfil para CPF: ${profileData.cpf}`);
        try {
          const existingProfileByCpf = await fetchProfileByCpf(profileData.cpf);
          console.log(`[AppLayout] Resultado da verificação de perfil por CPF:`, existingProfileByCpf);
          
          if (existingProfileByCpf && existingProfileByCpf.id) {
            const errorMessage = `Já existe um perfil com este CPF (CPF: ${profileData.cpf}, Perfil ID: ${existingProfileByCpf.id}, User ID: ${existingProfileByCpf.user_id}). Não é possível criar outro perfil com o mesmo CPF.`;
            console.error("[AppLayout]", errorMessage);
            throw new Error(errorMessage);
          } else {
            console.log(`[AppLayout] Nenhum perfil encontrado para CPF: ${profileData.cpf}`);
          }
        } catch (checkError: any) {
          console.error(`[AppLayout] Erro ao verificar perfil existente por CPF:`, checkError);
          
          // Se o erro for "perfil não encontrado", continuar normalmente
          if (checkError.message && (checkError.message.includes("não encontrado") || checkError.message.includes("Perfil não encontrado"))) {
            // Perfil não existe, pode continuar
            console.log("[AppLayout] Perfil não encontrado por CPF, prosseguindo com criação");
          } else if (checkError.message && checkError.message.includes("Já existe um perfil")) {
            // Perfil já existe, propagar o erro
            throw checkError;
          } else {
            // Outro erro na verificação - logar mas continuar (pode ser problema de conexão)
            console.warn("[AppLayout] Aviso ao verificar perfil existente por CPF:", checkError.message);
          }
        }
      } else {
        console.log("[AppLayout] CPF não fornecido, pulando verificação por CPF");
      }

      console.log(`[AppLayout] Verificações concluídas. Prosseguindo com criação do perfil.`);

      // Preparar payload completo
      const payload = {
        user_id: user.id,
        ...profileData,
      };

      console.log("[AppLayout] Criando perfil com payload:", payload);
      console.log("[AppLayout] Campos do profileData:", Object.keys(profileData));
      console.log("[AppLayout] Valores:", profileData);

      // Criar perfil via API
      const success = await createProfile(payload);

      if (success) {
        setShowCreateProfile(false);
        // Limpar dados do formulário
        setProfileData({});
      }
    } catch (error: any) {
      console.error("[AppLayout] Erro ao criar perfil:", error);
      console.error("[AppLayout] Stack trace:", error.stack);
      
      // Melhorar mensagem de erro genérico do backend
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
      console.error("[AppLayout] User ID não disponível para upload de foto");
      return;
    }

    try {
      // Buscar perfil do usuário primeiro
      const profile = await fetchProfileByUserId(user.id);
      if (!profile?.id) {
        throw new Error("Perfil não encontrado. Crie o perfil primeiro.");
      }

      // Fazer upload da foto via API
      const url = await uploadPhoto(profile.id, file);
      if (url) {
        console.log("[AppLayout] Foto enviada com sucesso:", url);
      } else {
        throw new Error("Erro ao fazer upload da foto");
      }
    } catch (error) {
      console.error("[AppLayout] Erro ao fazer upload da foto:", error);
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
