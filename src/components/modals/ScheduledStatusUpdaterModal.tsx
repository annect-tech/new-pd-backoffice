import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { ExamScheduled } from "../../interfaces/examScheduled";
import { examsScheduledService } from "../../core/http/services/examsScheduledService";

interface ScheduledStatusUpdaterModalProps {
  open: boolean;
  exams: ExamScheduled[];
  onClose: () => void;
}

const ScheduledStatusUpdaterModal: React.FC<ScheduledStatusUpdaterModalProps> = ({
  open,
  exams,
  onClose,
}) => {
  const [selectedExam, setSelectedExam] = useState<string | "">("");
  const [newStatus, setNewStatus] = useState<"pendente" | "ausente" | "aprovado" | "desqualificado">("pendente");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!open) {
      setSelectedExam("");
      setNewStatus("pendente");
      setSuccess(false);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleUpdate = async () => {
    if (!selectedExam) return;

    setLoading(true);
    setError(null);
    try {
      const response = await examsScheduledService.updateStatus(
        selectedExam,
        examsScheduledService.mapStatusToAPI(newStatus)
      );

      if (response.status >= 200 && response.status < 300) {
        setSuccess(true);
        
        setTimeout(() => {
          onClose();
          setSelectedExam("");
          setNewStatus("pendente");
          setSuccess(false);
          setError(null);
        }, 1500);
      } else {
        const errorMessage = response.message || "Erro ao atualizar status do exame";
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao atualizar status do exame";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedExam("");
      setNewStatus("pendente");
      setSuccess(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "absent":
      case "ausente":
        return "Ausente";
      case "scheduled":
      case "pendente":
        return "Agendado";
      case "present":
      case "aprovado":
        return "Presente";
      case "desqualificado":
        return "Desqualificado";
      default:
        return status || "—";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Atualização de Status</DialogTitle>
      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Status atualizado com sucesso!
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Selecione o Exame</InputLabel>
              <Select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value as string)}
                label="Selecione o Exame"
                disabled={loading}
              >
                {exams
                  .filter((exam) => exam.status !== "present")
                  .filter((exam) => exam.user_data?.user) // Filtrar apenas exames com user_data válido
                  .map((exam) => {
                    const firstName = exam.user_data?.user?.first_name || "";
                    const lastName = exam.user_data?.user?.last_name || "";
                    const name = [firstName, lastName].filter(Boolean).join(" ") || "Nome não disponível";
                    const date = exam.exam_scheduled_hour?.exam_date?.date || "—";
                    const hour = exam.exam_scheduled_hour?.hour || "—";
                    
                    return (
                      <MenuItem key={exam.id} value={exam.id}>
                        {name} - {date} {hour}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "pendente" | "ausente" | "aprovado" | "desqualificado")
                }
                label="Novo Status"
                disabled={loading}
              >
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="aprovado">Aprovado</MenuItem>
                <MenuItem value="ausente">Ausente</MenuItem>
                <MenuItem value="desqualificado">Desqualificado</MenuItem>
              </Select>
            </FormControl>

            {selectedExam && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status atual:{" "}
                  <strong>
                    {getStatusLabel(
                      exams.find((e) => String(e.id) === String(selectedExam))?.status || "scheduled"
                    )}
                  </strong>
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {success ? "Fechar" : "Cancelar"}
        </Button>
        {!success && (
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={!selectedExam || loading}
            sx={{ bgcolor: "#A650F0", "&:hover": { bgcolor: "#8B3DD9" } }}
          >
            {loading ? <CircularProgress size={20} /> : "Atualizar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ScheduledStatusUpdaterModal;


