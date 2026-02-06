import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import type { EnemResult } from "../../interfaces/enemResult";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";

interface EnemDetailsModalProps {
  open: boolean;
  candidate: EnemResult | null;
  onClose: () => void;
}

const EnemDetailsModal: React.FC<EnemDetailsModalProps> = ({
  open,
  candidate,
  onClose,
}) => {
  if (!candidate) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ScoreItem = ({ label, value }: { label: string; value: number }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={600} color="primary">
        {value.toFixed(1)}
      </Typography>
    </Box>
  );

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );

  // const candidateAverageScore = (
  //   candidate.languages_score +
  //   candidate.human_sciences_score +
  //   candidate.natural_sciences_score +
  //   candidate.math_score +
  //   candidate.essay_score
  // ) / 5;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Detalhes do Candidato
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Informações Pessoais */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Informações Pessoais
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <InfoItem label="Nome" value={candidate.name} />
            </Grid>
            <Grid size={12}>
              <InfoItem label="CPF" value={candidate.cpf} />
            </Grid>
            <Grid size={12}>
              <InfoItem label="Número de Inscrição" value={candidate.inscription_number} />
            </Grid>
            <Grid size={12}>
              <InfoItem label="Língua Estrangeira" value={candidate.foreign_language} />
            </Grid>
            <Grid size={12}>
              <InfoItem label="Data de Cadastro" value={formatDate(candidate.created_at)} />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Notas do ENEM */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SchoolIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Notas do ENEM
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ScoreItem label="Linguagens e Códigos" value={candidate.languages_score} />
            </Grid>
            <Grid size={12}>
              <ScoreItem label="Ciências Humanas" value={candidate.human_sciences_score} />
            </Grid>
            <Grid size={12}>
              <ScoreItem label="Ciências da Natureza" value={candidate.natural_sciences_score} />
            </Grid>
            <Grid size={12}>
              <ScoreItem label="Matemática" value={candidate.math_score} />
            </Grid>
            <Grid size={12}>
              <ScoreItem label="Redação" value={candidate.essay_score} />
            </Grid>
            {/* <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Média Geral
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {candidateAverageScore.toFixed(1)}
                </Typography>
              </Box>
            </Grid> */}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnemDetailsModal;
