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
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { Exam } from "../../interfaces/exam";

interface NoteUpdaterModalProps {
  open: boolean;
  exams: Exam[];
  onClose: () => void;
}

const NoteUpdaterModal: React.FC<NoteUpdaterModalProps> = ({
  open,
  exams,
  onClose,
}) => {
  const [selectedExam, setSelectedExam] = useState<number | "">("");
  const [newScore, setNewScore] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!selectedExam || !newScore) return;

    const score = parseFloat(newScore);
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Por favor, insira uma nota válida entre 0 e 100");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar chamada à API para atualizar nota
      // await httpClient.patch(API_URL, `/exams/${selectedExam}/`, { score: score });
      
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSelectedExam("");
        setNewScore("");
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar nota:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedExam("");
      setNewScore("");
      setSuccess(false);
    }
  };

  const selectedExamData = exams.find((e) => e.id === selectedExam);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Atualizar Notas</DialogTitle>
      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Nota atualizada com sucesso!
          </Alert>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Selecione o Exame</InputLabel>
              <Select
                value={selectedExam}
                onChange={(e) => {
                  const examId = e.target.value as number;
                  setSelectedExam(examId);
                  const exam = exams.find((exam) => exam.id === examId);
                  setNewScore(exam?.score?.toString() || "");
                }}
                label="Selecione o Exame"
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.user_data.user.first_name} {exam.user_data.user.last_name} -{" "}
                    {exam.exam_scheduled_hour?.exam_date?.date || "N/A"} {exam.exam_scheduled_hour?.hour || ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedExamData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nota atual: <strong>{selectedExamData.score ?? "Não informada"}</strong>
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Nova Nota"
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Digite uma nota entre 0 e 100"
            />
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
            disabled={!selectedExam || !newScore || loading}
            sx={{ bgcolor: "#A650F0", "&:hover": { bgcolor: "#8B3DD9" } }}
          >
            {loading ? <CircularProgress size={20} /> : "Atualizar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NoteUpdaterModal;

