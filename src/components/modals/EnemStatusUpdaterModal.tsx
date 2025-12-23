import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import type { EnemResult } from "../../interfaces/enemResult";

interface EnemStatusUpdaterModalProps {
  open: boolean;
  results: EnemResult[];
  onClose: () => void;
  onUpdate: (id: string, status: string) => Promise<{
    success: boolean;
    message: string;
  }>;
}

const STATUS_OPTIONS = ["pendente", "aprovado", "reprovado"];

const EnemStatusUpdaterModal: React.FC<EnemStatusUpdaterModalProps> = ({
  open,
  results,
  onClose,
  onUpdate,
}) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("pendente");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpdate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setFeedback(null);

    const result = await onUpdate(selectedId, newStatus);
    setFeedback({
      type: result.success ? "success" : "error",
      message: result.message,
    });

    setLoading(false);

    if (result.success) {
      setTimeout(() => handleClose(), 1200);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedId("");
    setNewStatus("pendente");
    setFeedback(null);
    onClose();
  };

  const current = results.find((item) => item.id === selectedId);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Atualizar Status do ENEM</DialogTitle>
      <DialogContent dividers>
        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Selecione o registro</InputLabel>
          <Select
            value={selectedId}
            label="Selecione o registro"
            onChange={(e) => setSelectedId(e.target.value as string)}
          >
            {results.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.inscription_number} - {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Novo status</InputLabel>
          <Select
            value={newStatus}
            label="Novo status"
            onChange={(e) => setNewStatus(e.target.value as string)}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {current && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Status atual: <strong>{current.status}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={!selectedId || loading}
          sx={{ bgcolor: "#A650F0", "&:hover": { bgcolor: "#8B3DD9" } }}
        >
          {loading ? <CircularProgress size={20} /> : "Atualizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnemStatusUpdaterModal;

