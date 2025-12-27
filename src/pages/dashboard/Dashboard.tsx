import React from "react";
import { useNavigate } from "react-router";
import { Box, Typography } from "@mui/material";
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
import DashboardCard from "../../components/ui/card/DashboardCard";
import { APP_ROUTES } from "../../util/constants";

interface DashboardCardData {
  title: string;
  icon: React.ReactNode;
  link: string;
  isAdmin?: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (link: string) => {
    navigate(link);
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
      title: "Resultado das Provas",
      icon: <TaskIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.EXAMS,
    },
    {
      title: "Resultados Mérito",
      icon: <WorkspacePremiumIcon sx={{ fontSize: 48 }} />,
      link: APP_ROUTES.MERIT_RESULTS,
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
      link: APP_ROUTES.CITIES,
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
        bgcolor: "#F3E5F5", // Lavanda claro
      }}
    >

      {/* Conteúdo Principal - Grid de Cards */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          overflow: "auto",
          gap: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Seção Cards Gerais */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#A650F0",
                fontWeight: 600,
                mb: 2,
                fontSize: "1.1rem",
              }}
            >
              Cards Gerais
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
                justifyItems: "center",
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

          {/* Seção Cards de Admin */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: "#F97316",
                fontWeight: 600,
                mb: 2,
                fontSize: "1.1rem",
              }}
            >
              Cards de Admin
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
                justifyItems: "center",
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
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

