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

// Mapeamento de status do frontend (português) para backend (inglês maiúsculo)
const STATUS_MAP_TO_API: Record<string, string> = {
  "pendente": "PENDING",
  "aprovado": "APPROVED",
  "reprovado": "REJECTED",
};

// Mapeamento de status do backend para frontend (para exibição)
const STATUS_MAP_FROM_API: Record<string, string> = {
  "PENDING": "pendente",
  "APPROVED": "aprovado",
  "REJECTED": "reprovado",
  "pending": "pendente",
  "approved": "aprovado",
  "rejected": "reprovado",
  "filesent": "pendente",
  "filesent?": "pendente",
  "file_sent": "pendente",
};

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
];

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

    // Converte o status do frontend (português) para o formato da API (inglês maiúsculo)
    const apiStatus = STATUS_MAP_TO_API[newStatus] || newStatus;
    
    const result = await onUpdate(selectedId, apiStatus);
    setFeedback({
      type: result.success ? "success" : "error",
      message: result.message,
    });

    setLoading(false);

    if (result.success) {
      setTimeout(() => handleClose(), 1200);
    }
  };

  // Normaliza o status para exibição
  const normalizeStatusDisplay = (status: string | null | undefined): string => {
    if (!status) return "pendente";
    
    const normalized = status.toLowerCase().trim();
    return STATUS_MAP_FROM_API[normalized] || STATUS_MAP_FROM_API[status] || "pendente";
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
                {item.inscription_number} - {item.name} CPF {item.cpf}
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
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {current && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Status atual: <strong style={{ textTransform: "capitalize" }}>
                {normalizeStatusDisplay(current.status)}
              </strong>
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

