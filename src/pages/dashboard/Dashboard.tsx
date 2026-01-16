import React from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Fade } from "@mui/material";
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HomeIcon from "@mui/icons-material/Home";
import DashboardCard from "../../components/ui/card/DashboardCard";
import { APP_ROUTES } from "../../util/constants";
import { useAuthContext } from "../../app/providers/AuthProvider";

interface DashboardCardData {
  title: string;
  icon: React.ReactNode;
  link: string;
  isAdmin?: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const handleCardClick = (link: string) => {
    navigate(link);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const dashboardCards: DashboardCardData[] = [
    {
      title: "Seletivo",
      icon: <TrackChangesIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.SELECTIVE,
    },
    {
      title: "Lista de Presença",
      icon: <CalendarMonthIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.EXAM_SCHEDULED,
    },
    {
      title: "Aprovação Mérito",
      icon: <WorkspacePremiumIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.MERIT_VALIDATION,
    },
    {
      title: "Resultados Mérito",
      icon: <EmojiEventsIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.MERIT_RESULTS,
    },
    {
      title: "Resultado das Provas",
      icon: <TaskIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.EXAMS,
    },
    {
      title: "Resultados ENEM",
      icon: <FormatListBulletedIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.ENEM_RESULTS,
    },
    {
      title: "Dados de Alunos",
      icon: <BadgeIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.STUDENTS,
    },
    {
      title: "Cadastro de Alunos",
      icon: <PersonAddIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.STUDENT_CREATE,
    },
    {
      title: "Retenção",
      icon: <GroupsIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.RETENTION,
    },
    {
      title: "Cidades",
      icon: <LocationCityIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.ALLOWED_CITIES,
      isAdmin: true,
    },
    {
      title: "Contratos",
      icon: <EditIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.CONTRACTS,
      isAdmin: true,
    },
    {
      title: "Visualização de Documentos",
      icon: <InsertDriveFileIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.DOCUMENTS,
      isAdmin: true,
    },
    {
      title: "Endereços",
      icon: <HomeIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.ADDRESSES,
      isAdmin: true,
    },
    {
      title: "Usuários",
      icon: <PersonIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.USERS_LIST,
      isAdmin: true,
    },
  ];

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
          pl: { xs: 2, sm: 2, md: 2 },
          pr: { xs: 2, sm: 4, md: 8 },
          py: { xs: 2, sm: 3, md: 4 },
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
          {/* Header do Dashboard */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#1F2937",
                  mb: 1,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                }}
              >
                {getGreeting()}, {user?.first_name || "Usuário"}!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6B7280",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                Bem-vindo ao painel de controle do Backoffice.  
              </Typography>
            </Box>
          </Fade>

          {/* Seção Cards Gerais */}
          <Fade in timeout={1200}>
            <Box sx={{ mb: 5 }}>
              <Box sx={{ mb: 3, pb: 2, position: "relative" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#1F2937",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  }}
                >
                  Funcionalidades Gerais
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, #3B82F6 0%, #A650F0 50%, transparent 100%)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(5, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {dashboardCards
                  .filter((card) => !card.isAdmin)
                  .map((card, index) => (
                    <DashboardCard
                      key={index}
                      title={card.title}
                      icon={card.icon}
                      onClick={() => handleCardClick(card.link)}
                      isAdmin={card.isAdmin}
                    />
                  ))}
              </Box>
            </Box>
          </Fade>

          {/* Seção Cards de Admin */}
          <Fade in timeout={1400}>
            <Box>
              <Box sx={{ mb: 3, pb: 2, position: "relative" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#1F2937",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  }}
                >
                  Administração
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, #F97316 0%, #A650F0 50%, transparent 100%)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(5, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {dashboardCards
                  .filter((card) => card.isAdmin)
                  .map((card, index) => (
                    <DashboardCard
                      key={index}
                      title={card.title}
                      icon={card.icon}
                      onClick={() => handleCardClick(card.link)}
                      isAdmin={card.isAdmin}
                    />
                  ))}
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

