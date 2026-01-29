import { Box } from '@mui/material';
import sideImage from '../../assets/images/side-image.png';

export default function AuthPromotionalSection() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        overflow: 'hidden',
        bgcolor: '#f8f9fa',
      }}
    >
      <Box
        component="img"
        src={sideImage}
        alt=""
        sx={{
          width: '100%',
          maxWidth: 520,
          height: 'auto',
          objectFit: 'contain',
          borderRadius: 2,
        }}
      />
    </Box>
  );
}
