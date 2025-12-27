import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface StudentRow {
  id: string;
  completeName: string;
  registration: string;
  corp_email: string;
  monitor: string;
  status: string;
  cpf: string;
  birth_date: string;
  username: string;
  origin: "novo" | "antigo";
}

interface EditStudentModalProps {
  open: boolean;
  student: StudentRow | null;
  onClose: () => void;
  onSave: (updatedStudent: StudentRow) => void;
  onError: (message: string) => void;
  agents: { name: string; value: string; email?: string }[];
}

const STATUS_OPTIONS = [
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
  { value: "Retido", label: "Retido" },
  { value: "Suspenso", label: "Suspenso" },
];

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  open,
  student,
  onClose,
  onSave,
  onError,
  agents,
}) => {
  const [formData, setFormData] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (student) {
      setFormData({ ...student });
    }
  }, [student]);

  if (!student || !formData) return null;

  const handleChange = (field: keyof StudentRow, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!formData) return;

    setLoading(true);
    try {
      // Mapear os campos do StudentRow para o formato esperado pela API
      // Removendo campos que não são aceitos pela API (como "monitor")
      const apiPayload: any = {
        nomeCompleto: formData.completeName,
        cpf: formData.cpf,
        registrationCode: formData.registration,
        emailPd: formData.corp_email,
        dataNasc: formData.birth_date,
        status: formData.status,
        agenteDoSucesso: formData.username,
      };

      const response = await fetch(
        `https://form-api-hml.pdinfinita.com.br/enrolled/${student.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro ao atualizar aluno (${response.status})`
        );
      }

      const updatedData = await response.json();
      
      // Mapear a resposta da API de volta para StudentRow
      const updatedStudent: StudentRow = {
        ...formData,
        completeName: updatedData.nomeCompleto || formData.completeName,
        cpf: updatedData.cpf || formData.cpf,
        registration: updatedData.registrationCode || formData.registration,
        corp_email: updatedData.emailPd || formData.corp_email,
        birth_date: updatedData.dataNasc || formData.birth_date,
        monitor: updatedData.monitor || formData.monitor,
        status: updatedData.status || formData.status,
        username: updatedData.agenteDoSucesso || formData.username,
      };

      onSave(updatedStudent);
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar aluno:", error);
      onError(error.message || "Erro ao atualizar aluno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#A650F0",
          color: "#FFFFFF",
        }}
      >
        Editar Aluno
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
      <DialogContent dividers sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nome Completo"
            value={formData.completeName}
            onChange={(e) => handleChange("completeName", e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="CPF"
            value={formData.cpf}
            onChange={(e) => handleChange("cpf", e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Matrícula"
            value={formData.registration}
            onChange={(e) => handleChange("registration", e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="E-mail Corporativo"
            value={formData.corp_email}
            onChange={(e) => handleChange("corp_email", e.target.value)}
            fullWidth
            required
            type="email"
          />
          <TextField
            label="Data de Nascimento"
            value={formData.birth_date}
            onChange={(e) => handleChange("birth_date", e.target.value)}
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Monitor"
            value={formData.monitor}
            onChange={(e) => handleChange("monitor", e.target.value)}
            fullWidth
          />
          <TextField
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            fullWidth
            select
            required
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Agente de Sucesso"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            fullWidth
            select
          >
            {agents.map((agent) => (
              <MenuItem key={agent.value || agent.email} value={agent.name}>
                {agent.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#A650F0" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: "#A650F0", "&:hover": { backgroundColor: "#8B3DD9" } }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentModal;

