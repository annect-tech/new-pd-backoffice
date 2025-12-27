import { Modal, Box, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface MonitoringModalProps {
  open: boolean;
  action: number;
  close: (monitoringAttendance: string) => void;
}

const MonitoringModal = ({ open, action, close }: MonitoringModalProps) => {
  const handleClose = () => {
    close("close");
  };

  const handlePresent = () => {
    close("present");
  };

  const handleMissed = () => {
    close("missed");
  };

  const handleJustified = () => {
    close("justified");
  };

  return (
    <Modal disableEscapeKeyDown={true} open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "3px",
          background: "linear-gradient(110deg, #0094FF 0%, #FF00FE 100%)",
        }}
      >
        <Box display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
          <IconButton onClick={handleClose}>
            <CloseIcon sx={{ color: "#CE0000" }} />
          </IconButton>
        </Box>

        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ background: "#FFFD", maxWidth: 400 }}
        >
          <Typography
            fontWeight={700}
            align="center"
            sx={{
              m: 2,
              fontSize: {
                xs: "1.5rem",
                sm: "1.5rem",
                md: "1.8rem",
                lg: "2.0rem",
                xl: "2.0rem",
              },
            }}
          >
            {action === 1 && "Você desfez a alteração. Qual é a opção correta?"}
            {action === 2 && "Selecione a opção correta para a última monitoria."}
          </Typography>

          <Box
            display={"flex"}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            width={"100%"}
            mb={2}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handlePresent}
              sx={{
                background: "#00FF00",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              Presente
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleMissed}
              sx={{
                background: "#FF0000",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              Ausente
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleJustified}
              sx={{
                background: "#FFFF00",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              Justificado
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default MonitoringModal;

