import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Toolbar,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useCities } from "../../hooks/useCities";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  primaryButtonStyles,
  progressStyles,
} from "../../styles/designSystem";

// Definindo tipos localmente para evitar problemas de importação
interface CityDataPayload {
  localidade: string;
  uf: string;
  active: boolean;
}

interface City extends CityDataPayload {
  id: number;
}

type Mode = "create" | "edit";

const Cidades: React.FC = () => {
  const navigate = useNavigate();
  const {
    cities,
    loading,
    createCity,
    updateCity,
    snackbar,
    closeSnackbar,
    fetchCities,
  } = useCities();

  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CityDataPayload>({
    localidade: "",
    uf: "",
    active: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>("");
  const [editalError, setEditalError] = useState<string>("");

  const filtered = useMemo(() => {
    return cities.filter(
      (c) =>
        c.localidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.uf.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (m: Mode, city?: City) => {
    setMode(m);
    if (m === "edit" && city) {
      setForm({
        localidade: city.localidade,
        uf: city.uf,
        active: city.active,
      });
      setEditingId(city.id);
    } else {
      setForm({ localidade: "", uf: "", active: true });
      setEditingId(null);
    }
    setLogoFile(null);
    setEditalFile(null);
    setLogoError("");
    setEditalError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setLogoFile(null);
    setEditalFile(null);
    setLogoError("");
    setEditalError("");
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoError("");
      return;
    }

    // Validar se é imagem
    if (!file.type.startsWith("image/")) {
      setLogoError("Por favor, selecione apenas arquivos de imagem.");
      setLogoFile(null);
      return;
    }

    setLogoFile(file);
    setLogoError("");
  };

  const handleEditalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setEditalFile(null);
      setEditalError("");
      return;
    }

    // Validar se é PDF
    if (file.type !== "application/pdf") {
      setEditalError("Por favor, selecione apenas arquivos PDF.");
      setEditalFile(null);
      return;
    }

    setEditalFile(file);
    setEditalError("");
  };

  const handleSave = async () => {
    if (mode === "create") {
      // TODO: Quando integrar com API, enviar logoFile e editalFile junto com form
      // const formData = new FormData();
      // formData.append("localidade", form.localidade);
      // formData.append("uf", form.uf);
      // formData.append("active", form.active.toString());
      // if (logoFile) formData.append("logo", logoFile);
      // if (editalFile) formData.append("edital", editalFile);
      
      // Por enquanto, apenas log dos arquivos (mockado)
      if (logoFile) {
        console.log("Logo selecionado:", logoFile.name, logoFile.size, "bytes");
      }
      if (editalFile) {
        console.log("Edital selecionado:", editalFile.name, editalFile.size, "bytes");
      }
      
      await createCity(form);
    } else if (editingId != null) {
      await updateCity(editingId.toString(), form);
    }
    await fetchCities();
    handleClose();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Conteúdo Principal */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Header da Página */}
          <PageHeader
            title="Cidades"
            subtitle="Gerencie as cidades disponíveis no sistema."
            description="Esta página permite gerenciar as cidades disponíveis no sistema. Você pode criar novas cidades, editar informações existentes, ativar ou desativar cidades, e pesquisar por nome ou UF. Utilize a barra de pesquisa para filtrar cidades e os botões de ação para gerenciar cada registro."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Cidades" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
                  <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
                  <TextField
                    placeholder="Pesquisar por cidade ou UF..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    onClick={fetchCities}
                    {...iconButtonStyles}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen("create")}
                    {...primaryButtonStyles}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : (
                <TableContainer sx={{ maxWidth: "100%" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell {...tableHeadStyles}>ID</TableCell>
                        <TableCell {...tableHeadStyles}>Cidade</TableCell>
                        <TableCell {...tableHeadStyles}>UF</TableCell>
                        <TableCell {...tableHeadStyles}>Status</TableCell>
                        <TableCell {...tableHeadStyles}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography color={designSystem.colors.text.disabled} fontSize="0.95rem">
                              {searchTerm
                                ? "Nenhum resultado encontrado"
                                : "Nenhuma cidade disponível"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((city) => (
                          <TableRow
                            key={city.id}
                            {...tableRowHoverStyles}
                          >
                            <TableCell sx={{ color: designSystem.colors.text.secondary, fontSize: "0.875rem", py: 1.5 }}>
                              {city.id}
                            </TableCell>
                            <TableCell sx={{ color: designSystem.colors.text.primary, fontWeight: 500, fontSize: "0.875rem", py: 1.5 }}>
                              {city.localidade}
                            </TableCell>
                            <TableCell sx={{ color: designSystem.colors.text.secondary, fontSize: "0.875rem", py: 1.5 }}>
                              {city.uf}
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={city.active ? "Ativo" : "Inativo"}
                                color={city.active ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpen("edit", city)}
                                sx={{
                                  color: designSystem.colors.text.disabled,
                                  padding: "4px",
                                  "&:hover": {
                                    backgroundColor: designSystem.colors.primary.lighter,
                                    color: designSystem.colors.primary.main,
                                  },
                                }}
                              >
                                <EditIcon sx={{ fontSize: "1.1rem" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                    }
                    sx={{
                      borderTop: `1px solid ${designSystem.colors.border.main}`,
                      backgroundColor: designSystem.colors.background.secondary,
                    }}
                  />
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          color: designSystem.colors.text.primary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {mode === "create" ? "Criar Cidade" : "Editar Cidade"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            sx={{
              color: designSystem.colors.text.disabled,
              "&:hover": {
                backgroundColor: designSystem.colors.primary.lightest,
                color: designSystem.colors.primary.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Cidade"
            margin="normal"
            value={form.localidade}
            onChange={(e) =>
              setForm((f) => ({ ...f, localidade: e.target.value }))
            }
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: designSystem.colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: designSystem.colors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: designSystem.colors.primary.main,
              },
            }}
          />
          <TextField
            fullWidth
            label="UF"
            margin="normal"
            value={form.uf}
            onChange={(e) =>
              setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))
            }
            slotProps={{
              htmlInput: { maxLength: 2 },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: designSystem.colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: designSystem.colors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: designSystem.colors.primary.main,
              },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: designSystem.colors.primary.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: designSystem.colors.primary.main,
                  },
                }}
              />
            }
            label="Ativo"
          />

          {/* Campos de upload apenas no modo create */}
          {mode === "create" && (
            <>
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: designSystem.colors.primary.main, fontWeight: 600 }}
                >
                  Partes WhiteLabel's do Seletivo:
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: designSystem.colors.primary.main, fontWeight: 600 }}
                >
                  Logo da Cidade
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                    sx={{
                      borderColor: designSystem.colors.primary.main,
                      color: designSystem.colors.primary.main,
                      "&:hover": {
                        borderColor: designSystem.colors.primary.darker,
                        backgroundColor: designSystem.colors.primary.lighter,
                      },
                      py: 1.5,
                    }}
                  >
                    {logoFile ? logoFile.name : "Selecionar Logo (Apenas Imagens)"}
                  </Button>
                </label>
                {logoError && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5, display: "block" }}
                  >
                    {logoError}
                  </Typography>
                )}
                {logoFile && (
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", mt: 0.5, display: "block" }}
                  >
                    Arquivo selecionado: {logoFile.name} ({(logoFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: designSystem.colors.primary.main, fontWeight: 600 }}
                >
                  Edital
                </Typography>
                <input
                  accept="application/pdf"
                  style={{ display: "none" }}
                  id="edital-upload"
                  type="file"
                  onChange={handleEditalChange}
                />
                <label htmlFor="edital-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PictureAsPdfIcon />}
                    fullWidth
                    sx={{
                      borderColor: designSystem.colors.primary.main,
                      color: designSystem.colors.primary.main,
                      "&:hover": {
                        borderColor: designSystem.colors.primary.darker,
                        backgroundColor: designSystem.colors.primary.lighter,
                      },
                      py: 1.5,
                    }}
                  >
                    {editalFile ? editalFile.name : "Selecionar Edital (Apenas PDF)"}
                  </Button>
                </label>
                {editalError && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5, display: "block" }}
                  >
                    {editalError}
                  </Typography>
                )}
                {editalFile && (
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", mt: 0.5, display: "block" }}
                  >
                    Arquivo selecionado: {editalFile.name} ({(editalFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: designSystem.colors.primary.main,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: designSystem.colors.primary.lightest,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            {...primaryButtonStyles}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cidades;
