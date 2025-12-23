import React, { useState } from "react";
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
  const [selectedExam, setSelectedExam] = useState<number | "">("");
  const [newStatus, setNewStatus] = useState<"scheduled" | "absent" | "present">("scheduled");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      // TODO: Implementar chamada à API para atualizar status
      // await httpClient.patch(API_URL, `/exams-scheduled/${selectedExam}/`, { status: newStatus });
      
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSelectedExam("");
        setNewStatus("scheduled");
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedExam("");
      setNewStatus("scheduled");
      setSuccess(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "absent":
        return "Ausente";
      case "scheduled":
        return "Agendado";
      case "present":
        return "Presente";
      default:
        return status;
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Selecione o Exame</InputLabel>
              <Select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value as number)}
                label="Selecione o Exame"
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.user_data.user.first_name} {exam.user_data.user.last_name} -{" "}
                    {exam.exam_scheduled_hour.exam_date.date} {exam.exam_scheduled_hour.hour}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "scheduled" | "absent" | "present")
                }
                label="Novo Status"
              >
                <MenuItem value="scheduled">Agendado</MenuItem>
                <MenuItem value="present">Presente</MenuItem>
                <MenuItem value="absent">Ausente</MenuItem>
              </Select>
            </FormControl>

            {selectedExam && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status atual:{" "}
                  <strong>
                    {getStatusLabel(
                      exams.find((e) => e.id === selectedExam)?.status || "scheduled"
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


