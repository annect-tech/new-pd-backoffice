import { Box, useTheme } from '@mui/material';

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
    </Box>
  );
}
