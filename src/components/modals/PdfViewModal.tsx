import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PdfViewModalProps {
  open: boolean;
  documentUrl: string | null;
  onClose: () => void;
}

const PdfViewModal: React.FC<PdfViewModalProps> = ({
  open,
  documentUrl,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#A650F0",
          color: "#FFFFFF",
        }}
      >
        Visualizar PDF
        <IconButton
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: "100%" }}>
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          {documentUrl && (
            <iframe
              src={documentUrl}
              title="Visualizador de PDF"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#A650F0" }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfViewModal;


