import { Box, Typography, useTheme } from '@mui/material';

export default function AuthPromotionalSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        Bem-vindo ao
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Sistema Backoffice
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 400, opacity: 0.9 }}>
        Gerencie processos seletivos, alunos, documentos e muito mais em um só lugar.
      </Typography>
    </Box>
  );
}
