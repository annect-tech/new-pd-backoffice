import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AgentModalProps {
  open: boolean;
  agentesOp: { name: string; value: string; email?: string }[];
  close: (agente: string) => void;
}

const AgentModal = ({ open, agentesOp, close }: AgentModalProps) => {
  const handleClose = () => {
    close("close");
  };

  const handleSelectAgent = (agente: string) => {
    close(agente);
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
            Selecione o monitor para quem você quer transferir o aluno.
          </Typography>

          <Box
            display={"flex"}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            flexWrap={"wrap"}
            width={"100%"}
            mb={2}
          >
            {agentesOp.map((agente, index) => (
              <Button
                key={index}
                variant="contained"
                color={index % 2 === 0 ? "primary" : "secondary"}
                size="small"
                onClick={() => handleSelectAgent(agente.value || agente.email || "")}
                sx={{
                  color: "#000",
                  fontWeight: "bold",
                  margin: "10px",
                  width: "25%",
                }}
              >
                {agente.name}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AgentModal;

