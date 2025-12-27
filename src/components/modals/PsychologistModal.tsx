import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PsychologistModalProps {
  open: boolean;
  psicologosOp: { name: string; value: string }[];
  close: (psychologist: string) => void;
}

const PsychologistModal = ({
  open,
  psicologosOp,
  close,
}: PsychologistModalProps) => {
  const handleClose = () => {
    close("close");
  };

  const handleSelectPsychologist = (psychologist: string) => {
    close(psychologist);
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
          sx={{ background: "#FFFD", maxWidth: 600 }}
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
            Selecione o psicólogo para quem você quer enviar o aluno.
          </Typography>

          <Box
            display={"flex"}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            flexWrap={"wrap"}
            width={"100%"}
            mb={2}
          >
            {psicologosOp.map((psicologo, index) => (
              <Button
                key={index}
                variant="contained"
                color={index % 2 === 0 ? "primary" : "secondary"}
                size="small"
                onClick={() => handleSelectPsychologist(psicologo.value)}
                sx={{
                  color: "#000",
                  fontWeight: "bold",
                  margin: "10px",
                  width: "25%",
                }}
              >
                {psicologo.name}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PsychologistModal;

