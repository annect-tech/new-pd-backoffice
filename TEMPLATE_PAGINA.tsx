// TEMPLATE PARA APLICAR DESIGN SYSTEM NAS PÁGINAS
// Este arquivo serve como referência rápida para atualizar páginas

import React from "react";
import { Box, Paper, Fade } from "@mui/material";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  primaryButtonStyles,
  progressStyles,
} from "../../styles/designSystem";

const TemplatePage: React.FC = () => {
  const navigate = useNavigate();

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
            title="Título da Página"
            subtitle="Subtítulo descritivo."
            description="Descrição completa do que esta página faz e como utilizá-la."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Página Atual" },
            ]}
          />

          {/* Conteúdo da Página */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              {/* SEU CONTEÚDO AQUI */}
              <Box p={3}>
                {/* Exemplo de conteúdo */}
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default TemplatePage;

/*
SUBSTITUIÇÕES RÁPIDAS:
=====================

1. Importações:
   - Adicionar: import PageHeader from "../../components/ui/page/PageHeader";
   - Adicionar: import { designSystem, ... } from "../../styles/designSystem";
   - Adicionar Fade se não houver

2. Estrutura Base:
   - Substituir <Box p={2}> por estrutura acima
   - Usar PageHeader no lugar de Breadcrumbs + Title

3. Cores:
   - "#A650F0" → designSystem.colors.primary.main
   - "#9333EA" → designSystem.colors.primary.dark
   - "#8B3DD9" → designSystem.colors.primary.darker
   - "#FAF5FF" → designSystem.colors.primary.lightest
   - "#F3E8FF" → designSystem.colors.primary.lighter
   - "#E5E7EB" → designSystem.colors.border.main
   - "#F9FAFB" → designSystem.colors.background.secondary
   - "#1F2937" → designSystem.colors.text.primary
   - "#6B7280" → designSystem.colors.text.disabled

4. Componentes:
   - <Paper elevation={2}> → <Paper {...paperStyles}>
   - <CircularProgress /> → <CircularProgress {...progressStyles} />
   - <IconButton> → <IconButton {...iconButtonStyles}>
   - <TextField> (busca) → <TextField {...textFieldStyles}>
   - <Button variant="contained"> → <Button {...primaryButtonStyles}>
   - <TableCell> (header) → <TableCell {...tableHeadStyles}>
   - <TableRow> (body) → <TableRow {...tableRowHoverStyles}>

5. Envolver com Fade:
   <Fade in timeout={1000}>
     <Paper {...paperStyles}>
       {/* conteúdo */}
     </Paper>
   </Fade>
*/
